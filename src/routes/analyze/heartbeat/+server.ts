import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { ANALYSIS_SERVER_URL, GOOGLE_SERVICE_KEY } from '$env/static/private';
import { obtainIDToken } from '../utils/auth'; // Create this utility file

/**
 * This endpoint receives heartbeat calls from the client
 * and forwards them to the analysis server.
 */
export const POST: RequestHandler = async ({ request }) => {
	// Get the requestId from the URL's query parameters.
	const parsedUrl = new URL(request.url);
	const requestId = parsedUrl.searchParams.get('requestId');
	if (!requestId) {
		return json({ error: 'Missing requestId' }, { status: 400 });
	}

	try {
		// Obtain a fresh ID token.
		const idToken = await obtainIDToken(GOOGLE_SERVICE_KEY);

		// Forward the heartbeat to the analysis server.
		const heartbeatResponse = await fetch(`${ANALYSIS_SERVER_URL}/heartbeat/${requestId}`, {
			method: 'POST',
			headers: {
				Authorization: `Bearer ${idToken}`,
				'Content-Type': 'application/json'
			}
		});

		if (!heartbeatResponse.ok) {
			const errorText = await heartbeatResponse.text();
			console.error('Server-side heartbeat failed:', errorText);
			return json({ error: errorText }, { status: heartbeatResponse.status });
		}

		console.log(`Forwarded heartbeat for request ${requestId} to analysis server.`);
		return json({ status: 'ok' });
	} catch (error) {
		console.error('Error forwarding heartbeat:', error);
		return json({ error: 'Error forwarding heartbeat' }, { status: 500 });
	}
};
