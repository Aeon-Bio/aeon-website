<!--
  One graph that grows under the data, seen one phrase at a time.

  The person's phrases sit in a line — the sentence. One is in focus: everything
  the model ties to it is drawn around it (causes above by depth, consequences
  below, the medications that can cause it, its observations with the person's
  values), and the pathways those terms share beneath as mechanism. Clicking a
  phrase, or the arrow keys, turn the focus; the page scrolls freely over the
  drawing. Nodes that persist glide,
  nodes that leave fade, edges redraw. Fill is posterior; a halo is an
  observation; ghost ink is a pruned branch. Terms with no pragmatic health
  use are triaged out of the drawing (data/triage.ts); rows order by posterior,
  the relevance the person's history gives each branch.
-->
<script context="module" lang="ts">
	export interface MNode {
		id: string;
		label: string;
		level?: number;
		said?: boolean;
		kind: 'var' | 'obs';
		parent?: string;
		value?: string;
		drugs?: string[];
		state: 'observed' | 'inferred' | 'closed' | 'pruned';
		p: number;
	}
	export interface MEdge {
		source: string;
		target: string;
		type: 'Activation' | 'Inhibition' | 'Observation';
		belief: number;
		w: number;
	}
	export interface Ask {
		for: string;
		about: string;
		text: string;
		p: number;
	}
	export interface MDepth {
		depth: string;
		nodes: MNode[];
		edges: MEdge[];
		asks?: Ask[];
	}
	export interface Pathway {
		id: string;
		label: string;
	}
</script>

<script lang="ts">
	import { tweened } from 'svelte/motion';
	import { cubicOut } from 'svelte/easing';
	import { attention, release } from '$lib/stores/attention';
	import { glyphOf, type Implication } from '$lib/data/implications';
	import { medicationExamples } from '$lib/data/medications';
	import { notPragmatic } from '$lib/data/triage';

	export let depths: MDepth[];
	export let at = 0;
	export let pathways: Pathway[] = [];
	/** "term|pathway" -> shared gene count */
	export let termPathways: Record<string, number> = {};
	export let narrow = false;
	export let geneCount = 0;
	export let indexed: Record<string, number> = {};
	/** what the genes imply, read from INDRA with its beliefs — the genome layer's voice */
	export let implications: Implication[] = [];
	/** indexed treatment names per term, for the dossier */
	export let treatments: Record<string, string[]> = {};
	/** where each term entered the conversation — “you said …” / “raised by …” */
	export let provenance: Record<string, string> = {};

	const levelName: Record<string, string> = {
		'2': 'upstream',
		'1': 'what the record raised',
		'0': 'what you said',
		'-1': 'downstream'
	};

	// ---- the current pass of the model ----
	$: cur = depths[Math.min(at, depths.length - 1)];
	$: nodeOf = Object.fromEntries(cur.nodes.map((n) => [n.id, n])) as Record<string, MNode>;

	// ---- what this pass's data actually moved ----
	// Belief propagation nudges every posterior a little; impact means a state
	// flip, a new node, a changed observation, or a real shift in p. Deeper
	// views draw only that subgraph — the rest of the model rests.
	$: prevPass = at > 0 ? depths[Math.min(at, depths.length - 1) - 1] : null;
	$: impacted = (() => {
		if (!prevPass) return null;
		const before = Object.fromEntries(prevPass.nodes.map((n) => [n.id, n])) as Record<
			string,
			MNode
		>;
		const s: Record<string, true> = {};
		for (const n of cur.nodes) {
			const b = before[n.id];
			if (!b || b.state !== n.state || b.value !== n.value || Math.abs(b.p - n.p) >= 0.05)
				s[n.id] = true;
		}
		// an observation that moved keeps its term on canvas
		for (const n of cur.nodes) if (s[n.id] && n.kind === 'obs' && n.parent) s[n.parent] = true;
		return s;
	})();
	/** the sentence: at deeper passes, only the phrases the data's ripples reached */
	$: said = (() => {
		const all = cur.nodes.filter((n) => n.kind === 'var' && n.said);
		if (!impacted) return all;
		const kept = all.filter(
			(n) =>
				impacted[n.id] ||
				cur.edges.some(
					(e) =>
						e.type !== 'Observation' &&
						(e.source === n.id || e.target === n.id) &&
						impacted[e.source === n.id ? e.target : e.source]
				)
		);
		return kept.length ? kept : all;
	})();
	$: saidKept = Object.fromEntries(said.map((n) => [n.id, true])) as Record<string, true>;

	// ---- focus: one phrase at a time ----
	let focusIndex = 0;
	$: focusIndex = Math.min(focusIndex, Math.max(0, said.length - 1));
	$: focus = said[focusIndex];

	// the neighbourhood: everything a factor ties to the focus, plus observations beneath those
	$: hood = (() => {
		if (!focus) return { vars: [] as MNode[], obs: [] as MNode[], edges: [] as MEdge[] };
		const ids: Record<string, true> = { [focus.id]: true };
		for (const e of cur.edges) {
			if (e.type === 'Observation') continue;
			if (e.source === focus.id) ids[e.target] = true;
			if (e.target === focus.id) ids[e.source] = true;
		}
		const vars = cur.nodes.filter(
			(n) =>
				n.kind === 'var' &&
				ids[n.id] &&
				!notPragmatic[n.id] &&
				(!impacted || impacted[n.id] || saidKept[n.id])
		);
		const inVar: Record<string, true> = {};
		for (const n of vars) inVar[n.id] = true;
		const obs = cur.nodes.filter((n) => n.kind === 'obs' && n.parent && inVar[n.parent]);
		const inHood: Record<string, true> = { ...inVar };
		for (const o of obs) inHood[o.id] = true;
		const edges = cur.edges.filter((e) => inHood[e.source] && inHood[e.target]);
		return { vars, obs, edges };
	})();

	// ---- geometry ----
	const NX = 104;
	const ROW = 46;
	/** vertical pitch of an observation line — the data must be readable */
	const OBS = 36;
	$: SW = narrow ? 400 : 1200;
	$: levels = [2, 1, 0, -1].filter((l) => l === 0 || hood.vars.some((n) => (n.level ?? 1) === l));
	$: obsUnder = (() => {
		const m: Record<string, MNode[]> = {};
		for (const o of hood.obs) (m[o.parent ?? ''] ??= []).push(o);
		return m;
	})();
	$: maxObsAt = Object.fromEntries(
		levels.map((l) => [
			l,
			Math.max(
				0,
				...(l === 0 ? said : hood.vars.filter((n) => (n.level ?? 1) === l)).map(
					(n) => obsUnder[n.id]?.length ?? 0
				)
			)
		])
	);
	$: rowY = (() => {
		const out: Record<string, number> = {};
		let y = 44;
		for (const l of levels) {
			out[l] = y;
			y += (l === 0 ? 124 : 96) + (maxObsAt[l] ? 34 + maxObsAt[l] * OBS : 0);
		}
		return { out, end: y };
	})();
	$: PY = rowY.end + 36;
	$: groupY = (() => {
		const out: Record<string, number> = {};
		let y = 36;
		for (const l of levels) {
			out[l] = y;
			const row = l === 0 ? said : hood.vars.filter((n) => (n.level ?? 1) === l);
			for (const n of row) y += ROW + (obsUnder[n.id]?.length ?? 0) * OBS;
			y += 42;
		}
		return { out, end: y };
	})();
	$: hoodPathways = pathways.filter((p) =>
		hood.vars.some((n) => (n.level ?? 1) === 1 && termPathways[`${n.id}|${p.id}`])
	);
	$: pw0 = narrow ? groupY.end + 6 : PY;
	$: SH = narrow
		? gy0 + 12 + shownImps.length * ROW + 24
		: shownImps.length
			? gy0 + 66 + impTiers * IMP_TIER
			: PY + (hoodPathways.length ? 96 : 8);
	const spread = (i: number, n: number, lo: number, hi: number) =>
		n <= 1 ? (lo + hi) / 2 : lo + (i * (hi - lo)) / (n - 1);
	/** a row name's half-width in the display face (19px Josefin ≈ 9.2px per glyph) */
	const labelHalf = (n: MNode) => (n.label.length * 9.2) / 2;
	/** the drop between a row's tiers, and the air kept between neighbouring names */
	const TIER = 34;
	const LABEL_GAP = 16;
	const byP = (a: MNode, b: MNode) => b.p - a.p || a.label.localeCompare(b.label);
	function saidX(n: MNode | undefined) {
		if (!n) return SW / 2;
		const i = said.findIndex((s) => s.id === n.id);
		return spread(i, said.length, 250, SW - 90);
	}

	$: pos = (() => {
		const out: Record<string, { x: number; y: number }> = {};
		// the sentence: every phrase at its fixed place; the neighbourhood centres on the focus
		if (narrow) {
			let y = groupY.out[0] + 12;
			for (const n of said) {
				out[n.id] = { x: NX, y };
				(obsUnder[n.id] ?? []).forEach((o, k) => (out[o.id] = { x: NX + 22, y: y + 30 + k * OBS }));
				y += ROW + (obsUnder[n.id]?.length ?? 0) * OBS;
			}
		} else {
			said.forEach((n) => {
				const x = saidX(n);
				out[n.id] = { x, y: rowY.out[0] };
				(obsUnder[n.id] ?? []).forEach(
					(o, k) => (out[o.id] = { x, y: rowY.out[0] + 74 + k * OBS })
				);
			});
		}
		for (const l of levels) {
			if (l === 0) continue;
			const row = hood.vars.filter((n) => (n.level ?? 1) === l).sort(byP);
			if (narrow) {
				let y = groupY.out[l] + 12;
				for (const n of row) {
					out[n.id] = { x: NX, y };
					(obsUnder[n.id] ?? []).forEach(
						(o, k) => (out[o.id] = { x: NX + 22, y: y + 30 + k * OBS })
					);
					y += ROW + (obsUnder[n.id]?.length ?? 0) * OBS;
				}
			} else {
				const span = Math.min(SW - 340, 150 * Math.max(1, row.length - 1));
				const cx = Math.min(Math.max(saidX(focus), 250 + span / 2), SW - 90 - span / 2);
				// a node whose name would run into the last name on its tier steps down a
				// tier, dot and name together, so no label clips its neighbour
				const right: number[] = [];
				row.forEach((n, i) => {
					const x = spread(i, row.length, cx - span / 2, cx + span / 2);
					const hw = labelHalf(n);
					let t = right.findIndex((r) => x - hw >= r + LABEL_GAP);
					if (t < 0) t = right.length < 3 ? right.length : right.indexOf(Math.min(...right));
					right[t] = x + hw;
					const y = rowY.out[l] + t * TIER;
					out[n.id] = { x, y };
					(obsUnder[n.id] ?? []).forEach((o, k) => (out[o.id] = { x, y: y + 52 + k * OBS }));
				});
			}
		}
		return out;
	})();
	// ---- hover columns: the whole slot a node occupies, not just its painted dot ----
	$: hitSpan = (() => {
		const out: Record<string, { x0: number; x1: number }> = {};
		if (narrow) return out;
		const rows = [
			said,
			...levels
				.filter((l) => l !== 0)
				.map((l) => hood.vars.filter((n) => (n.level ?? 1) === l && !n.said).sort(byP))
		];
		for (const row of rows) {
			row.forEach((n, i) => {
				const x = pos[n.id]?.x ?? 0;
				const left = i > 0 ? (x - (pos[row[i - 1].id]?.x ?? x)) / 2 : 80;
				const right = i < row.length - 1 ? ((pos[row[i + 1].id]?.x ?? x) - x) / 2 : 80;
				out[n.id] = { x0: -Math.max(24, left), x1: Math.max(24, right) };
			});
		}
		return out;
	})();
	function hitBox(n: MNode, s: { x0: number; x1: number } | undefined, nObs: number) {
		if (narrow) return { x: -18, y: -20, w: 280, h: 40 + nObs * OBS };
		const { x0, x1 } = s ?? { x0: -40, x1: 40 };
		const top = n.said ? -20 : -54;
		const bottom = (n.said ? 46 : 30) + (nObs ? 22 + nObs * OBS : 0);
		return { x: x0, y: top, w: x1 - x0, h: bottom - top };
	}

	// wide: alternate pathways step down a tier so their names never collide — the
	// whole node steps, dot and name together, so every tie lands on its own dot
	$: pwPos = Object.fromEntries(
		hoodPathways.map((n, i) => [
			n.id,
			narrow
				? { x: NX, y: pw0 + 12 + i * ROW }
				: { x: spread(i, hoodPathways.length, 250, SW - 90), y: PY + (i % 2) * 30 }
		])
	);

	// ---- the genome band: what the genes imply about the terms on this canvas ----
	$: shownImps = implications.filter((im) => pos[im.id]);
	$: gy0 = narrow
		? pw0 + 12 + hoodPathways.length * ROW + (hoodPathways.length ? 18 : 0)
		: PY + (hoodPathways.length ? 96 : 6);
	const impKey = (im: Implication) => im.gene + im.id + im.type;
	/** a chip's half-width in the mono face (12.5px Fira Mono ≈ 7.5px per glyph) */
	const impHalf = (im: Implication) => (impText(im).length * 7.5) / 2;
	/** the drop between staggered baselines: one two-line chip plus breathing room */
	const IMP_TIER = 40;
	const IMP_GAP = 18;
	/** wide layout: chips spread evenly, but one that would run into the last chip
	 *  on its baseline steps down to the next, so no label clips its neighbour */
	$: impLayout = (() => {
		const pos: Record<string, { x: number; y: number }> = {};
		if (narrow) {
			shownImps.forEach((im, i) => (pos[impKey(im)] = { x: NX, y: gy0 + 12 + i * ROW }));
			return { pos, tiers: 0 };
		}
		const right: number[] = [];
		let tiers = 0;
		shownImps.forEach((im, i) => {
			const x = spread(i, shownImps.length, 250, SW - 90);
			const hw = impHalf(im);
			let t = right.findIndex((r) => x - hw >= r + IMP_GAP);
			if (t < 0) {
				if (right.length < 3) t = right.length;
				else t = right.indexOf(Math.min(...right));
			}
			right[t] = x + hw;
			tiers = Math.max(tiers, t);
			pos[impKey(im)] = { x, y: gy0 + 26 + t * IMP_TIER };
		});
		return { pos, tiers };
	})();
	$: impPos = impLayout.pos;
	$: impTiers = impLayout.tiers;
	function impThread(im: Implication) {
		const a = pos[im.id];
		const b = impPos[impKey(im)];
		if (!a || !b) return '';
		const y0 = a.y + 8 + (obsUnder[im.id]?.length ? 36 + obsUnder[im.id].length * OBS : 0);
		const y1 = b.y - 26;
		const dy = (y1 - y0) * 0.5;
		return `M${a.x},${y0} C${a.x},${y0 + dy} ${b.x},${y1 - dy} ${b.x},${y1}`;
	}
	const impText = (im: Implication) =>
		im.dir === 'in'
			? `${im.label} ${glyphOf[im.type]} ${im.gene}`
			: `${im.gene} ${glyphOf[im.type]} ${im.label}`;

	function path(e: MEdge, narrow: boolean) {
		const a = pos[drawId(e.source)];
		const b = pos[drawId(e.target)];
		if (!a || !b) return '';
		if (e.type === 'Observation') {
			return narrow
				? `M${a.x},${a.y + 6} L${a.x},${b.y} L${b.x - 6},${b.y}`
				: `M${a.x},${a.y + 7} L${b.x},${b.y - 6}`;
		}
		if (narrow) {
			const bx = a.x - 26 - e.belief * 45;
			return `M${a.x - 6},${a.y} C${bx},${a.y} ${bx},${b.y} ${b.x - 7},${b.y}`;
		}
		if (a.y === b.y) {
			const lift = 22 + Math.abs(a.x - b.x) * 0.08;
			const dir = a.x < b.x ? 1 : -1;
			return `M${a.x + 6 * dir},${a.y - 6} Q${(a.x + b.x) / 2},${a.y - lift} ${b.x - 8 * dir},${b.y - 6}`;
		}
		const down = b.y > a.y;
		const pt = ports[key(e)];
		const x0 = pt?.x0 ?? a.x;
		const y0 = pt?.y0 ?? a.y + (down ? 8 : -8);
		const x1 = pt?.x1 ?? b.x;
		const y1 = pt?.y1 ?? b.y + (down ? -11 : 11);
		// leave and land along the rim's radial direction, so every edge reads as
		// emanating from its dot — never a bar hanging beside it
		const L = Math.min(60, Math.max(14, Math.hypot(x1 - x0, y1 - y0) * 0.35));
		const u = rimDir(x0, y0, a.x, a.y, down ? 1 : -1);
		const v = rimDir(x1, y1, b.x, b.y, down ? -1 : 1);
		return `M${x0},${y0} C${x0 + u.x * L},${y0 + u.y * L} ${x1 + v.x * L},${y1 + v.y * L} ${x1},${y1}`;
	}
	/** unit vector from a node's centre through its rim port; vertical fallback */
	function rimDir(px: number, py: number, cx: number, cy: number, fy: number) {
		const dx = px - cx;
		const dyy = py - cy;
		const len = Math.hypot(dx, dyy);
		return len < 1e-6 ? { x: 0, y: fy } : { x: dx / len, y: dyy / len };
	}
	function key(e: MEdge) {
		return e.source + '|' + e.target + '|' + e.type;
	}
	/**
	 * Where each factor leaves and lands. Edges sharing a node are spread across
	 * that node's rim — arrivals over the top, departures under the bottom — in
	 * the order of the far end's x, so a hub reads as many lines meeting, not one
	 * pile of arrowheads on a single pixel.
	 */
	$: ports = (() => {
		const out: Record<string, { x0: number; y0: number; x1: number; y1: number }> = {};
		if (narrow) return out;
		const byNode: Record<string, { e: MEdge; end: 'src' | 'dst' }[]> = {};
		for (const e of shownEdges) {
			if (e.type === 'Observation') continue;
			const a = pos[drawId(e.source)];
			const b = pos[drawId(e.target)];
			if (!a || !b || a.y === b.y) continue;
			(byNode[drawId(e.source)] ??= []).push({ e, end: 'src' });
			(byNode[drawId(e.target)] ??= []).push({ e, end: 'dst' });
		}
		const SPREAD = Math.PI * 0.62; // the arc a side of the rim offers
		for (const id in byNode) {
			const c = pos[id];
			const r = (id === focus?.id ? 7.5 : 4) + 4;
			const top = byNode[id].filter(
				({ e, end }) => pos[drawId(end === 'dst' ? e.source : e.target)].y < c.y
			);
			const bottom = byNode[id].filter(
				({ e, end }) => pos[drawId(end === 'dst' ? e.source : e.target)].y > c.y
			);
			for (const [side, list] of [
				[-1, top],
				[1, bottom]
			] as const) {
				list.sort((p, q) => {
					const px = pos[drawId(p.end === 'dst' ? p.e.source : p.e.target)].x;
					const qx = pos[drawId(q.end === 'dst' ? q.e.source : q.e.target)].x;
					return px - qx;
				});
				const n = list.length;
				list.forEach(({ e, end }, i) => {
					const t = n === 1 ? 0 : (i / (n - 1) - 0.5) * SPREAD;
					const x = c.x + Math.sin(t) * r;
					const y = c.y + side * Math.cos(t) * r;
					const k = key(e);
					const cur = (out[k] ??= { x0: NaN, y0: NaN, x1: NaN, y1: NaN });
					if (end === 'src') {
						cur.x0 = x;
						cur.y0 = y;
					} else {
						cur.x1 = x;
						cur.y1 = y;
					}
				});
			}
		}
		return out;
	})();
	function tie(t: string, pw: string, narrow: boolean) {
		const a = pos[t];
		const b = pwPos[pw];
		if (!a || !b) return '';
		if (narrow) {
			const bx = a.x - 28 - Math.min(4, termPathways[`${t}|${pw}`] ?? 1) * 14;
			return `M${a.x - 6},${a.y} C${bx},${a.y} ${bx},${b.y} ${b.x - 6},${b.y}`;
		}
		const y0 = a.y + 8 + (obsUnder[t]?.length ? 36 + obsUnder[t].length * OBS : 0);
		const dy = (b.y - 16 - y0) * 0.5;
		return `M${a.x},${y0} C${a.x},${y0 + dy} ${b.x},${b.y - 16 - dy} ${b.x},${b.y - 16}`;
	}
	function wrap(label: string, max: number): string[] {
		const words = label.split(' ');
		const lines: string[] = [];
		let curL = '';
		for (const w of words) {
			if ((curL + ' ' + w).trim().length > max && curL) {
				lines.push(curL);
				curL = w;
			} else curL = (curL + ' ' + w).trim();
		}
		if (curL) lines.push(curL);
		if (lines.length > 2) lines[1] = lines[1].replace(/,?\s*\S*$/, '') + ' …';
		return lines.slice(0, 2);
	}

	// ---- turning the focus: keys, or a click on a phrase ----
	function step(d: number) {
		const next = focusIndex + d;
		if (next < 0 || next >= said.length) return false;
		focusIndex = next;
		clearHold();
		hoverEdge = null;
		hoverImp = null;
		return true;
	}
	function onKey(ev: KeyboardEvent) {
		if (ev.key === 'ArrowRight' || ev.key === 'ArrowDown') {
			if (step(1)) ev.preventDefault();
		} else if (ev.key === 'ArrowLeft' || ev.key === 'ArrowUp') {
			if (step(-1)) ev.preventDefault();
		} else if (ev.key === 'Escape') {
			clearHold();
			clearTimeout(impT);
			hoverImp = null;
			impDwell = false;
		}
	}

	let hover: string | null = null;
	let hoverEdge: MEdge | null = null;
	function touches(id: string | null, e: MEdge) {
		return !!id && (e.source === id || e.target === id);
	}
	/** the mouse holds the beam here; the dialogue and ledger can aim it from outside.
	 *  `held` survives the short trip from a node into its popover — grace timers,
	 *  not raw mouseleave, decide when attention is truly gone. */
	let held: string | null = null;
	let closeT: ReturnType<typeof setTimeout> | undefined;
	function hoverNode(id: string | null) {
		clearTimeout(closeT);
		if (id) {
			hover = id;
			held = id;
			attention.set({ kind: 'term', id, from: 'graph' });
		} else {
			hover = null;
			closeT = setTimeout(letGo, 260);
		}
	}
	function letGo() {
		held = null;
		release((a) => a.kind === 'term' && a.from === 'graph');
	}
	function clearHold() {
		clearTimeout(closeT);
		hover = null;
		letGo();
	}
	function holdPop() {
		clearTimeout(closeT);
	}
	function leavePop() {
		clearTimeout(closeT);
		closeT = setTimeout(letGo, 200);
	}
	$: externTerm = $attention?.kind === 'term' && $attention.from !== 'graph' ? $attention.id : null;
	/** the attended term: the pointer first, a held popover next, then the conversation */
	$: hot = hover ?? held ?? (externTerm && nodeOf[externTerm] ? externTerm : null);

	// ---- hard evidence: the INDRA statement pages behind each drawn line ----
	const agentRef = (id: string) => {
		const i = id.indexOf(':');
		return `${id.slice(i + 1)}@${id.slice(0, i)}`;
	};
	const statementsUrl = (s: string, o: string) =>
		`https://db.indra.bio/statements/from_agents?subject=${agentRef(s)}&object=${agentRef(o)}&format=html`;
	const linkable = (id: string) => id.startsWith('MESH:') || id.startsWith('HGNC:');
	/** a ledger line under the pointer: interventions and probes lighting their targets */
	$: aim = $attention?.kind === 'tie' ? $attention : null;
	function aimHit(id: string) {
		return !!aim && (aim.acts.some((a) => a.id === id) || aim.probes.some((p) => p.id === id));
	}
	function aimAct(id: string) {
		return aim?.acts.find((a) => a.id === id);
	}
	function aimProbe(id: string) {
		return aim?.probes.find((p) => p.id === id);
	}
	/** the aggregate medication node drawn in this neighbourhood, if any */
	$: drugNode = hood.vars.find((n) => n.id.startsWith('DRUGS:'));
	/** where an id is drawn: itself — or, for an absent medication aggregate, the one on canvas */
	function drawId(id: string) {
		if (pos[id]) return id;
		return id.startsWith('DRUGS:') && drugNode ? drugNode.id : id;
	}
	function touchesDrawn(id: string, e: MEdge) {
		return drawId(e.source) === id || drawId(e.target) === id;
	}
	/** an attended node brings its own factors from anywhere in the model, to whatever is on canvas */
	$: hoverExtras = !hot
		? ([] as MEdge[])
		: (() => {
				const have = new Set(hood.edges.map(key));
				return cur.edges.filter(
					(e) =>
						e.type !== 'Observation' &&
						(e.source === hot || e.target === hot) &&
						!have.has(key(e)) &&
						pos[drawId(e.source)] &&
						pos[drawId(e.target)]
				);
			})();
	/** drawn factors: those on the focus; a hovered node brings its own */
	$: shownEdges = [
		...hood.edges.filter(
			(e) =>
				e.type === 'Observation' ||
				e.source === focus?.id ||
				e.target === focus?.id ||
				(hot && (e.source === hot || e.target === hot))
		),
		...hoverExtras
	];
	$: hoverAdj = (() => {
		const s: Record<string, true> = {};
		if (!hot) return s;
		s[hot] = true;
		for (const e of [...hood.edges, ...hoverExtras]) {
			if (e.source === hot) s[drawId(e.target)] = true;
			else if (e.target === hot) s[drawId(e.source)] = true;
		}
		return s;
	})();
	// ---- progressive disclosure: the readout deepens the longer attention holds ----
	/** the readout strip is resting for now */
	const showReadout = false;
	let cw = 1200;
	let dwell = false;
	let dwellT: ReturnType<typeof setTimeout> | undefined;
	function armDwell(id: string | null) {
		clearTimeout(dwellT);
		dwell = false;
		if (id) dwellT = setTimeout(() => (dwell = true), 450);
	}
	$: armDwell(hot);
	$: passTicks = [...depths.keys()];
	/** the belief's path through the passes: how each data stream moved this node */
	$: sparkPts = !hot
		? []
		: depths
				.map((d, i) => {
					const m = d.nodes.find((x) => x.id === hot);
					return m ? { i, p: m.p, state: m.state } : null;
				})
				.filter((x): x is { i: number; p: number; state: MNode['state'] } => !!x);
	$: sparkPath = sparkPts
		.map((pt, k) => `${k ? 'L' : 'M'}${6 + pt.i * 21},${14.5 - pt.p * 11}`)
		.join(' ');
	/** the pass that moved this belief the most */
	$: moverI = sparkPts.reduce(
		(best, pt, k) =>
			k > 0 && Math.abs(pt.p - sparkPts[k - 1].p) > best.d
				? { i: pt.i, d: Math.abs(pt.p - sparkPts[k - 1].p) }
				: best,
		{ i: -1, d: 0.001 }
	).i;
	$: topFactors = !hot
		? []
		: cur.edges
				.filter(
					(e) =>
						e.type !== 'Observation' &&
						touches(hot, e) &&
						!notPragmatic[e.source] &&
						!notPragmatic[e.target]
				)
				.sort((a, b) => b.belief - a.belief)
				.slice(0, 4);
	$: nodeImps = !hot ? [] : implications.filter((im) => im.id === hot);

	/** the medication aggregate's count, retold for whichever node is hovered */
	const drugCount = tweened(0, { duration: 450, easing: cubicOut });
	const knownIn = (label: string) =>
		Number((label.match(/([\d,]+)\s*known/)?.[1] ?? '0').replace(/,/g, ''));
	$: drugLabelFor = (hot && nodeOf['DRUGS:' + hot]?.label) || drugNode?.label;
	$: if (drugLabelFor) drugCount.set(knownIn(drugLabelFor));
	/** the entities behind the animated count: examples a person can recognise,
	 *  retold for whichever term holds the attention */
	$: activeMeds = !hot
		? []
		: (medicationExamples[hot.startsWith('DRUGS:') ? hot : 'DRUGS:' + hot] ?? []);

	let hoverImp: Implication | null = null;
	/** dwell on an implication chip opens its papers sheet; grace timers carry the trip */
	let impDwell = false;
	let impT: ReturnType<typeof setTimeout> | undefined;
	let impDwellT: ReturnType<typeof setTimeout> | undefined;
	function holdImp(im: Implication) {
		clearTimeout(impT);
		if (hoverImp !== im) {
			clearTimeout(impDwellT);
			impDwell = false;
			impDwellT = setTimeout(() => (impDwell = true), 420);
		}
		hoverImp = im;
	}
	function releaseImp() {
		clearTimeout(impT);
		impT = setTimeout(() => {
			hoverImp = null;
			impDwell = false;
		}, 240);
	}
	function sheetHold() {
		clearTimeout(impT);
	}

	/** a click opens the node's sheet at once — no dwell to wait through */
	function openSheet(n: MNode) {
		clearTimeout(closeT);
		hover = n.id;
		held = n.id;
		dwell = true;
		attention.set({ kind: 'term', id: n.id, from: 'graph' });
	}
	const labelOf = (id: string) => nodeOf[id]?.label ?? id;
	/** how the agent would follow up on this node — always its next real move,
	 *  never a number about the person */
	function followUp(n: MNode): string {
		if (n.id.startsWith('DRUGS:'))
			return `would ask what you take — ${knownIn(n.label)} known to cause this`;
		if (n.state === 'pruned') return 'would let this go — the data ruled it down';
		if (n.said) return 'has this from you — it is what you said';
		if (n.state === 'observed')
			return indexed[n.id]
				? `holds the measurement — would weigh the ${indexed[n.id]} indexed treatments`
				: 'holds the measurement — nothing left to ask';
		const drugAgg = nodeOf['DRUGS:' + n.id];
		if (drugAgg)
			return `would ask what you take — ${knownIn(drugAgg.label)} medications can cause this`;
		const probe = implications.find((im) => im.id === n.id && im.dir === 'in');
		if (probe) return `would send for a ${probe.gene} read — a measurement can see this`;
		if (indexed[n.id])
			return `would firm this up first — ${indexed[n.id]} treatments indexed if it holds`;
		return 'would wait — only deeper data can move this';
	}
	$: nextMove = hot && nodeOf[hot] ? followUp(nodeOf[hot]) : '';
	/** once data has arrived, presence follows the posterior: the unlikely recede toward the ground */
	$: resolving = at > 0;
	function presence(id: string) {
		if (!resolving) return 1;
		const n = nodeOf[id];
		if (!n) return 1;
		if (n.said || n.state === 'observed' || n.kind === 'obs') return 1;
		if (n.state === 'pruned') return 0.28;
		return 0.06 + Math.pow(n.p, 1.6) * 0.94;
	}
	function edgePresence(e: MEdge) {
		if (!resolving || e.type === 'Observation') return 1;
		return Math.min(presence(e.source), presence(e.target));
	}
</script>

<!-- svelte-ignore a11y_no_noninteractive_tabindex -->
<div
	class="model"
	class:narrow
	role="group"
	aria-label={`the model around “${focus?.label ?? ''}”`}
	tabindex="0"
	bind:clientWidth={cw}
	on:keydown={onKey}
>
	<svg
		class="graph"
		viewBox={`0 0 ${SW} ${SH}`}
		role="img"
		aria-label="The model: what you said, what the record raised, what the data observed, and the mechanism beneath"
	>
		<defs>
			{#each [['bar', 'var(--aeon-warn)'], ['bar-on', '#fff']] as [id, col] (id)}
				<marker
					{id}
					viewBox="0 0 8 8"
					refX="7"
					refY="4"
					markerWidth="7"
					markerHeight="7"
					markerUnits="userSpaceOnUse"
					orient="auto-start-reverse"
				>
					<path d="M6,0.5 L6,7.5" fill="none" stroke={col} stroke-width="1.4" />
				</marker>
			{/each}
		</defs>

		{#key focus?.id}
			<!-- mechanism ties -->
			<g class="ties">
				{#each hoodPathways as pw (pw.id)}
					{#each hood.vars.filter((n) => (n.level ?? 1) === 1 && termPathways[`${n.id}|${pw.id}`]) as t (t.id)}
						<path
							d={tie(t.id, pw.id, narrow)}
							pathLength="1"
							class:on={hot === t.id}
							class:dim={(hot && hot !== t.id) || !!aim || !!hoverImp}
							style:stroke-width={0.6 + Math.min(4, termPathways[`${t.id}|${pw.id}`]) * 0.45}
						/>
					{/each}
				{/each}
			</g>

			<!-- factors -->
			<g class="factors">
				{#each shownEdges as e (e.source + e.target + e.type)}
					{@const on = hoverEdge === e || touches(hot, e)}
					<path
						d={path(e, narrow)}
						pathLength="1"
						class:inhib={e.type === 'Inhibition'}
						class:obs={e.type === 'Observation'}
						class:on
						class:dim={(hot && !touches(hot, e)) ||
							(hoverEdge && hoverEdge !== e) ||
							!!aim ||
							!!hoverImp}
						style:stroke-width={e.type === 'Observation' ? 0.8 : 0.5 + e.belief * 1.6}
						style:opacity={(e.type === 'Observation' ? 0.6 : 0.12 + e.belief * 0.55) *
							edgePresence(e)}
						marker-end={e.type === 'Inhibition' ? `url(#bar${on ? '-on' : ''})` : undefined}
						on:mouseenter={() => (hoverEdge = e)}
						on:mouseleave={() => (hoverEdge = null)}
						role="presentation"
					/>
				{/each}
			</g>
		{/key}

		<!-- row names -->
		{#each levels as l (l)}
			<text x={narrow ? NX + 14 : 0} y={narrow ? groupY.out[l] - 14 : rowY.out[l] + 4} class="rowk"
				>{levelName[String(l)]}</text
			>
		{/each}
		{#if hoodPathways.length}
			<text x={narrow ? NX + 14 : 0} y={narrow ? pw0 - 14 : PY + 4} class="rowk"
				>mechanism{#if narrow}
					· {geneCount.toLocaleString()} genes{:else}<tspan x="0" dy="13"
						>{geneCount.toLocaleString()} genes</tspan
					>{/if}</text
			>
		{/if}

		<!-- the sentence: every phrase, the focus lit -->
		{#each said as n, i (n.id)}
			{@const p = pos[n.id]}
			{@const isFocus = n.id === focus?.id}
			{@const hb = hitBox(n, hitSpan[n.id], obsUnder[n.id]?.length ?? 0)}
			<g
				class="v said"
				class:focus={isFocus}
				class:dim={(hot && !hoverAdj[n.id]) ||
					(aim && !aimHit(n.id)) ||
					(hoverImp !== null && hoverImp.id !== n.id)}
				style:transform={`translate(${p.x}px, ${p.y}px)`}
				role="button"
				tabindex="-1"
				aria-label={`${n.label}${isFocus ? ', in focus' : ''}`}
				aria-pressed={isFocus}
				on:click={() => (focusIndex = i)}
				on:keydown={(e) => e.key === 'Enter' && (focusIndex = i)}
				on:mouseenter={() => hoverNode(n.id)}
				on:mouseleave={() => hoverNode(null)}
			>
				<rect class="hit" x={hb.x} y={hb.y} width={hb.w} height={hb.h} />
				{#if aim && aimAct(n.id)}<circle
						r="14"
						class="actring"
						class:inh={aimAct(n.id)?.type === 'Inhibition'}
					/>{/if}
				{#if aim && aimProbe(n.id)}<circle r="14" class="probering" />{/if}
				{#if hoverImp?.id === n.id}<circle
						r="13.5"
						class="impring"
						class:inh={hoverImp.type === 'Inhibition'}
					/>{/if}
				{#if n.state === 'observed'}<circle r="11" class="halo" />{/if}
				<circle r={isFocus ? 7.5 : 4} class="core" style:fill-opacity={isFocus ? 1 : 0.35} />
				{#if narrow}
					<text x="16" y="5" class="tl">{n.label}</text>
				{:else}
					<text y="34" text-anchor="middle" class="tl">{n.label}</text>
				{/if}
			</g>
		{/each}

		<!-- the neighbourhood -->
		{#each hood.vars.filter((n) => !n.said) as n (n.id)}
			{@const p = pos[n.id]}
			{@const hb = hitBox(n, hitSpan[n.id], obsUnder[n.id]?.length ?? 0)}
			{@const shownLabel = n.id.startsWith('DRUGS:')
				? n.label.replace(/[\d,]+(?=\s*known)/, String(Math.round($drugCount)))
				: n.label}
			<g
				class="v"
				class:far={(n.level ?? 1) !== 1}
				class:observed={n.state === 'observed'}
				class:ghost={n.state === 'pruned'}
				class:on={hot === n.id || (hoverEdge && touchesDrawn(n.id, hoverEdge))}
				class:dim={(hot && !hoverAdj[n.id]) ||
					(hoverEdge && !touchesDrawn(n.id, hoverEdge)) ||
					(aim && !aimHit(n.id)) ||
					(hoverImp !== null && hoverImp.id !== n.id)}
				class:lit={hot === n.id}
				style:transform={`translate(${p.x}px, ${p.y}px)`}
				style:--presence={presence(n.id)}
				role="button"
				tabindex="-1"
				aria-label={`${n.label}, ${n.state}`}
				on:mouseenter={() => hoverNode(n.id)}
				on:mouseleave={() => hoverNode(null)}
				on:click={() => openSheet(n)}
				on:keydown={(e) => e.key === 'Enter' && openSheet(n)}
			>
				<rect class="hit" x={hb.x} y={hb.y} width={hb.w} height={hb.h} />
				{#if aim && aimAct(n.id)}<circle
						r="14"
						class="actring"
						class:inh={aimAct(n.id)?.type === 'Inhibition'}
					/>{/if}
				{#if aim && aimProbe(n.id)}<circle r="14" class="probering" />{/if}
				{#if hoverImp?.id === n.id}<circle
						r="13.5"
						class="impring"
						class:inh={hoverImp.type === 'Inhibition'}
					/>{/if}
				{#if n.state === 'observed'}<circle r="11" class="halo" />{/if}
				<circle r={3.2 + n.p * 4.5} class="core" style:fill-opacity={0.15 + n.p * 0.85} />
				{#if narrow}
					<text x="16" y="5" class="tl">{shownLabel}</text>
				{:else}
					<text y="-15" text-anchor="middle" class="tl">{shownLabel}</text>
				{/if}
				{#if n.id.startsWith('DRUGS:') && activeMeds.length && !narrow}
					{#key drugLabelFor}
						{#each activeMeds.slice(0, 3) as d, k (d)}
							<text y={20 + k * 14} text-anchor="middle" class="dg" style:--k={k}>{d}</text>
						{/each}
					{/key}
				{/if}
			</g>
		{/each}

		<!-- observations beneath the term, with the person's value -->
		{#each hood.obs as o (o.id)}
			{@const p = pos[o.id]}
			<g
				class="o"
				class:present={o.state === 'observed'}
				class:closed={o.state === 'closed'}
				class:dim={(hot && hot !== o.parent && hot !== o.id) ||
					!!aim ||
					(hoverImp !== null && hoverImp.id !== o.parent)}
				style:transform={`translate(${p.x}px, ${p.y}px)`}
			>
				<rect x="-5" y="-5" width="10" height="10" transform="rotate(45)" class="mark" />
				<text x="14" y="-2" class="ol">{o.label}</text>
				<text x="14" y="13" class="ov">{o.value}</text>
			</g>
		{/each}

		<!-- mechanism -->
		{#each hoodPathways as n (n.id)}
			{@const p = pwPos[n.id]}
			{@const lines = wrap(n.label, narrow ? 38 : 26)}
			<g
				class="pw"
				class:dim={(hot && !termPathways[`${hot}|${n.id}`]) || !!aim || !!hoverImp}
				style:transform={`translate(${p.x}px, ${p.y}px)`}
			>
				<circle r="3.5" />
				{#if narrow}
					<text x="14" y={lines.length > 1 ? -2 : 4} class="pl">
						{#each lines as line, k (k)}<tspan x="14" dy={k === 0 ? 0 : 13}>{line}</tspan>{/each}
					</text>
				{:else}
					<text y="18" text-anchor="middle" class="pl">
						{#each lines as line, k (k)}<tspan x="0" dy={k === 0 ? 0 : 13}>{line}</tspan>{/each}
					</text>
				{/if}
			</g>
		{/each}

		<!-- the genome band: what the genes imply about the terms above, with INDRA's own belief -->
		{#if shownImps.length}
			<text x={narrow ? NX + 14 : 0} y={narrow ? gy0 - 2 : gy0 + 4} class="rowk">genome</text>
			{#each shownImps as im (impKey(im))}
				{@const ip = impPos[impKey(im)]}
				{@const lit = hoverImp !== null && impKey(hoverImp) === impKey(im)}
				{@const kin =
					hoverImp !== null && hoverImp.gene === im.gene && impKey(hoverImp) !== impKey(im)}
				{#if !narrow}
					<path
						d={impThread(im)}
						class="impthread"
						class:lit
						class:inh={im.type === 'Inhibition'}
						class:rev={im.dir === 'in'}
						class:dim={(hot && hot !== im.id) || !!aim || (hoverImp !== null && !lit)}
						style:stroke-width={0.7 + im.belief * 1.3}
					/>
				{/if}
				<g
					class="imp"
					class:lit
					class:kin
					class:dim={(hot && hot !== im.id) || !!aim || (hoverImp !== null && !lit && !kin)}
					style:transform={`translate(${ip.x}px, ${ip.y}px)`}
					on:mouseenter={() => holdImp(im)}
					on:mouseleave={releaseImp}
					role="presentation"
				>
					<rect class="hit" x={narrow ? -8 : -95} y="-14" width={narrow ? 300 : 190} height="38" />
					<text text-anchor={narrow ? 'start' : 'middle'} class="ig">{impText(im)}</text>
					<text y="16" text-anchor={narrow ? 'start' : 'middle'} class="ib"
						>{im.evidence}
						{im.evidence === 1 ? 'paper' : 'papers'}</text
					>
				</g>
			{/each}
		{/if}
	</svg>

	<!-- hard evidence: the papers behind the drawn lines, one click away -->
	{#if !narrow && held && dwell && nodeOf[held] && pos[held]}
		{@const hn = nodeOf[held]}
		{@const s = cw / SW}
		{@const flipX = pos[held].x > SW * 0.68}
		{@const flipY = pos[held].y > SH * 0.55}
		<div
			class="pop"
			class:flipx={flipX}
			class:flipy={flipY}
			style:left={`${pos[held].x * s}px`}
			style:top={`${pos[held].y * s}px`}
			role="dialog"
			tabindex="-1"
			aria-label={`evidence for ${hn.label}`}
			on:mouseenter={holdPop}
			on:mouseleave={leavePop}
		>
			{#key held}
				{@const meds = medicationExamples[held.startsWith('DRUGS:') ? held : 'DRUGS:' + held]}
				<div class="pop-in">
					<span class="ph"><span class="dk">evidence</span>{hn.label}</span>
					{#if !hn.said}
						<span class="say" aria-hidden="true">
							<span class="uchip soon">talk about this</span>
							<i class="tline t1"></i>
							<span class="bub yours"><i style:width="34px"></i><i style:width="19px"></i></span>
							<i class="tline t2"></i>
							<span class="bub theirs"><b></b><b></b><b></b></span>
						</span>
					{/if}
					{#each topFactors as e, k (key(e))}
						{@const out = e.source === held}
						{@const other = out ? e.target : e.source}
						<span class="pr" style:--i={k}>
							<span class="arr" class:inh={e.type === 'Inhibition'}
								>{out ? (e.type === 'Inhibition' ? '⊣' : '→') : '←'}</span
							>
							{labelOf(other)}
							{#if linkable(e.source) && linkable(e.target)}
								{@const eu = statementsUrl(e.source, e.target)}
								<!-- eslint-disable-next-line svelte/no-navigation-without-resolve -->
								<a href={eu} target="_blank" rel="noopener noreferrer">papers ↗</a>
							{/if}
						</span>
					{/each}
					{#each nodeImps as im, k (impKey(im))}
						{@const iu =
							im.dir === 'in' ? statementsUrl(im.id, im.hgnc) : statementsUrl(im.hgnc, im.id)}
						<span class="pr" style:--i={topFactors.length + k}>
							<span class="dk">genome</span>{impText(im)}
							<!-- eslint-disable-next-line svelte/no-navigation-without-resolve -->
							<a href={iu} target="_blank" rel="noopener noreferrer"
								>{im.evidence} {im.evidence === 1 ? 'paper' : 'papers'} ↗</a
							>
						</span>
					{/each}
					{#if treatments[held]?.length}
						<span class="pr" style:--i={topFactors.length + nodeImps.length}>
							<span class="dk">indexed</span>{treatments[held].slice(0, 4).join(', ')}{indexed[held]
								? ` — ${indexed[held]} known`
								: ''}
						</span>
					{/if}
					{#if meds}
						<span class="pr" style:--i={topFactors.length + nodeImps.length + 3}>
							<span class="dk">for example</span>{meds.join(', ')}
						</span>
					{/if}
					{#if provenance[held]}
						<span class="pr quiet" style:--i={topFactors.length + nodeImps.length + 1}
							>{provenance[held]}</span
						>
					{/if}
					{#if held.startsWith('MESH:')}
						{@const ru = `https://bioregistry.io/${held.replace('MESH:', 'mesh:')}`}
						<span class="pr quiet" style:--i={topFactors.length + nodeImps.length + 2}>
							<!-- eslint-disable-next-line svelte/no-navigation-without-resolve -->
							<a href={ru} target="_blank" rel="noopener noreferrer">{held.toLowerCase()} ↗</a>
						</span>
					{/if}
				</div>
			{/key}
		</div>
	{/if}

	<!-- the papers behind one implication: every sign the literature takes, one click to read -->
	{#if !narrow && hoverImp && impDwell && impPos[impKey(hoverImp)]}
		{@const sp = impPos[impKey(hoverImp)]}
		{@const s3 = cw / SW}
		<div
			class="pop impsheet"
			style:left={`${sp.x * s3}px`}
			style:top={`${sp.y * s3}px`}
			role="dialog"
			tabindex="-1"
			aria-label={`the papers on ${impText(hoverImp)}`}
			on:mouseenter={sheetHold}
			on:mouseleave={releaseImp}
		>
			{#key impKey(hoverImp)}
				<div class="pop-in">
					<span class="ph"><span class="dk">the papers</span>{impText(hoverImp)}</span>
					{#each hoverImp.stances ?? [] as st, k (st.hash)}
						{@const su = `https://db.indra.bio/statements/from_hash/${st.hash}?format=html`}
						<span class="pr" style:--i={k}>
							<span class="arr" class:inh={st.type === 'Inhibition'}>{glyphOf[st.type]}</span>
							{st.evidence}
							{st.evidence === 1 ? 'paper' : 'papers'}
							<!-- eslint-disable-next-line svelte/no-navigation-without-resolve -->
							<a href={su} target="_blank" rel="noopener noreferrer">read ↗</a>
						</span>
					{/each}
					{#if (hoverImp.stances ?? []).some((st) => st.retracted)}
						<span class="pr caut" style:--i={(hoverImp.stances ?? []).length}
							>some of this evidence has been withdrawn</span
						>
					{/if}
				</div>
			{/key}
		</div>
	{/if}

	<!-- the readout strip, resting for now — flip showReadout to bring it back -->
	{#if showReadout}
		<div class="readout" aria-live="polite">
			{#if aim}
				<span class="k">{aim.label}</span>
				{#each aim.acts as a (a.verb + a.id)}
					<span class="m"
						>{a.verb}
						<span class:inh={a.type === 'Inhibition'} class="arr"
							>{a.type === 'Inhibition' ? '⊣' : '→'}</span
						>
						{a.label}</span
					>
				{/each}
				{#each aim.probes as pr (pr.id)}
					<span class="m">would observe {pr.label} via {pr.via}</span>
				{/each}
			{:else if hoverImp}
				<span class="k">{impText(hoverImp)}</span>
				<span class="m"
					>{hoverImp.dir === 'in'
						? 'the condition moves this gene — what a measurement of it reads'
						: 'the gene presses this branch'} · belief {hoverImp.belief} · {hoverImp.evidence}
					{hoverImp.evidence === 1 ? 'paper' : 'papers'} · INDRA</span
				>
			{:else if hoverEdge}
				{#if hoverEdge.type === 'Observation'}
					<span class="k">observation</span>{labelOf(hoverEdge.target)}
					<span class="m">observes {labelOf(hoverEdge.source)}</span>
				{:else}
					<span class="k">{hoverEdge.type === 'Inhibition' ? '⊣' : '→'} {hoverEdge.type}</span>
					{labelOf(hoverEdge.source)}
					{hoverEdge.type === 'Inhibition' ? '⊣' : '→'}
					{labelOf(hoverEdge.target)}
					<span class="m">belief {hoverEdge.belief} · strength {hoverEdge.w}</span>
				{/if}
			{:else if hot && nodeOf[hot]}
				{@const n = nodeOf[hot]}
				<span class="k">{n.state}</span>{n.label}
				{#if sparkPts.length > 1}
					{#key hot}
						<svg class="spark" width="76" height="19" viewBox="0 0 76 19" aria-hidden="true">
							{#each passTicks as i (i)}
								<line x1={6 + i * 21} y1="16.5" x2={6 + i * 21} y2="18" class="stick" />
							{/each}
							<path d={sparkPath} pathLength="1" class="sline" />
							{#each sparkPts as pt, k (pt.i)}
								<circle
									cx={6 + pt.i * 21}
									cy={14.5 - pt.p * 11}
									r="2"
									class="sdot"
									class:mv={pt.i === moverI}
									class:obs={pt.state === 'observed'}
									class:now={pt.i === Math.min(at, depths.length - 1)}
									style:--k={k}
								/>
							{/each}
						</svg>
					{/key}
				{/if}
				{#if n.drugs}
					<span class="m">{n.drugs.slice(0, 4).join(', ')}{n.drugs.length > 4 ? '…' : ''}</span>
				{/if}
				{#if nextMove}<span class="m qm">{nextMove}</span>{/if}
			{:else}
				<span class="k">{cur.depth}</span><span class="m"
					>around “{focus?.label}” · {hood.vars.length} variables, {shownEdges.length} factors drawn
					of
					{cur.nodes.filter((n) => n.state !== 'pruned').length} and {cur.edges.length} in the model{impacted
						? ` · only what the ${cur.depth} moved`
						: ''} ·
					{narrow ? 'tap a phrase' : 'click a phrase, or use the arrow keys,'} to turn</span
				>
			{/if}
		</div>
	{/if}
</div>

<style>
	.model {
		position: relative;
		width: 100%;
		outline: none;
	}

	.model:focus-visible .graph {
		outline: 1px solid var(--ink-12);
		outline-offset: 8px;
	}

	.graph {
		display: block;
		width: 100%;
		height: auto;
		overflow: visible;
		font-family: var(--font-mono);
	}

	.rowk {
		font-size: 9.5px;
		letter-spacing: 0.12em;
		text-transform: uppercase;
		fill: var(--ink-30);
	}

	.ties path {
		fill: none;
		stroke: var(--aeon-primary);
		opacity: 0.08;
		stroke-dasharray: 1;
		stroke-dashoffset: 1;
		animation: draw 1200ms var(--ease-out) 260ms forwards;
		transition: opacity var(--t-move) var(--ease-out);
	}

	.ties path.on {
		stroke: var(--aeon-biolum);
		opacity: 0.9 !important;
	}

	.ties path.dim {
		opacity: 0.04 !important;
	}

	.factors path {
		fill: none;
		stroke: var(--aeon-biolum);
		stroke-dasharray: 1;
		stroke-dashoffset: 1;
		animation: draw 1100ms var(--ease-out) 320ms forwards;
		pointer-events: stroke;
		cursor: crosshair;
		transition:
			opacity var(--t-move) var(--ease-out),
			stroke var(--t-snap) var(--ease-out);
	}

	.factors path.inhib {
		stroke: var(--aeon-warn);
	}

	.factors path.obs {
		stroke: var(--ink-50);
		stroke-dasharray: 2 3;
		animation: none;
		stroke-dashoffset: 0;
	}

	.factors path.on {
		stroke: #fff;
		opacity: 1 !important;
	}

	.factors path.dim {
		opacity: 0.05 !important;
	}

	@keyframes draw {
		to {
			stroke-dashoffset: 0;
		}
	}

	/* a ledger line pressing on this node */
	.actring {
		fill: none;
		stroke: var(--aeon-biolum);
		stroke-width: 1.2;
		transform-box: fill-box;
		transform-origin: center;
		animation: breathe 1.7s var(--ease-out) infinite;
	}

	.actring.inh {
		stroke: var(--aeon-warn);
	}

	/* a test that would observe this node */
	.probering {
		fill: none;
		stroke: var(--aeon-biolum);
		stroke-width: 1;
		stroke-dasharray: 2.6 4.2;
		transform-box: fill-box;
		transform-origin: center;
		animation: circling 4s linear infinite;
	}

	@keyframes breathe {
		0%,
		100% {
			transform: scale(1);
			opacity: 0.9;
		}
		50% {
			transform: scale(1.3);
			opacity: 0.35;
		}
	}

	/* nodes glide between focuses; new ones settle in */
	.v,
	.o,
	.pw {
		outline: none;
		cursor: default;
		transition:
			transform 720ms var(--ease-out),
			opacity 520ms var(--ease-out);
		animation: settle 640ms var(--ease-out) both;
	}

	@keyframes settle {
		from {
			opacity: 0;
		}
	}

	.v.said {
		cursor: pointer;
	}

	/* a node opens its sheet on click */
	.v:not(.said):not(.ghost) {
		cursor: pointer;
	}

	.hit {
		fill: none;
		stroke: none;
		pointer-events: all;
	}

	.v {
		opacity: var(--presence, 1);
	}

	.v.lit {
		opacity: 1;
	}

	.v.ghost {
		opacity: 0.28;
		pointer-events: none;
	}

	.v.ghost .tl {
		text-decoration: line-through;
		fill: var(--ink-30);
	}

	.v.dim,
	.o.dim,
	.pw.dim {
		opacity: 0.25;
	}

	/* observations sit inside their parent's hover column; don't intercept it */
	.o {
		pointer-events: none;
	}

	.core {
		fill: var(--aeon-biolum);
		stroke: var(--aeon-primary);
		stroke-width: 1.2;
		transition:
			r 720ms var(--ease-out),
			fill-opacity 720ms var(--ease-out);
	}

	.v.said .core {
		stroke: var(--ink-70);
		stroke-width: 1.4;
	}

	.v.said.focus .core {
		stroke: var(--aeon-biolum);
		stroke-width: 1.6;
	}

	.v.observed .core {
		stroke: var(--aeon-biolum);
	}

	.halo {
		fill: none;
		stroke: rgba(128, 255, 219, 0.45);
		stroke-width: 1;
		animation: halo 900ms var(--ease-out) both;
		transform-box: fill-box;
		transform-origin: center;
	}

	@keyframes halo {
		from {
			opacity: 0;
			transform: scale(0.4);
		}
		to {
			opacity: 1;
			transform: scale(1);
		}
	}

	.v.on .core {
		stroke: #fff;
	}

	/* words sit on islands carved out of the edge field */
	.tl,
	.ol,
	.ov,
	.pl,
	.ig,
	.ib,
	.dg,
	.rowk {
		paint-order: stroke;
		stroke: var(--aeon-deep-space);
		stroke-width: 6px;
		stroke-linejoin: round;
	}

	.tl {
		font-family: var(--font-display);
		font-size: 19px;
		fill: var(--ink-100);
		letter-spacing: -0.01em;
		transition:
			font-size 720ms var(--ease-out),
			fill 520ms var(--ease-out);
	}

	.v.said .tl {
		font-style: italic;
		font-size: 17px;
		fill: var(--ink-50);
		stroke-width: 8px;
	}

	.v.said.focus .tl {
		font-size: 27px;
		letter-spacing: -0.02em;
		fill: var(--ink-100);
	}

	.v.far .tl {
		font-size: 15px;
		fill: var(--ink-70);
	}

	.narrow .tl {
		font-size: 17px;
	}

	.narrow .v.said.focus .tl {
		font-size: 22px;
	}

	.o .mark {
		fill: var(--aeon-deep-space);
		stroke: var(--ink-50);
		stroke-width: 1.1;
		transition: all var(--t-move) var(--ease-out);
	}

	.o.present .mark {
		fill: var(--aeon-biolum);
		stroke: var(--aeon-biolum);
	}

	.o.closed .mark {
		stroke: var(--ink-30);
	}

	.ol {
		font-size: 13.5px;
		fill: var(--ink-70);
	}

	.o.closed .ol {
		fill: var(--ink-30);
	}

	.ov {
		font-size: 13px;
		fill: var(--aeon-biolum);
	}

	.o.closed .ov {
		fill: var(--ink-30);
	}

	.pw circle {
		fill: var(--aeon-deep-space);
		stroke: var(--ink-30);
		stroke-width: 1.2;
	}

	.pl {
		font-size: 11px;
		fill: var(--ink-50);
	}

	/* the genome band: implication chips, threaded up to their terms */
	.impthread {
		fill: none;
		stroke: var(--aeon-primary);
		stroke-dasharray: 3 4;
		opacity: 0.25;
		transition: opacity var(--t-move) var(--ease-out);
	}

	.impthread.dim {
		opacity: 0.05;
	}

	/* the hovered implication is the edge: it brightens, takes the relation's
	   sign as its color, and its dashes flow in the relation's direction */
	.impthread.lit {
		stroke: var(--aeon-biolum);
		opacity: 0.95;
		animation: impflow 1.1s linear infinite;
	}

	.impthread.lit.inh {
		stroke: var(--aeon-warn);
	}

	.impthread.lit.rev {
		animation-direction: reverse;
	}

	@keyframes impflow {
		to {
			stroke-dashoffset: 14;
		}
	}

	.imp {
		cursor: help;
		transition: opacity 520ms var(--ease-out);
		animation: settle 640ms var(--ease-out) both;
	}

	.imp.dim {
		opacity: 0.15;
	}

	.imp.kin {
		opacity: 0.6;
	}

	.imp.lit .ig {
		fill: var(--ink-100);
	}

	@keyframes circling {
		to {
			transform: rotate(360deg);
		}
	}

	/* the relation's landing: a ring circling the term it speaks about */
	.impring {
		fill: none;
		stroke: var(--aeon-biolum);
		stroke-width: 1.1;
		stroke-dasharray: 2.6 4.2;
		transform-box: fill-box;
		transform-origin: center;
		animation: circling 4s linear infinite;
	}

	.impring.inh {
		stroke: var(--aeon-warn);
	}

	.ig {
		font-size: 12.5px;
		fill: var(--ink-70);
	}

	.ib {
		font-size: 11px;
		fill: var(--aeon-biolum);
	}

	/* the entities behind the count, surfacing beneath the aggregate */
	.dg {
		font-size: 11px;
		fill: var(--ink-50);
		animation: settle-row 320ms var(--ease-out) forwards;
		animation-delay: calc(80ms + var(--k) * 70ms);
		opacity: 0;
	}

	.readout {
		font-family: var(--font-mono);
		font-size: 0.74rem;
		line-height: 1.7;
		color: var(--ink-70);
		display: flex;
		flex-wrap: wrap;
		gap: 0 0.9rem;
		align-items: baseline;
		min-height: 1.7em;
		margin-top: 0.4rem;
	}

	.k {
		font-family: var(--font-mono);
		font-size: 0.66rem;
		letter-spacing: 0.12em;
		text-transform: uppercase;
		color: var(--aeon-biolum);
	}

	.m {
		font-size: 0.72rem;
		color: var(--ink-50);
	}

	.m .arr {
		color: var(--aeon-biolum);
	}

	.m .arr.inh {
		color: var(--aeon-warn);
	}

	.m.qm {
		font-family: var(--font-display);
		font-style: italic;
		font-size: 0.82rem;
		color: var(--ink-70);
	}

	/* the belief's path through the passes */
	.spark {
		align-self: center;
		overflow: visible;
	}

	.stick {
		stroke: var(--ink-12);
		stroke-width: 1;
	}

	.sline {
		fill: none;
		stroke: var(--aeon-primary);
		stroke-width: 1.2;
		stroke-dasharray: 1;
		stroke-dashoffset: 1;
		animation: draw 560ms var(--ease-out) forwards;
	}

	.sdot {
		fill: var(--ink-30);
		animation: settle 300ms var(--ease-out) both;
		animation-delay: calc(120ms + var(--k) * 90ms);
	}

	.sdot.obs {
		fill: var(--aeon-biolum);
	}

	.sdot.mv {
		fill: var(--aeon-biolum);
		r: 2.8;
		filter: drop-shadow(0 0 3px rgba(128, 255, 219, 0.8));
	}

	.sdot.now {
		stroke: var(--ink-70);
		stroke-width: 1;
	}

	/* hard evidence, anchored to the node and held open by grace timers */
	.pop {
		position: absolute;
		z-index: 6;
		width: max-content;
		max-width: 300px;
		transform: translate(14px, 14px);
		background: color-mix(in srgb, var(--aeon-deep-space) 88%, transparent);
		backdrop-filter: blur(10px);
		border: 1px solid var(--ink-12);
		border-radius: 6px;
		padding: 0.7rem 0.85rem 0.65rem;
		box-shadow:
			0 12px 34px rgba(0, 0, 0, 0.45),
			0 0 0 1px rgba(128, 255, 219, 0.05);
		animation: settle 240ms var(--ease-out) both;
	}

	.pop.flipx {
		transform: translate(calc(-100% - 14px), 14px);
	}

	.pop.flipy {
		transform: translate(14px, calc(-100% - 14px));
	}

	.pop.flipx.flipy {
		transform: translate(calc(-100% - 14px), calc(-100% - 14px));
	}

	.pop-in {
		display: grid;
		gap: 0.34rem;
		font-family: var(--font-mono);
		font-size: 0.7rem;
		line-height: 1.45;
		color: var(--ink-70);
	}

	.ph {
		font-family: var(--font-display);
		font-size: 1rem;
		color: var(--ink-100);
		display: flex;
		align-items: baseline;
		gap: 0.5rem;
		margin-bottom: 0.15rem;
	}

	.pr {
		opacity: 0;
		transform: translateY(4px);
		animation: settle-row 320ms var(--ease-out) forwards;
		animation-delay: calc(60ms + var(--i) * 55ms);
	}

	@keyframes settle-row {
		to {
			opacity: 1;
			transform: none;
		}
	}

	.pr .arr {
		color: var(--aeon-biolum);
	}

	.pr .arr.inh {
		color: var(--aeon-warn);
	}

	.pr a {
		color: var(--aeon-biolum);
		text-decoration: none;
		border-bottom: 1px dashed rgba(128, 255, 219, 0.35);
		transition:
			border-color var(--t-snap) var(--ease-out),
			color var(--t-snap) var(--ease-out);
	}

	.pr a:hover,
	.pr a:focus-visible {
		border-bottom-style: solid;
		border-bottom-color: var(--aeon-biolum);
		outline: none;
	}

	.pr.quiet {
		color: var(--ink-30);
		font-size: 0.64rem;
	}

	.pr.caut {
		color: var(--aeon-warn);
	}

	/* the implication sheet hangs above its chip, centred */
	.pop.impsheet {
		transform: translate(-50%, calc(-100% - 16px));
	}

	/* the placeholder of the affordance, drawn instead of told: from the pill a
	   ghost conversation threads — an emptied turn of yours, then the agent's
	   typing dots, all in the site's dashed not-yet language */
	.say {
		display: grid;
		justify-items: start;
		margin: 0.1rem 0 0.4rem;
	}

	.uchip.soon {
		font-family: var(--font-display);
		font-style: italic;
		font-size: 0.86rem;
		line-height: 1;
		color: var(--ink-50);
		border: 1px dashed var(--ink-30);
		border-radius: 999px;
		padding: 0.34rem 0.7rem 0.38rem;
	}

	.tline {
		width: 0;
		height: 11px;
		border-left: 1px dashed var(--ink-30);
		transform-origin: top;
		animation: growline 320ms var(--ease-out) both;
	}

	.tline.t1 {
		margin-left: 1.3rem;
		animation-delay: 180ms;
	}

	.tline.t2 {
		margin-left: 2.3rem;
		animation-delay: 620ms;
	}

	@keyframes growline {
		from {
			transform: scaleY(0);
		}
	}

	.bub {
		display: inline-flex;
		align-items: center;
		gap: 0.28rem;
		border: 1px solid var(--ink-12);
		border-radius: 10px;
		padding: 0.34rem 0.55rem;
		background: rgba(255, 255, 255, 0.02);
		opacity: 0;
		animation: settle-row 360ms var(--ease-out) forwards;
	}

	.bub.yours {
		margin-left: 0.8rem;
		border-radius: 10px 10px 10px 3px;
		animation-delay: 340ms;
	}

	.bub.yours i {
		display: block;
		height: 3px;
		border-radius: 2px;
		background: var(--ink-30);
	}

	.bub.theirs {
		margin-left: 1.8rem;
		border-radius: 10px 10px 10px 3px;
		border-color: rgba(128, 255, 219, 0.28);
		animation-delay: 780ms;
	}

	.bub.theirs b {
		width: 4px;
		height: 4px;
		border-radius: 50%;
		background: var(--aeon-biolum);
		animation: typing 1.3s var(--ease-out) infinite;
	}

	.bub.theirs b:nth-child(2) {
		animation-delay: 160ms;
	}

	.bub.theirs b:nth-child(3) {
		animation-delay: 320ms;
	}

	@keyframes typing {
		0%,
		60%,
		100% {
			opacity: 0.25;
			transform: translateY(0);
		}
		30% {
			opacity: 1;
			transform: translateY(-1.5px);
		}
	}

	.dk {
		font-family: var(--font-mono);
		font-size: 0.6rem;
		letter-spacing: 0.12em;
		text-transform: uppercase;
		color: var(--ink-30);
		margin-right: 0.45rem;
	}

	@media (prefers-reduced-motion: reduce) {
		.ties path,
		.factors path,
		.halo,
		.v,
		.o,
		.pw {
			animation: none;
			stroke-dashoffset: 0;
			opacity: 1;
			transform: none;
		}
		.actring,
		.probering,
		.impring,
		.impthread.lit {
			animation: none;
		}
		.dg {
			animation: none;
			opacity: 1;
		}
		.sline,
		.sdot {
			animation: none;
			stroke-dashoffset: 0;
			opacity: 1;
		}
		.pop {
			animation: none;
		}
		.pr {
			animation: none;
			opacity: 1;
			transform: none;
		}
		.tline,
		.bub {
			animation: none;
			opacity: 1;
			transform: none;
		}
		.bub.theirs b {
			animation: none;
			opacity: 0.6;
		}
		.v,
		.o,
		.pw,
		.core,
		.tl {
			transition: none;
		}
	}
</style>
