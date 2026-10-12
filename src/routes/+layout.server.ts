import type { LayoutServerLoad } from './$types';
import type { Lang } from '$lib/i18n';

export const load: LayoutServerLoad = ({ params }) => {
	const lang: Lang = (params as { lang?: string }).lang === 'ja' ? 'ja' : 'en';
	return { lang };
};
