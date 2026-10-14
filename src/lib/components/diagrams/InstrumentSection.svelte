<!--
  The plate, in the reader's hand.

  One patch of a standard plate, in one world. This is about changing something
  to see what it does. The view rests over the plate, from where changes come,
  with the watcher's lamp walking underneath. Press a well and a change forms
  above it, from the same side of the well every time; hold and it grows; let go
  and it falls under gravity, spreads from where it entered, and the cells answer
  with their own kinetics, or do not. When the change lands, the view goes down
  through the floor of that well to the watcher's own view, so the answer is
  watched cell by cell, and comes back up when it has been seen. Nothing happens
  on a clock the reader has to wait for and nothing moves that the reader did
  not cause, except the robot's answer to the reader's act: on arrival it puts
  in one change, to show that this is done here; after the reader's first change
  it puts the same change into the next wells of the row; after the second, a
  row at three strengths. A row is never touched. The sentences name what the
  light has shown, whoever caused it, and only when the view can see it. Grab
  the stage and drag, and the view turns about where it rests, settling back
  when let go. Nothing follows the pointer by itself; the page scrolls as a page.

  Nothing is drawn. Every light is a field or a point; the robot is where changes
  come from, the watcher is where the light under the plate is, the plate is the
  plane the cells sit on and the body that hides the lamp. Same material as the
  mark: soft plates at quarter resolution, light that adds, one colour ramp from
  deep space through primary and biolum to white.
  Reduced motion: one exposure from the side with the maps settled and one
  sentence; the stage is not pinned and nothing follows the scroll.
-->
<script>
	import { onMount } from 'svelte';
	import { useMessages, useLang } from '$lib/i18n';
	const m = useMessages();
	const lang = useLang();

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
	const DROP_H = 150; // the fixed height a change is released from, above the plate
	const HOVER = 0.3; // s the robot's change waits there before it is released
	const FALL = 0.6; // s, the fall under gravity
	const HOLD_T = 0.7; // s of holding for the hand's change to reach full strength
	const OBS_Z = -110; // the watcher, under the plate: what the eye sees is the floor it lights, not the lamp
	const PACE = 1.0; // s, the watcher's walk from one well to the next
	const D2R = Math.PI / 180;

	// the views: target on the plate, azimuth, elevation, distance, focal length, and the up hint
	// (0 sky-up for a view from the side or above; 1 the from-below frame)
	// HOME: over the plate from where changes come, high enough that every well is a thing to press
	// and a change is seen to fall, low enough that the plate is a thing with a watcher underneath
	const HOME = { tx: 420, ty: 410, az: -6 * D2R, el: 52 * D2R, dist: 2600, f: 2600 * 1.15, k: 0 };
	// the watcher's own view of one well, from below, through the floor
	const below = (w) => ({
		tx: w.x,
		ty: w.y,
		az: 0,
		el: -90 * D2R,
		dist: 8000,
		f: 8000 * 3.3,
		k: 1
	});
	const THROUGH_T = 0.9; // s, the pass through the floor: a cross-fade on the well, never an edge-on swing
	const DWELL = 4.2; // s the view stays on the answering cells after a change has landed
	// the view turned in the hand: a drag across 40% of the stage is the full tilt
	const TILT_X = 30 * D2R;
	const TILT_Y = 18 * D2R;
	const GRAB_SPAN = 0.4;
	// the robot's answer to the reader's act, after the view has come back up: the same change again
	// in the rest of the row, then a row at three strengths, in that order; a row is never touched
	const ROBOT_AFTER = 0.6; // s after the view is back
	const STAGGER = 0.6; // s between the robot's wells
	const STRENGTHS = [0.3, 0.55, 1];
	// the watcher's patrol when nothing is about to change: neighbour to neighbour at a steady pace
	const PATROL = ['T2', 'T1', 'T0', 'M0', 'M1', 'M2', 'B2', 'B1', 'B0'];
	const STILL = m.beats.still;

	let wrap;
	let stage;
	let canvas;
	let live = false;
	let caption = '';
	let capOff = true;
	let still = false; // reduced motion: one frame, the sentence set beneath it
	let overWell = false; // the pointer is over a well: the hand can act here

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
	const noise2 = (n, x, y, s) =>
		0.65 * n(x / s, y / s) + 0.35 * n(x / (s * 0.45) + 17, y / (s * 0.45) + 9);
	const smooth = (u) => (u <= 0 ? 0 : u >= 1 ? 1 : u * u * (3 - 2 * u));
	const cross = (a, b) => [
		a[1] * b[2] - a[2] * b[1],
		a[2] * b[0] - a[0] * b[2],
		a[0] * b[1] - a[1] * b[0]
	];
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
			const w = {
				x: X0[0] + c * PITCH,
				y: Y0[0] + r * PITCH,
				r,
				c,
				entryA: ENTRY_A,
				entry: null,
				impactT: -100,
				dose: 0,
				doses: [],
				cells: []
			};
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
						if (Math.hypot(q[0] - p[0], q[1] - p[1]) < 0.5 * (need + spacingAt(q[0], q[1])))
							return false;
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
		if (!canvas || !stage || !wrap) return;
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
		let clock0 = -1; // the robot's clock starts when the reader arrives
		const plan = []; // the robot's steps still to take: { at, w, dose }, sorted by time
		let readerN = 0; // changes by the reader's hand
		let capTimer = 0;
		let capUntil = 0; // the sentence on screen holds until then
		const pending = []; // sentences waiting for a view they can be seen in
		const said = {}; // each sentence is said once
		const cam = { ...HOME };
		let fade = null; // the pass through the floor: { from, to, k }
		let tween = null; // the view on its way: { from, to, t0, dur, through }
		let backAt = -1; // when the view comes back up from the well it went down to
		const drops = []; // changes on their way in: forming above a well, or falling
		const watcher = { x: NAMED.T2.x, y: NAMED.T2.y, goal: null, holdUntil: 0, next: 1 };
		let landed = 0; // changes that have reached the floor
		function say(key, needs) {
			if (said[key]) return;
			said[key] = true;
			pending.push({ key, needs });
		}
		function show(text, t) {
			capOff = true;
			clearTimeout(capTimer);
			capUntil = t + 3.6;
			capTimer = setTimeout(() => {
				caption = text;
				capOff = false;
			}, 320);
		}
		function hide() {
			capOff = true;
			clearTimeout(capTimer);
		}
		// the change enters the well: from the same place near the wall, every time, whoever's hand it is
		function entryOf(w) {
			const d = R * 0.78;
			return [w.x + Math.cos(w.entryA) * d, w.y + Math.sin(w.entryA) * d];
		}
		function release(w, dose, t, hover) {
			w.entry = entryOf(w);
			w.impactT = t + hover + FALL;
			w.dose = dose;
			w.doses.push(dose);
			drops.push({
				w,
				x: w.entry[0],
				y: w.entry[1],
				t0: t,
				t1: w.impactT,
				hover,
				dose,
				forming: false
			});
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
			// the watcher goes to the well that is about to change, and stays while it answers
			watcher.goal = w;
			watcher.holdUntil = w.impactT + 5;
		}
		function change(w, dose, t) {
			release(w, dose, t, HOVER);
		}
		function schedule(at, w, dose) {
			plan.push({ at, w, dose });
			plan.sort((a, b) => a.at - b.at);
		}
		// the robot's steps that wait for the view to be back up: given their time when it arrives
		function onBack(t) {
			for (const e of plan) if (e.at === Infinity) e.at = t + ROBOT_AFTER + STAGGER * e.order;
			plan.sort((a, b) => a.at - b.at);
		}
		// the wells of a row that are whole in the frame
		const rowOf = (r) => WELLS.filter((w) => w.r === r && w.c >= 0 && w.c <= 2);
		// the robot answers the reader's act once the view is back up: first the same change again
		// in the rest of the row, then three strengths in a row nobody has touched
		function answer(w, dose) {
			const later = (o, order, d) => plan.push({ at: Infinity, order, w: o, dose: d });
			if (readerN === 1) {
				let i = 0;
				for (const o of rowOf(w.r)) if (o !== w) later(o, i++, dose);
			} else if (readerN === 2) {
				const rows = [0, 2, 1].map(rowOf).filter((row) => row.length === 3);
				const row = rows.find((row) => row.every((o) => !o.doses.length)) || rows[0];
				row.forEach((o, i) => later(o, i, STRENGTHS[i]));
			}
		}
		// the view goes down through the floor of the well a change has landed in, and comes back
		function goTo(to, t, through) {
			tween = { from: { ...cam }, to, t0: t, dur: THROUGH_T, through };
		}
		function goDown(w, t) {
			if (cam.el < 0 && cam.tx === w.x && cam.ty === w.y) {
				backAt = t + DWELL; // already here: stay a while longer
				return;
			}
			goTo(below(w), t, true);
			backAt = t + DWELL;
		}
		// what the light has shown so far, by the reader's hand or the robot's
		function rows() {
			const out = [];
			for (let r = -1; r <= 3; r++) out.push(WELLS.filter((w) => w.r === r));
			return out;
		}
		function noticed() {
			if (landed > 0) say('above', 'high');
			if (landed > 0 && cam.el < 0 && cam.f >= cam.dist * 1.5) say('below', 'near'); // the watcher's own view, once the camera is in it
			for (const row of rows()) {
				const done = row.filter((w) => w.doses.length);
				if (
					done.length >= 2 &&
					done.some((a) => done.some((b) => a !== b && Math.abs(a.dose - b.dose) < 0.08))
				)
					say('again', 'wide');
				const ds = done.map((w) => w.dose).sort((a, b) => a - b);
				if (ds.length >= 3 && ds[2] - ds[0] > 0.4 && ds[1] - ds[0] > 0.12 && ds[2] - ds[1] > 0.12)
					say('strengths', 'wide');
			}
			// a row never touched, named once the strengths have been seen
			if (said.strengths && [0, 1, 2].some((r) => rowOf(r).every((w) => !w.doses.length)))
				say('untouched', 'wide');
		}
		// where the watcher is, on its walk: towards the next change, or on patrol
		function walk(dt, t) {
			let goal = watcher.goal;
			if (goal && t > watcher.holdUntil) goal = watcher.goal = null;
			if (!goal) {
				const n = NAMED[PATROL[watcher.next % PATROL.length]];
				if (Math.hypot(n.x - watcher.x, n.y - watcher.y) < 1) watcher.next++;
				goal = NAMED[PATROL[watcher.next % PATROL.length]];
			}
			const dx = goal.x - watcher.x,
				dy = goal.y - watcher.y,
				d = Math.hypot(dx, dy),
				step = (PITCH / PACE) * dt;
			if (d <= step) {
				watcher.x = goal.x;
				watcher.y = goal.y;
			} else {
				watcher.x += (dx / d) * step;
				watcher.y += (dy / d) * step;
			}
		}
		function stepProcess(t, quiet) {
			const dt = Math.min(0.05, Math.max(0, t - lastT));
			lastT = t;
			while (plan.length && t >= plan[0].at) {
				const e = plan.shift();
				change(e.w, e.dose, t);
				if (e.down) drops[drops.length - 1].down = true;
			}
			walk(dt, t);
			while (drops.length && !drops[0].forming && t > drops[0].t1 + 0.1) drops.shift();
			for (const d of drops) {
				if (!d.forming && !d.counted && t >= d.t1) {
					d.counted = true;
					landed++;
					if (d.down && !quiet) goDown(d.w, t); // the change has landed: go and see what it does
				}
			}
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
				c.evidence *= 1 - dt / 240; // the slow layer nearly does not forget
			}
			if (!quiet) noticed();
		}
		// a sentence is shown only in a view it can be seen in
		function speak(t) {
			if (t < capUntil || !pending.length) return;
			const v = cam;
			const high = v.el > 0; // above or from the side: the plate as a thing, changes falling into it
			const wide = v.f < v.dist * 1.5; // the whole plate, not one well
			const near = v.el < 0 && !wide; // the watcher's own view
			const i = pending.findIndex((s) =>
				s.needs === 'high' ? high : s.needs === 'near' ? near : wide
			);
			if (i < 0) return;
			const [s] = pending.splice(i, 1);
			show(m.beats[s.key], t);
		}

		// ---- the camera and the exposure ---------------------------------------
		const plate = document.createElement('canvas');
		const pctx = plate.getContext('2d');
		const mask = document.createElement('canvas');
		const mctx = mask.getContext('2d');
		const HS = 0.25;
		let hs = HS;
		let S = 1,
			dpr = 1,
			W = 1,
			H = 1,
			CX = 0.5,
			CY = 0.5;
		let C = null; // the camera basis this frame
		const xa = document.createElement('canvas'); // the two views of the pass through the floor
		const xb = document.createElement('canvas');

		// a vector turned about an axis (Rodrigues)
		function rot(v, k, th) {
			const c = Math.cos(th),
				s = Math.sin(th),
				kv = cross(k, v),
				d = k[0] * v[0] + k[1] * v[1] + k[2] * v[2];
			return [
				v[0] * c + kv[0] * s + k[0] * d * (1 - c),
				v[1] * c + kv[1] * s + k[1] * d * (1 - c),
				v[2] * c + kv[2] * s + k[2] * d * (1 - c)
			];
		}
		function camera(v) {
			const ce = Math.cos(v.el),
				se = Math.sin(v.el),
				ca = Math.cos(v.az),
				sa = Math.sin(v.az);
			let eye = [v.tx + sa * ce * v.dist, v.ty - ca * ce * v.dist, se * v.dist]; // on the near side, swung by the azimuth
			let fwd = norm([-sa * ce, ca * ce, -se]);
			const hint = norm([sa * v.k, -ca * v.k, 1 - Math.abs(v.k)]);
			let right = norm(cross(fwd, hint)),
				up = cross(right, fwd);
			if (look.x || look.y) {
				// the view turned in the hand: the eye swings about the station's target on the station's
				// own axes, so a turn from above is a tilt of the plate, never a spin of the picture
				let e = [eye[0] - v.tx, eye[1] - v.ty, eye[2]];
				e = rot(e, up, look.x * TILT_X);
				e = rot(e, right, look.y * TILT_Y);
				eye = [v.tx + e[0], v.ty + e[1], e[2]];
				fwd = norm([-e[0], -e[1], -e[2]]);
				right = norm(cross(fwd, hint));
				up = cross(right, fwd);
			}
			C = { eye, fwd, right, up, f: v.f * S * dpr, cx: canvas.width * CX, cy: canvas.height * CY };
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
		// the point on the plate under a pixel: the hand reaches through whatever view it is in
		function unproj(px, py) {
			const u = (px - C.cx) / C.f,
				v = -(py - C.cy) / C.f;
			const D = [
				C.fwd[0] + C.right[0] * u + C.up[0] * v,
				C.fwd[1] + C.right[1] * u + C.up[1] * v,
				C.fwd[2] + C.right[2] * u + C.up[2] * v
			];
			if (Math.abs(D[2]) < 1e-6) return null;
			const s = -C.eye[2] / D[2];
			if (s <= 0) return null;
			return [C.eye[0] + D[0] * s, C.eye[1] + D[1] * s];
		}
		// an affine frame on the plate around (x, y) with unit = r
		function frameAt(x, y, r) {
			const o = proj(x, y, 0),
				a = proj(x + r, y, 0),
				b = proj(x, y + r, 0);
			return {
				ox: o[0],
				oy: o[1],
				ux: a[0] - o[0],
				uy: a[1] - o[1],
				vx: b[0] - o[0],
				vy: b[1] - o[1]
			};
		}
		function resize() {
			const r = stage.getBoundingClientRect();
			dpr = Math.min(window.devicePixelRatio || 1, 2);
			W = Math.max(1, Math.round(r.width));
			H = Math.max(1, Math.round(r.height));
			const wide = W >= 1024 && W > H; // words on the left, the world on the right; otherwise words above
			if (still) {
				S = Math.min(W, H) / FW;
				CX = 0.5;
				CY = 0.5;
			} else if (wide) {
				S = Math.min(0.52 * W, 0.92 * H) / FW;
				CX = 0.64;
				CY = 0.5;
			} else {
				S = Math.min(0.96 * W, 0.62 * H) / FW;
				CX = 0.5;
				CY = 0.6;
			}
			canvas.width = xa.width = xb.width = Math.round(W * dpr);
			canvas.height = xa.height = xb.height = Math.round(H * dpr);
			hs = canvas.width < 1100 ? 0.5 : HS; // small frames keep a finer soft plate
			plate.width = mask.width = Math.max(1, Math.round(canvas.width * hs));
			plate.height = mask.height = Math.max(1, Math.round(canvas.height * hs));
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
			const mm = Math.min(Math.hypot(ux, uy), Math.hypot(vx, vy));
			if (mm < 0.7) {
				const q = 0.7 / mm;
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
			const side = Math.max(0, Math.min(1, (v.el / D2R + 70) / 50)); // how much the view is from the side or above: the watcher under the plate is seen only then
			const flat = Math.abs(Math.sin(v.el)); // how much the view is along the plate's normal: a change above the floor is out of focus then
			const minWH = Math.min(canvas.width, canvas.height);

			// the medium, on the soft plate: a dim floor in every well; the watcher's light through the floor of the well it is under;
			// in a changed well, the change spreading from where it entered
			pctx.setTransform(1, 0, 0, 1, 0, 0);
			pctx.clearRect(0, 0, plate.width, plate.height);
			pctx.globalCompositeOperation = 'source-over';
			// no tint over the whole plate: a filled square reads as a window; the wells carry the light
			pctx.globalCompositeOperation = 'lighter';
			const rx = watcher.x,
				ry = watcher.y;
			if (side > 0) {
				// the watcher, under the plate: its light reaches the eye through the floor of the well it is under; the mask hides it between wells
				const o = proj(rx, ry, 0);
				const rr = Math.max(1, Math.min(-1.2 * OBS_Z * o[2], 0.11 * minWH) * hs); // no bigger than a well's neighbourhood, even close to the camera
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
				const rr = Math.max(1, Math.min(-OBS_Z * o[2], 0.1 * minWH));
				const g = ctx.createRadialGradient(o[0], o[1], 0, o[0], o[1], rr);
				g.addColorStop(0, rgba(PRIMARY, 0.07 * side));
				g.addColorStop(1, rgba(PRIMARY, 0));
				ctx.fillStyle = g;
				ctx.beginPath();
				ctx.arc(o[0], o[1], rr, 0, 6.2832);
				ctx.fill();
			}

			// a change on its way in: it forms at the same fixed height above the well every time, waits (or is held), then falls under gravity.
			// Along the plate's normal it is out of focus and wide, gathering to a point as it nears the floor
			for (const d of drops) {
				const dt = t - d.t0;
				if (dt < 0 || (!d.forming && t >= d.t1)) continue;
				let z, form, dose;
				if (d.forming) {
					z = DROP_H;
					dose = d.dose;
					form = 0.35 + 0.65 * smooth(dt / 0.25); // it forms under the hand, and grows while the hand stays
				} else {
					const fk = Math.max(0, Math.min(1, (dt - d.hover) / FALL));
					z = DROP_H * (1 - fk * fk);
					dose = d.dose;
					form = dt < d.hover ? 0.35 + 0.65 * (dt / d.hover) : 1; // the robot's forms before it is released
				}
				const o = proj(d.x, d.y, z);
				const wide = 70 * (z / DROP_H) * flat * flat,
					r = (7 + wide) * o[2] * (0.6 + 0.4 * dose);
				// out of focus it is a soft disc of light, never nothing: the hand has to see what it is holding
				const a = form * (0.1 + 0.6 * (1 - wide / 77)) * (0.5 + 0.5 * dose);
				const g = ctx.createRadialGradient(o[0], o[1], 0, o[0], o[1], Math.max(1, r));
				g.addColorStop(0, rgba(mix(PRIMARY, WHITE, 0.35 * (1 - flat)), a));
				g.addColorStop(1, rgba(PRIMARY, 0));
				ctx.fillStyle = g;
				ctx.beginPath();
				ctx.arc(o[0], o[1], Math.max(1, r), 0, 6.2832);
				ctx.fill();
			}
			// the cultures: every footprint, faint at rest; brighter where the slow layer has settled
			for (const c of cells) {
				const ev = Math.min(1, c.evidence);
				const rest = 0.07 + 0.012 * Math.sin(t * 0.5 + c.x);
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
					if (e.caused && d > RISE * 0.6 && d < RISE + 0.22 && e.a > 0.8)
						recent = Math.max(recent, e.a);
				}
				if (recent) {
					const o = proj(c.x, c.y, 0);
					ctx.fillStyle = rgba(WHITE, Math.min(1, recent));
					ctx.beginPath();
					ctx.arc(o[0], o[1], Math.max(0.8, 1.2 * o[2]), 0, 6.2832);
					ctx.fill();
				}
			}
			// the exposure fades at the edges of the frame: the plate goes on, the frame does not cut it.
			// The fade is an ellipse about the plate's place on the screen, like the mark's exposure: no
			// edge of it is straight, and it reaches zero before any edge of the canvas
			ctx.globalCompositeOperation = 'destination-in';
			const CW = canvas.width,
				CH = canvas.height,
				ex = Math.min(CX, 1 - CX) * CW,
				ey = Math.min(CY, 1 - CY) * CH;
			ctx.save();
			ctx.translate(CX * CW, CY * CH);
			ctx.scale(ex, ey);
			const vg = ctx.createRadialGradient(0, 0, 0, 0, 0, 1);
			vg.addColorStop(0, 'rgba(0,0,0,1)');
			vg.addColorStop(0.6, 'rgba(0,0,0,1)');
			vg.addColorStop(1, 'rgba(0,0,0,0)');
			ctx.fillStyle = vg;
			ctx.fillRect(-(CX * CW) / ex, -(CY * CH) / ey, CW / ex, CH / ey);
			ctx.restore();
			ctx.globalCompositeOperation = 'source-over';
		}
		function draw(t) {
			if (fade) {
				render(t, fade.from, xa.getContext('2d'));
				render(t, fade.to, xb.getContext('2d'));
				ctx0.setTransform(1, 0, 0, 1, 0, 0);
				ctx0.clearRect(0, 0, canvas.width, canvas.height);
				ctx0.globalAlpha = 1 - fade.k;
				ctx0.drawImage(xa, 0, 0);
				ctx0.globalAlpha = fade.k;
				ctx0.drawImage(xb, 0, 0);
				ctx0.globalAlpha = 1;
				return;
			}
			render(t, cam, ctx0);
		}

		// ---- the view on its way --------------------------------------------------
		const look = { x: 0, y: 0, tx: 0, ty: 0 }; // the view's turn in the hand, and where it is going
		function moveView(t) {
			if (backAt > 0 && t >= backAt && !held && !grab) {
				backAt = -1;
				goTo(HOME, t, true); // seen: back up through the floor
			}
			if (!tween) return;
			const k = smooth((t - tween.t0) / tween.dur);
			const a = tween.from,
				b = tween.to;
			if (tween.through) {
				fade = k <= 0 || k >= 1 ? null : { from: a, to: b, k };
				Object.assign(cam, k < 0.5 ? a : b);
			} else {
				fade = null;
				cam.tx = a.tx + (b.tx - a.tx) * k;
				cam.ty = a.ty + (b.ty - a.ty) * k;
				cam.az = a.az + (b.az - a.az) * k;
				cam.el = a.el + (b.el - a.el) * k;
				cam.k = a.k + (b.k - a.k) * k;
				cam.dist = Math.exp(Math.log(a.dist) + (Math.log(b.dist) - Math.log(a.dist)) * k);
				cam.f = Math.exp(Math.log(a.f) + (Math.log(b.f) - Math.log(a.f)) * k);
			}
			if (k >= 1) {
				tween = null;
				fade = null;
				Object.assign(cam, b);
				if (b === HOME) onBack(t);
			}
		}

		// ---- the hand -------------------------------------------------------------
		let held = null; // { w, drop, x, y, t0 } while a pointer is down on a well
		let grab = null; // { x, y, ox, oy, id } while a pointer drags the view
		let tNow = 0;
		function wellUnder(ev) {
			const r = stage.getBoundingClientRect();
			camera(cam);
			const pt = unproj((ev.clientX - r.left) * dpr, (ev.clientY - r.top) * dpr);
			if (!pt) return null;
			const w = wellAt(pt[0], pt[1]);
			if (!w || Math.hypot(pt[0] - w.x, pt[1] - w.y) > R * 0.98) return null;
			return w;
		}
		function takeHold(ev) {
			grab = { x: ev.clientX, y: ev.clientY, ox: look.tx, oy: look.ty, id: ev.pointerId };
		}
		function onDown(ev) {
			if (still || held || grab || ev.button > 0) return;
			const w = wellUnder(ev);
			if (!w) {
				takeHold(ev); // not on a well: the hand has the view
				return;
			}
			const [x, y] = entryOf(w);
			const drop = { w, x, y, t0: tNow, t1: 0, hover: 0, dose: 0.45, forming: true };
			drops.push(drop);
			held = { w, drop, x: ev.clientX, y: ev.clientY, id: ev.pointerId };
			if (clock0 < 0) clock0 = tNow; // the reader's first touch is an arrival too
		}
		function onMove(ev) {
			if (held) {
				if (held.id !== ev.pointerId) return;
				// the hand has moved on: it was a grab, not a change
				if (Math.hypot(ev.clientX - held.x, ev.clientY - held.y) > 10) abandon(ev);
				return;
			}
			if (grab) {
				if (grab.id !== ev.pointerId) return;
				const r = stage.getBoundingClientRect();
				look.tx = Math.max(
					-1,
					Math.min(1, grab.ox + (ev.clientX - grab.x) / (GRAB_SPAN * r.width))
				);
				look.ty = Math.max(
					-1,
					Math.min(1, grab.oy + (ev.clientY - grab.y) / (GRAB_SPAN * r.height))
				);
				return;
			}
			if (ev.pointerType === 'mouse') overWell = !!wellUnder(ev);
		}
		function abandon(ev) {
			if (!held) return;
			const i = drops.indexOf(held.drop);
			if (i >= 0) drops.splice(i, 1);
			held = null;
			if (ev && ev.type === 'pointermove') takeHold(ev);
		}
		function letGo(ev) {
			if (grab && grab.id === ev.pointerId) {
				grab = null;
				look.tx = look.ty = 0; // let go: the view settles back on the station
			}
		}
		function onUp(ev) {
			letGo(ev);
			if (!held || held.id !== ev.pointerId) return;
			const { w, drop } = held;
			held = null;
			const i = drops.indexOf(drop);
			if (i >= 0) drops.splice(i, 1);
			release(w, drop.dose, tNow, 0); // held already: it falls at once
			drops[drops.length - 1].down = true; // and the view goes to see what it does
			readerN++;
			answer(w, drop.dose); // the robot answers once the view is back up
		}
		stage.addEventListener('pointerdown', onDown);
		stage.addEventListener('pointermove', onMove);
		stage.addEventListener('pointerup', onUp);
		stage.addEventListener('pointercancel', (ev) => {
			abandon();
			letGo(ev);
		});
		stage.addEventListener('pointerleave', (ev) => {
			if (held && held.id === ev.pointerId) abandon();
			letGo(ev);
			overWell = false;
		});

		resize();
		if (reduced) {
			// one exposure from the side, the maps settled, with one sentence
			still = true;
			resize();
			clock0 = 0;
			// the grammar, taken quietly: one change, the same again, three strengths, a row untouched
			schedule(0.8, NAMED.M0, 1);
			schedule(9.0, NAMED.M1, 1);
			schedule(9.6, NAMED.M2, 1);
			schedule(16.0, NAMED.T0, 0.3);
			schedule(16.6, NAMED.T1, 0.55);
			schedule(17.2, NAMED.T2, 1);
			let t = 0;
			for (let i = 0; i < 60 * 45.5; i++) {
				t = i / 60;
				stepProcess(t, true);
			}
			fade = null;
			Object.assign(cam, HOME);
			draw(t);
			caption = STILL;
			capOff = false;
			live = true;
			return;
		}
		draw(0);
		live = true;

		// the cells' clock runs only while the stage is in view; the robot's starts when the reader has arrived
		let t = 0;
		let lastNow = 0;
		let frame = 0;
		let visible = false;
		let arrived = false;
		function tick(now) {
			if (visible) {
				const dms = lastNow ? Math.min(100, now - lastNow) : 16;
				t += dms / 1000;
				lastNow = now;
				tNow = t;
				if (arrived && clock0 < 0) {
					clock0 = t;
					// the robot's one change on arrival: this is where a change is put in, and what it does
					schedule(t + 0.8, NAMED.M0, 1);
					plan[0].down = true;
				}
				// a grabbed view follows the hand closely; a let-go view settles back with the weight of a thing
				const kl = 1 - Math.exp(-dms / (grab ? 60 : 420));
				look.x += (look.tx - look.x) * kl;
				look.y += (look.ty - look.y) * kl;
				moveView(t);
				if (held) held.drop.dose = 0.45 + 0.55 * smooth((t - held.drop.t0 - 0.1) / HOLD_T); // the longer the hold, the stronger the change
				stepProcess(t, false);
				if (capOff === false && t > capUntil) hide();
				speak(t);
				draw(t);
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
			clearTimeout(capTimer);
			io.disconnect();
			ro.disconnect();
		};
	});
</script>

<div class="experiment" class:still bind:this={wrap}>
	<div class="stage" class:hand={overWell} bind:this={stage} role="img" aria-label={m.a11y.figure}>
		<canvas class="instrument" class:shown={live} bind:this={canvas} aria-hidden="true"></canvas>
		<p class="pass" class:off={capOff} aria-live="polite" {lang}>{caption}</p>
	</div>
	<slot />
</div>

<style>
	/* one screen for the plate; the page's head station is set over it, the readout follows */
	.experiment {
		position: relative;
	}

	.stage {
		position: relative;
		height: 100svh;
		overflow: clip;
		touch-action: pan-y; /* the page still scrolls under a finger; a still finger is a hand on a well */
		user-select: none;
		-webkit-user-select: none;
		-webkit-touch-callout: none;
	}

	.stage.hand {
		cursor: pointer;
	}

	.stage:active {
		cursor: grabbing;
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

	/* the sentence of the beat: display face, set under the plate inside the exposure's feathered
	   lower edge, so the words are never read apart from the light they name */
	.pass {
		position: absolute;
		left: 16px;
		right: 16px;
		bottom: 5svh;
		margin: 0;
		font-family: var(--font-display);
		font-weight: 300;
		font-size: clamp(1.15rem, 2vw, 1.4rem);
		line-height: 1.3;
		max-width: 48ch;
		color: var(--ink-100, rgba(255, 255, 255, 0.96));
		transition: opacity var(--t-move, 320ms) var(--ease-out, ease-out);
		pointer-events: none;
	}

	.pass.off {
		opacity: 0;
	}

	@media (min-width: 1024px) and (orientation: landscape) {
		.pass {
			left: 46vw;
			right: 4vw;
			bottom: 7svh;
			text-align: center;
			max-width: none;
		}
	}

	/* reduced motion: one square exposure, the sentence beneath it; the stations follow */
	.experiment.still {
		display: flex;
		flex-direction: column;
	}

	.still .stage {
		position: relative;
		height: auto;
		aspect-ratio: 1;
		width: 100%;
		max-width: 880px;
		margin-inline: auto;
		order: 1;
	}

	.still .pass {
		position: static;
		margin: 1rem 16px 0;
		text-align: left;
		max-width: 48ch;
	}
</style>
