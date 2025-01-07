import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { AZURE_FUNCTION_URL } from '$env/static/private';

export const POST: RequestHandler = async ({ request }) => {
    try {
        const formData = await request.formData();
        const file = formData.get('file') as File;
        const cpgColumn = formData.get('cpgColumn') as string;
        const sampleColumn = formData.get('sampleColumn') as string;
        const requestId = formData.get('requestId') as string;

        if (!file || !cpgColumn || !sampleColumn || !requestId) {
            return json({ error: 'Missing required fields' }, { status: 400 });
        }

        // Send directly to Azure function
        const uploadResponse = await fetch(
            `${AZURE_FUNCTION_URL}/methylation-analysis?` + 
            new URLSearchParams({
                sample_id: sampleColumn,
                probe_id_col: cpgColumn
            }), 
            {
                method: 'POST',
                body: file,
                headers: {
                    'Content-Type': 'text/csv',
                    'x-request-id': requestId
                },
                signal: AbortSignal.timeout(1800000)
            }
        );

        if (!uploadResponse.ok) {
            throw new Error('Upload failed: ' + await uploadResponse.text());
        }

        const headers = new Headers({
            'Content-Type': 'text/event-stream',
            'Cache-Control': 'no-cache',
            'Connection': 'keep-alive',
            'X-Request-ID': requestId
        });

        return new Response(uploadResponse.body, { headers });

    } catch (error) {
        console.error('Server error:', error);
        return json({ error: 'Server error occurred' }, { status: 500 });
    }
};
