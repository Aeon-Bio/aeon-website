import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { ANALYSIS_SERVER_URL, GOOGLE_SERVICE_KEY } from '$env/static/private';
import { obtainIDToken } from './utils/auth';

// Add interface and constants at the top
interface ActiveRequest {
  controller: AbortController;
  lastHeartbeat: number;
}

const HEARTBEAT_INTERVAL = 20000;
const MAX_HEARTBEAT_AGE = 30000;
const activeRequests = new Map<string, ActiveRequest>();

// Assume you have a global map to track heartbeat intervals
const activeHeartbeatIntervals = new Map<string, NodeJS.Timeout>();

// Main POST handler
export const POST: RequestHandler = async ({ request, url }) => {
  // Create an AbortController to cancel pending operations if the client disconnects.
  const controller = new AbortController();
  let requestId: string | null = null; 

  // Listen for client disconnects and clear the heartbeat when detected.
  request.signal.addEventListener('abort', () => {
    console.log('Client disconnected, cancelling analysis.');
    controller.abort();
  });

  try {
    // Process formData and extract requestId.
    const formData = await request.formData();
    requestId = formData.get('requestId') as string;
    const file = formData.get('file') as File;
    const cpgColumn = formData.get('cpgColumn') as string;
    const sampleColumn = formData.get('sampleColumn') as string;
    const selectedLlm = formData.get('selected_llm') as string;

    // Validate required fields
    if (!file || !cpgColumn || !sampleColumn || !requestId || !selectedLlm) {
      console.error('Missing required fields:', { file, cpgColumn, sampleColumn, requestId, selectedLlm });
      return json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Create new AbortController for this request
    activeRequests.set(requestId, { 
      controller,
      lastHeartbeat: Date.now() // Initialize heartbeat timestamp
    });

    // Obtain an ID token and forward the file to the analysis server.
    const idToken = await obtainIDToken(GOOGLE_SERVICE_KEY);
    const uploadResponse = await fetch(
      `${ANALYSIS_SERVER_URL}/methylation-analysis?` +
        new URLSearchParams({
          sample_id: sampleColumn,
          probe_id_col: cpgColumn,
          selected_llm: selectedLlm,
        }),
      {
        method: 'POST',
        body: file,
        headers: {
          'Content-Type': 'text/csv',
          'x-request-id': requestId,
          Authorization: `Bearer ${idToken}`,
        },
        signal: controller.signal,
      }
    );

    // Assume uploadResponse.body is a readable stream that we process further.
    if (!uploadResponse.body) {
      throw new Error('No response body received from analysis server.');
    }
    
    // Create a transform stream for SSE formatting.
    const transformer = new TransformStream({
      start(controller) {
        const encoder = new TextEncoder();
        controller.enqueue(encoder.encode(
          `data: ${JSON.stringify({ type: 'progress', progress: 0, message: 'Analysis started...' })}\n\n`
        ));
      },
      transform(chunk, controller) {
        controller.enqueue(chunk);
      },
      cancel(reason) {
        console.log('Transform stream cancelled due to:', reason);
      }
    });

    const responseStream = uploadResponse.body.pipeThrough(transformer);

    // Set response headers for SSE.
    const headers = new Headers({
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
      'X-Request-ID': requestId
    });

    // Return streaming response WITHOUT clearing the heartbeat here.
    return new Response(responseStream, { headers });
    
  } catch (error) {
    if (error instanceof Error) {
      if (error.name === 'AbortError') {
        return json({ message: 'Analysis cancelled due to client disconnect' }, { status: 499 });
      }
      console.error('POST handler error:', error.message, error.stack);
      return json({ error: error.message || 'Server error occurred' }, { status: 500 });
    }
    console.error('Unknown error:', error);
    return json({ error: 'Unknown server error occurred' }, { status: 500 });
  }
};
