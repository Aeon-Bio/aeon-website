<!--
  The strand: one arm of a Clifford attractor, running the height of the dialogue.

  The form is a function of depth: at each height where the person's data lands
  (wearable, blood, genome), the strand below takes the shape and colour of a
  different regime — the landscape reshaped where the evidence arrived. The
  strand below a landing re-forms as that landing is reached, and it brightens
  at the height where a term the reader is attending to entered the conversation.

  The form is never drawn — only inhabited: motes run down the strand at their
  own pace, quicker below each landing, and the reader's pointer pulls them off
  their line. Nothing on the canvas holds still.
-->
<script lang="ts">
	import { onMount } from 'svelte';

	/** where data lands on the page: below each, the strand changes regime */
	export let landings: { el: HTMLElement; phase: number; seen: boolean }[] = [];
	/** the exchange the reader's attention points at, if any */
	export let spot: HTMLElement | null = null;
	/** the dialogue's exchanges: where the page grows between them, the strand grows in place */
	export let anchors: HTMLElement[] = [];

	type Point = { x: number; y: number };
	type Regime = { a: number; b: number; c: number; d: number };
	/** an inhabitant of the strand: where it is, where along the strand it belongs, how it runs */
	type Mote = Point & {
		vx: number;
		vy: number;
		rank: number;
		pace: number;
		weight: number;
		/** a wandering offset along the strand: the lick of the flame */
		turb: number;
		/** where across the ribbon this one runs, −1..1: the weft of the fabric */
		side: number;
	};
	/** the ribbon's half-breadth, as a fraction of the canvas width */
	const RIBBON = 0.065;
	/** how fast the current runs along the strand, px/s at the top; quicker below each landing */
	const FLOW = 26;

	/** words → wearable → blood → genome */
	const regimes: Regime[] = [
		{ a: -1.4, b: 1.6, c: 1, d: 0.7 },
		{ a: -1.7, b: 1.3, c: -0.1, d: -1.21 },
		{ a: 1.7, b: 1.7, c: 0.6, d: 1.2 },
		{ a: -1.8, b: -2, c: -0.5, d: -0.9 }
	];

	let canvas: HTMLCanvasElement;
	let context: CanvasRenderingContext2D | null = null;
	let host: HTMLElement | null = null;
	let width = 0;
	let height = 0;
	/** each regime's strand, N points rank-aligned, in unit space */
	let forms: Point[][] = [];
	let N = 0;
	let target: Point[] = [];
	let current: Point[] = [];
	let hue: number[] = [];
	let hueNow: number[] = [];
	let motes: Mote[] = [];
	const pointer = { x: 0, y: 0, active: false };
	let spotY = 0;
	let spotYNow = 0;
	let glow = 0;
	let glowNow = 0;
	let frame = 0;
	let last = 0;
	let visible = false;
	let mounted = false;
	let reduced = false;

	function random(seed: number) {
		let state = seed >>> 0;
		return () => {
			state = (state * 1664525 + 1013904223) >>> 0;
			return state / 4294967296;
		};
	}

	/** one regime's strand: sample the attractor, keep the leftmost arm, resample by rank */
	function strandOf(regime: Regime, n: number): Point[] {
		const raw: Point[] = [];
		let x = 0.1;
		let y = 0.1;
		let minX = Infinity;
		let maxX = -Infinity;
		let minY = Infinity;
		let maxY = -Infinity;
		for (let i = 0; i < 1900; i++) {
			const nx = Math.sin(regime.a * y) + regime.c * Math.cos(regime.a * x);
			const ny = Math.sin(regime.b * x) + regime.d * Math.cos(regime.b * y);
			x = nx;
			y = ny;
			if (i < 120) continue;
			raw.push({ x, y });
			minX = Math.min(minX, x);
			maxX = Math.max(maxX, x);
			minY = Math.min(minY, y);
			maxY = Math.max(maxY, y);
		}
		const all = raw.map((p) => ({
			x: ((p.x - minX) / Math.max(0.001, maxX - minX) - 0.5) * 2,
			y: ((p.y - minY) / Math.max(0.001, maxY - minY) - 0.5) * 2
		}));
		// the attractor has arms; keep one: at every height, only the points within an
		// arm's thickness of the leftmost one there
		const ranked = all.map((_, i) => i).sort((i, j) => all[i].y - all[j].y);
		const BAND = 12;
		const ARM = 0.3;
		const kept: Point[] = [];
		for (let b = 0; b < ranked.length; b += BAND) {
			const band = ranked.slice(b, b + BAND);
			const edge = Math.min(...band.map((i) => all[i].x));
			for (const i of band) if (all[i].x <= edge + ARM) kept.push(all[i]);
		}
		kept.sort((p, q) => p.y - q.y);
		// the arm's own breadth becomes the strand's: its folds open out into a weave
		// rather than staying a thread at the scale of the whole two-armed figure
		let lo = Infinity;
		let hi = -Infinity;
		for (const p of kept) {
			lo = Math.min(lo, p.x);
			hi = Math.max(hi, p.x);
		}
		const span = Math.max(0.001, hi - lo);
		// rank-aligned: point r of every regime sits at the same height, so forms blend point-wise
		return Array.from({ length: n }, (_, r) => ({
			x: ((kept[Math.round((r * (kept.length - 1)) / Math.max(1, n - 1))].x - lo) / span - 0.5) * 2,
			y: (r / Math.max(1, n - 1) - 0.5) * 2
		}));
	}

	/** the width and height the strand is laid out for */
	let laidW = 0;
	let laidH = 0;
	/**
	 * the strand's height, unit → page px: a polyline, straight until the page grows
	 * between two exchanges (a frame opening), where it stretches in place instead of
	 * restretching the whole strand over the new height
	 */
	let knots: { u: number; y: number }[] = [];
	/** the strand overshoots the canvas a little at both ends, so it is not seen to start or stop */
	const OVER = 0.035;
	function seatKnots(h: number) {
		knots = [
			{ u: 0, y: -OVER * h },
			{ u: 1, y: (1 + OVER) * h }
		];
	}
	/** page y of a unit height along the strand */
	function Y(u: number) {
		if (u <= knots[0].u) return knots[0].y;
		for (let i = 1; i < knots.length; i++) {
			if (u <= knots[i].u) {
				const a = knots[i - 1];
				const b = knots[i];
				return a.y + ((b.y - a.y) * (u - a.u)) / Math.max(1e-6, b.u - a.u);
			}
		}
		return knots[knots.length - 1].y;
	}
	/** unit height along the strand of a page y */
	function U(y: number) {
		if (y <= knots[0].y) return knots[0].u;
		for (let i = 1; i < knots.length; i++) {
			if (y <= knots[i].y) {
				const a = knots[i - 1];
				const b = knots[i];
				return a.u + ((b.u - a.u) * (y - a.y)) / Math.max(1e-6, b.y - a.y);
			}
		}
		return knots[knots.length - 1].u;
	}
	/** where each anchor sat at the last layout, px from the canvas top */
	let tops = new Map<HTMLElement, number>();
	function measure() {
		const now = new Map<HTMLElement, number>();
		if (!canvas) return now;
		const top = canvas.getBoundingClientRect().top;
		for (const el of anchors) if (el) now.set(el, el.getBoundingClientRect().top - top);
		return now;
	}

	/** the strand's density: N points and the inhabitants, for the height at hand */
	function build() {
		const scale = Math.max(1, Math.min(5, height / 900));
		const prev = current;
		const prevHue = hueNow;
		const prevN = N;
		N = Math.round(240 * scale);
		forms = regimes.map((r) => strandOf(r, N));
		if (prev.length > 1 && !reduced) {
			// carry the strand across the rebuild by rank, so it glides to its new form
			const at = (r: number) => (r * (prev.length - 1)) / Math.max(1, N - 1);
			current = Array.from({ length: N }, (_, r) => {
				const t = at(r);
				const i = Math.floor(t);
				const f = t - i;
				const a = prev[i];
				const b = prev[Math.min(prev.length - 1, i + 1)];
				return { x: a.x + (b.x - a.x) * f, y: a.y + (b.y - a.y) * f };
			});
			hueNow = Array.from({ length: N }, (_, r) => {
				const t = at(r);
				const i = Math.floor(t);
				return prevHue[i] + (prevHue[Math.min(prevHue.length - 1, i + 1)] - prevHue[i]) * (t - i);
			});
			// the inhabitants keep their place along the strand
			const fr = (N - 1) / Math.max(1, prevN - 1);
			for (const m of motes) m.rank *= fr;
			retarget(false);
		} else {
			retarget(true);
		}
		populate();
	}

	/** seat motes along the strand between two unit heights, spread by rank, each with its own pace */
	function seatMotes(count: number, uLo = 0, uHi = 1) {
		if (count <= 0 || !N) return;
		const rand = random(0xbe11 + motes.length);
		const rLo = uLo * (N - 1);
		const rHi = uHi * (N - 1);
		for (let i = 0; i < count; i++) {
			const rank = rLo + ((i + rand() * 0.8) / count) * (rHi - rLo);
			const seat = current[Math.min(N - 1, Math.round(rank))] ?? { x: 0, y: 0 };
			motes.push({
				x: seat.x + (rand() - 0.5) * 24,
				y: seat.y + (rand() - 0.5) * 18,
				vx: 0,
				vy: 0,
				rank,
				pace: 0.6 + rand() * 0.9,
				weight: 0.55 + rand() * 0.9,
				turb: 0,
				// more run near the warp than at the selvedge
				side: (rand() + rand() - 1) * 1.15
			});
		}
	}

	/** as many inhabitants as the height asks for: top up along the whole strand, or trim */
	function populate() {
		const want = Math.round(220 * Math.max(1, Math.min(5, height / 900)));
		if (motes.length > want) motes.length = want;
		else seatMotes(want - motes.length);
	}

	/** the band the strand occupies: a fabric's breadth down the left of the canvas */
	function placeX(x: number) {
		const narrow = width <= 720;
		const across = (x + 1) * 0.5;
		return width * ((narrow ? 0.04 : 0.03) + across * (narrow ? 0.9 : 0.27));
	}

	const smooth = (t: number) => {
		const c = Math.min(1, Math.max(0, t));
		return c * c * (3 - 2 * c);
	};

	/** where each seen landing sits along the strand, as a unit height */
	function landingBands() {
		if (!canvas) return [];
		const top = canvas.getBoundingClientRect().top;
		return landings
			.filter((l) => l.seen && l.el)
			.map((l) => ({
				u: U(l.el.getBoundingClientRect().top - top),
				phase: Math.max(0, Math.min(regimes.length - 1, l.phase))
			}))
			.sort((a, b) => a.u - b.u);
	}

	/** the strand's target form: regime 0 at the top, blending into each landing's regime below it */
	/** the landings in effect, and the strand's height map, for inspection */
	let bandsNow = '';
	let knotsNow = '';
	function retarget(snap = false) {
		if (!N || !width || !height) return;
		const bands = landingBands();
		bandsNow = bands.map((b) => `${b.phase}@${b.u.toFixed(2)}`).join(' ');
		knotsNow = knots.map((k) => `${k.u.toFixed(3)}:${Math.round(k.y)}`).join(' ');
		// half the height of the band over which one regime becomes the next: wide enough
		// that the handoff reads as the strand bending, not stepping
		const HALF = 0.06;
		target = new Array(N);
		hue = new Array(N);
		for (let r = 0; r < N; r++) {
			const u = r / Math.max(1, N - 1);
			let x = forms[0][r].x;
			let h = 0;
			for (const b of bands) {
				const s = smooth((u - (b.u - HALF)) / (2 * HALF));
				x += (forms[b.phase][r].x - x) * s;
				h += (b.phase / (regimes.length - 1) - h) * s;
			}
			target[r] = { x: placeX(x), y: Y(u) };
			hue[r] = h;
		}
		if (snap || reduced || current.length !== N) {
			current = target.map((p) => ({ ...p }));
			hueNow = hue.slice();
		}
		run();
	}

	function aim(at: HTMLElement | null) {
		if (!canvas) return;
		if (at) {
			const top = canvas.getBoundingClientRect().top;
			const r = at.getBoundingClientRect();
			spotY = r.top - top + r.height / 2;
			if (!glowNow) spotYNow = spotY;
			glow = 1;
		} else {
			glow = 0;
		}
		if (reduced) {
			glowNow = glow;
			spotYNow = spotY;
		}
		run();
	}

	/**
	 * where the page grew, if it grew as one opening between the anchors (a frame
	 * settling in): the old y of the cut. null when it grew some other way.
	 */
	function cutAt(now: Map<HTMLElement, number>, delta: number): number | null {
		if (delta < 24) return null;
		const known = [...now.keys()]
			.filter((el) => tops.has(el))
			.sort((p, q) => (tops.get(p) ?? 0) - (tops.get(q) ?? 0));
		if (known.length < 2) return null;
		// an exchange mid-reveal is translating a little; that is not the page growing
		const SLACK = 24;
		let cut: number | null = null;
		for (const el of known) {
			const moved = (now.get(el) ?? 0) - (tops.get(el) ?? 0);
			if (cut === null && Math.abs(moved) <= SLACK) continue;
			if (Math.abs(moved - delta) > SLACK) return null;
			cut ??= tops.get(el) ?? null;
		}
		return cut;
	}

	/** the strand and its inhabitants scaled with the canvas, as one figure */
	function rescale(fw: number, fh: number) {
		for (const k of knots) k.y *= fh;
		for (const c of current) {
			c.x *= fw;
			c.y *= fh;
		}
		for (const m of motes) {
			m.x *= fw;
			m.y *= fh;
		}
		spotY *= fh;
		spotYNow *= fh;
	}

	/**
	 * the page grew by `delta` at `y0` — a frame opened. the strand keeps its place
	 * above, stretches a little across the opening, and moves down with the dialogue
	 * below, in the same instant the page itself reflowed. nothing streams.
	 */
	function grow(y0: number, delta: number) {
		const S = Math.max(120, delta * 1.5);
		const a = Math.max(Y(0), Math.min(y0, Y(1) - S));
		const ua = U(a);
		const ub = U(a + S);
		const was = Array.from({ length: N }, (_, r) => Y(r / Math.max(1, N - 1)));
		const spotU = U(spotY);
		const spotUNow = U(spotYNow);
		knots = [
			...knots.filter((k) => k.u < ua),
			{ u: ua, y: a },
			{ u: ub, y: a + S + delta },
			...knots.filter((k) => k.u > ub).map((k) => ({ u: k.u, y: k.y + delta }))
		];
		const dy = was.map((y, r) => Y(r / Math.max(1, N - 1)) - y);
		for (let r = 0; r < N; r++) current[r].y += dy[r];
		for (const m of motes) m.y += dy[Math.min(N - 1, Math.max(0, Math.round(m.rank)))];
		spotY = Y(spotU);
		spotYNow = Y(spotUNow);
		// the new ground is peopled at the density the rest of the strand has
		seatMotes(Math.round((motes.length * delta) / Math.max(1, Y(1) - Y(0))), ua, ub);
		retarget(false);
	}

	function resize() {
		if (!canvas || !context) return;
		const rect = canvas.getBoundingClientRect();
		if (rect.width < 2 || rect.height < 2) return;
		const now = measure();
		const delta = rect.height - laidH;
		const cut = N ? cutAt(now, delta) : null;
		tops = now;
		width = rect.width;
		height = rect.height;
		const dpr = Math.min(window.devicePixelRatio || 1, 2);
		canvas.width = Math.round(width * dpr);
		canvas.height = Math.round(height * dpr);
		context.setTransform(dpr, 0, 0, dpr, 0, 0);
		if (!N) {
			seatKnots(height);
			laidW = width;
			laidH = height;
			build();
			return;
		}
		const fw = width / laidW;
		if (cut !== null) {
			// a frame opened: grow in place
			if (fw !== 1) rescale(fw, 1);
			laidW = width;
			laidH = height;
			grow(cut, delta);
			return;
		}
		// grown some other way (the window, another concern): the whole figure scales;
		// by much, and it is re-densified too
		const grown = Math.abs(delta) / laidH;
		rescale(fw, height / laidH);
		laidW = width;
		laidH = height;
		if (grown > 0.2) build();
		else retarget(false);
	}

	/** how far a tie reaches: enough to cross the weave, so the fabric stays joined */
	function reachFor() {
		return Math.max(Math.min(178, Math.max(104, height / 7.2)), width * 0.13);
	}

	/** settle current toward target; true while anything is still moving */
	function step(dt: number) {
		const k = 1 - Math.pow(0.88, dt);
		let moving = false;
		for (let r = 0; r < N; r++) {
			const c = current[r];
			const t = target[r];
			const dx = t.x - c.x;
			const dy = t.y - c.y;
			if (Math.abs(dx) > 0.05 || Math.abs(dy) > 0.05) moving = true;
			c.x += dx * k;
			c.y += dy * k;
			const dh = hue[r] - hueNow[r];
			if (Math.abs(dh) > 0.002) moving = true;
			hueNow[r] += dh * k;
		}
		const dg = glow - glowNow;
		if (Math.abs(dg) > 0.005) moving = true;
		glowNow += dg * k;
		const ds = spotY - spotYNow;
		if (Math.abs(ds) > 0.5) moving = true;
		spotYNow += ds * k;
		return moving;
	}

	/** the inhabitants: run down the strand, pulled by the pointer, eased by the spring */
	function flow(dt: number) {
		if (!N || target.length !== N) return;
		const seconds = (dt * 16.67) / 1000;
		// the pointer's reach scales with the page; its pull at the centre stays as it was
		const R2 = Math.max(33, width * 0.05) ** 2;
		const G = (6.2 * R2) / 1100;
		for (const m of motes) {
			const r = Math.min(N - 1, Math.max(0, Math.round(m.rank)));
			// the current runs at its pace in px, so it is no quicker where the strand is stretched
			const next = Math.min(N - 1, r + 1);
			const pxPerRank = Math.max(0.5, target[next].y - target[next - 1].y);
			// quicker below each landing: the deeper the regime, the faster the current
			m.rank += (FLOW * (1 + hueNow[r] * 0.6) * m.pace * seconds) / pxPerRank;
			if (m.rank > N - 1) {
				// off the bottom: return to the top without streaking the page
				m.rank -= N - 1;
				const seat = current[0];
				m.x = seat.x;
				m.y = seat.y;
				m.vx = 0;
				m.vy = 0;
			}
			// the target wanders a few ranks either way — the strand folds back on itself
			// within the arm, so a small step in rank is a sideways lick in space
			m.turb = m.turb * Math.pow(0.94, dt) + (Math.random() - 0.5) * 1.6 * dt;
			// the weft drifts slowly across the ribbon and turns back at the selvedge
			m.side += (Math.random() - 0.5) * 0.05 * dt;
			if (m.side > 1.15) m.side = 2.3 - m.side;
			if (m.side < -1.15) m.side = -2.3 - m.side;
			const warp = current[Math.min(N - 1, Math.max(0, Math.round(m.rank + m.turb * 4)))];
			const tx = warp.x + m.side * width * RIBBON;
			m.vx += (tx - m.x) * 0.0038 * dt;
			m.vy += (warp.y - m.y) * 0.0038 * dt;
			if (pointer.active) {
				const dx = pointer.x - m.x;
				const dy = pointer.y - m.y;
				const g = (G * m.weight * dt) / (dx * dx + dy * dy + R2);
				m.vx += dx * g;
				m.vy += dy * g;
			}
			m.vx *= Math.pow(0.91, dt);
			m.vy *= Math.pow(0.91, dt);
			m.x += m.vx * dt;
			m.y += m.vy * dt;
		}
	}

	function draw() {
		if (!context || !width || !height || !N) return;
		const ctx = context;
		ctx.clearRect(0, 0, width, height);
		ctx.globalCompositeOperation = 'lighter';
		const reach = reachFor();
		const sigma = height * 0.03;
		const rgb = (h: number) =>
			`${Math.round(76 + (128 - 76) * h)}, ${Math.round(201 + (255 - 201) * h)}, ${Math.round(240 + (219 - 240) * h)}`;
		const lit = (y: number) => {
			if (glowNow < 0.01) return 0;
			const d = (y - spotYNow) / sigma;
			return glowNow * Math.exp(-d * d);
		};
		// the strand dissolves at the canvas's ends rather than being cut on a line
		const edge = (y: number) => Math.max(0, Math.min(1, y / 140, (height - y) / 280));

		// the form itself is never drawn: it is only where the inhabitants go. anything
		// static — a dot, or a junction where faint lines meet — would read as a frozen
		// node beside the moving ones, so nothing on this canvas holds still.
		// the inhabitants: tied to their near neighbours along the strand, then drawn
		const order = motes.slice().sort((a, b) => a.rank - b.rank);
		ctx.lineWidth = 0.8;
		for (let i = 0; i < order.length; i++) {
			const a = order[i];
			for (let j = i + 1; j < Math.min(order.length, i + 14); j++) {
				const b = order[j];
				const distance = Math.hypot(a.x - b.x, a.y - b.y);
				if (distance >= reach) continue;
				const boost = lit((a.y + b.y) / 2);
				const h = hueNow[Math.min(N - 1, Math.round((a.rank + b.rank) / 2))];
				// ground, not figure: faint enough to sit behind the type; the glow lifts it where attention points
				const alpha =
					Math.pow(1 - distance / reach, 2) * (0.12 + boost * 0.3) * edge((a.y + b.y) / 2);
				ctx.strokeStyle = `rgba(${rgb(h)}, ${alpha})`;
				ctx.beginPath();
				ctx.moveTo(a.x, a.y);
				ctx.lineTo(b.x, b.y);
				ctx.stroke();
			}
		}
		for (const m of motes) {
			const boost = lit(m.y);
			const h = hueNow[Math.min(N - 1, Math.max(0, Math.round(m.rank)))];
			ctx.fillStyle = `rgba(${rgb(h)}, ${(0.1 + m.weight * 0.07 + boost * 0.4) * edge(m.y)})`;
			ctx.beginPath();
			ctx.arc(m.x, m.y, 0.7 + m.weight * 0.5 + boost * 1.2, 0, Math.PI * 2);
			ctx.fill();
		}

		ctx.globalCompositeOperation = 'source-over';
	}

	function tick(time: number) {
		frame = 0;
		if (!visible) return;
		const dt = Math.min(1.7, Math.max(0.35, (time - last) / 16.67 || 1));
		last = time;
		if (!reduced) {
			step(dt);
			flow(dt);
		}
		draw();
		// the inhabitants never rest while the strand is on screen
		if (!reduced) frame = requestAnimationFrame(tick);
	}

	function run() {
		if (!mounted) return;
		if (reduced) {
			current = target.map((p) => ({ ...p }));
			hueNow = hue.slice();
			draw();
			return;
		}
		if (visible && !frame) {
			last = 0;
			frame = requestAnimationFrame(tick);
		}
	}

	$: if (mounted && landings) retarget();
	$: if (mounted) aim(spot);
	// the anchors are known before the page grows between them
	$: if (mounted && anchors) tops = measure();

	onMount(() => {
		context = canvas.getContext('2d');
		host = canvas.parentElement;
		if (!context || !host) return;
		reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

		// the pointer pulls on the inhabitants; a touch does not
		const move = (event: PointerEvent) => {
			const rect = canvas.getBoundingClientRect();
			pointer.x = event.clientX - rect.left;
			pointer.y = event.clientY - rect.top;
			pointer.active = event.pointerType !== 'touch';
		};
		const leave = () => (pointer.active = false);
		host.addEventListener('pointermove', move, { passive: true });
		host.addEventListener('pointerleave', leave, { passive: true });

		const sizes = new ResizeObserver(resize);
		sizes.observe(host);
		const viewport = new IntersectionObserver(
			([entry]) => {
				visible = entry.isIntersecting;
				if (visible) run();
				else if (frame) {
					cancelAnimationFrame(frame);
					frame = 0;
				}
			},
			{ rootMargin: '160px 0px' }
		);
		viewport.observe(host);

		mounted = true;
		resize();

		return () => {
			mounted = false;
			host?.removeEventListener('pointermove', move);
			host?.removeEventListener('pointerleave', leave);
			sizes.disconnect();
			viewport.disconnect();
			if (frame) cancelAnimationFrame(frame);
		};
	});
</script>

<canvas
	bind:this={canvas}
	class="attractor"
	data-landings={landings.length}
	data-bands={bandsNow}
	data-knots={knotsNow}
	aria-hidden="true"
></canvas>

<style>
	.attractor {
		position: absolute;
		/* bleeds past the dialogue sideways only, so a mote pulled to the edge is not cut
		   mid-body; top and bottom stay on the section's own line */
		inset: 0 -120px;
		/* a canvas is a replaced element: `auto` would fall back to its intrinsic size */
		width: calc(100% + 240px);
		height: 100%;
		pointer-events: none;
		z-index: 0;
		/* the only ground beneath the dialogue — and ground, so it stays behind the type */
		opacity: 0.85;
		mask-image: linear-gradient(90deg, black 0%, black 42%, transparent 62%);
	}

	@media (max-width: 600px) {
		.attractor {
			mask-image: linear-gradient(90deg, black 0%, black 76%, transparent 100%);
		}
	}

	@media (prefers-reduced-motion: reduce) {
		.attractor {
			opacity: 0.7;
		}
	}
</style>
