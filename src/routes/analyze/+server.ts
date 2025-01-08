import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { ANALYSIS_SERVER_URL } from '$env/static/private';
import { GoogleAuth } from 'google-auth-library';
import { GOOGLE_SERVICE_KEY } from '$env/static/private';

async function getAuthToken() {
    const auth = new GoogleAuth({
        credentials: JSON.parse(
            Buffer.from(GOOGLE_SERVICE_KEY, 'base64').toString()
        ),
        scopes: ['https://www.googleapis.com/auth/cloud-platform']
    });
    const client = await auth.getClient();
    const token = await client.getAccessToken();
    return token.token;
}

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
            `${ANALYSIS_SERVER_URL}/methylation-analysis?` + 
            new URLSearchParams({
                sample_id: sampleColumn,
                probe_id_col: cpgColumn
            }), 
            {
                method: 'POST',
                body: file,
                headers: {
                    'Content-Type': 'text/csv',
                    'x-request-id': requestId,
                    'Authorization': `Bearer ${await getAuthToken()}`
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
