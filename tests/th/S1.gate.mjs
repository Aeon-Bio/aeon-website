import { test } from 'node:test';
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { existsSync } from 'node:fs';
const DENY = existsSync(new URL('./_deny.local.mjs', import.meta.url))
	? (await import('./_deny.local.mjs')).S1
	: [];

const STAGING = 'https://aeon-website-staging.pages.dev/';

test('npm run build exits 0', { timeout: 300_000 }, () => {
	const r = spawnSync('npm', ['run', 'build'], {
		encoding: 'utf8',
		stdio: ['ignore', 'pipe', 'pipe']
	});
	assert.equal(r.status, 0, `build failed:\n${(r.stderr || '').slice(-2000)}`);
	assert.ok(existsSync('.svelte-kit/cloudflare/_worker.js'), 'worker bundle present');
});

test('staging serves the refocused page', { timeout: 60_000 }, async () => {
	const res = await fetch(STAGING, { headers: { 'cache-control': 'no-cache' } });
	assert.equal(res.status, 200, `staging status ${res.status}`);
	const html = await res.text();
	assert.match(html, /Open hardware for live-cell experiments/, 'hero line live');
	for (const re of DENY) {
		assert.doesNotMatch(html, re, `legacy string live: ${re}`);
	}
});
