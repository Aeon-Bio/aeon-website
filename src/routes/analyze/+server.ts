import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { ANALYSIS_SERVER_URL } from '$env/static/private';
import { GOOGLE_SERVICE_KEY } from '$env/static/private';

// Simple JWT generation function that works in Cloudflare Workers
async function generateJWT(serviceAccountKey: string): Promise<string> {
    const key = JSON.parse(atob(serviceAccountKey));
    
    const header = {
        alg: 'RS256',
        typ: 'JWT',
        kid: key.private_key_id
    };

    const now = Math.floor(Date.now() / 1000);
    const payload = {
        iss: key.client_email,
        sub: key.client_email,
        aud: ANALYSIS_SERVER_URL,
        iat: now,
        exp: now + 3600,
        scope: 'https://www.googleapis.com/auth/cloud-platform'
    };

    const encoder = new TextEncoder();
    const headerB64 = btoa(JSON.stringify(header)).replace(/=/g, '');
    const payloadB64 = btoa(JSON.stringify(payload)).replace(/=/g, '');
    const signatureInput = encoder.encode(`${headerB64}.${payloadB64}`);

    // Convert PEM key to format suitable for WebCrypto
    const privateKey = key.private_key
        .replace('-----BEGIN PRIVATE KEY-----\n', '')
        .replace('\n-----END PRIVATE KEY-----', '')
        .replace(/\n/g, '');

    const binaryKey = Uint8Array.from(atob(privateKey), c => c.charCodeAt(0));
    const cryptoKey = await crypto.subtle.importKey(
        'pkcs8',
        binaryKey,
        {
            name: 'RSASSA-PKCS1-v1_5',
            hash: 'SHA-256'
        },
        false,
        ['sign']
    );

    const signature = await crypto.subtle.sign(
        'RSASSA-PKCS1-v1_5',
        cryptoKey,
        signatureInput
    );

    const signatureB64 = btoa(String.fromCharCode(...new Uint8Array(signature)))
        .replace(/=/g, '')
        .replace(/\+/g, '-')
        .replace(/\//g, '_');

    return `${headerB64}.${payloadB64}.${signatureB64}`;
}

async function getAccessToken(): Promise<string> {
    const jwt = await generateJWT(GOOGLE_SERVICE_KEY);
    
    const response = await fetch('https://oauth2.googleapis.com/token', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: new URLSearchParams({
            grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
            assertion: jwt
        })
    });

    if (!response.ok) {
        const error = await response.text();
        throw new Error(`Failed to get access token: ${error}`);
    }

    const data = await response.json();
    return data.access_token;
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

        const accessToken = await getAccessToken();

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
                    'Authorization': `Bearer ${accessToken}`
                }
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
