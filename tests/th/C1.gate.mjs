import { test } from 'node:test';
import assert from 'node:assert/strict';
import { compileSvelte } from './_compile.mjs';

const EMAIL = 'src/lib/components/forms/EmailCapture.svelte';
const WRITE = 'src/lib/components/forms/PartnershipInquiry.svelte';
const PAGE = 'src/routes/+page.svelte';

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
		assert.match(source, /aeon\.science/, `${f}: subject names aeon.science`);
	}
});

test('EmailCapture keeps its form contract and tells the truth about what follows', () => {
	const { source } = compileSvelte(EMAIL);
	assert.match(source, /formPayload\.append\('subject'/, 'subject still appended');
	assert.match(source, /<input[^>]*type="email"/, 'email input kept');
	assert.match(source, /Follow the build/, 'heading');
	assert.match(source, /We only write when there is news/, 'no-confirmation line');
});

test('Write-to-us form is a conversation, not a partnership funnel', () => {
	const { source } = compileSvelte(WRITE);
	assert.match(source, /I run a wet lab/, 'reason option: wet lab');
	assert.match(source, /I hold perturbation data/, 'reason option: data');
	assert.match(source, /Eric reads every message/, 'truthful reply promise');
	assert.match(source, /no product to demo yet|nothing to demo yet/i, 'no-demo line');
	assert.match(source, /<span id="submit-status">Send<\/span>/, 'submit label Send');
});

test('homepage has a title and meta description', () => {
	const { source } = compileSvelte(PAGE);
	assert.match(
		source,
		/<svelte:head>[\s\S]*<title>aeon\.science<\/title>[\s\S]*<\/svelte:head>/,
		'title'
	);
	assert.match(
		source,
		/<meta\s+name="description"\s+content="An instrument that sits on a liquid-handling robot[^"]*make the cells work well\."/,
		'description'
	);
});
