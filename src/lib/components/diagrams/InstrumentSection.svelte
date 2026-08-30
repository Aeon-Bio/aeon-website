<!--
  Section view across one Aevum row, playing itself while it is on screen.

  Three kinds of change, in the instrument's own grammar:
    press — the pipette punctures the septum and changes what is in a well
    cycle — the row-shared headspace changes what every well breathes
    swap  — the observer docks a different head under the deck; the plate never moves
  and one kind of look: the observer reads a well from the dry bay beneath.

  The choreography is chosen by the concern the reader carried down (`concern`),
  so the method deepens the question that was staked: iron across the plates and
  oxygen across the hours for the apnea/iron split; a dose series for the
  variant under a drug; the drugs on offer one to a plate for clearance.
  Press is warn, read is biolum: the tie grammar of the dialogue.

  Nothing here reports a result; it shows how one would be earned. Where the
  method asks the instrument for something it does not yet have (O₂ mixing),
  the caption says so. Vocabulary follows aevum/docs: tile, row, observer,
  head, dock plane, fiducials, septum mat, dry inverted bay.
  Geometry is schematic, not to scale.
-->
<script lang="ts">
	import { onMount, tick } from 'svelte';
	import { tweened } from 'svelte/motion';
	import { cubicInOut } from 'svelte/easing';
	import { fade } from 'svelte/transition';

	/** the question the dialogue staked on this plate, if the reader carried one down */
	export let stake: string | null = null;
	/** which concern staked it — chooses the choreography */
	export let concern: string | null = null;

	// ---- geometry ----
	const plateX = (i: number) => 140 + i * 155;
	const wellCx = (i: number, w: number) => plateX(i) + 28 + w * 19;
	const TIP_UP = 108; // rests at the top of the headspace
	const TIP_IN = 196; // through the septum, in the well
	const OFF = 7; // the pipette enters off the imaging axis
	const DOCK_X = 158; // where the observer docks a head, at the bay's end

	// ---- heads the observer can carry (aevum/docs/engineering/sensor_module_interface.md) ----
	// named by what the look is, not the catalog's shorthand (QPI = label-free phase imaging)
	type Head = 'qpi' | 'fluor' | 'o2';
	const HEADS: Record<Head, { name: string; color: string }> = {
		qpi: { name: 'label-free', color: 'var(--ink-70)' },
		fluor: { name: 'fluorescence', color: 'var(--aeon-biolum)' },
		o2: { name: 'O₂ / pH spot', color: 'var(--aeon-primary)' }
	};

	// ---- steps ----
	type Well = [number, number];
	type Step =
		| { kind: 'press'; at: Well; dose: number }
		| { kind: 'read'; wells: Well[] }
		| { kind: 'cycle'; epochs: number }
		| { kind: 'swap'; head: Head };
	interface Pass {
		text: string;
		tempo: number;
		steps: Step[];
	}

	const row = (i: number): Well[] => [0, 1, 2, 3, 4].map((w) => [i, w]);
	const all: Well[] = [0, 1, 2, 3].flatMap(row);
	const press = (wells: Well[], dose: number | ((w: number) => number)): Step[] =>
		wells.map(([i, w]) => ({
			kind: 'press',
			at: [i, w],
			dose: typeof dose === 'number' ? dose : dose(w)
		}));
	const read = (wells: Well[]): Step => ({ kind: 'read', wells });
	const gradient = (w: number) => 0.2 + w * 0.2;
	/** where the cheap look would send the costly one: a few wells, not the raster */
	const flagged: Well[] = [
		[1, 2],
		[2, 4],
		[3, 1]
	];

	const ONE: Pass = {
		text: 'One well. One change. Watch.',
		tempo: 1,
		steps: [...press([[1, 2]], 1), read([[1, 2]])]
	};
	const AGAIN: Pass = {
		text: 'The same change, again. One observation is a story; four are a claim.',
		tempo: 0.85,
		steps: [
			...press(
				[
					[1, 0],
					[1, 1],
					[1, 3],
					[1, 4]
				],
				1
			),
			read(row(1))
		]
	};
	const SWAP = (first: Head, then: Head, why: string): Pass => ({
		text: `Heads swap under the deck; the plate never moves. ${why}`,
		tempo: 0.4,
		steps: [{ kind: 'swap', head: first }, read(all), { kind: 'swap', head: then }, read(flagged)]
	});
	const LATER = (text: string): Pass => ({ text, tempo: 0.22, steps: [read(all)] });

	const PLANS: Record<string, Pass[]> = {
		tired: [
			ONE,
			AGAIN,
			{
				text: 'Iron at five strengths across one plate; the plate beside it left alone. The iron half.',
				tempo: 0.7,
				steps: [...press(row(2), gradient), read(row(2)), read(row(0))]
			},
			{
				text: 'Oxygen falls and returns, hour by hour, over the whole row. The apnea half — and a thing this question asks of the row’s gas mixing, which was drawn for CO₂.',
				tempo: 0.6,
				steps: [{ kind: 'cycle', epochs: 4 }, read(all)]
			},
			SWAP(
				'qpi',
				'o2',
				'A label-free look at every well first, cheaply — how much cell there is, how it moves; then what the cells actually breathed, only where the first look flagged.'
			),
			LATER(
				'And again, later. Iron across the plates, oxygen across the hours: two causes pulled apart on one row.'
			)
		],
		heart: [
			ONE,
			AGAIN,
			{
				text: 'PCSK9 inhibition at five strengths on cells that carry the variant; the plate beside them left alone.',
				tempo: 0.7,
				steps: [...press(row(2), gradient), read(row(2)), read(row(0))]
			},
			SWAP(
				'qpi',
				'fluor',
				'A label-free look at every well first, cheaply; then a labelled look at LDL uptake, only where the first look flagged.'
			),
			{
				text: 'Four plates in one headspace, one hour, one head reading them all.',
				tempo: 0.5,
				steps: [...press(row(3), 1), read(all)]
			},
			LATER(
				'And again, later. A cause answers in proportion and holds over time, or it was a moment.'
			)
		],
		ninety: [
			ONE,
			AGAIN,
			{
				text: 'The drugs on offer, one to a plate; a plate left alone. Clearance is a slope, not a snapshot.',
				tempo: 0.6,
				steps: [...press(row(2), 1), ...press(row(3), 1), read(all)]
			},
			SWAP(
				'fluor',
				'qpi',
				'The labelled amyloid everywhere first; then the cells beneath it, label-free, only where the first look flagged.'
			),
			LATER('And again, later. What clears keeps clearing, or it was a moment.')
		]
	};
	const GENERIC: Pass[] = [
		ONE,
		AGAIN,
		{
			text: 'The change at five strengths. A cause answers in proportion, or it is not one.',
			tempo: 0.7,
			steps: [...press(row(2), gradient), read(row(2))]
		},
		{
			text: 'A plate left alone, watched the same way. What differs is only what we changed.',
			tempo: 0.55,
			steps: [read(row(0))]
		},
		SWAP(
			'qpi',
			'fluor',
			'The cheap look everywhere; the costly look only where the cheap one flagged.'
		),
		LATER('And again, later. A cause holds over time, or it was a moment.')
	];
	const HOLD = 'This is how a cause is earned. Then it climbs back.';

	$: passes = (concern && PLANS[concern]) || GENERIC;

	// ---- state ----
	const tipX = tweened(wellCx(1, 2) + OFF, { duration: 500, easing: cubicInOut });
	const tipY = tweened(TIP_UP, { duration: 380, easing: cubicInOut });
	const obsX = tweened(wellCx(0, 0), { duration: 450, easing: cubicInOut });

	let pressed: Record<string, number> = {}; // well -> strength of the change
	let watched: Record<string, number> = {}; // well -> times read
	let beam = false;
	let head: Head = 'qpi';
	let docking = false;
	let heads: Head[] = ['qpi'];
	let hypoxic = false;
	let cycles = 0;
	let pass = -1; // index into passes; passes.length while holding
	let visible = false;

	$: caption = pass < 0 ? '' : pass < passes.length ? passes[pass].text : HOLD;
	$: nPressed = Object.keys(pressed).length;
	$: nRead = Object.values(watched).reduce((a, b) => a + b, 0);

	// ---- the runner: waits while off screen, loops while on, restarts when the concern changes ----
	let alive = true;
	let run = 0; // bumps to abandon a running plan
	let wake: (() => void) | null = null;
	const sleep = (ms: number) => new Promise<void>((r) => setTimeout(r, ms));
	const whenVisible = () => (visible ? Promise.resolve() : new Promise<void>((r) => (wake = r)));
	const key = ([i, w]: Well) => `${i}-${w}`;

	async function doStep(s: Step, tempo: number, id: number) {
		switch (s.kind) {
			case 'press': {
				const cx = wellCx(...s.at);
				await tipX.set(cx + OFF, { duration: 500 * tempo });
				await tipY.set(TIP_IN, { duration: 380 * tempo });
				if (id !== run) return;
				pressed = { ...pressed, [key(s.at)]: s.dose };
				await sleep(150 * tempo);
				await tipY.set(TIP_UP, { duration: 300 * tempo });
				return;
			}
			case 'read': {
				for (const w of s.wells) {
					await whenVisible();
					if (id !== run) return;
					await obsX.set(wellCx(...w), { duration: 450 * tempo });
					beam = true;
					watched = { ...watched, [key(w)]: (watched[key(w)] ?? 0) + 1 };
					await sleep(350 * tempo);
					beam = false;
				}
				return;
			}
			case 'cycle': {
				for (let e = 0; e < s.epochs; e++) {
					if (id !== run) return;
					hypoxic = true;
					await sleep(900 * tempo);
					hypoxic = false;
					cycles += 1;
					await sleep(700 * tempo);
				}
				return;
			}
			case 'swap': {
				if (s.head === head) return;
				await obsX.set(DOCK_X, { duration: 600 * tempo });
				docking = true;
				await sleep(500 * tempo);
				if (id !== run) return;
				head = s.head;
				if (!heads.includes(s.head)) heads = [...heads, s.head];
				await sleep(400 * tempo);
				docking = false;
				return;
			}
		}
	}

	async function play(id: number) {
		while (alive && id === run) {
			pressed = {};
			watched = {};
			cycles = 0;
			heads = ['qpi'];
			head = 'qpi';
			hypoxic = false;
			for (let p = 0; p < passes.length && alive && id === run; p++) {
				await whenVisible();
				if (id !== run) return;
				pass = p;
				await tick();
				await sleep(900);
				for (const s of passes[p].steps) {
					await whenVisible();
					if (id !== run) return;
					await doStep(s, passes[p].tempo, id);
				}
				await sleep(600);
			}
			if (!alive || id !== run) return;
			pass = passes.length;
			await sleep(7000);
		}
	}

	/** reduced motion: the finished state, no travel */
	function settle() {
		const done: Record<string, number> = {};
		const seen: Record<string, number> = {};
		for (const p of passes)
			for (const s of p.steps) {
				if (s.kind === 'press') done[key(s.at)] = s.dose;
				if (s.kind === 'read') for (const w of s.wells) seen[key(w)] = (seen[key(w)] ?? 0) + 1;
				if (s.kind === 'cycle') cycles = s.epochs;
				if (s.kind === 'swap' && !heads.includes(s.head)) heads = [...heads, s.head];
			}
		pressed = done;
		watched = seen;
		pass = passes.length;
	}

	let mounted = false;
	let reduced = false;
	// a new plan (the concern changed) abandons the running one and starts over
	$: if (mounted && passes) restart();
	function restart() {
		run += 1;
		pass = -1;
		if (reduced) settle();
		else play(run);
	}

	let root: HTMLElement;
	onMount(() => {
		reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
		const io = new IntersectionObserver(
			([e]) => {
				visible = e.isIntersecting;
				if (visible && wake) {
					const w = wake;
					wake = null;
					w();
				}
			},
			{ threshold: 0.35 }
		);
		io.observe(root);
		mounted = true;
		return () => {
			alive = false;
			run += 1;
			io.disconnect();
		};
	});
</script>

<div class="instrument-wrap" bind:this={root} data-pass={pass}>
	<svg
		viewBox="0 0 880 400"
		role="img"
		aria-labelledby="instrument-diagram-title"
		class="instrument"
	>
		<title id="instrument-diagram-title"
			>Section view of one Aevum row: pipette above a septum mat, four plate tiles under one shared
			headspace, the observer head in the dry bay below on the OT-2 deck. Wells are pressed, the
			headspace cycled, heads swapped, and wells read in turn.</title
		>

		<defs>
			<marker
				id="arr"
				viewBox="0 0 8 8"
				refX="7"
				refY="4"
				markerWidth="6"
				markerHeight="6"
				orient="auto"
			>
				<path d="M0,0 L8,4 L0,8 Z" fill="currentColor" />
			</marker>
			<radialGradient id="well-glow" cx="50%" cy="50%" r="50%">
				<stop offset="0%" stop-color="#f06078" stop-opacity="0.75" />
				<stop offset="100%" stop-color="#f06078" stop-opacity="0" />
			</radialGradient>
		</defs>

		<g class="deck">
			<rect x="60" y="352" width="760" height="10" />
			<text x="60" y="380" class="label">OT-2 deck · dry kinematic reference</text>
			{#if pass >= 0}
				<text x="820" y="380" class="label tally" text-anchor="end"
					>{nPressed} pressed{cycles ? ` · ${cycles} O₂ cycles` : ''} · {nRead} read · {heads.length}
					{heads.length === 1 ? 'head' : 'heads'}</text
				>
			{/if}
		</g>

		<g class="bay">
			<rect x="120" y="236" width="640" height="116" />
			<path d="M140,300 H740" class="corridor" />
			<text x="750" y="252" class="label" text-anchor="end">dry inverted bay · 80 mm</text>
			<!-- the dock plane: mechanical authority hands off to the gantry here -->
			<path d="M136,334 H760" class="dock" />
			<text x="750" y="346" class="label" text-anchor="end">dock plane · heads swap here</text>
		</g>

		<g class="observer" class:docking style:transform={`translateX(${$obsX - 368}px)`}>
			<rect x="342" y="288" width="52" height="40" rx="3" />
			<!-- the head: the swappable part -->
			<rect
				x="350"
				y="280"
				width="36"
				height="8"
				rx="1.5"
				class="head"
				style:fill={HEADS[head].color}
			/>
			<path d="M368,280 V246" />
			<circle cx="368" cy="244" r="4" />
			<path d="M368,244 V214" class="beam" class:on={beam} />
			<!-- named beside the stem, on whichever side has room; clear of the labels above and below -->
			<text
				x={$obsX > 440 ? 358 : 378}
				y="274"
				class="label"
				text-anchor={$obsX > 440 ? 'end' : 'start'}>observer · {HEADS[head].name}</text
			>
		</g>

		<g class="tiles">
			{#each [0, 1, 2, 3] as i (i)}
				{@const x = plateX(i)}
				<rect {x} y="214" width="135" height="22" class="support" />
				<rect x={x + 28} y="214" width="79" height="22" class="aperture" />
				<rect x={x + 8} y="184" width="119" height="30" class="plate" />
				<path d={`M${x + 12},213 H${x + 123}`} class="glass" />
				{#each [0, 1, 2, 3, 4] as w (w)}
					{@const k = `${i}-${w}`}
					<rect
						x={x + 22 + w * 19}
						y="190"
						width="12"
						height="21"
						class="well"
						class:read={watched[k]}
						style:--dose={pressed[k] ?? 0}
					/>
				{/each}
				<!-- fiducials on the plate-support frame: the world frame the observer re-finds -->
				<circle cx={x + 8} cy="236" r="3" class="fiducial" />
				<circle cx={x + 127} cy="236" r="3" class="fiducial" />
			{/each}
			{#each Object.entries(pressed) as [k, dose] (k)}
				{@const [i, w] = k.split('-').map(Number)}
				<circle
					cx={wellCx(i, w)}
					cy="201"
					r="22"
					fill="url(#well-glow)"
					class="glow"
					style:opacity={0.35 + dose * 0.65}
				/>
			{/each}
		</g>

		<g class="lid" class:hypoxic>
			<path d="M136,182 H760" class="mat" />
			<text x="762" y="186" class="label">septum mat</text>
			<rect x="120" y="120" width="640" height="62" rx="4" class="headspace" />
			<rect x="120" y="108" width="640" height="12" rx="3" class="cap" />
			<text x="440" y="158" class="label" text-anchor="middle"
				>shared headspace · CO₂ / RH{hypoxic ? ' · O₂ ↓' : ''} · one continuous volume</text
			>
			<path d="M70,150 H118" class="flow" marker-end="url(#arr)" />
			<path d="M762,150 H810" class="flow" marker-end="url(#arr)" />
			<text x="66" y="140" class="label">supply</text>
			<text x="812" y="140" class="label" text-anchor="end">return</text>
		</g>

		<!-- body, cone narrowing to the tip, and the tip itself: one part, moving together -->
		<g class="pipette" style:transform={`translate(${$tipX - 375}px, ${$tipY - TIP_UP}px)`}>
			<rect x="366" y="20" width="18" height="52" rx="2" />
			<path d="M366,72 L384,72 L375,92 Z" />
			<path d="M375,92 V108" class="tip" />
		</g>
		<!-- above the band the pipette travels in, so it is never covered -->
		<text x="60" y="14" class="label">P300 · through the septum, 1.5 mm off the imaging axis</text>
	</svg>

	<div class="method" aria-live="polite">
		{#if stake}
			<span class="asks"><span class="k">asks</span>“{stake}”</span>
		{/if}
		{#key caption}
			<span class="pass" in:fade={{ duration: 500 }}>{caption}</span>
		{/key}
	</div>
</div>

<style>
	.instrument-wrap {
		display: grid;
		gap: 1rem;
	}

	.instrument {
		display: block;
		width: 100%;
		min-width: 560px;
		height: auto;
		font-family: var(--font-mono);
		color: rgba(128, 255, 219, 0.9);
	}

	.label {
		font-size: 11px;
		fill: var(--ink-50);
	}

	.label.tally {
		fill: rgba(128, 255, 219, 0.75);
	}

	.deck rect {
		fill: var(--ink-12);
	}

	.bay rect {
		fill: rgba(76, 201, 240, 0.04);
		stroke: rgba(76, 201, 240, 0.35);
		stroke-dasharray: 4 4;
	}

	.corridor {
		stroke: rgba(76, 201, 240, 0.25);
		stroke-dasharray: 2 6;
	}

	.dock {
		stroke: var(--ink-30);
		stroke-dasharray: 1 5;
	}

	.observer rect {
		fill: rgba(76, 201, 240, 0.18);
		stroke: var(--aeon-primary);
	}

	.observer .head {
		stroke: none;
		transition: fill 400ms var(--ease-out);
	}

	.observer path {
		stroke: var(--aeon-primary);
		stroke-width: 1.5;
	}

	.observer .beam {
		stroke: var(--aeon-biolum);
		stroke-width: 2;
		stroke-dasharray: 2 3;
		opacity: 0;
		transition: opacity 120ms var(--ease-out);
	}

	.observer .beam.on {
		opacity: 1;
	}

	.observer circle {
		fill: var(--aeon-primary);
	}

	/* while a head is swapped: the observer sits on the dock plane and the beam is dark */
	.observer.docking > rect:first-of-type {
		stroke: var(--ink-50);
	}

	.observer.docking .head {
		animation: seat 900ms var(--ease-out);
	}

	@keyframes seat {
		0% {
			transform: translateY(6px);
			opacity: 0;
		}
		100% {
			transform: none;
			opacity: 1;
		}
	}

	.support {
		fill: rgba(128, 255, 219, 0.1);
		stroke: rgba(128, 255, 219, 0.5);
	}

	.aperture {
		fill: var(--aeon-deep-space);
	}

	.plate {
		fill: rgba(255, 255, 255, 0.05);
		stroke: var(--ink-50);
	}

	.glass {
		stroke: var(--aeon-biolum);
		stroke-width: 2;
	}

	/* a well: pressed fills warn by strength; read strokes biolum */
	.well {
		fill: rgb(240 96 120 / calc(var(--dose) * 0.55));
		stroke: var(--ink-30);
		transition:
			fill 400ms var(--ease-out),
			stroke 300ms var(--ease-out);
	}

	.well.read {
		stroke: var(--aeon-biolum);
	}

	/* a change blooms in its own well: scale about the circle's own centre, never the drawing's */
	.glow {
		transform-box: fill-box;
		transform-origin: center;
		animation: bloom 700ms var(--ease-out) both;
	}

	@keyframes bloom {
		from {
			transform: scale(0.3);
			opacity: 0;
		}
	}

	.fiducial {
		fill: var(--aeon-biolum);
	}

	.mat {
		stroke: var(--ink-50);
		stroke-width: 3;
		stroke-linecap: round;
	}

	.headspace {
		fill: rgba(128, 255, 219, 0.05);
		stroke: rgba(128, 255, 219, 0.4);
		transition:
			fill 700ms var(--ease-out),
			stroke 700ms var(--ease-out);
	}

	/* the row breathes less: the whole headspace, all four tiles at once */
	.lid.hypoxic .headspace {
		fill: rgba(76, 201, 240, 0.02);
		stroke: rgba(76, 201, 240, 0.25);
	}

	.lid.hypoxic .flow {
		stroke: rgba(76, 201, 240, 0.45);
		color: rgba(76, 201, 240, 0.45);
	}

	.cap {
		fill: var(--ink-12);
	}

	.flow {
		stroke: rgba(128, 255, 219, 0.7);
		stroke-width: 1.5;
		color: rgba(128, 255, 219, 0.7);
		transition:
			stroke 700ms var(--ease-out),
			color 700ms var(--ease-out);
	}

	.pipette rect,
	.pipette path {
		fill: var(--ink-70);
	}

	.pipette .tip {
		fill: none;
		stroke: var(--ink-70);
		stroke-width: 2;
		stroke-linecap: round;
	}

	/* ---------- the caption: the method, deepening ---------- */

	.method {
		display: grid;
		gap: 0.5rem;
		padding-top: 0.25rem;
		border-top: 1px solid var(--ink-12);
		min-height: 5.4rem;
	}

	.asks {
		font-family: var(--font-mono);
		font-size: 0.74rem;
		line-height: 1.7;
		color: var(--ink-50);
		font-style: italic;
	}

	.k {
		font-style: normal;
		letter-spacing: 0.12em;
		text-transform: uppercase;
		color: var(--aeon-biolum);
		margin-right: 0.6rem;
	}

	.pass {
		font-family: var(--font-display);
		font-size: clamp(1.15rem, 2vw, 1.4rem);
		line-height: 1.3;
		color: var(--ink-100);
		max-width: 48ch;
	}

	@media (prefers-reduced-motion: reduce) {
		.well,
		.observer .beam,
		.observer .head,
		.headspace,
		.flow {
			transition: none;
		}
		.glow,
		.observer.docking .head {
			animation: none;
		}
	}
</style>
