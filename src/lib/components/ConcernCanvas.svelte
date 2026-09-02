<!--
  The canvas. Full width, no sticky, no step cards. The dialogue is the
  interface: what's said ties to a term; what's brought ties to a holding.
  The system level draws what INDRA ties the terms to; the molecule layer
  unfolds only when data that can see it arrives. One ledger recurs at each
  depth and racks into focus.

  Data: scripts/pregenerate_concerns.py → concerns.json. Dialogue: journeys.ts.
-->
<script lang="ts">
	import { onMount } from 'svelte';
	import { tweened } from 'svelte/motion';
	import { cubicOut } from 'svelte/easing';
	import concerns from '$lib/data/concerns.json';
	import { journeys, type Holding, type Depth, type Message, type Step } from '$lib/data/journeys';
	import { culmination } from '$lib/data/culmination';
	import { implications as geneImplications, glyphOf } from '$lib/data/implications';
	import { stake } from '$lib/stores/stake';
	import { attention } from '$lib/stores/attention';
	import AttractorPlane from '$lib/components/diagrams/AttractorPlane.svelte';
	import ModelGraph, { type MDepth } from '$lib/components/diagrams/ModelGraph.svelte';

	type Level = 'body' | 'pathway' | 'molecule';
	interface Node {
		id: string;
		label: string;
		level: Level;
		said?: string;
		url?: string;
		hits?: number;
		observable: Partial<Record<Holding, boolean | string | null>>;
		interventions?: { count: number; sample: string[] };
	}
	interface Edge {
		source: string;
		target: string;
	}
	interface Stmt extends Edge {
		type: string;
		belief: number;
		evidence: number;
		hash: number;
	}
	interface CNode {
		id: string;
		label: string;
		level: number;
		said: boolean;
	}
	interface Factor {
		source: string;
		target: string;
		type: 'Activation' | 'Inhibition';
		belief: number;
	}
	interface Concern {
		id: string;
		said: string;
		causal: { nodes: CNode[]; edges: Factor[] };
		model: { depths: MDepth[] };
		counts: { genes: number; shown: number; statements: number };
		nodes: Node[];
		membership: Edge[];
		statements: Stmt[];
		generated: string;
	}

	const data = concerns as Concern[];

	let index = 0;
	/** the glyph that cycles to another concern — hidden for now, one narrative only */
	const SHOW_REFRESH = false;
	let seenDialogue = -1; // furthest dialogue exchange revealed
	let seenDeeper = -1; // furthest deeper exchange revealed
	let systemSeen = false;
	let dishSeen = false;
	let narrow = false;

	$: concern = data[index];
	$: journey = journeys[concern.id];
	$: byId = Object.fromEntries(concern.nodes.map((n) => [n.id, n]));
	$: bodyNodes = concern.nodes.filter((n) => n.level === 'body');
	$: pathwayNodes = concern.nodes.filter((n) => n.level === 'pathway');

	/** the agent's final turn of the dialogue is delivered after the system level */
	$: lastAgent = journey.dialogue.length - 1;
	/** which pass of the model a brought holding opens */
	function passOf(brings: Holding[]) {
		if (brings.includes('genome') || brings.includes('methylation')) return 3;
		if (brings.includes('blood')) return 2;
		if (brings.includes('wearable')) return 1;
		return 0;
	}
	// the strand behind the dialogue takes its form from where data lands on the page,
	// and brightens where the term the reader is attending to entered the conversation
	let dialogueEls: HTMLElement[] = [];
	let deeperEls: HTMLElement[] = [];
	let stakeEl: HTMLElement | null = null;
	/** every exchange, so the strand can tell where the page grows when a frame opens between them */
	$: anchors = [...dialogueEls, ...deeperEls, stakeEl].filter((el): el is HTMLElement => !!el);
	$: landings = journey.deeper
		.map((m, i) => ({ m, i }))
		.filter(({ m }) => m.brings?.length)
		.map(({ m, i }) => ({ el: deeperEls[i], phase: passOf(m.brings ?? []), seen: i <= seenDeeper }))
		.filter((l) => !!l.el);
	$: spot = (() => {
		const a = $attention;
		if (!a || a.kind !== 'term') return null;
		const i = journey.dialogue.findIndex(
			(m) => m.grounds?.some((g) => g.id === a.id) || m.lands?.some((l) => l.id === a.id)
		);
		return i >= 0 ? (dialogueEls[i] ?? null) : null;
	})();
	$: indexed = Object.fromEntries(bodyNodes.map((n) => [n.id, n.interventions?.count ?? 0]));
	$: treatments = Object.fromEntries(
		bodyNodes
			.filter((n) => n.interventions?.sample?.length)
			.map((n) => [n.id, n.interventions?.sample ?? []])
	);
	/** where each term entered the conversation — the person's own words */
	$: provenance = (() => {
		const saidOf: Record<string, string> = {};
		const out: Record<string, string> = {};
		for (const m of journey.dialogue)
			for (const g of m.grounds ?? []) {
				saidOf[g.id] = g.said;
				out[g.id] = `you said “${g.said}”`;
			}
		for (const m of journey.dialogue)
			for (const l of m.lands ?? [])
				if (!out[l.id])
					out[l.id] = saidOf[l.from] ? `raised by “${saidOf[l.from]}”` : 'raised by the record';
		return out;
	})();

	const geneCount = tweened(0, { duration: 1100, easing: cubicOut });
	$: geneCount.set(systemSeen ? concern.counts.genes : 0);

	// term → pathway via shared genes: "term|pathway" -> shared gene count
	$: termPathways = (() => {
		const geneTerms: Record<string, string[]> = {};
		const genePathways: Record<string, string[]> = {};
		for (const e of concern.membership) {
			const t = byId[e.target];
			if (!t) continue;
			const bucket = t.level === 'body' ? geneTerms : genePathways;
			(bucket[e.source] ??= []).push(e.target);
		}
		const out: Record<string, number> = {};
		for (const g of Object.keys(geneTerms)) {
			for (const t of geneTerms[g])
				for (const pw of genePathways[g] ?? []) {
					const k = `${t}|${pw}`;
					out[k] = (out[k] ?? 0) + 1;
				}
		}
		return out;
	})();

	// ---- reveal-on-scroll for exchanges ----
	function seen(node: HTMLElement, cb: () => void) {
		if (typeof window === 'undefined') return;
		const io = new IntersectionObserver(
			([e]) => {
				if (e.isIntersecting) {
					cb();
					io.disconnect();
				}
			},
			{ rootMargin: '0px 0px -28% 0px' }
		);
		io.observe(node);
		return { destroy: () => io.disconnect() };
	}

	let topEl: HTMLElement;
	function refresh() {
		index = (index + 1) % data.length;
		seenDialogue = -1;
		seenDeeper = -1;
		systemSeen = false;
		dishSeen = false;
		stake.set(null);
		topEl?.scrollIntoView({ block: 'start', behavior: 'smooth' });
	}

	onMount(() => {
		const mq = window.matchMedia('(max-width: 720px)');
		const set = () => (narrow = mq.matches);
		set();
		mq.addEventListener('change', set);
		return () => mq.removeEventListener('change', set);
	});

	$: L = Object.fromEntries(journey.ledgers.map((l) => [l.depth, l])) as Record<
		Depth,
		(typeof journey.ledgers)[number]
	>;

	/** the dish ledger's one line: the question the dialogue stakes on cells */
	$: dishItem = L.dish?.items?.[0];
	function stakeDish() {
		dishSeen = true;
		if (dishItem) stake.set({ concern: concern.id, question: dishItem.do, edge: dishItem.edge });
	}

	const holdingName: Record<Holding, string> = {
		words: 'words',
		wearable: 'wearable',
		blood: 'blood panel',
		methylation: 'methylation clock',
		genome: 'genome'
	};
</script>

<div class="canvas">
	<AttractorPlane {landings} {spot} {anchors} />
	{#snippet turn(m: Message, i: number, offers: Step[] = [])}
		<div
			class="exchange"
			class:seen={i <= seenDialogue}
			use:seen={() => (seenDialogue = Math.max(seenDialogue, i))}
			bind:this={dialogueEls[i]}
		>
			<div class="msg {m.who}">
				<span class="who">{m.who === 'you' ? 'you' : 'agent'}</span>
				<span class="text"
					>{m.text}{#if i === 0 && SHOW_REFRESH}
						<button
							class="refresh"
							on:click={refresh}
							aria-label="Another concern"
							title="Another concern"
						>
							<svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true">
								<path
									d="M20 12a8 8 0 1 1-2.34-5.66"
									fill="none"
									stroke="currentColor"
									stroke-width="1.6"
									stroke-linecap="round"
								/>
								<path
									d="M20 4v5h-5"
									fill="none"
									stroke="currentColor"
									stroke-width="1.6"
									stroke-linecap="round"
									stroke-linejoin="round"
								/>
							</svg>
						</button>
					{/if}</span
				>
			</div>
			{#if m.grounds?.length || m.ungrounded?.length || m.lands?.length || offers.length}
				<div class="gloss">
					{#each m.grounds ?? [] as gr, k (gr.id)}
						<span class="tie" style:--k={k}>
							<i></i>
							<span class="gl">{gr.label}</span>
						</span>
					{/each}
					{#each m.ungrounded ?? [] as u, k (u)}
						<span class="tie none" style:--k={(m.grounds?.length ?? 0) + k}>
							<i></i>
							<span class="gl">“{u}”</span>
						</span>
					{/each}
					{#each m.lands ?? [] as l, k (l.from + l.id + l.dir + l.type)}
						<span
							class="tie land"
							class:weak={l.belief < 0.5}
							style:--k={(m.grounds?.length ?? 0) + (m.ungrounded?.length ?? 0) + k}
							style:--w={0.6 + l.belief * 1.8}
							style:--a={0.35 + l.belief * 0.9}
						>
							<i></i>
							<span class="gl">{l.label}</span>
						</span>
					{/each}
					{#each offers as it, k (it.do)}
						{@const t = culmination[concern.id]?.[it.do]}
						<span
							class="tie offer"
							class:probe={!!t?.probes?.length}
							style:--k={(m.grounds?.length ?? 0) +
								(m.ungrounded?.length ?? 0) +
								(m.lands?.length ?? 0) +
								k}
						>
							<i></i>
							<span class="gl">{it.do}</span>
						</span>
					{/each}
				</div>
			{/if}
		</div>
	{/snippet}

	<!-- ============ the dialogue: up to the person's last answer ============ -->
	<section class="dialogue" bind:this={topEl}>
		{#each journey.dialogue.slice(0, lastAgent) as m, i (concern.id + i)}
			{@render turn(m, i)}
		{/each}
	</section>

	<!-- ============ the model: one drawing, redrawn in place each time data changes it ============ -->
	<!-- keyed by concern so the one-shot reveal observers re-arm when the journey cycles -->
	{#key concern.id}
		<section class="model" use:seen={() => (systemSeen = true)} class:seen={systemSeen}>
			{#if systemSeen}
				<div class="frame">
					<ModelGraph
						depths={concern.model.depths}
						at={0}
						pathways={pathwayNodes.map((n) => ({ id: n.id, label: n.label }))}
						{termPathways}
						{narrow}
						geneCount={Math.round($geneCount)}
						{indexed}
						implications={geneImplications[concern.id] ?? []}
						{treatments}
						{provenance}
					/>
				</div>
			{/if}

			<!-- the agent's answer, its offers glossed like everything else it says -->
			<section class="dialogue answer">
				{#if journey.dialogue[lastAgent]}
					{@render turn(journey.dialogue[lastAgent], lastAgent, L.system.items)}
				{/if}
			</section>

			<!-- deeper: data brought → the same drawing, changed → the lines → the reply -->
			<section class="deeper">
				{#each journey.deeper as m, i (concern.id + 'd' + i)}
					{#if m.who === 'agent'}
						{@const pass = passOf(journey.deeper[i - 1]?.brings ?? [])}
						{#if pass > 0 && i - 1 <= seenDeeper}
							<div class="frame">
								<ModelGraph
									depths={concern.model.depths}
									at={pass}
									pathways={pathwayNodes.map((n) => ({ id: n.id, label: n.label }))}
									{termPathways}
									{narrow}
									geneCount={Math.round($geneCount)}
									{indexed}
									implications={geneImplications[concern.id] ?? []}
									{treatments}
									{provenance}
								/>
							</div>
						{/if}
					{/if}

					<div
						class="exchange"
						class:seen={i <= seenDeeper}
						use:seen={() => (seenDeeper = Math.max(seenDeeper, i))}
						bind:this={deeperEls[i]}
					>
						<div class="msg {m.who}">
							<span class="who">{m.who === 'you' ? 'you' : 'agent'}</span>
							<span class="text">{m.text}</span>
						</div>
						{#if m.brings?.length}
							<div class="gloss">
								{#each m.brings as b, k (b)}
									<span class="tie brought" style:--k={k}>
										<i></i>
										<span class="gl">{holdingName[b]}</span>
									</span>
								{/each}
							</div>
						{/if}
					</div>
				{/each}
			</section>

			<!-- the stake: the model collapses to the one branch worth touching, and hands it down -->
			{#if dishItem}
				{#if concern.model.depths.length > 4 && seenDeeper >= journey.deeper.length - 1}
					<div class="frame">
						<ModelGraph
							depths={concern.model.depths}
							at={4}
							pathways={pathwayNodes.map((n) => ({ id: n.id, label: n.label }))}
							{termPathways}
							{narrow}
							geneCount={Math.round($geneCount)}
							{indexed}
							implications={geneImplications[concern.id] ?? []}
							{treatments}
							{provenance}
						/>
					</div>
				{/if}
				<section class="dialogue stake-line">
					<div class="exchange" class:seen={dishSeen} use:seen={stakeDish} bind:this={stakeEl}>
						<div class="msg stake">
							<span class="who">the dish</span>
							<span class="text">{dishItem.do}</span>
						</div>
						<div class="gloss">
							<span class="tie dish" style:--k={0}>
								<i class="press"></i>
								<i class="watch"></i>
								<span class="gl"
									>{dishItem.edge
										? `${dishItem.edge.source} ${glyphOf[dishItem.edge.type]} ${dishItem.edge.target}`
										: 'unearned'}</span
								>
							</span>
							{#if dishItem.edge}
								<span class="m"
									>belief {dishItem.edge.belief.toFixed(2)} · {dishItem.edge.evidence} papers · borrowed</span
								>
							{/if}
						</div>
					</div>
				</section>
			{/if}
		</section>
	{/key}
</div>

<style>
	.canvas {
		position: relative;
		width: 100%;
		isolation: isolate;
	}

	.dialogue,
	.model {
		position: relative;
		z-index: 1;
	}

	.k {
		font-family: var(--font-mono);
		font-size: 0.66rem;
		letter-spacing: 0.12em;
		text-transform: uppercase;
		color: var(--aeon-biolum);
	}

	.m {
		font-family: var(--font-mono);
		font-size: 0.72rem;
		color: var(--ink-50);
	}

	/* another concern, offered beside the person's opening words */
	.refresh {
		width: 30px;
		height: 30px;
		border-radius: 50%;
		border: 1px solid var(--ink-12);
		background: transparent;
		color: var(--ink-50);
		display: inline-grid;
		place-items: center;
		vertical-align: middle;
		margin-left: 0.7rem;
		cursor: pointer;
		transition:
			color var(--t-move) var(--ease-out),
			border-color var(--t-move) var(--ease-out),
			transform 520ms cubic-bezier(0.34, 1.56, 0.64, 1);
	}

	.refresh:hover,
	.refresh:focus-visible {
		color: var(--aeon-biolum);
		border-color: var(--aeon-biolum);
		transform: rotate(180deg);
		outline: none;
	}

	.frame {
		margin: 0 0 1.5rem;
		opacity: 0;
		transform: translateY(14px);
		animation: settle 900ms var(--ease-out) forwards;
	}

	@keyframes settle {
		to {
			opacity: 1;
			transform: none;
		}
	}

	.dialogue.answer {
		padding-top: 0;
	}

	.dialogue,
	.deeper {
		display: grid;
		gap: 3.5rem;
		padding: 4rem 0;
		max-width: 64rem;
	}

	.exchange {
		display: grid;
		grid-template-columns: minmax(0, 1.2fr) minmax(0, 1fr);
		gap: 1.5rem 3rem;
		align-items: start;
		opacity: 0;
		transform: translateY(18px);
		transition:
			opacity 720ms var(--ease-out),
			transform 720ms var(--ease-out);
	}

	.exchange.seen {
		opacity: 1;
		transform: none;
	}

	.msg {
		display: grid;
		gap: 0.35rem;
	}

	.msg .who {
		font-family: var(--font-mono);
		font-size: 0.64rem;
		letter-spacing: 0.14em;
		text-transform: uppercase;
		color: var(--ink-30);
	}

	.msg.agent .who {
		color: var(--aeon-biolum);
	}

	.msg .text {
		font-family: var(--font-display);
		font-size: clamp(1.35rem, 2.4vw, 1.9rem);
		line-height: 1.18;
		letter-spacing: -0.01em;
		color: var(--ink-100);
		max-width: 26ch;
	}

	.msg.agent .text {
		font-style: italic;
		color: var(--ink-70);
	}

	/* what's said ties to a term; what's brought ties to a holding. same grammar as the edges. */
	.gloss {
		display: grid;
		gap: 0.9rem;
		padding-top: 0.55rem;
	}

	.tie {
		display: grid;
		grid-template-columns: 2.4rem 1fr;
		column-gap: 0.7rem;
		align-items: baseline;
	}

	.tie i {
		grid-row: 1;
		align-self: center;
		height: 1px;
		background: var(--aeon-primary);
		transform: scaleX(0);
		transform-origin: left;
	}

	.tie .gl {
		grid-column: 2;
		font-family: var(--font-display);
		font-size: 1.2rem;
		line-height: 1.1;
		color: var(--ink-100);
		opacity: 0;
		transform: translateX(-6px);
	}

	.exchange.seen .tie i {
		animation: tie 560ms var(--ease-out) forwards;
		animation-delay: calc(300ms + var(--k) * 140ms);
	}

	.exchange.seen .tie .gl {
		animation: gloss 560ms var(--ease-out) forwards;
		animation-delay: calc(560ms + var(--k) * 140ms);
	}

	@keyframes tie {
		to {
			transform: scaleX(1);
		}
	}

	@keyframes gloss {
		to {
			opacity: 1;
			transform: none;
		}
	}

	.tie {
		cursor: default;
	}

	.tie i,
	.tie .gl {
		transition:
			background var(--t-snap) var(--ease-out),
			color var(--t-snap) var(--ease-out),
			text-shadow var(--t-snap) var(--ease-out);
	}

	/* what grounds to nothing: a broken tie */
	.tie.none i {
		background: none;
		border-top: 1px dashed var(--ink-30);
	}

	.tie.none .gl {
		color: var(--ink-50);
		font-style: italic;
	}

	/* what the record raised, landing later: weight is evidence, presence is belief */
	.tie.land i {
		height: calc(var(--w) * 1px);
		background: var(--aeon-biolum);
		opacity: var(--a);
	}

	.tie.land .gl {
		opacity: var(--a);
	}

	.tie.land.weak .gl {
		color: var(--ink-70);
	}

	.exchange.seen .tie.land i {
		animation-delay: calc(900ms + var(--k) * 140ms);
	}

	.exchange.seen .tie.land .gl {
		animation-delay: calc(1160ms + var(--k) * 140ms);
	}

	/* the agent's offers: interventions press (warn), tests would observe (dashed biolum) */
	.tie.offer i {
		background: var(--aeon-warn);
		opacity: 0.75;
	}

	.tie.offer.probe i {
		background: none;
		border-top: 1px dashed var(--aeon-biolum);
	}

	.tie.offer .gl {
		color: var(--ink-100);
	}

	.tie.offer:hover .gl {
		color: var(--aeon-biolum);
	}

	.tie.brought i {
		background: var(--aeon-biolum);
	}

	.tie.brought .gl {
		color: var(--aeon-biolum);
	}

	/* the stake: pressed and watched at once — the offer's rule over the probe's */
	.msg.stake .who {
		color: var(--aeon-warn);
	}

	.tie.dish i {
		grid-column: 1;
		grid-row: 1;
		position: relative;
	}

	.tie.dish i.press {
		background: var(--aeon-warn);
		top: -2.5px;
		opacity: 0.85;
	}

	.tie.dish i.watch {
		background: none;
		border-top: 1px dashed var(--aeon-biolum);
		top: 2.5px;
	}

	.exchange.seen .tie.dish i.watch {
		animation-delay: calc(520ms + var(--k) * 140ms);
	}

	.stake-line {
		padding: 1.5rem 0 3.5rem;
	}

	/* ============ the model ============ */

	.model {
		padding: 3rem 0 2rem;
	}

	@media (max-width: 720px) {
		.exchange {
			grid-template-columns: 1fr;
		}
		.molecule svg {
			min-width: 900px;
		}
		.molecule {
			overflow-x: auto;
		}
	}

	@media (prefers-reduced-motion: reduce) {
		.exchange.seen .tie i,
		.exchange.seen .tie .gl,
		.system.seen .tnode,
		.system.seen .pnode,
		.molecule.open .mterm,
		.system.seen .sysedges path,
		.system.seen .factors path,
		.molecule.open .members path,
		.molecule.open .pop {
			animation: none;
			opacity: 1;
			transform: none;
			stroke-dashoffset: 0;
		}
		.exchange,
		.molecule,
		.refresh {
			transition: none;
		}
	}
</style>
