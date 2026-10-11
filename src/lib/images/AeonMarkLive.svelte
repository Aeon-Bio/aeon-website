<!--
  The aeon mark, alive.

  The card prints a long exposure of one Lorenz trajectory (scripts/gen-mark.py):
  light deposited per unit time, the unprojected axis as depth, a white core on
  near passes, the trail fading in from nothing and ending in a head of light.
  This is the same exposure with the shutter still open: the head keeps moving
  and the last ~1400 steps of trail follow it. Same system, same start, same
  frame as the card, so the first frame IS the card's mark; the static render
  sits underneath for no-JS, reduced motion and the instant before first paint.
-->
<script>
	import { onMount } from 'svelte';

	export let label = 'aeon mark, a Lorenz attractor photographed as a long exposure';

	// --- the card's exposure, verbatim ---------------------------------------
	const SIG = 10,
		RHO = 28,
		BETA = 8 / 3;
	const DT = 0.004;
	const FRAME_W = 1000,
		FRAME_H = 800;
	const SX = 23,
		SY = 15.2,
		OX = 500,
		OY = 780; // proj: X = OX + x·SX, Y = OY − z·SY
	const SKIP = 30000,
		START = 3359,
		WINDOW = 7000; // the printed card's exposure length: the figure stays dense as the head moves
	const STEPS_PER_FRAME = 3; // ≈ 0.7 time units per second at 60 fps: one lobe turn per second-ish

	const PRIMARY = [76, 201, 240];
	const BIOLUM = [128, 255, 219];
	const WHITE = [255, 255, 255];

	let canvas;
	let field;
	let live = false;

	function step(p) {
		const [x, y, z] = p;
		return [x + SIG * (y - x) * DT, y + (x * (RHO - z) - y) * DT, z + (x * y - BETA * z) * DT];
	}

	function mix(a, b, t) {
		return [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t, a[2] + (b[2] - a[2]) * t];
	}

	function rgba(c, a) {
		return `rgba(${c[0] | 0},${c[1] | 0},${c[2] | 0},${a})`;
	}

	onMount(() => {
		if (!canvas || !field) return;
		const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
		if (reduced) return;

		const ctx = canvas.getContext('2d');
		if (!ctx) return;

		// integrate to the card's window
		let p = [0.5, 0.8, 1.2];
		for (let i = 0; i < SKIP + START; i++) p = step(p);
		/** @type {number[][]} ring of the last WINDOW points */
		const ring = [];
		for (let i = 0; i < WINDOW; i++) {
			p = step(p);
			ring.push(p);
		}

		const haloPlate = document.createElement('canvas');
		const hctx = haloPlate.getContext('2d');
		const HALO_SCALE = 0.25;

		let S = 1,
			w = 0,
			h = 0,
			dpr = 1;
		function resize() {
			const r = field.getBoundingClientRect();
			dpr = Math.min(window.devicePixelRatio || 1, 2);
			w = Math.max(1, Math.round(r.width));
			h = Math.max(1, Math.round(r.height));
			canvas.width = Math.round(w * dpr);
			canvas.height = Math.round(h * dpr);
			canvas.style.width = w + 'px';
			canvas.style.height = h + 'px';
			S = Math.min(w / FRAME_W, h / FRAME_H); // px per frame unit
			haloPlate.width = Math.max(1, Math.round(canvas.width * HALO_SCALE));
			haloPlate.height = Math.max(1, Math.round(canvas.height * HALO_SCALE));
		}

		const proj = (q) => [(OX + q[0] * SX) * S * dpr, (OY - q[2] * SY) * S * dpr];

		// the window's depth range and median projected speed, for the plates' weights
		function stats() {
			let lo = Infinity,
				hi = -Infinity;
			const sp = [];
			for (let i = 0; i < ring.length; i++) {
				const y = ring[i][1];
				if (y < lo) lo = y;
				if (y > hi) hi = y;
				if (i) {
					const a = proj(ring[i - 1]),
						b = proj(ring[i]);
					sp.push(Math.hypot(b[0] - a[0], b[1] - a[1]));
				}
			}
			const sorted = sp.slice().sort((a, b) => a - b);
			return { lo, hi, med: sorted[sorted.length >> 1] || 1 };
		}

		const CHUNK = 10; // segments per stroke: one width, one alpha, one hue
		// The halo is exposed on a quarter-resolution plate and upscaled, like the
		// card's Plate(0.25): a wide stroke drawn sharp is a band, not a glow.
		const hue = (t) => mix(PRIMARY, BIOLUM, t);
		const plates = [
			{
				ctx: () => hctx,
				scale: HALO_SCALE,
				sig: (d) => 8 * (0.7 + 0.5 * d),
				I: (t, d) => 0.1 + 0.26 * d,
				col: hue,
				gain: 0.6
			},
			{
				ctx: () => ctx,
				scale: 1,
				sig: (d) => 0.55 + 0.75 * d,
				I: (t, d) => 0.35 + 0.65 * d,
				col: hue,
				gain: 0.5
			},
			{
				ctx: () => ctx,
				scale: 1,
				sig: () => 0.42,
				I: (t, d) => 1.1 * Math.pow(d, 2.2),
				col: (t) => mix(hue(t), WHITE, 0.75),
				gain: 0.9
			}
		];

		function expose(pl, lo, hi, med) {
			const c = pl.ctx();
			const px = S * dpr * pl.scale;
			const n = ring.length;
			c.globalCompositeOperation = 'lighter';
			c.lineCap = 'butt';
			c.lineJoin = 'round';
			for (let i0 = 1; i0 < n; i0 += CHUNK) {
				const i1 = Math.min(n - 1, i0 + CHUNK - 1); // next chunk starts here: no overlap, no beads
				const mid = (i0 + i1) >> 1;
				const t = mid / (n - 1);
				const ramp = 0.06 + 0.94 * Math.pow(t, 2.0); // older trail fades harder over the longer window
				const d = (ring[mid][1] - lo) / (hi - lo || 1);
				const a = proj(ring[mid - 1]),
					b = proj(ring[mid]);
				const speed = Math.hypot(b[0] - a[0], b[1] - a[1]) || 1e-6;
				const wt = Math.min(1.8, Math.max(0.55, Math.pow(med / speed, 0.45)));
				const alpha = Math.min(1, pl.I(t, d) * ramp * wt * pl.gain);
				if (alpha <= 0.003) continue;
				c.strokeStyle = rgba(pl.col(t), alpha);
				c.lineWidth = Math.max(0.6, 2.355 * pl.sig(d) * px);
				c.beginPath();
				const s0 = proj(ring[i0 - 1]);
				c.moveTo(s0[0] * pl.scale, s0[1] * pl.scale);
				for (let i = i0; i <= i1; i++) {
					const q = proj(ring[i]);
					c.lineTo(q[0] * pl.scale, q[1] * pl.scale);
				}
				c.stroke();
			}
			c.globalCompositeOperation = 'source-over';
		}

		function draw() {
			const { lo, hi, med } = stats();
			ctx.setTransform(1, 0, 0, 1, 0, 0);
			ctx.clearRect(0, 0, canvas.width, canvas.height);
			hctx.setTransform(1, 0, 0, 1, 0, 0);
			hctx.clearRect(0, 0, haloPlate.width, haloPlate.height);

			expose(plates[0], lo, hi, med);
			ctx.globalCompositeOperation = 'lighter';
			ctx.imageSmoothingEnabled = true;
			ctx.imageSmoothingQuality = 'high';
			ctx.drawImage(haloPlate, 0, 0, canvas.width, canvas.height);
			expose(plates[1], lo, hi, med);
			expose(plates[2], lo, hi, med);

			// the head of light
			const px = S * dpr;
			ctx.globalCompositeOperation = 'lighter';
			const [hx, hy] = proj(ring[ring.length - 1]);
			for (const [sig, peak, col] of [
				[15, 0.5, PRIMARY],
				[5.5, 1, BIOLUM],
				[1.9, 1.6, WHITE]
			]) {
				const r = 3 * sig * px;
				const g = ctx.createRadialGradient(hx, hy, 0, hx, hy, r);
				g.addColorStop(0, rgba(col, Math.min(1, peak)));
				g.addColorStop(0.35, rgba(col, Math.min(1, peak) * 0.3));
				g.addColorStop(1, rgba(col, 0));
				ctx.fillStyle = g;
				ctx.beginPath();
				ctx.arc(hx, hy, r, 0, Math.PI * 2);
				ctx.fill();
			}
			ctx.globalCompositeOperation = 'source-over';
		}

		resize();
		draw();
		live = true;

		let frame = 0;
		let visible = true;
		function tick() {
			if (visible) {
				for (let k = 0; k < STEPS_PER_FRAME; k++) {
					p = step(p);
					ring.push(p);
					ring.shift();
				}
				draw();
			}
			frame = requestAnimationFrame(tick);
		}
		frame = requestAnimationFrame(tick);

		const io = new IntersectionObserver(([e]) => (visible = e.isIntersecting), { threshold: 0 });
		io.observe(field);
		const ro = new ResizeObserver(() => {
			resize();
			draw();
		});
		ro.observe(field);

		return () => {
			cancelAnimationFrame(frame);
			io.disconnect();
			ro.disconnect();
		};
	});
</script>

<div class="field" bind:this={field} role="img" aria-label={label}>
	<img
		class="still"
		class:hidden={live}
		src="/mark/aeon-mark-1500.webp"
		srcset="/mark/aeon-mark-750.webp 750w, /mark/aeon-mark-1500.webp 1500w"
		sizes="(max-width: 720px) 100vw, 56vw"
		width={FRAME_W}
		height={FRAME_H}
		alt=""
		decoding="async"
		fetchpriority="high"
	/>
	<canvas class="live" class:shown={live} bind:this={canvas} aria-hidden="true"></canvas>
</div>

<style>
	.field {
		position: relative;
		width: 100%;
		aspect-ratio: 5 / 4;
	}

	.still,
	.live {
		position: absolute;
		inset: 0;
		width: 100%;
		height: 100%;
		display: block;
	}

	.still {
		object-fit: contain;
		transition: opacity var(--t-settle, 720ms) var(--ease-out, ease-out);
	}

	.still.hidden {
		opacity: 0;
	}

	.live {
		opacity: 0;
		transition: opacity var(--t-settle, 720ms) var(--ease-out, ease-out);
	}

	.live.shown {
		opacity: 1;
	}
</style>
