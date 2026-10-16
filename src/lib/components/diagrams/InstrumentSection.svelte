<!--
  The bench: one patch of a standard plate, seen from where changes come.

  The view rests over the plate and never moves. The instrument does the experiment by
  itself, in the open: as the visitor arrives it puts one change into one well, the cells
  answer in place with their own timing, or do not, beside wells never touched, and once
  that answer has settled the instrument puts the next change into the next well of the
  row, stronger if few answered and weaker if many, looking for the strength at which half
  do. A reader who only scrolls sees the whole chain. A tap or a click on a well puts one
  more change in, at the one strength every change starts at, and the instrument follows it
  the same way; nothing is asked beyond that. A row nobody has touched stays untouched; the
  plate is the control for itself. The keyboard has a button after the plate that puts a
  change into the next well.
  Nothing is drawn. Every light is a field or a point, and each kind of light is its own:
  the watcher is a field of plain light on the floor of the well it is under, hidden by the
  body of the plate between wells; a change is a bead of liquid, a solid body stretched by
  its fall; an answer is the cells' own colour. Same material as the mark: soft plates at
  quarter resolution, light that adds, one ramp from deep space through primary and biolum
  to white. Every change is written to the record (bench.js) as it happens, with the well it
  went into, and the record draws those wells as themselves.
  Reduced motion: one exposure with the instrument's own three changes settled; the count
  line beside it says so in one sentence.
-->
<script>
	import { onMount } from 'svelte';
	import { useMessages } from '$lib/i18n';
	import { bench, addPoint, resetBench, nextDose, stillMode, WELL_R } from './bench.js';
	const m = useMessages();

	const FW = 800;
	const PITCH = 220;
	const R = WELL_R; // well to pitch as on a standard plate
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
	const HOVER = 0.5; // s the instrument's bead waits above the well before it is released
	const FALL = 0.6; // s, the fall under gravity
	const DOSE = 0.3; // the one strength every change starts at: the visitor's, and the instrument's first
	const SETTLE = 3.6; // s after landing until a well's answer is read
	const THINK = 0.6; // s between an answer read and the instrument's next change
	const ARRIVAL = 0.8; // s after the visitor arrives until the instrument's first change
	const FIELD = 0.5 * R; // the watcher's field: the floor it lights, the size of what it sees at once
	const TILE_T = 0.9; // s the watcher spends on each quarter of a well it is holding
	const PACE = 1.0; // s, the watcher's walk from one well to the next
	const D2R = Math.PI / 180;
	// over the plate from where changes come, high enough that every well is a thing to press and a
	// bead is seen to fall, low enough that the plate is a body with a watcher underneath
	const HOME = { tx: 420, ty: 392, az: -6 * D2R, el: 52 * D2R, dist: 2600, f: 2600 * 1.15, k: 0 };
	const PATROL = ['T2', 'T1', 'T0', 'M0', 'M1', 'M2', 'B2', 'B1', 'B0'];

	let stage;
	let canvas;
	let live = false;
	let still = false; // reduced motion: one frame, the sentence set beneath it
	/** the keyboard's way in: a change into the next well, wired in onMount */
	let putNext = () => {};

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
				whole: r >= 0 && r <= 2 && c >= 0 && c <= 2,
				entryA: ENTRY_A,
				entry: null,
				impactT: -100,
				dose: 0,
				doses: [],
				cells: [],
				point: null
			};
			WELLS.push(w);
			if (w.whole) NAMED[(r === 0 ? 'T' : r === 1 ? 'M' : 'B') + c] = w;
		}
	function wellAt(x, y) {
		const c = Math.round((x - X0[0]) / PITCH),
			r = Math.round((y - Y0[0]) / PITCH);
		if (c < -1 || c > 3 || r < -1 || r > 3) return null;
		return WELLS[(r + 1) * 5 + (c + 1)];
	}
	const rowOf = (r) => WELLS.filter((w) => w.r === r && w.whole);

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
		if (!canvas || !stage) return;
		resetBench();
		const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
		const ctx0 = canvas.getContext('2d');
		if (!ctx0) return;

		const rnd = mulberry(11);
		const nDensity = valueNoise(3),
			nOrient = valueNoise(5),
			nSens = valueNoise(7);
		const logn = (mu, sig) => Math.exp(mu + sig * (rnd() + rnd() + rnd() + rnd() - 2) * 0.9);
		for (const w of WELLS) w.entryA = ENTRY_A + (rnd() - 0.5) * 0.16;
		// each cell is an individual: footprint, orientation, kinetics, and the strength it needs before it
		// answers. Thresholds are drawn per cell, never from a field across the plate: heterogeneity lives
		// inside a well, not between wells
		const cells = culture(rnd, nDensity).map(([x, y]) => {
			const w = wellAt(x, y);
			const c = {
				x,
				y,
				w,
				o: noise2(nOrient, x, y, 120) * 6.2832 * 1.5 + (rnd() - 0.5) * 0.5,
				size: 2.6 * logn(0, 0.3),
				aspect: 1.25 + rnd() * 0.75,
				gain: logn(-0.35, 0.6),
				latency: 0.18 + rnd() * 0.17,
				quiet: rnd() < 0.18, // some never answer; a uniform response would be a lie
				thr: Math.pow(rnd(), 0.635) * (0.88 + 0.24 * noise2(nSens, x, y, 45)),
				arriveAt: -1,
				pending: 0,
				answered: false,
				events: [],
				evidence: 0,
				L: 0
			};
			w.cells.push(c);
			return c;
		});

		// ---- the process -------------------------------------------------------
		let lastT = 0;
		let clock0 = -1; // the instrument's clock starts when the visitor arrives
		const plan = []; // the instrument's changes still to put in: { at, w, dose }, by time
		const drops = []; // beads on their way in: forming above a well, or falling
		const watcher = { x: NAMED.T1.x, y: NAMED.T1.y, goal: null, holdUntil: 0, next: 1 };

		// the change enters the well from the same place near the wall, every time, whoever's hand it is
		function entryOf(w) {
			const d = R * 0.78;
			return [w.x + Math.cos(w.entryA) * d, w.y + Math.sin(w.entryA) * d];
		}
		function release(w, dose, t, hover, mine) {
			w.entry = entryOf(w);
			w.impactT = t + hover + FALL;
			w.dose = dose;
			w.doses.push(dose);
			drops.push({ w, x: w.entry[0], y: w.entry[1], t0: t, t1: w.impactT, hover, dose, forming: false });
			const reach = 0.45 + 0.55 * dose; // how far across the well a change of this strength carries
			for (const c of w.cells) {
				c.answered = false;
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
			// the record gets a point the moment the change is on its way; it rises as the cells answer
			w.point = addPoint(dose, mine, w, w.impactT, w.impactT + SETTLE);
			// the watcher goes to the well that is about to change, and stays while it answers
			watcher.goal = w;
			watcher.holdUntil = w.impactT + SETTLE;
		}
		function schedule(at, w, dose) {
			plan.push({ at, w, dose });
			plan.sort((a, b) => a.at - b.at);
		}
		// the instrument's next change, once a well has answered: the next untouched well of that row,
		// stronger if few answered and weaker if many
		function follow(w, t) {
			const row = rowOf(w.r).filter((o) => !o.doses.length && !plan.some((e) => e.w === o));
			if (!row.length) return;
			row.sort((a, b) => Math.abs(a.c - w.c) - Math.abs(b.c - w.c));
			schedule(t + THINK, row[0], nextDose(w.dose, w.point.f));
		}
		function fractionOf(w) {
			let n = 0;
			for (const c of w.cells) if (c.answered) n++;
			return w.cells.length ? n / w.cells.length : 0;
		}
		// where the watcher is, on its walk: under the well answering, or on patrol
		function walk(dt, t) {
			let goal = watcher.goal;
			if (goal && t > watcher.holdUntil) goal = watcher.goal = null;
			if (!goal) {
				const n = NAMED[PATROL[watcher.next % PATROL.length]];
				if (Math.hypot(n.x - watcher.x, n.y - watcher.y) < 1) watcher.next++;
				goal = NAMED[PATROL[watcher.next % PATROL.length]];
			}
			// holding a well, the watcher takes it in quarters; on patrol it passes through the centre
			let gx = goal.x,
				gy = goal.y;
			if (goal === watcher.goal) {
				const q = Math.floor(t / TILE_T) % 4;
				gx += (q === 1 || q === 2 ? 1 : -1) * 0.42 * R;
				gy += (q >= 2 ? 1 : -1) * 0.42 * R;
			}
			const dx = gx - watcher.x,
				dy = gy - watcher.y,
				d = Math.hypot(dx, dy),
				step = (PITCH / PACE) * dt;
			if (d <= step) {
				watcher.x = gx;
				watcher.y = gy;
			} else {
				watcher.x += (dx / d) * step;
				watcher.y += (dy / d) * step;
			}
		}
		function stepProcess(t) {
			const dt = Math.min(0.05, Math.max(0, t - lastT));
			lastT = t;
			bench.clock = t;
			while (plan.length && t >= plan[0].at) {
				const e = plan.shift();
				release(e.w, e.dose, t, HOVER, false);
			}
			walk(dt, t);
			while (drops.length && !drops[0].forming && t > drops[0].t1 + 0.1) drops.shift();
			for (const c of cells) {
				if (c.arriveAt >= 0 && t >= c.arriveAt) {
					if (c.pending > 0.03) {
						c.events.push({ t: c.arriveAt, a: c.pending, caused: true });
						c.evidence += 0.22 * c.pending; // the slow layer: what answered because of the change
						c.answered = true;
					}
					c.arriveAt = -1;
				}
				// spontaneous activity, uncaused: part of the picture, never part of the evidence
				if (rnd() < dt * 0.006) c.events.push({ t, a: 0.35 + 0.4 * rnd(), caused: false });
				if (c.events.length > 4) c.events.shift();
				c.evidence *= 1 - dt / 240; // the slow layer nearly does not forget
			}
			// the record: each live point rises with its well; a settled one is read and answered
			for (const w of WELLS) {
				const p = w.point;
				if (!p || p.settled) continue;
				if (t >= p.born) p.f = fractionOf(w);
				if (t >= p.settledAt) {
					p.settled = true;
					follow(w, t);
				}
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
			dpr = 1,
			W = 1,
			H = 1;
		let C = null; // the camera basis this frame
		function camera(v) {
			const ce = Math.cos(v.el),
				se = Math.sin(v.el),
				ca = Math.cos(v.az),
				sa = Math.sin(v.az);
			const eye = [v.tx + sa * ce * v.dist, v.ty - ca * ce * v.dist, se * v.dist];
			const fwd = norm([-sa * ce, ca * ce, -se]);
			const hint = norm([sa * v.k, -ca * v.k, 1 - Math.abs(v.k)]);
			const right = norm(cross(fwd, hint)),
				up = cross(right, fwd);
			C = { eye, fwd, right, up, f: v.f * S * dpr, cx: canvas.width * 0.5, cy: canvas.height * 0.52 };
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
		// the point on the plate under a pixel: the hand reaches through the view
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
			return { ox: o[0], oy: o[1], ux: a[0] - o[0], uy: a[1] - o[1], vx: b[0] - o[0], vy: b[1] - o[1] };
		}
		function resize() {
			const r = stage.getBoundingClientRect();
			dpr = Math.min(window.devicePixelRatio || 1, 2);
			W = Math.max(1, Math.round(r.width));
			H = Math.max(1, Math.round(r.height));
			S = Math.min(W, H) / FW;
			canvas.width = Math.round(W * dpr);
			canvas.height = Math.round(H * dpr);
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
		let ctx = ctx0;
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

		function render(t) {
			camera(HOME);
			buildMask();
			ctx.setTransform(1, 0, 0, 1, 0, 0);
			ctx.clearRect(0, 0, canvas.width, canvas.height);
			ctx.imageSmoothingEnabled = true;
			ctx.imageSmoothingQuality = 'high';
			// the medium, on the soft plate: in a changed well, the change spreading from where it entered
			pctx.setTransform(1, 0, 0, 1, 0, 0);
			pctx.clearRect(0, 0, plate.width, plate.height);
			pctx.globalCompositeOperation = 'lighter';
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
			// the watcher, under the plate: a field of plain light on the floor of the well it is under,
			// the size of what it sees at once, with the hard edge a field has. The wall of the well hides it
			// between wells, so it is seen only through a floor: the body of the plate is a body because it hides it
			{
				const w = wellAt(watcher.x, watcher.y);
				if (w) {
					const Fw = frameAt(w.x, w.y, R * 0.9);
					ctx.save();
					ctx.setTransform(Fw.ux, Fw.uy, Fw.vx, Fw.vy, Fw.ox, Fw.oy);
					ctx.beginPath();
					ctx.arc(0, 0, 1, 0, 6.2832);
					ctx.clip();
					const F = frameAt(watcher.x, watcher.y, FIELD);
					ctx.setTransform(F.ux, F.uy, F.vx, F.vy, F.ox, F.oy);
					const g = ctx.createRadialGradient(0, 0, 0, 0, 0, 1);
					g.addColorStop(0, rgba(WHITE, 0.1));
					g.addColorStop(0.86, rgba(WHITE, 0.1));
					g.addColorStop(1, rgba(WHITE, 0));
					ctx.fillStyle = g;
					ctx.beginPath();
					ctx.arc(0, 0, 1, 0, 6.2832);
					ctx.fill();
					ctx.restore();
					ctx.setTransform(1, 0, 0, 1, 0, 0);
				}
			}
			// a change on its way in: it forms at the same fixed height above the well every time, waits
			// (or is held), then falls under gravity. A bead of liquid, not a light: a solid body the size of
			// its dose, with one point of the room's light on its shoulder, drawn out along its fall
			for (const d of drops) {
				const dt = t - d.t0;
				if (dt < 0 || (!d.forming && t >= d.t1)) continue;
				let z,
					form,
					fk = 0;
				if (d.forming) {
					z = DROP_H;
					form = smooth(dt / 0.25); // it forms under the press, and grows while the press stays
				} else {
					fk = Math.max(0, Math.min(1, (dt - d.hover) / FALL));
					z = DROP_H * (1 - fk * fk);
					form = dt < d.hover ? smooth(dt / d.hover) : 1; // the instrument's forms before it is released
				}
				const o = proj(d.x, d.y, z),
					u = proj(d.x, d.y, z + 1);
				let gx = o[0] - u[0],
					gy = o[1] - u[1];
				const gl = Math.hypot(gx, gy) || 1;
				gx /= gl;
				gy /= gl;
				const rb = Math.max(2.5, (3.5 + 4 * d.dose) * o[2]) * (0.6 + 0.4 * form),
					along = rb * (1 + 1.3 * fk);
				ctx.setTransform(-gy * rb, gx * rb, gx * along, gy * along, o[0], o[1]);
				ctx.beginPath();
				ctx.arc(0, 0, 1, 0, 6.2832);
				ctx.setTransform(1, 0, 0, 1, 0, 0);
				ctx.fillStyle = rgba(mix(PRIMARY, WHITE, 0.2), 0.85 * form);
				ctx.fill();
				ctx.fillStyle = rgba(WHITE, 0.9 * form);
				ctx.beginPath();
				ctx.arc(o[0] - 0.3 * rb, o[1] - 0.35 * rb, Math.max(0.6, 0.22 * rb), 0, 6.2832);
				ctx.fill();
			}
			// the cultures: every footprint, faint at rest; brighter where the slow layer has settled
			for (const c of cells) {
				const ev = Math.min(1, c.evidence);
				const rest = 0.11 + 0.016 * Math.sin(t * 0.5 + c.x);
				// in the watcher's field the cells are seen: each body distinct in plain light
				const fd = Math.hypot(c.x - watcher.x, c.y - watcher.y) / FIELD;
				const seen = fd < 1 ? 0.3 * (1 - fd ** 6) : 0;
				ctx.fillStyle = rgba(
					mix(mix(PRIMARY, BIOLUM, 0.5 * ev), WHITE, 0.5 * seen),
					rest + 0.3 * ev + seen
				);
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
			// the exposure fades at the edges of the frame: the plate goes on, the frame does not cut it.
			// An ellipse about the plate's centre, like the mark's exposure: no edge of it is straight
			ctx.globalCompositeOperation = 'destination-in';
			const CW = canvas.width,
				CH = canvas.height;
			ctx.save();
			ctx.translate(CW * 0.5, CH * 0.52);
			ctx.scale(CW * 0.5, CH * 0.5);
			const vg = ctx.createRadialGradient(0, 0, 0, 0, 0, 1);
			vg.addColorStop(0, 'rgba(0,0,0,1)');
			vg.addColorStop(0.58, 'rgba(0,0,0,1)');
			vg.addColorStop(0.98, 'rgba(0,0,0,0)');
			ctx.fillStyle = vg;
			ctx.fillRect(-1, -1.1, 2, 2.2);
			ctx.restore();
			ctx.globalCompositeOperation = 'source-over';
		}

		// ---- the hand: tap a well -----------------------------------------------
		let tNow = 0;
		function wellUnder(ev) {
			const r = stage.getBoundingClientRect();
			camera(HOME);
			const pt = unproj((ev.clientX - r.left) * dpr, (ev.clientY - r.top) * dpr);
			if (!pt) return null;
			const w = wellAt(pt[0], pt[1]);
			if (!w || !w.whole || Math.hypot(pt[0] - w.x, pt[1] - w.y) > R * 1.02) return null;
			return w;
		}
		// one tap, one change, at the one strength; the instrument answers it once the well has
		function put(w) {
			if (clock0 < 0) clock0 = tNow;
			release(w, DOSE, tNow, 0.25, true);
		}
		// a click is a tap on every device, and never a scroll
		function onClick(ev) {
			if (still) return;
			const w = wellUnder(ev);
			if (w) put(w);
		}
		// the keyboard: the button after the plate puts a change into the next untouched well, from the centre out
		const FROM_CENTRE = ['M1', 'M0', 'M2', 'T1', 'B1', 'T0', 'T2', 'B0', 'B2'];
		putNext = () => {
			if (still) return;
			const w =
				FROM_CENTRE.map((k) => NAMED[k]).find((o) => !o.doses.length && !plan.some((e) => e.w === o)) ||
				NAMED.M1;
			put(w);
		};
		stage.addEventListener('click', onClick);

		resize();
		if (reduced) {
			// one exposure: the instrument's own three changes, chosen one from the last, settled
			still = true;
			stillMode.set(true);
			clock0 = 0;
			schedule(ARRIVAL, NAMED.T1, DOSE);
			let t = 0;
			for (let i = 0; i < 60 * 24; i++) {
				t = i / 60;
				tNow = t;
				stepProcess(t);
			}
			render(t);
			live = true;
			return;
		}
		render(0);
		live = true;

		// the clock starts when the visitor arrives at the plate and runs on from there: the instrument keeps
		// working its row while the plate is off-screen, so a reader who scrolls on finds the record with its
		// curve. The plate is only drawn while it is in view
		let t = 0;
		let lastNow = 0;
		let frame = 0;
		let visible = false;
		let arrived = false;
		function tick(now) {
			if (visible || clock0 >= 0) {
				const dms = lastNow ? Math.min(100, now - lastNow) : 16;
				t += dms / 1000;
				lastNow = now;
				tNow = t;
				if (arrived && clock0 < 0) {
					clock0 = t;
					// the instrument's one change on arrival: this is where a change goes in, and what it does
					schedule(t + ARRIVAL, NAMED.T1, DOSE);
				}
				stepProcess(t);
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

<!-- the plate is a picture to the page; the one thing a hand can do to it is wired on the stage in the
     script, and the keyboard gets the same thing as a button after it -->
<div class="stage" class:still bind:this={stage} role="img" aria-label={m.a11y.figure}>
	<canvas class="instrument" class:shown={live} bind:this={canvas} aria-hidden="true"></canvas>
</div>
{#if !still}
	<button class="put" type="button" on:click={() => putNext()}>{m.a11y.put}</button>
{/if}

<style>
	/* the plate's own box, square: the exposure fades to nothing before any edge of it */
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
