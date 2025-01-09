import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { ANALYSIS_SERVER_URL, GOOGLE_SERVICE_KEY } from '$env/static/private';

/**
 * Function to obtain a Google-signed ID Token.
 * @param serviceAccountKey - Base64-encoded service account JSON key.
 * @returns A Google-signed ID Token.
 */
async function obtainIDToken(serviceAccountKey: string): Promise<string> {
  try {
    const decodedKey = atob(serviceAccountKey);
    const key = JSON.parse(decodedKey);
    
    // Convert PEM to ArrayBuffer for Web Crypto API
    const pemHeader = '-----BEGIN PRIVATE KEY-----';
    const pemFooter = '-----END PRIVATE KEY-----';
    const pemContents = key.private_key
      .replace(pemHeader, '')
      .replace(pemFooter, '')
      .replace(/\s/g, '');
    
    const binaryDer = atob(pemContents);
    const buf = new Uint8Array(binaryDer.length);
    for (let i = 0; i < binaryDer.length; i++) {
      buf[i] = binaryDer.charCodeAt(i);
    }

    // Import key using Web Crypto API
    const privateKey = await crypto.subtle.importKey(
      'pkcs8',
      buf,
      {
        name: 'RSASSA-PKCS1-v1_5',
        hash: 'SHA-256',
      },
      false,
      ['sign']
    );

    // Create JWT payload
    const now = Math.floor(Date.now() / 1000);
    const payload = {
      target_audience: ANALYSIS_SERVER_URL,
      iss: key.client_email,
      sub: key.client_email,
      aud: 'https://www.googleapis.com/oauth2/v4/token',
      iat: now,
      exp: now + 3600
    };

    // Create JWT header
    const header = {
      alg: 'RS256',
      typ: 'JWT'
    };

    // Encode header and payload
    const encoder = new TextEncoder();
    const headerString = JSON.stringify(header);
    const payloadString = JSON.stringify(payload);
    const encodedHeader = btoa(headerString).replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_');
    const encodedPayload = btoa(payloadString).replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_');

    // Create signature
    const dataToSign = encoder.encode(`${encodedHeader}.${encodedPayload}`);
    const signature = await crypto.subtle.sign(
      { name: 'RSASSA-PKCS1-v1_5' },
      privateKey,
      dataToSign
    );

    // Convert signature to base64url
    const signatureArray = new Uint8Array(signature);
    let signatureBase64 = btoa(String.fromCharCode(...signatureArray));
    const encodedSignature = signatureBase64.replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_');

    // Combine to create final JWT
    const jwt = `${encodedHeader}.${encodedPayload}.${encodedSignature}`;

    // Exchange JWT for Google-signed ID token
    const tokenResponse = await fetch('https://www.googleapis.com/oauth2/v4/token', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${jwt}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        'grant_type': 'urn:ietf:params:oauth:grant-type:jwt-bearer',
        'assertion': jwt
      })
    });

    if (!tokenResponse.ok) {
      const errorText = await tokenResponse.text();
      console.error('Token exchange failed:', errorText);
      throw new Error('Failed to exchange JWT for ID token');
    }

    const tokenData = await tokenResponse.json();
    return tokenData.id_token; // Return the Google-signed ID token
  } catch (error) {
    console.error('Error in obtainIDToken:', error);
    throw error;
  }
}

export const POST: RequestHandler = async ({ request }) => {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const cpgColumn = formData.get('cpgColumn') as string;
    const sampleColumn = formData.get('sampleColumn') as string;
    const requestId = formData.get('requestId') as string;

    // Validate required fields.
    if (!file || !cpgColumn || !sampleColumn || !requestId) {
      console.error('Missing required fields:', { file, cpgColumn, sampleColumn, requestId });
      return json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Obtain the ID Token.
    const idToken = await obtainIDToken(GOOGLE_SERVICE_KEY);

    // Make the authenticated request to Cloud Run.
    const uploadResponse = await fetch(
      `${ANALYSIS_SERVER_URL}/methylation-analysis?` +
        new URLSearchParams({
          sample_id: sampleColumn,
          probe_id_col: cpgColumn,
        }),
      {
        method: 'POST',
        body: file,
        headers: {
          'Content-Type': 'text/csv',
          'x-request-id': requestId,
          Authorization: `Bearer ${idToken}`,
        },
      }
    );

    if (!uploadResponse.ok) {
      const errorText = await uploadResponse.text();
      console.error('Upload failed:', {
        status: uploadResponse.status,
        statusText: uploadResponse.statusText,
        headers: Object.fromEntries(uploadResponse.headers),
        error: errorText,
      });
      throw new Error(`Upload failed: ${errorText}`);
    }

    // Set response headers for streaming.
    const headers = new Headers({
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      Connection: 'keep-alive',
      'X-Request-ID': requestId,
    });

    console.log('Upload successful. Returning response.');
    return new Response(uploadResponse.body, { headers });
  } catch (error) {
    console.error('POST handler error:', error);
    return json({ error: 'Server error occurred' }, { status: 500 });
  }
};
