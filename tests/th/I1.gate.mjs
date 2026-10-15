import { test } from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import { pathToFileURL } from 'node:url';
import { resolve } from 'node:path';

// N5 · i18n: one page, two languages, the same keys, the same disclosure rules.
const load = (p) => import(pathToFileURL(resolve(p)).href);
const read = (p) => readFileSync(p, 'utf8');
const PAGE = 'src/routes/[[lang=lang]]/+page.svelte';
const LAYOUT = 'src/routes/+layout.svelte';
const DENY = existsSync(new URL('./_deny.local.mjs', import.meta.url))
	? Object.values(await import('./_deny.local.mjs')).filter(Array.isArray).flat()
	: [];
// the mono face on the page before i18n (git HEAD:src/routes/+page.svelte): none may be added
const MONO_BASELINE = 3;

const { en } = await load('src/lib/i18n/en.ts');
const jaMod = await load('src/lib/i18n/ja.ts');
const { ja } = jaMod;

/** every leaf: [path, value]; an array (a segment list) is one key whose items are checked as leaves */
function leaves(o, path = '') {
	if (typeof o === 'string') return [[path, o]];
	if (Array.isArray(o)) return o.flatMap((x, i) => leaves(x, `${path}[${i}]`));
	return Object.entries(o).flatMap(([k, v]) => leaves(v, path ? `${path}.${k}` : k));
}
/** the key shape: objects by key, arrays as `[]` (segment lists may differ in length per language) */
function shape(o, path = '') {
	if (typeof o === 'string') return [path];
	if (Array.isArray(o)) return [`${path}[]`];
	return Object.entries(o).flatMap(([k, v]) => shape(v, path ? `${path}.${k}` : k));
}

test('en and ja have identical deep key sets and no empty strings', () => {
	const a = shape(en).sort();
	const b = shape(ja).sort();
	assert.deepEqual(
		{ missingInJa: a.filter((k) => !b.includes(k)), extraInJa: b.filter((k) => !a.includes(k)) },
		{ missingInJa: [], extraInJa: [] }
	);
	for (const [lang, m] of [['en', en], ['ja', ja]]) {
		for (const [p, v] of leaves(m)) {
			if (/\.href$/.test(p)) assert.match(v, /^https?:\/\//, `${lang}.${p} href`);
			assert.ok(v.trim().length > 0, `${lang}.${p} is empty`);
		}
		for (const [p, v] of Object.entries(m).flatMap(([s, o]) =>
			Object.entries(o).filter(([, x]) => Array.isArray(x)).map(([k, x]) => [`${s}.${k}`, x])
		))
			assert.ok(v.length > 0, `${lang}.${p} is an empty segment list`);
	}
});

test('every ja value passes the disclosure deny-list', { skip: DENY.length === 0 && 'no _deny.local.mjs' }, () => {
	for (const [p, v] of leaves(ja)) for (const re of DENY) assert.doesNotMatch(v, re, `ja.${p}: forbidden ${re}`);
});

test('ja.ts carries the NATIVE-CHECK flags', () => {
	const { nativeCheck } = jaMod;
	assert.ok(Array.isArray(nativeCheck), 'nativeCheck export');
	assert.ok(nativeCheck.length >= 3, 'at least 3 entries');
	const keys = shape(en);
	for (const { key, note } of nativeCheck) {
		assert.ok(keys.includes(key), `nativeCheck key ${key} is not a message key`);
		assert.ok(typeof note === 'string' && note.trim(), `nativeCheck ${key} has a note`);
	}
});

test('routing: /ja matcher, Accept-Language redirect, the lang cookie, <html lang>', async () => {
	assert.ok(existsSync('src/params/lang.ts'), 'src/params/lang.ts missing');
	const { match } = await load('src/params/lang.ts');
	assert.equal(match('ja'), true, "matcher accepts 'ja'");
	for (const x of ['en', 'JA', 'jp', 'ja-JP', '']) assert.equal(match(x), false, `matcher rejects '${x}'`);
	assert.ok(existsSync(PAGE), `${PAGE} missing`);
	assert.ok(!existsSync('src/routes/+page.svelte'), 'the old page is gone: one page component');

	const hooks = read('src/hooks.server.ts');
	assert.match(hooks, /accept-language/i, 'reads Accept-Language');
	assert.match(hooks, /startsWith\(\s*'ja'\s*\)/, 'Japanese-first browsers');
	assert.match(hooks, /status:\s*302|redirect\(\s*302/, '302');
	assert.match(hooks, /location:\s*'\/ja'|redirect\(\s*302,\s*'\/ja'/, 'to /ja');
	assert.match(hooks, /url\.pathname === '\/'/, 'only on /');
	assert.match(hooks, /searchParams\.get\('lang'\)/, '?lang= sets the cookie');
	assert.match(hooks, /cookies\.set\(/, 'cookie set');
	assert.match(hooks, /cookies\.get\(/, 'cookie read: it wins over the header');
	assert.match(hooks, /path:\s*'\/'/, "cookie path '/'");
	assert.match(hooks, /sameSite:\s*'lax'/i, 'SameSite=Lax');
	assert.match(hooks, /60 \* 60 \* 24 \* 365|31536000/, 'one year');
	assert.match(hooks, /transformPageChunk/, 'transformPageChunk');
	assert.match(hooks, /%lang%/, 'fills %lang%');

	assert.match(read('src/app.html'), /<html lang="%lang%">/, 'app.html <html lang="%lang%">');
});

test('the switch and hreflang alternates', () => {
	const page = read(PAGE);
	assert.match(page, /class="lang-switch"/, 'the switch is on the page');
	assert.match(en.switch.label, /日本語/, "en switch reads '日本語'");
	assert.match(ja.switch.label, /English/, "ja switch reads 'English'");
	// the alternates live in the layout's head (home route only); either file satisfies the contract
	const head = page + read(LAYOUT);
	assert.match(head, /hreflang="ja"/, 'hreflang ja');
	assert.match(head, /hreflang="en"/, 'hreflang en');
	assert.match(head, /hreflang="x-default"/, 'hreflang x-default');
});

test('Japanese typography: upright em under :lang(ja), no new mono', () => {
	const css = read('src/app.css');
	// any rule whose selector names both :lang(ja) and em (`:lang(ja) em`, `em:lang(ja)`, lists, :where())
	const upright = [...css.matchAll(/([^{}]+)\{([^{}]*)\}/g)].some(
		([, sel, body]) => /:lang\(ja\)/.test(sel) && /(^|[\s,>(])em\b/.test(sel) && /font-style:\s*normal/.test(body)
	);
	assert.ok(upright, 'src/app.css: a :lang(ja) rule sets font-style: normal on em');
	const mono = (read(PAGE).match(/font-family:\s*var\(--font-mono\)/g) || []).length;
	assert.ok(mono <= MONO_BASELINE, `font-family: var(--font-mono) introduced in the page (${mono} > ${MONO_BASELINE})`);
});
