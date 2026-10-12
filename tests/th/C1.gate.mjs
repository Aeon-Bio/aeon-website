import { test } from 'node:test';
import assert from 'node:assert/strict';
import { compileSvelte } from './_compile.mjs';
import { pathToFileURL } from 'node:url';
import { resolve } from 'node:path';
// the page's head copy lives in the messages module
const { en } = await import(pathToFileURL(resolve('src/lib/i18n/en.ts')).href);
// which messages section each form reads (`const f = useMessages().<section>`)
const SECTION = {
	'src/lib/components/forms/EmailCapture.svelte': 'follow',
	'src/lib/components/forms/PartnershipInquiry.svelte': 'form'
};
/** `src` renders copy matching `re`: literally, or by a key of en.<section> whose value matches,
 *  referenced as <section>.<key> or through an alias (`const f = useMessages().<section>` → f.<key>) */
function rendersMatch(src, file, re, label) {
	if (re.test(src)) return;
	const section = SECTION[file];
	const keys = Object.entries(en[section]).filter(([, v]) => typeof v === 'string' && re.test(v));
	assert.ok(keys.length, `${file}: en.${section} has no string matching ${re} (${label})`);
	const aliases = [section, ...[...src.matchAll(new RegExp(`(\\w+)\\s*=\\s*[\\w$.()]*\\.${section}\\b`, 'g'))].map((x) => x[1])];
	const hit = keys.some(([k]) => aliases.some((a) => new RegExp(`\\b${a}\\.${k}\\b`).test(src)));
	assert.ok(hit, `${file}: renders none of en.${section}.{${keys.map(([k]) => k)}} (${label})`);
}

const EMAIL = 'src/lib/components/forms/EmailCapture.svelte';
const WRITE = 'src/lib/components/forms/PartnershipInquiry.svelte';
const PAGE = 'src/routes/[[lang=lang]]/+page.svelte';

// Old positioning plus every promise the site cannot keep today.
const FORBIDDEN = [
	/Aeon Bio/,
	/biomolecular causality/i,
	/breakthrough/i,
	/insights on/i,
	/\bCEO\b/,
	/48 hours/i,
	/within \d+ (hours|days)/i,
	/publications/i,
	/demo call/i,
	/schedule a demo/i,
	/webinar/i,
	/Partnership Inquiry/i,
	/partnership inquiry/i,
	/Partnership opportunities/i,
	/Co-Development/i,
	/Product updates/i,
	/Events and/i,
	/confirmation message/i,
	/Research collaborations/i,
	/Data Partnership/i,
	/schedule a/i
];

test('contact forms compile and carry no old positioning or unkept promise', () => {
	for (const f of [EMAIL, WRITE]) {
		const { source } = compileSvelte(f);
		for (const re of FORBIDDEN) assert.doesNotMatch(source, re, `${f}: forbidden ${re}`);
		const copy = JSON.stringify(en[SECTION[f]]);
		for (const re of FORBIDDEN) assert.doesNotMatch(copy, re, `en.${SECTION[f]}: forbidden ${re}`);
		assert.match(source, /aeon\.science/, `${f}: subject names aeon.science`);
	}
});

test('EmailCapture keeps its form contract and tells the truth about what follows', () => {
	const { source } = compileSvelte(EMAIL);
	assert.match(source, /formPayload\.append\('subject'/, 'subject still appended');
	assert.match(source, /<input[^>]*type="email"/, 'email input kept');
	rendersMatch(source, EMAIL, /Follow the build/, 'heading');
	rendersMatch(source, EMAIL, /We only write when there is news/, 'no-confirmation line');
});

test('Write-to-us form is a conversation, not a partnership funnel', () => {
	const { source } = compileSvelte(WRITE);
	rendersMatch(source, WRITE, /I run a wet lab/, 'reason option: wet lab');
	rendersMatch(source, WRITE, /I hold perturbation data/, 'reason option: data');
	rendersMatch(source, WRITE, /Eric reads every message/, 'truthful reply promise');
	rendersMatch(source, WRITE, /no product to demo yet|nothing to demo yet/i, 'no-demo line');
	assert.equal(en.form.submit, 'Send', 'en.form.submit');
	assert.match(source, /<span id="submit-status">(?:Send|\{(?:f|form|m\.form)\.submit\})<\/span>/, 'submit label Send');
});

test('homepage has a title and meta description', () => {
	const { source } = compileSvelte(PAGE);
	assert.equal(en.meta.title, 'aeon.science', 'en.meta.title');
	assert.match(
		source,
		/<svelte:head>[\s\S]*<title>(?:aeon\.science|\{[^}]*meta\.title\})<\/title>[\s\S]*<\/svelte:head>/,
		'title'
	);
	assert.match(
		en.meta.description,
		/^An instrument that sits on a liquid-handling robot[^"]*make the cells work well\.$/,
		'en.meta.description'
	);
	assert.match(
		source,
		/<meta\s+name="description"\s+content=(?:"An instrument that sits on a liquid-handling robot[^"]*make the cells work well\."|\{[^}]*meta\.description\})/,
		'description'
	);
});
