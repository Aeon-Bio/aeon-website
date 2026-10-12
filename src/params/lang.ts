import type { ParamMatcher } from '@sveltejs/kit';

// only Japanese has a prefix; English lives at '/'
export const match = ((param: string): param is 'ja' => param === 'ja') satisfies ParamMatcher;
