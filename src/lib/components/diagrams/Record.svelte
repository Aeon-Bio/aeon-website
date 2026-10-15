<!--
  The record: what every change did, as it happened.

  One point of light per change put into the plate, the visitor's brighter than the
  instrument's; strength across, how many cells answered up. A point is born at nothing the
  moment its bead is on its way and rises while the cells light, so the measurement is
  watched, not reported; once three have settled, one curve of the mark's own light finds the
  strength at which half answer, and moves as each new point lands. No axes, no ticks: the
  floor is the line the points sit on, and the curve says the rest. Same material as the mark:
  a halo on a quarter-resolution plate, a body, light that adds. Drawn small beside the plate
  and large under the readout from the same record.
-->
<script>
	import { onMount } from 'svelte';
	import { bench, hill } from './bench.js';

	/** the large readout record has heavier light than the small one beside the plate */
	export let large = false;

	const PRIMARY = [76, 201, 240];
	const BIOLUM = [128, 255, 219];
	const WHITE = [255, 255, 255];
	const mix = (a, b, t) => [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t, a[2] + (b[2] - a[2]) * t];
	const rgba = (c, a) => `rgba(${c[0] | 0},${c[1] | 0},${c[2] | 0},${Math.max(0, Math.min(1, a))})`;
	const smooth = (u) => (u <= 0 ? 0 : u >= 1 ? 1 : u * u * (3 - 2 * u));

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
		// the drawn curve follows the fitted one with a lag, so a new point moves it rather than replaces it
		let shown = null;
		let shownSince = 0;
		let curveAlpha = 0;
		const px = () => (large ? 1.6 : 1) * dpr;
		function place(d, f) {
			const padX = 0.1 * W,
				padT = 0.14 * H,
				padB = 0.16 * H;
			return [(padX + d * (W - 2 * padX)) * dpr, (H - padB - f * (H - padT - padB)) * dpr];
		}
		function draw(t, dt) {
			const fit = bench.fit;
			if (fit) {
				if (!shown) shown = { ...fit };
				else {
					const a = 1 - Math.exp(-dt / 0.45);
					shown.top += (fit.top - shown.top) * a;
					shown.k += (fit.k - shown.k) * a;
					shown.n += (fit.n - shown.n) * a;
				}
				curveAlpha = Math.min(1, curveAlpha + dt / 0.72);
			} else curveAlpha = Math.max(0, curveAlpha - dt / 0.72);
			ctx.setTransform(1, 0, 0, 1, 0, 0);
			ctx.clearRect(0, 0, canvas.width, canvas.height);
			hctx.setTransform(1, 0, 0, 1, 0, 0);
			hctx.clearRect(0, 0, halo.width, halo.height);
			ctx.globalCompositeOperation = 'lighter';
			hctx.globalCompositeOperation = 'lighter';
			// the floor: the line the points sit on, a field and not a rule
			{
				const [x0, y0] = place(0, 0),
					[x1] = place(1, 0);
				const g = ctx.createLinearGradient(x0, 0, x1, 0);
				g.addColorStop(0, rgba(PRIMARY, 0));
				g.addColorStop(0.3, rgba(PRIMARY, 0.14));
				g.addColorStop(0.7, rgba(BIOLUM, 0.14));
				g.addColorStop(1, rgba(BIOLUM, 0));
				const h = 3 * px();
				const v = ctx.createLinearGradient(0, y0 - h, 0, y0 + h);
				v.addColorStop(0, 'rgba(0,0,0,0)');
				v.addColorStop(0.5, 'rgba(255,255,255,1)');
				v.addColorStop(1, 'rgba(0,0,0,0)');
				ctx.save();
				ctx.fillStyle = g;
				ctx.globalAlpha = 1;
				// a soft band: the gradient across, feathered up and down by a second pass
				for (let i = -2; i <= 2; i++) {
					ctx.globalAlpha = 0.22 * (1 - Math.abs(i) / 3);
					ctx.fillRect(x0, y0 + i * h * 0.5 - h * 0.25, x1 - x0, h * 0.5);
				}
				ctx.restore();
			}
			// the curve: halo on the soft plate, then the body, hue from primary to biolum across
			if (shown && curveAlpha > 0.002) {
				const N = 72;
				const pts = [];
				for (let i = 0; i <= N; i++) {
					const d = i / N;
					pts.push(place(d, Math.min(1, hill(d, shown))));
				}
				const stroke = (c, width, alpha, scale) => {
					c.lineCap = 'round';
					c.lineJoin = 'round';
					c.lineWidth = width * scale;
					for (let i = 1; i < pts.length; i += 6) {
						const i1 = Math.min(pts.length - 1, i + 6);
						const hue = mix(PRIMARY, BIOLUM, (i + i1) / 2 / pts.length);
						c.strokeStyle = rgba(hue, alpha);
						c.beginPath();
						c.moveTo(pts[i - 1][0] * scale, pts[i - 1][1] * scale);
						for (let j = i; j <= i1; j++) c.lineTo(pts[j][0] * scale, pts[j][1] * scale);
						c.stroke();
					}
				};
				stroke(hctx, 14 * px(), 0.22 * curveAlpha, HS);
				ctx.imageSmoothingEnabled = true;
				ctx.imageSmoothingQuality = 'high';
				ctx.drawImage(halo, 0, 0, canvas.width, canvas.height);
				stroke(ctx, 1.4 * px(), 0.55 * curveAlpha, 1);
			}
			// the points: born at the floor, rising as the cells answer; the visitor's carry a white core
			for (const p of bench.points) {
				const age = t - p.born;
				if (age < -1) continue;
				const form = smooth((age + 1) / 0.72);
				const [x, y] = place(p.dose, p.f);
				const [, y0] = place(p.dose, 0);
				const r = (p.mine ? 4.2 : 3.4) * px();
				const col = p.mine ? mix(BIOLUM, WHITE, 0.5) : mix(PRIMARY, BIOLUM, 0.35);
				// the rise: a trail from the floor to where the point is, fading once it has settled
				const trail = p.settled ? Math.max(0, 1 - (t - p.settledAt) / 2.5) : 1;
				if (trail > 0.01 && y0 - y > 1) {
					const g = ctx.createLinearGradient(0, y0, 0, y);
					g.addColorStop(0, rgba(col, 0));
					g.addColorStop(1, rgba(col, 0.28 * trail * form));
					ctx.fillStyle = g;
					ctx.fillRect(x - 0.7 * px(), y, 1.4 * px(), y0 - y);
				}
				const g = ctx.createRadialGradient(x, y, 0, x, y, r * 2.6);
				g.addColorStop(0, rgba(col, 0.95 * form));
				g.addColorStop(0.3, rgba(col, 0.45 * form));
				g.addColorStop(1, rgba(col, 0));
				ctx.fillStyle = g;
				ctx.beginPath();
				ctx.arc(x, y, r * 2.6, 0, 6.2832);
				ctx.fill();
				if (p.mine) {
					ctx.fillStyle = rgba(WHITE, 0.9 * form);
					ctx.beginPath();
					ctx.arc(x, y, r * 0.42, 0, 6.2832);
					ctx.fill();
				}
			}
			// the exposure fades before every edge
			ctx.globalCompositeOperation = 'destination-in';
			ctx.save();
			ctx.translate(canvas.width * 0.5, canvas.height * 0.5);
			ctx.scale(canvas.width * 0.5, canvas.height * 0.5);
			const vg = ctx.createRadialGradient(0, 0, 0, 0, 0, 1);
			vg.addColorStop(0, 'rgba(0,0,0,1)');
			vg.addColorStop(0.7, 'rgba(0,0,0,1)');
			vg.addColorStop(1.0, 'rgba(0,0,0,0)');
			ctx.fillStyle = vg;
			ctx.fillRect(-1.2, -1.2, 2.4, 2.4);
			ctx.restore();
			ctx.globalCompositeOperation = 'source-over';
		}
		resize();
		live = true;
		if (reduced) {
			// the plate has already settled its still record; draw it once it is there
			let tries = 0;
			const once = () => {
				if (bench.points.length || tries++ > 30) {
					if (bench.fit) shown = { ...bench.fit };
					curveAlpha = bench.fit ? 1 : 0;
					draw(bench.clock + 10, 0.016);
				} else requestAnimationFrame(once);
			};
			requestAnimationFrame(once);
			const ro = new ResizeObserver(() => {
				resize();
				draw(bench.clock + 10, 0.016);
			});
			ro.observe(field);
			return () => ro.disconnect();
		}
		let frame = 0;
		let visible = false;
		let last = 0;
		function tick(now) {
			if (visible) {
				const dt = last ? Math.min(0.1, (now - last) / 1000) : 0.016;
				last = now;
				draw(bench.clock, dt);
			} else last = 0;
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
		aspect-ratio: 8 / 5;
	}

	.field.large {
		aspect-ratio: 16 / 9;
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
