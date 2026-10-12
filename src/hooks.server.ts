import type { Handle } from '@sveltejs/kit';
import { isLang, langOfPath, type Lang } from '$lib/i18n';

const COOKIE = 'lang';
const ONE_YEAR = 60 * 60 * 24 * 365;

/** the highest-q language in an Accept-Language header (ties keep header order) */
function preferredLanguage(header: string | null): string {
	if (!header) return '';
	let best = '';
	let bestQ = -1;
	for (const part of header.split(',')) {
		const [tag, ...params] = part.trim().split(';');
		if (!tag) continue;
		let q = 1;
		for (const p of params) {
			const [k, v] = p.trim().split('=');
			if (k === 'q') q = Number(v);
		}
		if (Number.isFinite(q) && q > bestQ) {
			best = tag.trim().toLowerCase();
			bestQ = q;
		}
	}
	return bestQ > 0 ? best : '';
}

export const handle: Handle = async ({ event, resolve }) => {
	const { url, cookies, request } = event;

	// the EN/JA switch: ?lang= sets the cookie (1 year) and the request continues
	const asked = url.searchParams.get('lang');
	let chosen: Lang | undefined = isLang(asked) ? asked : undefined;
	if (chosen) {
		cookies.set(COOKIE, chosen, {
			path: '/',
			maxAge: ONE_YEAR,
			sameSite: 'lax',
			httpOnly: false
		});
	} else {
		const c = cookies.get(COOKIE);
		chosen = isLang(c) ? c : undefined;
	}

	// first visit to '/' with no cookie: a Japanese-first browser goes to /ja
	if (
		(request.method === 'GET' || request.method === 'HEAD') &&
		url.pathname === '/' &&
		!chosen &&
		!event.isDataRequest &&
		preferredLanguage(request.headers.get('accept-language')).startsWith('ja')
	) {
		return new Response(null, {
			status: 302,
			headers: { location: '/ja', vary: 'Accept-Language, Cookie' }
		});
	}

	const lang = langOfPath(url.pathname);
	const response = await resolve(event, {
		transformPageChunk: ({ html }) => html.replace('%lang%', lang)
	});
	try {
		if (url.pathname === '/') response.headers.append('vary', 'Accept-Language, Cookie');
		// previews (*.pages.dev) stay out of search; only aeon.science is indexed
		if (url.hostname.endsWith('.pages.dev')) response.headers.set('x-robots-tag', 'noindex, nofollow');
	} catch {
		// immutable headers: nothing to add
	}
	return response;
};
