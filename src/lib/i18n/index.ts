import { getContext } from 'svelte';
import { en } from './en';
import { ja } from './ja';

export type Lang = 'en' | 'ja';
export const LANGS: readonly Lang[] = ['en', 'ja'];

// `en` is `as const`; Messages widens its literals to string so ja.ts can conform with the same keys.
type Widen<T> = T extends string
	? string
	: T extends readonly (infer U)[]
		? readonly Widen<U>[]
		: { readonly [K in keyof T]: Widen<T[K]> };
export type Messages = Widen<typeof en>;
/** one run of a segmented paragraph: plain text, or a link when href is present */
export type Segment = { readonly t: string; readonly href?: string };

export const messages: Record<Lang, Messages> = { en, ja };

export const I18N = Symbol('i18n');
type I18nContext = { readonly lang: Lang; readonly m: Messages };

export function isLang(v: unknown): v is Lang {
	return v === 'en' || v === 'ja';
}

export function useMessages(): Messages {
	return getContext<I18nContext | undefined>(I18N)?.m ?? en;
}

export function useLang(): Lang {
	return getContext<I18nContext | undefined>(I18N)?.lang ?? 'en';
}

export function pathFor(lang: Lang): string {
	return lang === 'ja' ? '/ja' : '/';
}

/** the language a pathname belongs to: '/ja' and '/ja/...' are Japanese, everything else English */
export function langOfPath(pathname: string): Lang {
	return pathname === '/ja' || pathname.startsWith('/ja/') ? 'ja' : 'en';
}

export { en, ja };
