import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { ANALYSIS_SERVER_URL, GOOGLE_SERVICE_KEY } from '$env/static/private';
import { SignJWT } from 'jose';
import { createPrivateKey } from 'crypto';



/**
 * Function to obtain a Google-signed ID Token.
 * @param serviceAccountKey - Base64-encoded service account JSON key.
 * @returns A Google-signed ID Token.
 */
async function obtainIDToken(serviceAccountKey: string): Promise<string> {
  try {
    const decodedKey = Buffer.from(serviceAccountKey, 'base64').toString('utf-8');
    const key = JSON.parse(decodedKey);
    
    const privateKey = createPrivateKey({
      key: key.private_key,
      format: 'pem',
    });

    // Step 1: Create self-signed JWT
    const now = Math.floor(Date.now() / 1000);
    const jwt = await new SignJWT({
      target_audience: ANALYSIS_SERVER_URL,
      iss: key.client_email,
      sub: key.client_email
    })
      .setProtectedHeader({ alg: 'RS256', typ: 'JWT' })
      .setAudience('https://www.googleapis.com/oauth2/v4/token')
      .setIssuedAt(now)
      .setExpirationTime(now + 3600)
      .sign(privateKey);

    // Step 2: Exchange JWT for Google-signed ID token
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
