import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { AZURE_FUNCTION_URL } from '$env/static/private';

// Track ongoing requests to prevent duplicates
const ongoingRequests = new Map<string, Promise<Response>>();

export const POST: RequestHandler = async ({ request }) => {
    try {
        const formData = await request.formData();
        const file = formData.get('file') as File;
        const cpgColumn = formData.get('cpgColumn') as string;
        const sampleColumn = formData.get('sampleColumn') as string;
        const isProgressRequest = formData.get('progressOnly') === 'true';

        if (!file || !cpgColumn || !sampleColumn) {
            return json({ error: 'Missing required fields' }, { status: 400 });
        }

        const requestId = crypto.randomUUID();

        // If this is a progress-only request, return early with a 204
        if (isProgressRequest) {
            return new Response(null, { status: 204 });
        }

        // Check if there's already an ongoing request with this ID
        if (ongoingRequests.has(requestId)) {
            return ongoingRequests.get(requestId)!;
        }

        const responsePromise = (async () => {
            try {
                const uploadResponse = await fetch(`${AZURE_FUNCTION_URL}/api/methylation-analysis?` + new URLSearchParams({
                    sample_id: sampleColumn,
                    probe_id_col: cpgColumn
                }), {
                    method: 'POST',
                    body: await file.arrayBuffer(),
                    headers: {
                        'x-request-id': requestId
                    },
                    signal: AbortSignal.timeout(1800000)
                });

                if (!uploadResponse.ok) {
                    throw new Error('Upload failed: ' + await uploadResponse.text());
                }

                const headers = new Headers({
                    'Content-Type': 'text/event-stream',
                    'Cache-Control': 'no-cache',
                    'Connection': 'keep-alive',
                    'X-Request-ID': requestId
                });

                for (const [key, value] of uploadResponse.headers.entries()) {
                    if (!headers.has(key)) {
                        headers.set(key, value);
                    }
                }

                return new Response(uploadResponse.body, { headers });
            } finally {
                // Clean up the request tracking
                ongoingRequests.delete(requestId);
            }
        })();

        // Store the promise for potential duplicate requests
        ongoingRequests.set(requestId, responsePromise);

        return responsePromise;

    } catch (error) {
        console.error('Server error:', error);
        if (error instanceof Error && error.name === 'AbortError') {
            return json({ error: 'Analysis timeout exceeded' }, { status: 504 });
        }
        return json({ error: 'Server error occurred' }, { status: 500 });
    }
}; 