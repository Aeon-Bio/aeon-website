// Rasterise static/favicon.svg into the icons browsers ask for by pixel size.
//
//   node scripts/gen-favicon-raster.mjs
//
// Safari ignores SVG favicons and Chrome fetches /favicon.ico blind, so the
// vector icon is rendered once with Chromium (the renderer that will show it)
// at each size, and the .ico is packed from the 16/32/48 renders. Run after
// scripts/gen-favicon.mjs; commit the outputs together.
import { readFileSync, writeFileSync } from 'node:fs';
import { chromium } from 'playwright';

const OUT = new URL('../static/', import.meta.url);
const svg = readFileSync(new URL('favicon.svg', OUT), 'utf8');
const src = 'data:image/svg+xml;base64,' + Buffer.from(svg).toString('base64');

// 16 and 48 only go into the .ico; the rest are shipped as files
const SIZES = {
	'favicon-16.png': 16,
	'favicon-32.png': 32,
	'favicon-48.png': 48,
	'favicon-192.png': 192,
	'favicon-512.png': 512,
	'apple-touch-icon.png': 180
};
const SHIP = new Set([
	'favicon-32.png',
	'favicon-192.png',
	'favicon-512.png',
	'apple-touch-icon.png'
]);

const browser = await chromium.launch();
const png = {};
for (const [name, size] of Object.entries(SIZES)) {
	const page = await browser.newPage({
		viewport: { width: size, height: size },
		deviceScaleFactor: 1
	});
	// the touch icon is shown unmasked on a light sheet: give it the ground to the corners
	const bg = name === 'apple-touch-icon.png' ? '#1a1b2f' : 'transparent';
	await page.setContent(
		`<body style="margin:0;background:${bg}"><img src="${src}" width="${size}" height="${size}" style="display:block"></body>`
	);
	png[name] = await page.screenshot({ omitBackground: bg === 'transparent', type: 'png' });
	if (SHIP.has(name)) writeFileSync(new URL(name, OUT), png[name]);
	await page.close();
}
await browser.close();

// favicon.ico: an ICONDIR with PNG-encoded entries (every current browser reads PNG-in-ICO)
const entries = ['favicon-16.png', 'favicon-32.png', 'favicon-48.png'].map((n) => [
	SIZES[n],
	png[n]
]);
const header = Buffer.alloc(6);
header.writeUInt16LE(0, 0);
header.writeUInt16LE(1, 2);
header.writeUInt16LE(entries.length, 4);
let offset = 6 + 16 * entries.length;
const dir = entries.map(([size, data]) => {
	const e = Buffer.alloc(16);
	e.writeUInt8(size === 256 ? 0 : size, 0);
	e.writeUInt8(size === 256 ? 0 : size, 1);
	e.writeUInt8(0, 2);
	e.writeUInt8(0, 3);
	e.writeUInt16LE(1, 4);
	e.writeUInt16LE(32, 6);
	e.writeUInt32LE(data.length, 8);
	e.writeUInt32LE(offset, 12);
	offset += data.length;
	return e;
});
writeFileSync(
	new URL('favicon.ico', OUT),
	Buffer.concat([header, ...dir, ...entries.map(([, d]) => d)])
);
console.log([...SHIP].join(' '), 'favicon.ico');
