<!--
  The record: the wells that were changed, read in the order they were changed.

  Each changed well is drawn as itself, from above: the same cells the plate holds, at
  rest or answering, so the brightness of a well here is the fraction of its cells that
  answered. Under each well sits the bead that went into it, the size of its strength. Read
  left to right it is the whole claim: a change went in, the cells answered this much, and
  the next bead was sized from that answer. No axes, no ticks, no curve: the wells and the
  beads say it. Same material as the plate: light that adds, a halo plate at quarter
  resolution for the answering cells, a change a solid bead of liquid. Drawn small beside
  the plate and large under the readout from the same record.
-->
<script>
	import { onMount } from 'svelte';
	import { bench, changedWells, WELL_R } from './bench.js';

	/** the large readout record has heavier light than the small one beside the plate */
	export let large = false;

	const PRIMARY = [76, 201, 240];
	const BIOLUM = [128, 255, 219];
	const WHITE = [255, 255, 255];
	const mix = (a, b, t) => [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t, a[2] + (b[2] - a[2]) * t];
	const rgba = (c, a) => `rgba(${c[0] | 0},${c[1] | 0},${c[2] | 0},${Math.max(0, Math.min(1, a))})`;
	const smooth = (u) => (u <= 0 ? 0 : u >= 1 ? 1 : u * u * (3 - 2 * u));
	const SLOTS = 4; // the strip is laid out for this many wells; more share the width

	let field;
	let canvas;
	let live = false;

	onMount(() => {
		if (!canvas || !field) return;
		const ctx = canvas.getContext('2d');
		if (!ctx) return;
		const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
		const halo = document.createElement('canvas');
		const hctx = halo.getContext('2d');
		const HS = 0.25;
		let W = 1,
			H = 1,
			dpr = 1;
		function resize() {
			const r = field.getBoundingClientRect();
			dpr = Math.min(window.devicePixelRatio || 1, 2);
			W = Math.max(1, Math.round(r.width));
			H = Math.max(1, Math.round(r.height));
			canvas.width = Math.round(W * dpr);
			canvas.height = Math.round(H * dpr);
			halo.width = Math.max(1, Math.round(canvas.width * HS));
			halo.height = Math.max(1, Math.round(canvas.height * HS));
		}
		function draw(t) {
			const wells = changedWells();
			const CW = canvas.width,
				CH = canvas.height;
			ctx.setTransform(1, 0, 0, 1, 0, 0);
			ctx.clearRect(0, 0, CW, CH);
			hctx.setTransform(1, 0, 0, 1, 0, 0);
			hctx.clearRect(0, 0, halo.width, halo.height);
			ctx.globalCompositeOperation = 'lighter';
			hctx.globalCompositeOperation = 'lighter';
			const n = Math.max(SLOTS, wells.length);
			const slot = CW / n;
			const rd = Math.min(slot * 0.36, CH * 0.3); // a well's radius here
			const cy = CH * 0.4; // the wells' line
			const by = CH * 0.84; // the beads' line, under them
			wells.forEach(({ well, point, first }, i) => {
				const cx = slot * (i + 0.5);
				// the slot appears as its first bead is released, a moment before it lands
				const t0 = first.born - 0.9;
				const form = smooth((t - t0) / 0.45);
				if (form <= 0) return;
				// the well: its medium, a field that stops at the wall
				const mg = ctx.createRadialGradient(cx, cy, 0, cx, cy, rd);
				mg.addColorStop(0, rgba(PRIMARY, 0.07 * form));
				mg.addColorStop(0.85, rgba(PRIMARY, 0.05 * form));
				mg.addColorStop(1, rgba(PRIMARY, 0));
				ctx.fillStyle = mg;
				ctx.beginPath();
				ctx.arc(cx, cy, rd, 0, 6.2832);
				ctx.fill();
				// its cells, the same ones the plate holds: faint at rest, bright where they answered, so the well's
				// brightness is the fraction that did; alight where it is happening now
				const k = rd / WELL_R;
				for (const c of well.cells) {
					const x = cx + (c.x - well.x) * k,
						y = cy + (c.y - well.y) * k;
					const on = c.answered ? 1 : 0; // the fraction answered is the brightness of the well
					const l = Math.min(1, c.L);
					const a = c.size * c.aspect * k,
						b = c.size * k;
					const mm = Math.max(0.5, Math.min(a, b));
					const q = mm < 0.5 ? 0.5 / mm : 1;
					ctx.setTransform(Math.cos(c.o) * a * q, Math.sin(c.o) * a * q, -Math.sin(c.o) * b * q, Math.cos(c.o) * b * q, x, y);
					ctx.beginPath();
					ctx.arc(0, 0, 1, 0, 6.2832);
					ctx.setTransform(1, 0, 0, 1, 0, 0);
					ctx.fillStyle = rgba(mix(PRIMARY, BIOLUM, Math.min(1, 0.7 * on + 0.5 * l)), (0.14 + 0.5 * on + 0.5 * l) * form);
					ctx.fill();
					if (l > 0.25) {
						const rr = Math.max(0.6, c.size * 2.6 * k * HS);
						const g = hctx.createRadialGradient(x * HS, y * HS, 0, x * HS, y * HS, rr);
						g.addColorStop(0, rgba(BIOLUM, 0.18 * l * form));
						g.addColorStop(1, rgba(BIOLUM, 0));
						hctx.fillStyle = g;
						hctx.beginPath();
						hctx.arc(x * HS, y * HS, rr, 0, 6.2832);
						hctx.fill();
					}
				}
				// the bead that went in: a solid body the size of its strength, one point of the room's light on it
				const bf = smooth((t - (point.born - 0.9)) / 0.3);
				const rb = rd * (0.14 + 0.36 * point.dose) * (0.7 + 0.3 * bf);
				ctx.fillStyle = rgba(mix(PRIMARY, WHITE, point.mine ? 0.45 : 0.2), 0.85 * bf);
				ctx.beginPath();
				ctx.arc(cx, by, rb, 0, 6.2832);
				ctx.fill();
				ctx.fillStyle = rgba(WHITE, 0.9 * bf);
				ctx.beginPath();
				ctx.arc(cx - 0.3 * rb, by - 0.35 * rb, Math.max(0.6, 0.22 * rb), 0, 6.2832);
				ctx.fill();
			});
			ctx.imageSmoothingEnabled = true;
			ctx.imageSmoothingQuality = 'high';
			ctx.drawImage(halo, 0, 0, CW, CH);
			ctx.globalCompositeOperation = 'source-over';
		}
		resize();
		live = true;
		if (reduced) {
			// the plate has already settled its still record; draw it once it is there
			let tries = 0;
			const once = () => {
				if (bench.points.length || tries++ > 30) draw(bench.clock + 10);
				else requestAnimationFrame(once);
			};
			requestAnimationFrame(once);
			const ro = new ResizeObserver(() => {
				resize();
				draw(bench.clock + 10);
			});
			ro.observe(field);
			return () => ro.disconnect();
		}
		let frame = 0;
		let visible = false;
		function tick() {
			if (visible) draw(bench.clock);
			frame = requestAnimationFrame(tick);
		}
		frame = requestAnimationFrame(tick);
		const io = new IntersectionObserver(([e]) => (visible = e.isIntersecting), { threshold: 0 });
		io.observe(field);
		const ro = new ResizeObserver(() => resize());
		ro.observe(field);
		return () => {
			cancelAnimationFrame(frame);
			io.disconnect();
			ro.disconnect();
		};
	});
</script>

<div class="field" class:large bind:this={field} aria-hidden="true">
	<canvas class="record" class:shown={live} bind:this={canvas}></canvas>
</div>

<style>
	.field {
		position: relative;
		width: 100%;
		aspect-ratio: 3 / 1;
	}

	.field.large {
		aspect-ratio: 3 / 1;
	}

	.record {
		position: absolute;
		inset: 0;
		width: 100%;
		height: 100%;
		display: block;
		opacity: 0;
		transition: opacity var(--t-settle, 720ms) var(--ease-out, ease-out);
	}

	.record.shown {
		opacity: 1;
	}
</style>
