import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { AZURE_FUNCTION_URL } from '$env/static/private';

export const POST: RequestHandler = async ({ request }) => {
    try {
        const formData = await request.formData();
        const file = formData.get('file') as File;
        const cpgColumn = formData.get('cpgColumn') as string;
        const sampleColumn = formData.get('sampleColumn') as string;

        if (!file || !cpgColumn || !sampleColumn) {
            return json({ error: 'Missing required fields' }, { status: 400 });
        }

        // Initial upload to Azure Function
        const uploadResponse = await fetch(`${AZURE_FUNCTION_URL}/api/methylation-analysis?` + new URLSearchParams({
            sample_id: sampleColumn,
            probe_id_col: cpgColumn
        }), {
            method: 'POST',
            body: await file.arrayBuffer()
        });

        if (!uploadResponse.ok) {
            throw new Error('Upload failed: ' + await uploadResponse.text());
        }

        const { statusQueryGetUri } = await uploadResponse.json();

        // Fetch the streaming response from the Azure function
        const streamResponse = await fetch(statusQueryGetUri);

        if (!streamResponse.ok) {
            throw new Error('Failed to fetch results: ' + await streamResponse.text());
        }

        // Stream the response back to the client
        return new Response(streamResponse.body, {
            headers: {
                'Content-Type': 'text/event-stream'
            }
        });

    } catch (error) {
        console.error('Server error:', error);
        return json({ error: 'Server error occurred' }, { status: 500 });
    }
}; 