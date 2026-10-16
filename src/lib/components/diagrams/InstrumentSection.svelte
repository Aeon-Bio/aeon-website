<!--
  One cell, kept.

  One living cell, at the scale of a face, in the room's dark. It breathes. Something arrives:
  a drop from outside the frame, travelling to the cell's edge, taken in at the membrane with
  a ripple. The cell answers in light, a wave from where the drop touched, the whole body
  brightening by how much it was given, then settling, a little brighter than before: it
  keeps what it was asked. The next question comes to the same cell. It is never thrown away
  to be read. The instrument asks three times on arrival (a little, too much, between) and
  then keeps asking at a slower pace for as long as the page is open. A tap or a click on the
  cell asks it too: the drop comes from the side you touched. Nothing else moves. There is no
  plate, no chart, no bead to decode: a body, a drop, light.
  Material as the mark's: fields and points of light that add, no outlines; the cell is a
  body known by its lit edge, the drop a solid bead with one point of the room's light on it,
  the answer the cells' own colour. The count beside the figure is written to cell.js.
  Reduced motion: one still, the cell lit by its third answer; the count line says so.
-->
<script>
	import { onMount } from 'svelte';
	import { useMessages } from '$lib/i18n';
	import { asked, resetCell, stillMode } from './cell.js';
	const m = useMessages();

	const PRIMARY = [76, 201, 240];
	const BIOLUM = [128, 255, 219];
	const WHITE = [255, 255, 255];
	const mix = (a, b, t) => [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t, a[2] + (b[2] - a[2]) * t];
	const rgba = (c, a) => `rgba(${c[0] | 0},${c[1] | 0},${c[2] | 0},${Math.max(0, Math.min(1, a))})`;
	const smooth = (u) => (u <= 0 ? 0 : u >= 1 ? 1 : u * u * (3 - 2 * u));
	const TAU = Math.PI * 2;

	// the ask
	const ARRIVAL = 0.3; // s after the visitor arrives until the first question
	const AGAIN = 2.6; // s after a question lands until the instrument asks the next, for the first three
	const REST = 5.0; // s between questions once the first three have been asked
	const FIRST = [0.35, 1.0, 0.6]; // the first three strengths: a little, too much, between
	const FROM = [-TAU / 4 - 0.55, -TAU / 4, -TAU / 4 + 0.55]; // where the first three come from: over the top
	const TAP = 0.75; // the strength of a visitor's question
	const TRAVEL = 0.5; // s a drop takes to reach the cell
	const RISE = 0.35; // s for the answer to light
	const FADE = 2.4; // s for the answer to settle, leaving a trace
	const BREATH = 0.045; // how much the body moves at rest, of its radius

	let stage;
	let canvas;
	let live = false;
	let still = false;
	/** the keyboard's way in, wired in onMount */
	let askNext = () => {};

	function mulberry(seed) {
		return () => {
			seed |= 0;
			seed = (seed + 0x6d2b79f5) | 0;
			let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
			t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
			return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
		};
	}

	onMount(() => {
		if (!canvas || !stage) return;
		resetCell();
		const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
		const ctx = canvas.getContext('2d');
		if (!ctx) return;
		const rnd = mulberry(7);
		// the halo plate: the body's light drawn soft at quarter resolution, as the mark's is
		const halo = document.createElement('canvas');
		const hctx = halo.getContext('2d');
		const HS = 0.25;

		// ---- the body ------------------------------------------------------------
		// the interior: a few soft bodies at fixed places in the cell, that move with it
		const spots = Array.from({ length: 6 }, () => ({
			rho: 0.25 + 0.5 * rnd(),
			phi: rnd() * TAU,
			size: 0.1 + 0.12 * rnd(),
			a: 0.5 + 0.5 * rnd()
		}));
		const ripples = []; // { t0, th, A }: the membrane taking a drop in
		const answers = []; // { t0, th, dose }: light from where a drop touched
		const drops = []; // { t0, th, dose, ox, oy }: on their way in
		let trace = 0; // what the cell keeps of every answer: a little brighter each time
		const wrap = (d) => Math.atan2(Math.sin(d), Math.cos(d));
		// the radius of the body at angle th, in units of R: breath, and ripples where drops landed
		function shape(th, t) {
			let d =
				0.5 * BREATH * Math.sin(2 * th + 0.55 * t) +
				0.35 * BREATH * Math.sin(3 * th - 0.4 * t + 1.3) +
				0.22 * BREATH * Math.sin(5 * th + 0.7 * t + 2.1);
			for (const r of ripples) {
				const tau = t - r.t0;
				if (tau < 0 || tau > 2) continue;
				const dth = wrap(th - r.th) / 0.5;
				d += r.A * Math.exp(-dth * dth) * Math.cos(11 * tau) * Math.exp(-tau / 0.55);
			}
			return 1 + d;
		}

		// ---- the frame -----------------------------------------------------------
		let W = 1,
			H = 1,
			dpr = 1,
			S = 1,
			cx = 0,
			cy = 0,
			R = 1;
		function resize() {
			const r = stage.getBoundingClientRect();
			dpr = Math.min(window.devicePixelRatio || 1, 2);
			W = Math.max(1, Math.round(r.width));
			H = Math.max(1, Math.round(r.height));
			canvas.width = Math.round(W * dpr);
			canvas.height = Math.round(H * dpr);
			S = Math.min(canvas.width, canvas.height);
			cx = canvas.width * 0.5;
			cy = canvas.height * 0.5;
			R = 0.3 * S;
			halo.width = Math.max(1, Math.round(canvas.width * HS));
			halo.height = Math.max(1, Math.round(canvas.height * HS));
		}
		const N = 180;
		function body(t, c = ctx, k = 1) {
			c.beginPath();
			for (let i = 0; i < N; i++) {
				const th = (i / N) * TAU;
				const rr = R * shape(th, t);
				const x = (cx + Math.cos(th) * rr) * k,
					y = (cy + Math.sin(th) * rr) * k;
				if (i) c.lineTo(x, y);
				else c.moveTo(x, y);
			}
			c.closePath();
		}
		const rim = (th, t) => [cx + Math.cos(th) * R * shape(th, t), cy + Math.sin(th) * R * shape(th, t)];

		// ---- the ask -------------------------------------------------------------
		let tNow = 0;
		let clock0 = -1;
		let nextAt = -1; // when the instrument asks next
		let count = 0;
		function ask(th, dose, t) {
			// the drop sets out near the edge of the frame, in the direction it came from, and fades in there
			const far = 0.46 * S;
			drops.push({ t0: t, th, dose, ox: cx + Math.cos(th) * far, oy: cy + Math.sin(th) * far, landed: false });
		}
		function land(d, t) {
			d.landed = true;
			d.t1 = t;
			ripples.push({ t0: t, th: d.th, A: 0.05 * (0.5 + d.dose) });
			answers.push({ t0: t + 0.12, th: d.th, dose: d.dose });
			count++;
			asked.set(count);
			nextAt = t + (count < 3 ? AGAIN : REST);
		}
		function step(t) {
			tNow = t;
			if (clock0 >= 0 && nextAt >= 0 && t >= nextAt) {
				nextAt = -1;
				const i = count;
				if (i < 3) ask(FROM[i], FIRST[i], t);
				else ask(-TAU / 4 + (rnd() - 0.5) * 1.6, 0.4 + 0.5 * rnd(), t);
			}
			for (const d of drops) if (!d.landed && t - d.t0 >= TRAVEL) land(d, t);
			while (drops.length && drops[0].landed && t - drops[0].t1 > 0.4) drops.shift();
			while (ripples.length && t - ripples[0].t0 > 2) ripples.shift();
			while (answers.length > 6) answers.shift();
		}

		// ---- the exposure --------------------------------------------------------
		function render(t) {
			ctx.setTransform(1, 0, 0, 1, 0, 0);
			ctx.clearRect(0, 0, canvas.width, canvas.height);
			ctx.globalCompositeOperation = 'lighter';
			// the answers now: how lit the body is, and from where
			let lit = 0;
			for (const a of answers) {
				const tau = t - a.t0;
				if (tau < 0) continue;
				const env = smooth(tau / RISE) * (0.2 + 0.8 * Math.exp(-Math.max(0, tau - RISE) / FADE));
				lit = Math.max(lit, a.dose * env);
			}
			const rest = mix(PRIMARY, BIOLUM, trace);
			// the room's light on the cell: a halo beyond the membrane, warmer as it answers
			{
				const g = ctx.createRadialGradient(cx, cy, R * 0.85, cx, cy, R * 1.6);
				const c = mix(rest, BIOLUM, lit);
				g.addColorStop(0, rgba(c, 0.1 + 0.12 * lit));
				g.addColorStop(0.45, rgba(c, 0.03 + 0.05 * lit));
				g.addColorStop(1, rgba(c, 0));
				ctx.fillStyle = g;
				ctx.fillRect(0, 0, canvas.width, canvas.height);
			}
			// the body's soft light, on the halo plate: a bloom at the membrane that grows with the answer
			hctx.setTransform(1, 0, 0, 1, 0, 0);
			hctx.clearRect(0, 0, halo.width, halo.height);
			hctx.globalCompositeOperation = 'lighter';
			body(t, hctx, HS);
			hctx.fillStyle = rgba(mix(rest, BIOLUM, lit), 0.08 + 0.09 * lit);
			hctx.fill();
			ctx.imageSmoothingEnabled = true;
			ctx.imageSmoothingQuality = 'high';
			ctx.drawImage(halo, 0, 0, canvas.width, canvas.height);
			// the body: an interior that is almost dark, a membrane that holds the light
			body(t);
			ctx.save();
			ctx.clip();
			{
				const g = ctx.createRadialGradient(cx, cy, 0, cx, cy, R * (1 + BREATH));
				const edge = mix(rest, BIOLUM, lit);
				g.addColorStop(0, rgba(rest, 0.04));
				g.addColorStop(0.72, rgba(rest, 0.06));
				g.addColorStop(0.9, rgba(edge, 0.16 + 0.1 * lit));
				g.addColorStop(1, rgba(edge, 0.42 + 0.25 * lit));
				ctx.fillStyle = g;
				ctx.fillRect(0, 0, canvas.width, canvas.height);
			}
			for (const s of spots) {
				const rr = R * shape(s.phi, t) * s.rho;
				const x = cx + Math.cos(s.phi) * rr,
					y = cy + Math.sin(s.phi) * rr,
					sr = R * s.size;
				const g = ctx.createRadialGradient(x, y, 0, x, y, sr);
				g.addColorStop(0, rgba(mix(rest, BIOLUM, 0.5 * lit), 0.035 * s.a * (1 + 1.5 * lit)));
				g.addColorStop(1, rgba(rest, 0));
				ctx.fillStyle = g;
				ctx.beginPath();
				ctx.arc(x, y, sr, 0, TAU);
				ctx.fill();
			}
			// the answers: a wave from where each drop touched, and the body lit behind it
			for (const a of answers) {
				const tau = t - a.t0;
				if (tau < 0) continue;
				const [px, py] = rim(a.th, t);
				const env = smooth(tau / RISE) * (0.2 + 0.8 * Math.exp(-Math.max(0, tau - RISE) / FADE));
				const L = a.dose * env;
				const g = ctx.createRadialGradient(px, py, 0, px, py, R * 2.2);
				g.addColorStop(0, rgba(BIOLUM, 0.34 * L));
				g.addColorStop(0.35, rgba(BIOLUM, 0.14 * L));
				g.addColorStop(1, rgba(BIOLUM, 0.03 * L));
				ctx.fillStyle = g;
				ctx.fillRect(0, 0, canvas.width, canvas.height);
				const wr = R * 2.4 * (tau / 0.7);
				if (wr < R * 2.6) {
					const w = ctx.createRadialGradient(px, py, Math.max(0, wr - 0.22 * R), px, py, wr + 0.22 * R);
					const wa = 0.55 * a.dose * Math.exp(-tau / 0.9);
					w.addColorStop(0, rgba(BIOLUM, 0));
					w.addColorStop(0.5, rgba(mix(BIOLUM, WHITE, 0.4), wa));
					w.addColorStop(1, rgba(BIOLUM, 0));
					ctx.fillStyle = w;
					ctx.fillRect(0, 0, canvas.width, canvas.height);
				}
			}
			ctx.restore();
			// the drops: a solid bead from outside the frame to the membrane, taken in on arrival
			for (const d of drops) {
				const tau = t - d.t0;
				if (tau < 0) continue;
				const [px, py] = rim(d.th, t);
				let x, y, sx = 1, sy = 1, alpha = 1;
				if (!d.landed) {
					const u = Math.min(1, tau / TRAVEL);
					const e = u * u; // it falls: slow to leave, fast to arrive
					x = d.ox + (px - d.ox) * e;
					y = d.oy + (py - d.oy) * e;
					alpha = smooth(u / 0.3);
				} else {
					const v = Math.min(1, (t - d.t1) / 0.3);
					x = px;
					y = py;
					sx = 1 + 0.5 * v;
					sy = 1 - 0.7 * v;
					alpha = 1 - smooth(v);
				}
				const rb = 0.042 * S * (0.6 + 0.5 * d.dose);
				const c = Math.cos(d.th),
					s = Math.sin(d.th);
				ctx.globalCompositeOperation = 'source-over';
				ctx.setTransform(-s * rb * sx, c * rb * sx, c * rb * sy, s * rb * sy, x, y);
				ctx.beginPath();
				ctx.arc(0, 0, 1, 0, TAU);
				ctx.setTransform(1, 0, 0, 1, 0, 0);
				ctx.fillStyle = rgba(mix(PRIMARY, WHITE, 0.25), 0.92 * alpha);
				ctx.fill();
				ctx.fillStyle = rgba(WHITE, 0.95 * alpha);
				ctx.beginPath();
				ctx.arc(x - 0.3 * rb, y - 0.32 * rb, Math.max(0.8, 0.2 * rb), 0, TAU);
				ctx.fill();
				ctx.globalCompositeOperation = 'lighter';
			}
			ctx.globalCompositeOperation = 'source-over';
		}
		// a settled answer leaves a trace: the cell keeps what it was asked
		let traced = 0;
		function keep() {
			while (traced < count) {
				traced++;
				trace = Math.min(0.35, trace + 0.05);
			}
		}

		// ---- the hand: a tap asks, from the side it came --------------------------
		function onClick(ev) {
			if (still) return;
			const r = stage.getBoundingClientRect();
			const x = (ev.clientX - r.left) * dpr - cx,
				y = (ev.clientY - r.top) * dpr - cy;
			const th = Math.atan2(y, x);
			if (clock0 < 0) clock0 = tNow;
			ask(th, TAP, tNow);
			nextAt = -1; // the instrument waits for this answer, then follows
		}
		askNext = () => {
			if (still) return;
			if (clock0 < 0) clock0 = tNow;
			ask(-TAU / 4 + (rnd() - 0.5) * 1.6, TAP, tNow);
			nextAt = -1;
		};
		stage.addEventListener('click', onClick);

		resize();
		if (reduced) {
			still = true;
			stillMode.set(true);
			clock0 = 0;
			nextAt = ARRIVAL;
			let t = 0;
			for (let i = 0; i < 60 * 9; i++) {
				t = i / 60;
				step(t);
				keep();
			}
			render(t);
			live = true;
			return;
		}
		render(0);
		live = true;

		let t = 0,
			lastNow = 0,
			frame = 0,
			visible = false,
			arrived = false;
		function tick(now) {
			if (visible || clock0 >= 0) {
				const dms = lastNow ? Math.min(100, now - lastNow) : 16;
				t += dms / 1000;
				lastNow = now;
				if (arrived && clock0 < 0) {
					clock0 = t;
					nextAt = t + ARRIVAL;
				}
				step(t);
				keep();
				if (visible) render(t);
			} else lastNow = 0;
			frame = requestAnimationFrame(tick);
		}
		frame = requestAnimationFrame(tick);
		const io = new IntersectionObserver(
			([e]) => {
				visible = e.isIntersecting;
				if (e.intersectionRatio >= 0.5) arrived = true;
			},
			{ threshold: [0, 0.5] }
		);
		io.observe(stage);
		const ro = new ResizeObserver(() => resize());
		ro.observe(stage);
		return () => {
			cancelAnimationFrame(frame);
			io.disconnect();
			ro.disconnect();
		};
	});
</script>

<!-- the cell is a picture to the page; a click on it asks, wired on the stage in the script, and the
     keyboard gets the same thing as a button after it -->
<div class="stage" class:still bind:this={stage} role="img" aria-label={m.a11y.figure}>
	<canvas class="instrument" class:shown={live} bind:this={canvas} aria-hidden="true"></canvas>
</div>
{#if !still}
	<button class="put" type="button" on:click={() => askNext()}>{m.a11y.put}</button>
{/if}

<style>
	.stage {
		position: relative;
		width: 100%;
		aspect-ratio: 1;
		cursor: pointer;
		user-select: none;
		-webkit-user-select: none;
		-webkit-touch-callout: none;
	}

	/* the keyboard's button: out of sight until it is reached, then a plain line of the body face */
	.put {
		position: absolute;
		left: 50%;
		bottom: 0.5rem;
		transform: translateX(-50%);
		clip-path: inset(50%);
		width: 1px;
		height: 1px;
		overflow: hidden;
		white-space: nowrap;
		font: inherit;
		font-size: 0.85rem;
		color: var(--ink-70, inherit);
		background: none;
		border: 0;
		padding: 0.4rem 0.8rem;
		cursor: pointer;
	}

	.put:focus-visible {
		clip-path: none;
		width: auto;
		height: auto;
		outline: 1px solid currentColor;
		outline-offset: 2px;
	}

	.instrument {
		position: absolute;
		inset: 0;
		width: 100%;
		height: 100%;
		display: block;
		opacity: 0;
		transition: opacity var(--t-settle, 720ms) var(--ease-out, ease-out);
	}

	.instrument.shown {
		opacity: 1;
	}
</style>
