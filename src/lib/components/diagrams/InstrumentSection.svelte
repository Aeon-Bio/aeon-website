<!--
  The plate, the hand above it and the eye beneath it, as a long exposure.

  Three views of one patch of a standard plate, in one world.
  From the side, low over the plate, drifting slowly: the plate is a grid of
  faint cultures; a watcher walks underneath it at a steady pace, its light
  reaching the eye through the floor of the well it is under and only faintly
  across the body between wells, sliding against the rim as the camera
  drifts, so the plate is known by what it hides and by parallax. The camera
  closes on the well the watcher has stopped under; a change appears at a
  fixed height above it, waits, falls under gravity, lands near the wall and
  spreads. Then a cross-fade on that well to the watcher's own view: up
  through the floor, close, where the cells are seen one by one and answer
  with their own kinetics, or do not. Then it pulls back to the plate from
  below and the experiment runs: the same change again, wells one after
  another; three strengths, the answer in how many cells are recruited; a row
  never touched, there all along; a night; a day later the same cells
  answering again. One sentence names each beat after the light has shown it.
  At the end the view fades back to the side with the maps settled, they
  dissolve, and it begins again.
  Nothing is drawn. Every light is a field or a point; the robot is where
  changes come from, the watcher is where the light under the plate is, the
  plate is the plane the cells sit on and the body that hides the lamp.
  Same material as the mark: soft plates at quarter resolution, light that
  adds, one colour ramp from deep space through primary and biolum to white.
  Reduced motion: one exposure from above with the maps settled and one
  sentence.
-->
<script>
	import { onMount } from 'svelte';

	const FW = 800;
	const PITCH = 220;
	const R = 79; // well to pitch as on a standard plate
	const X0 = [200, 420, 640]; // the three whole wells; a ring of partial wells runs off the frame
	const Y0 = [172, 392, 612];

	const PRIMARY = [76, 201, 240];
	const BIOLUM = [128, 255, 219];
	const WHITE = [255, 255, 255];

	// the process
	const FRONT_T = 3.6; // s for a change to cross a well
	const RISE = 0.24; // s, the steep rise of an answer
	const ENTRY_A = -1.05; // a change is put in from the same side of every well
	const CYCLE = 50; // s, one experiment
	const DROP_H = 150; // the fixed height a change is released from, above the plate
	const HOVER = 0.3; // s it waits there before it is released
	const FALL = 0.6; // s, the fall under gravity
	const OBS_Z = -110; // the watcher, under the plate: what the eye sees is the floor it lights, not the lamp
	const D2R = Math.PI / 180;
	const NIGHT = [28.5, 34.0]; // the dark interval

	// the camera: target on the plate, azimuth, elevation, distance, focal length, and the up hint (0 sky-up, 1 the from-below frame)
	const SYSTEM = { tx: 420, ty: 430, az: -5 * D2R, el: 22 * D2R, dist: 1700, f: 1700 * 0.8, k: 0 };
	const SYSTEM_DRIFT = { ...SYSTEM, az: 5 * D2R }; // a slow sideways drift: parallax tells what is under the plate
	const CLOSE = { tx: 200, ty: 392, az: 4 * D2R, el: 22 * D2R, dist: 1700, f: 1700 * 2.1, k: 0 };
	const CLOSE_DRIFT = { ...CLOSE, az: 7 * D2R };
	const PLATE = { tx: 400, ty: 400, az: 0, el: -90 * D2R, dist: 8000, f: 8000, k: 1 };
	const MACRO = { tx: 200, ty: 392, az: 0, el: -90 * D2R, dist: 8000, f: 8000 * 3.3, k: 1 };

	// the experiment, in order; a sentence names what the light has just shown
	const SCRIPT = [
		{ at: 0.0, cam: SYSTEM_DRIFT, dur: 6.0 },
		{ at: 2.0, cam: CLOSE, dur: 1.5 },
		{ at: 3.5, cam: CLOSE_DRIFT, dur: 3.0 },
		{ at: 3.5, change: ['M0', 1] },
		{ at: 3.8, say: 'Changes come from above.' },
		{ at: 5.2, fade: MACRO, dur: 0.9 },
		{ at: 6.4, say: 'We watch from below.' },
		{ at: 11.0, cam: PLATE, dur: 1.6 },
		{ at: 12.8, say: 'The same change, again.' },
		{ at: 13.0, change: ['M1', 1] },
		{ at: 13.6, change: ['M2', 1] },
		{ at: 18.0, say: 'Three strengths.' },
		{ at: 18.2, change: ['T0', 0.3] },
		{ at: 18.8, change: ['T1', 0.55] },
		{ at: 19.4, change: ['T2', 1] },
		{ at: 24.0, say: 'These were never touched.' },
		{ at: 28.5, say: '' },
		{ at: 34.0, say: 'A day later. The same cells.' },
		{ at: 34.2, change: ['T0', 0.3] },
		{ at: 34.8, change: ['T1', 0.55] },
		{ at: 35.4, change: ['T2', 1] },
		{ at: 36.2, change: ['M0', 1] },
		{ at: 36.8, change: ['M1', 1] },
		{ at: 37.4, change: ['M2', 1] },
		{ at: 42.0, say: '' },
		{ at: 42.5, fade: SYSTEM, dur: 1.2 },
		{ at: 43.7, cam: SYSTEM_DRIFT, dur: 6.3 },
		{ at: 46.5, dissolve: true }
	];
	// the watcher's walk: a steady pace, neighbour to neighbour, stopping under the well the change will go into
	const WALK = [[0, 'T2'], [1.0, 'T1'], [2.0, 'T0'], [3.0, 'M0'], [7.5, 'M0'], [8.5, 'M1'], [9.5, 'M2'], [10.5, 'B2'], [11.5, 'B1'], [12.5, 'B0'], [13.5, 'M0'], [14.5, 'T0'], [15.5, 'T1'], [16.5, 'T2']];
	const STILL =
		'Changes come from above; we watch from below. Three strengths, three repeats, three never touched; a day later the same cells answer again.';
	// (the sentence of the still exposure)

	let canvas;
	let field;
	let live = false;
	let caption = '';
	let capOff = true;
	let still = false; // reduced motion: one frame, the sentence set beneath it

	function mulberry(seed) {
		return () => {
			seed |= 0;
			seed = (seed + 0x6d2b79f5) | 0;
			let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
			t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
			return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
		};
	}
	function valueNoise(seed) {
		const r = mulberry(seed);
		const G = 64;
		const g = new Float32Array(G * G);
		for (let i = 0; i < g.length; i++) g[i] = r();
		const sm = (t) => t * t * (3 - 2 * t);
		return (x, y) => {
			const x0 = Math.floor(x),
				y0 = Math.floor(y),
				fx = sm(x - x0),
				fy = sm(y - y0);
			const v = (i, j) => g[(((j % G) + G) % G) * G + (((i % G) + G) % G)];
			return (
				(v(x0, y0) * (1 - fx) + v(x0 + 1, y0) * fx) * (1 - fy) +
				(v(x0, y0 + 1) * (1 - fx) + v(x0 + 1, y0 + 1) * fx) * fy
			);
		};
	}
	const noise2 = (n, x, y, s) => 0.65 * n(x / s, y / s) + 0.35 * n(x / (s * 0.45) + 17, y / (s * 0.45) + 9);
	const smooth = (u) => (u <= 0 ? 0 : u >= 1 ? 1 : u * u * (3 - 2 * u));
	const cross = (a, b) => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];
	const norm = (a) => {
		const l = Math.hypot(a[0], a[1], a[2]) || 1;
		return [a[0] / l, a[1] / l, a[2] / l];
	};

	function mix(a, b, t) {
		return [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t, a[2] + (b[2] - a[2]) * t];
	}
	function rgba(c, a) {
		return `rgba(${c[0] | 0},${c[1] | 0},${c[2] | 0},${Math.max(0, Math.min(1, a))})`;
	}

	// the wells: three by three whole, and the ring around them cut by the frame
	const WELLS = [];
	const NAMED = {};
	for (let r = -1; r <= 3; r++)
		for (let c = -1; c <= 3; c++) {
			const w = { x: X0[0] + c * PITCH, y: Y0[0] + r * PITCH, entryA: ENTRY_A, entry: null, impactT: -100, dose: 0, cells: [] };
			WELLS.push(w);
			if (c >= 0 && c <= 2) {
				if (r === 0) NAMED['T' + c] = w;
				if (r === 1) NAMED['M' + c] = w;
				if (r === 2) NAMED['B' + c] = w;
			}
		}
	function wellAt(x, y) {
		const c = Math.round((x - X0[0]) / PITCH),
			r = Math.round((y - Y0[0]) / PITCH);
		if (c < -1 || c > 3 || r < -1 || r > 3) return null;
		return WELLS[(r + 1) * 5 + (c + 1)];
	}

	/** the cultures: one Poisson-disc population per well, spacing on a slow field, thinner at the wall */
	function culture(rnd, nDensity) {
		const cell = 8 / Math.SQRT2;
		const gw = Math.ceil(FW / cell);
		const grid = [];
		for (let i = 0; i < gw * gw; i++) grid.push([]);
		const pts = [];
		const active = [];
		const spacingAt = (x, y) => 8 + 14 * Math.pow(noise2(nDensity, x, y, 70), 1.6);
		const inWell = (x, y) => {
			const w = wellAt(x, y);
			if (!w) return false;
			const d = Math.hypot(x - w.x, y - w.y) / R;
			if (d >= 0.975) return false;
			if (d > 0.86) return rnd() < 1 - ((d - 0.86) / 0.115) * 0.85;
			return true;
		};
		const ok = (p) => {
			const gx = (p[0] / cell) | 0,
				gy = (p[1] / cell) | 0,
				need = spacingAt(p[0], p[1]);
			const reach = Math.ceil(need / cell);
			for (let y = Math.max(0, gy - reach); y <= Math.min(gw - 1, gy + reach); y++)
				for (let x = Math.max(0, gx - reach); x <= Math.min(gw - 1, gx + reach); x++)
					for (const i of grid[y * gw + x]) {
						const q = pts[i];
						if (Math.hypot(q[0] - p[0], q[1] - p[1]) < 0.5 * (need + spacingAt(q[0], q[1]))) return false;
					}
			return true;
		};
		const add = (p) => {
			pts.push(p);
			active.push(pts.length - 1);
			grid[((p[1] / cell) | 0) * gw + ((p[0] / cell) | 0)].push(pts.length - 1);
		};
		for (const w of WELLS) {
			const sx = Math.max(6, Math.min(FW - 6, w.x + 8)),
				sy = Math.max(6, Math.min(FW - 6, w.y - 5));
			if (inWell(sx, sy)) add([sx, sy]);
		}
		while (active.length) {
			const ai = (rnd() * active.length) | 0,
				p = pts[active[ai]];
			let found = false;
			for (let k = 0; k < 24; k++) {
				const a = rnd() * 6.2832,
					d = spacingAt(p[0], p[1]) * (1 + rnd());
				const q = [p[0] + Math.cos(a) * d, p[1] + Math.sin(a) * d];
				if (q[0] < 2 || q[1] < 2 || q[0] > FW - 2 || q[1] > FW - 2) continue;
				if (!inWell(q[0], q[1])) continue;
				if (ok(q)) {
					add(q);
					found = true;
					break;
				}
			}
			if (!found) active.splice(ai, 1);
		}
		return pts;
	}

	// the light of one answer: a steep rise, then a fast and a slow clearance
	function kernel(dt) {
		if (dt < 0) return 0;
		if (dt < RISE) {
			const u = dt / RISE;
			return u * u * u;
		}
		const s = dt - RISE;
		return 0.4 * Math.exp(-s / 1.2) + 0.6 * Math.exp(-s / 14);
	}
	// a spontaneous flash: brief, and leaves nothing
	function flash(dt) {
		if (dt < 0) return 0;
		if (dt < 0.12) return dt / 0.12;
		return Math.exp(-(dt - 0.12) / 0.5);
	}

	onMount(() => {
		if (!canvas || !field) return;
		const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
		const ctx0 = canvas.getContext('2d');
		if (!ctx0) return;

		const rnd = mulberry(11);
		const nDensity = valueNoise(3),
			nOrient = valueNoise(5),
			nSens = valueNoise(7);
		const logn = (mu, sig) => Math.exp(mu + sig * (rnd() + rnd() + rnd() + rnd() - 2) * 0.9);
		for (const w of WELLS) w.entryA = ENTRY_A + (rnd() - 0.5) * 0.16;
		// each cell is an individual: footprint, orientation, kinetics, and the strength it needs before it answers.
		// thresholds are drawn per cell, never from a field across the plate: heterogeneity lives inside a well, not between wells
		const cells = culture(rnd, nDensity).map(([x, y]) => {
			const w = wellAt(x, y);
			const c = {
				x,
				y,
				o: noise2(nOrient, x, y, 120) * 6.2832 * 1.5 + (rnd() - 0.5) * 0.5,
				size: 2.6 * logn(0, 0.3),
				aspect: 1.25 + rnd() * 0.75,
				gain: logn(-0.35, 0.6),
				latency: 0.18 + rnd() * 0.17,
				quiet: rnd() < 0.18, // some never answer; a uniform response would be a lie
				thr: Math.pow(rnd(), 0.635) * (0.88 + 0.24 * noise2(nSens, x, y, 45)),
				arriveAt: -1,
				pending: 0,
				events: [],
				evidence: 0,
				L: 0
			};
			w.cells.push(c);
			return c;
		});

		// ---- the process -------------------------------------------------------
		let lastT = 0;
		let cycleT0 = 0;
		let dissolving = false;
		const fired = new Set();
		let capTimer = 0;
		const cam = { ...SYSTEM };
		let camFrom = { ...SYSTEM },
			camTo = { ...SYSTEM },
			camT0 = -10,
			camDur = 1;
		let fade = null; // a cross-fade between two views on the same well: { from, to, t0, dur }
		const drops = []; // changes on their way down
		function say(text) {
			capOff = true;
			clearTimeout(capTimer);
			if (text)
				capTimer = setTimeout(() => {
					caption = text;
					capOff = false;
				}, 320);
		}
		function change(w, dose, t) {
			const d = R * 0.78; // near the wall, where a change is put in; the same place every time
			w.entry = [w.x + Math.cos(w.entryA) * d, w.y + Math.sin(w.entryA) * d];
			w.impactT = t + HOVER + FALL;
			w.dose = dose;
			drops.push({ x: w.entry[0], y: w.entry[1], t0: t, t1: w.impactT, dose });
			const reach = 0.45 + 0.55 * dose; // how far across the well a change of this strength carries
			for (const c of w.cells) {
				const dist = Math.hypot(c.x - w.entry[0], c.y - w.entry[1]) / (2 * R);
				if (c.quiet || dose < c.thr || dist > reach) {
					c.arriveAt = -1;
					c.pending = 0;
					continue;
				}
				const transit = FRONT_T * dist * dist;
				c.arriveAt = w.impactT + transit * (1 + 0.4 * (rnd() - 0.5)) + c.latency;
				c.pending = Math.min(1.3, c.gain * 1.05);
			}
		}
		function moveCam(to, dur, t) {
			camFrom = { ...cam };
			camTo = to;
			camT0 = t;
			camDur = dur;
		}
		function fadeCam(to, dur, t) {
			fade = { from: { ...cam }, to, t0: t, dur };
			Object.assign(cam, to);
			camFrom = { ...to };
			camTo = to;
			camT0 = t - 10;
		}
		// where the watcher is, on its walk
		function watcherAt(u) {
			const last = WALK[WALK.length - 1][0];
			const v = u < last ? u : last - 10 + ((u - last) % 10); // after the opening it loops the plate at the same pace
			let i = 0;
			while (i < WALK.length - 2 && v >= WALK[i + 1][0]) i++;
			const a = NAMED[WALK[i][1]],
				b = NAMED[WALK[i + 1][1]];
			const k = Math.max(0, Math.min(1, (v - WALK[i][0]) / (WALK[i + 1][0] - WALK[i][0])));
			return [a.x + (b.x - a.x) * k, a.y + (b.y - a.y) * k];
		}
		function stepProcess(t, quiet) {
			const dt = Math.min(0.05, Math.max(0, t - lastT));
			lastT = t;
			let u = t - cycleT0;
			if (u >= CYCLE) {
				cycleT0 = t;
				u = 0;
				fired.clear();
				dissolving = false;
				fade = null;
				drops.length = 0;
				for (const c of cells) {
					c.events.length = 0;
					c.evidence = 0;
					c.arriveAt = -1;
				}
				for (const w of WELLS) w.impactT = -100;
			}
			for (let i = 0; i < SCRIPT.length; i++) {
				const e = SCRIPT[i];
				if (fired.has(i) || u < e.at) continue;
				fired.add(i);
				if (e.say !== undefined && !quiet) say(e.say);
				if (e.change) change(NAMED[e.change[0]], e.change[1], t);
				if (e.cam) moveCam(e.cam, e.dur, t);
				if (e.fade) fadeCam(e.fade, e.dur, t);
				if (e.dissolve) dissolving = true;
			}
			if (fade && t > fade.t0 + fade.dur) fade = null;
			// the camera, between its views
			const k = smooth((t - camT0) / camDur);
			cam.tx = camFrom.tx + (camTo.tx - camFrom.tx) * k;
			cam.ty = camFrom.ty + (camTo.ty - camFrom.ty) * k;
			cam.az = camFrom.az + (camTo.az - camFrom.az) * k;
			cam.el = camFrom.el + (camTo.el - camFrom.el) * k;
			cam.k = camFrom.k + (camTo.k - camFrom.k) * k;
			cam.dist = Math.exp(Math.log(camFrom.dist) + (Math.log(camTo.dist) - Math.log(camFrom.dist)) * k);
			cam.f = Math.exp(Math.log(camFrom.f) + (Math.log(camTo.f) - Math.log(camFrom.f)) * k);
			while (drops.length && t > drops[0].t1 + 0.1) drops.shift();
			for (const c of cells) {
				if (c.arriveAt >= 0 && t >= c.arriveAt) {
					if (c.pending > 0.03) {
						c.events.push({ t: c.arriveAt, a: c.pending, caused: true });
						c.evidence += 0.22 * c.pending; // the slow layer: what answered because of the change
					}
					c.arriveAt = -1;
				}
				// spontaneous activity, uncaused: part of the picture, never part of the evidence
				if (rnd() < dt * 0.006) c.events.push({ t, a: 0.35 + 0.4 * rnd(), caused: false });
				if (c.events.length > 4) c.events.shift();
				c.evidence *= dissolving ? 1 - dt / 0.9 : 1 - dt / 240; // the slow layer nearly does not forget
			}
		}

		// ---- the camera and the exposure ---------------------------------------
		const plate = document.createElement('canvas');
		const pctx = plate.getContext('2d');
		const mask = document.createElement('canvas');
		const mctx = mask.getContext('2d');
		const HS = 0.25;
		let hs = HS;
		let S = 1,
			dpr = 1;
		let C = null; // the camera basis this frame
		const xa = document.createElement('canvas'); // the two views of a cross-fade
		const xb = document.createElement('canvas');

		function camera(v) {
			const ce = Math.cos(v.el),
				se = Math.sin(v.el),
				ca = Math.cos(v.az),
				sa = Math.sin(v.az);
			const eye = [v.tx + sa * ce * v.dist, v.ty - ca * ce * v.dist, se * v.dist]; // on the near side, swung by the azimuth
			const fwd = norm([-sa * ce, ca * ce, -se]);
			const hint = norm([sa * v.k, -ca * v.k, 1 - v.k]);
			const right = norm(cross(fwd, hint)),
				up = cross(right, fwd);
			C = { eye, fwd, right, up, f: v.f * S * dpr, cx: canvas.width / 2, cy: canvas.height / 2 };
		}
		function proj(x, y, z) {
			const dx = x - C.eye[0],
				dy = y - C.eye[1],
				dz = z - C.eye[2];
			const pz = dx * C.fwd[0] + dy * C.fwd[1] + dz * C.fwd[2];
			const s = C.f / Math.max(1, pz);
			return [
				C.cx + (dx * C.right[0] + dy * C.right[1] + dz * C.right[2]) * s,
				C.cy - (dx * C.up[0] + dy * C.up[1] + dz * C.up[2]) * s,
				s
			];
		}
		// an affine frame on the plate around (x, y) with unit = r
		function frameAt(x, y, r) {
			const o = proj(x, y, 0),
				a = proj(x + r, y, 0),
				b = proj(x, y + r, 0);
			return { ox: o[0], oy: o[1], ux: a[0] - o[0], uy: a[1] - o[1], vx: b[0] - o[0], vy: b[1] - o[1] };
		}
		function resize() {
			const r = field.getBoundingClientRect();
			dpr = Math.min(window.devicePixelRatio || 1, 2);
			const w = Math.max(1, Math.round(r.width));
			S = w / FW;
			canvas.width = canvas.height = xa.width = xa.height = xb.width = xb.height = Math.round(w * dpr);
			hs = canvas.width < 1100 ? 0.5 : HS; // small frames keep a finer soft plate
			plate.width = plate.height = mask.width = mask.height = Math.max(1, Math.round(canvas.width * hs));
		}
		// the medium stops where each culture stops: a feather at every wall, no ring
		function buildMask() {
			mctx.setTransform(1, 0, 0, 1, 0, 0);
			mctx.clearRect(0, 0, mask.width, mask.height);
			for (const w of WELLS) {
				const F = frameAt(w.x, w.y, R);
				mctx.setTransform(F.ux * hs, F.uy * hs, F.vx * hs, F.vy * hs, F.ox * hs, F.oy * hs);
				const g = mctx.createRadialGradient(0, 0, 0, 0, 0, 1);
				g.addColorStop(0, 'rgba(0,0,0,1)');
				g.addColorStop(0.82, 'rgba(0,0,0,1)');
				g.addColorStop(1, 'rgba(0,0,0,0)');
				mctx.fillStyle = g;
				mctx.beginPath();
				mctx.arc(0, 0, 1, 0, 6.2832);
				mctx.fill();
			}
			mctx.setTransform(1, 0, 0, 1, 0, 0);
		}
		function footprint(c, scale) {
			const o = proj(c.x, c.y, 0),
				ca = Math.cos(c.o),
				sa = Math.sin(c.o),
				A = c.size * c.aspect * scale,
				B = c.size * scale;
			const a = proj(c.x + ca * A, c.y + sa * A, 0),
				b = proj(c.x - sa * B, c.y + ca * B, 0);
			let ux = a[0] - o[0],
				uy = a[1] - o[1],
				vx = b[0] - o[0],
				vy = b[1] - o[1];
			const m = Math.min(Math.hypot(ux, uy), Math.hypot(vx, vy));
			if (m < 0.7) {
				const q = 0.7 / m;
				ux *= q;
				uy *= q;
				vx *= q;
				vy *= q;
			}
			ctx.setTransform(ux, uy, vx, vy, o[0], o[1]);
			ctx.beginPath();
			ctx.arc(0, 0, 1, 0, 6.2832);
			ctx.setTransform(1, 0, 0, 1, 0, 0);
		}

		let ctx = ctx0;
		function render(t, v, target) {
			ctx = target;
			camera(v);
			buildMask();
			ctx.setTransform(1, 0, 0, 1, 0, 0);
			ctx.clearRect(0, 0, canvas.width, canvas.height);
			ctx.imageSmoothingEnabled = true;
			ctx.imageSmoothingQuality = 'high';
			const side = Math.max(0, Math.min(1, (v.el / D2R + 70) / 50)); // how much the view is from the side: the watcher under the plate is seen only then
			const u = t - cycleT0;
			const night = smooth((u - NIGHT[0]) / 1.5) * (1 - smooth((u - NIGHT[1] + 1.5) / 1.5)); // the interval between the day and the day after

			// the medium, on the soft plate: a dim floor in every well; the watcher's light through the floor of the well it is under;
			// in a changed well, the change spreading from where it entered
			pctx.setTransform(1, 0, 0, 1, 0, 0);
			pctx.clearRect(0, 0, plate.width, plate.height);
			pctx.globalCompositeOperation = 'source-over';
			pctx.fillStyle = rgba(PRIMARY, 0.03 * (1 - 0.6 * night));
			pctx.fillRect(0, 0, plate.width, plate.height);
			pctx.globalCompositeOperation = 'lighter';
			const [rx, ry] = watcherAt(u);
			if (side > 0) {
				// the watcher, under the plate: its light reaches the eye through the floor of the well it is under; the mask hides it between wells
				const o = proj(rx, ry, 0);
				const rr = Math.max(1, Math.min(-1.2 * OBS_Z * o[2], 0.11 * canvas.width) * hs); // no bigger than a well's neighbourhood, even close to the camera
				const g = pctx.createRadialGradient(o[0] * hs, o[1] * hs, 0, o[0] * hs, o[1] * hs, rr);
				g.addColorStop(0, rgba(mix(PRIMARY, WHITE, 0.2), 0.55 * side));
				g.addColorStop(0.35, rgba(PRIMARY, 0.16 * side));
				g.addColorStop(1, rgba(PRIMARY, 0));
				pctx.fillStyle = g;
				pctx.beginPath();
				pctx.arc(o[0] * hs, o[1] * hs, rr, 0, 6.2832);
				pctx.fill();
			}
			for (const w of WELLS) {
				if (!w.entry) continue;
				const since = t - w.impactT;
				if (since <= 0) continue;
				const F = frameAt(w.x, w.y, R);
				pctx.setTransform(F.ux * hs, F.uy * hs, F.vx * hs, F.vy * hs, F.ox * hs, F.oy * hs);
				pctx.save();
				pctx.beginPath();
				pctx.arc(0, 0, 1, 0, 6.2832);
				pctx.clip();
				const ex = (w.entry[0] - w.x) / R,
					ey = (w.entry[1] - w.y) / R;
				const reach = 0.45 + 0.55 * w.dose,
					rad = 2 * reach * Math.sqrt(Math.min(1, since / FRONT_T));
				const held = (0.3 + 0.7 * Math.exp(-since / 6)) * (0.35 + 0.65 * w.dose);
				const fg = pctx.createRadialGradient(ex, ey, 0, ex, ey, Math.max(0.01, rad * 1.25));
				fg.addColorStop(0, rgba(PRIMARY, 0.13 * held));
				fg.addColorStop(0.5, rgba(PRIMARY, 0.07 * held));
				fg.addColorStop(0.8, rgba(PRIMARY, 0.025 * held));
				fg.addColorStop(1, rgba(PRIMARY, 0));
				pctx.fillStyle = fg;
				pctx.fillRect(-1.2, -1.2, 2.4, 2.4);
				if (since < 0.4) {
					// the landing: a point where the change entered, then nothing
					const g = pctx.createRadialGradient(ex, ey, 0, ex, ey, 6 / R);
					g.addColorStop(0, rgba(PRIMARY, 0.5 * (1 - since / 0.4) * (0.5 + 0.5 * w.dose)));
					g.addColorStop(1, rgba(PRIMARY, 0));
					pctx.fillStyle = g;
					pctx.fillRect(-1.2, -1.2, 2.4, 2.4);
				}
				pctx.restore();
			}
			pctx.setTransform(1, 0, 0, 1, 0, 0);
			// the halo of answering cells, on the same plate: small, few, never stacked into a wash
			for (const c of cells) {
				let l = 0;
				for (const e of c.events) l += e.a * (e.caused ? kernel(t - e.t) : flash(t - e.t));
				c.L = l;
				if (l > 0.25) {
					const o = proj(c.x, c.y, 0),
						rr = Math.max(0.5, c.size * 2.6 * o[2] * hs);
					const g = pctx.createRadialGradient(o[0] * hs, o[1] * hs, 0, o[0] * hs, o[1] * hs, rr);
					g.addColorStop(0, rgba(BIOLUM, 0.16 * Math.min(1, l)));
					g.addColorStop(1, rgba(BIOLUM, 0));
					pctx.fillStyle = g;
					pctx.beginPath();
					pctx.arc(o[0] * hs, o[1] * hs, rr, 0, 6.2832);
					pctx.fill();
				}
			}
			pctx.globalCompositeOperation = 'destination-in';
			pctx.drawImage(mask, 0, 0);
			pctx.globalCompositeOperation = 'source-over';
			ctx.globalCompositeOperation = 'lighter';
			ctx.drawImage(plate, 0, 0, canvas.width, canvas.height);
			if (side > 0) {
				// and a little of the watcher's light scatters through the body of the plate between wells, so the walk never breaks
				const o = proj(rx, ry, 0);
				const rr = Math.max(1, Math.min(-OBS_Z * o[2], 0.1 * canvas.width));
				const g = ctx.createRadialGradient(o[0], o[1], 0, o[0], o[1], rr);
				g.addColorStop(0, rgba(PRIMARY, 0.07 * side));
				g.addColorStop(1, rgba(PRIMARY, 0));
				ctx.fillStyle = g;
				ctx.beginPath();
				ctx.arc(o[0], o[1], rr, 0, 6.2832);
				ctx.fill();
			}

			// a change on its way in: it appears at the same fixed height above the well every time, waits, then falls under gravity.
			// From below it is out of focus and wide, gathering to a point as it nears the floor
			for (const d of drops) {
				const dt = t - d.t0;
				if (dt < 0 || t >= d.t1) continue;
				const fk = Math.max(0, Math.min(1, (dt - HOVER) / FALL));
				const z = DROP_H * (1 - fk * fk);
				const o = proj(d.x, d.y, z);
				const wide = 70 * (z / DROP_H) * (1 - side),
					r = (7 + wide) * o[2];
				const form = dt < HOVER ? 0.35 + 0.65 * (dt / HOVER) : 1; // it forms before it is released
				const a = form * Math.min(0.7, 0.045 * (77 / (7 + wide)) ** 2 + 0.5 * side) * (0.5 + 0.5 * d.dose);
				const g = ctx.createRadialGradient(o[0], o[1], 0, o[0], o[1], Math.max(1, r));
				g.addColorStop(0, rgba(mix(PRIMARY, WHITE, 0.35 * side), a));
				g.addColorStop(1, rgba(PRIMARY, 0));
				ctx.fillStyle = g;
				ctx.beginPath();
				ctx.arc(o[0], o[1], Math.max(1, r), 0, 6.2832);
				ctx.fill();
			}
			// the cultures: every footprint, faint at rest; brighter where the slow layer has settled
			for (const c of cells) {
				const ev = Math.min(1, c.evidence);
				const rest = (0.07 + 0.012 * Math.sin(t * 0.5 + c.x)) * (1 - 0.45 * night);
				ctx.fillStyle = rgba(mix(PRIMARY, BIOLUM, 0.5 * ev), rest + 0.3 * ev);
				footprint(c, 1);
				ctx.fill();
			}
			// the answer, now: biolum body; a white core only at the top of the steepest answers, for an instant
			for (const c of cells) {
				if (c.L < 0.03) continue;
				const l = Math.min(1, c.L);
				ctx.fillStyle = rgba(mix(BIOLUM, WHITE, 0.35 * l * l), 0.75 * l);
				footprint(c, 1 + 0.25 * l);
				ctx.fill();
				let recent = 0;
				for (const e of c.events) {
					const d = t - e.t;
					if (e.caused && d > RISE * 0.6 && d < RISE + 0.22 && e.a > 0.8) recent = Math.max(recent, e.a);
				}
				if (recent) {
					const o = proj(c.x, c.y, 0);
					ctx.fillStyle = rgba(WHITE, Math.min(1, recent));
					ctx.beginPath();
					ctx.arc(o[0], o[1], Math.max(0.8, 1.2 * o[2]), 0, 6.2832);
					ctx.fill();
				}
			}
			// the exposure fades at the edges of the frame: the plate goes on, the frame does not cut it
			ctx.globalCompositeOperation = 'destination-in';
			const W = canvas.width,
				E = Math.round(W * 0.07);
			for (const [x0, y0, x1, y1] of [
				[0, 0, E, 0],
				[W, 0, W - E, 0],
				[0, 0, 0, E],
				[0, W, 0, W - E]
			]) {
				const g = ctx.createLinearGradient(x0, y0, x1, y1);
				g.addColorStop(0, 'rgba(0,0,0,0)');
				g.addColorStop(1, 'rgba(0,0,0,1)');
				ctx.fillStyle = g;
				ctx.fillRect(0, 0, W, W);
			}
			ctx.globalCompositeOperation = 'source-over';
		}
		function draw(t) {
			if (fade) {
				const k = smooth((t - fade.t0) / fade.dur);
				render(t, fade.from, xa.getContext('2d'));
				render(t, fade.to, xb.getContext('2d'));
				ctx0.setTransform(1, 0, 0, 1, 0, 0);
				ctx0.clearRect(0, 0, canvas.width, canvas.height);
				ctx0.globalAlpha = 1 - k;
				ctx0.drawImage(xa, 0, 0);
				ctx0.globalAlpha = k;
				ctx0.drawImage(xb, 0, 0);
				ctx0.globalAlpha = 1;
				return;
			}
			render(t, cam, ctx0);
		}

		resize();
		if (reduced) {
			// one exposure from above, the maps settled, with one sentence
			let t = 0;
			for (let i = 0; i < 60 * 45.5; i++) {
				t = i / 60;
				stepProcess(t, true);
			}
			fade = null;
			Object.assign(cam, SYSTEM);
			draw(t);
			caption = STILL;
			capOff = false;
			still = true;
			live = true;
			return;
		}
		draw(0);
		live = true;

		// the experiment's clock runs only while the figure is in view: it begins when the reader arrives
		let t = 0;
		let lastNow = 0;
		let frame = 0;
		let visible = false;
		function tick(now) {
			if (visible) {
				if (lastNow) t += Math.min(0.1, (now - lastNow) / 1000);
				lastNow = now;
				stepProcess(t, false);
				draw(t);
			} else lastNow = 0;
			frame = requestAnimationFrame(tick);
		}
		frame = requestAnimationFrame(tick);
		const io = new IntersectionObserver(([e]) => (visible = e.isIntersecting), { threshold: 0.5 });
		io.observe(field);
		const ro = new ResizeObserver(() => resize());
		ro.observe(field);
		return () => {
			cancelAnimationFrame(frame);
			clearTimeout(capTimer);
			io.disconnect();
			ro.disconnect();
		};
	});
</script>

<div class="instrument-wrap" class:still>
	<div
		class="field"
		bind:this={field}
		role="img"
		aria-label="Part of a standard plate as a long exposure, seen first from the side: cultures of individual cells on the floor of every well, a watcher walking underneath whose light shows only through the well it is under, and a change falling into one well from above. The view dives through the plate to the watcher's own: close on that well as the change spreads and the cells answer with their own timing, or not. It pulls back to the plate from below: the same change enters the next wells of that row one after another; a row receives it at three strengths and more cells answer the stronger it is; a row is never touched and only flickers on its own; a day later the same cells answer the same changes again. What answered because of a change settles slowly into a map of cause."
	>
		<canvas class="instrument" class:shown={live} bind:this={canvas} aria-hidden="true"></canvas>
	</div>
	<p class="pass" class:off={capOff} aria-live="polite">{caption}</p>
</div>

<style>
	/* the figure is sized by the page so the whole exposure fits in view with its sentence */
	.instrument-wrap {
		position: relative;
		width: 100%;
		max-width: 880px;
		margin-inline: auto;
		display: grid;
	}

	.field {
		position: relative;
		width: 100%;
		aspect-ratio: 1;
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

	/* the sentence of the beat: display face, set inside the exposure on its feathered
	   lower edge, so the words are never read apart from the light they name */
	.pass {
		position: absolute;
		left: 6%;
		right: 6%;
		bottom: 5%;
		margin: 0;
		font-family: var(--font-display);
		font-weight: 300;
		font-size: clamp(1.15rem, 2vw, 1.4rem);
		line-height: 1.3;
		max-width: 48ch;
		color: var(--ink-100, rgba(255, 255, 255, 0.96));
		transition: opacity var(--t-move, 320ms) var(--ease-out, ease-out);
	}

	.pass.off {
		opacity: 0;
	}

	/* the still exposure's sentence is longer; it sits beneath the frame */
	.still .pass {
		position: static;
		margin-top: 1rem;
	}
</style>
