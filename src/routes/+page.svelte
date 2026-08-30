<script lang="ts">
	import GridSystem from '$lib/components/GridSystem.svelte';
	import ScrollDrivenParticleField from '$lib/components/ScrollDrivenParticleField.svelte';
	import EnergyFlow from '$lib/components/EnergyFlow.svelte';
	import MolecularContainer from '$lib/components/MolecularContainer.svelte';
	import ViewportGradient from '$lib/components/ViewportGradient.svelte';
	import Modal from '$lib/components/ui/Modal.svelte';
	import PartnershipInquiry from '$lib/components/forms/PartnershipInquiry.svelte';
	import EmailCapture from '$lib/components/forms/EmailCapture.svelte';
	import ConcernCanvas from '$lib/components/ConcernCanvas.svelte';
	import InstrumentSection from '$lib/components/diagrams/InstrumentSection.svelte';
	import AeonLogo from '$lib/images/AeonLogo.svelte';
	import { reveal } from '$lib/actions/reveal';
	import { progress } from '$lib/actions/progress';
	import { interactionState } from '$lib/stores/interaction';
	import { stake } from '$lib/stores/stake';
	import { glyphOf } from '$lib/data/implications';
	import { onMount } from 'svelte';
	import { fade } from 'svelte/transition';
	import { Linkedin, Github, ArrowDown } from 'lucide-svelte';

	const HARNESS_REPO = 'https://github.com/Aeon-Bio/ot2-harness';
	const AEVUM_REPO = 'https://github.com/Aeon-Bio/aevum';

	function handleContainerHover(event: CustomEvent) {
		interactionState.update((s) => ({
			...s,
			hoveredElement: event.detail.element,
			systemActivity: 0.8
		}));
	}

	function handleContainerLeave() {
		interactionState.update((s) => ({ ...s, hoveredElement: null, systemActivity: 0 }));
	}

	let isResizing = false;
	let resizeTimer: ReturnType<typeof setTimeout>;
	let shouldRenderParticles = true;

	function handleResize() {
		if (isResizing) return;
		isResizing = true;
		shouldRenderParticles = false;
		clearTimeout(resizeTimer);
		resizeTimer = setTimeout(() => {
			shouldRenderParticles = true;
			isResizing = false;
		}, 500);
	}

	let showContact = false;
	let showUpdates = false;

	let dishProgress = 0;

	onMount(() => {
		window.addEventListener('resize', handleResize);
		return () => {
			window.removeEventListener('resize', handleResize);
		};
	});
</script>

<div class="background-layer" aria-hidden="true">
	<GridSystem />
	{#if shouldRenderParticles}
		<div transition:fade={{ duration: 300 }}>
			<ScrollDrivenParticleField />
		</div>
	{/if}
	<EnergyFlow />
	<ViewportGradient />
</div>

<!-- 00 · person -->
<section id="hero-section" class="hero" aria-labelledby="hero-heading">
	<div class="container-wrapper">
		<MolecularContainer on:hover={handleContainerHover} on:leave={handleContainerLeave}>
			<div class="logo-container" role="img" aria-label="Aeon Bio">
				<AeonLogo />
			</div>
			<h1 id="hero-heading">
				Building the information layer of health through biomolecular causality
			</h1>
			<p class="tagline">We are biology, studying itself.</p>
			<div class="cta-group" role="group" aria-label="Main actions">
				<a class="cta-primary" href="#speak-section">
					<span>Descend</span>
					<ArrowDown size={16} strokeWidth={2} aria-hidden="true" />
				</a>
				<a class="cta-secondary" href={HARNESS_REPO} target="_blank" rel="noopener noreferrer">
					<Github size={16} strokeWidth={1.8} aria-hidden="true" />
					<span>Source</span>
				</a>
			</div>
		</MolecularContainer>
	</div>
</section>

<!-- 01 · words -->
<section
	id="speak-section"
	class="level canvas-level"
	aria-label="Say what’s wrong. Watch it resolve."
>
	<div class="content wide">
		<ConcernCanvas />
	</div>
</section>

<!-- 02 · dish -->
<section id="dish-section" class="level" aria-labelledby="dish-heading">
	<div class="content">
		{#if $stake}
			<p class="chain stake" aria-label="What the dialogue stakes on the dish" transition:fade>
				<span class="q">“{$stake.question}”</span>
				{#if $stake.edge}
					<span>{$stake.edge.source} {glyphOf[$stake.edge.type]} {$stake.edge.target}</span>
					<span
						>belief {$stake.edge.belief.toFixed(2)} · {$stake.edge.evidence} papers · borrowed</span
					>
				{/if}
				<span class="arrow">↓</span>
				<span>this plate</span>
			</p>
		{/if}
		<h2 id="dish-heading" use:reveal={{ delay: 60 }}>
			A cause is earned on living cells. <em>Change something. Watch.</em>
		</h2>
		<figure class="diagram" use:reveal={{ delay: 140 }} use:progress={(p) => (dishProgress = p)}>
			<InstrumentSection progress={dishProgress} stake={$stake?.question ?? null} />
		</figure>
		<dl class="facts" use:reveal>
			<div>
				<dt>registered</dt>
				<dd>
					each glass-bottom plate seats on its own datums; contact on the frame, never the glass
				</dd>
			</div>
			<div>
				<dt>incubated</dt>
				<dd>four plates share one CO₂/RH domain, fed as a slow sheet, sensed at the return</dd>
			</div>
			<div>
				<dt>observed</dt>
				<dd>a moving head in the dry bay beneath; imaging first, Raman budgeted</dd>
			</div>
			<div>
				<dt>generated</dt>
				<dd>CAD, labware, and protocols from one parameter set, checksummed before motion</dd>
			</div>
		</dl>
		<p class="status" use:reveal>
			<span class="k">now</span> first fixture commissioned on an OT-2 · one-row coupon in revision
			· CERN-OHL-S-2.0
			<a href={AEVUM_REPO} target="_blank" rel="noopener noreferrer">Aeon-Bio/aevum</a>
		</p>
	</div>
</section>

<!-- 03 · return -->
<section id="return-section" class="level" aria-labelledby="return-heading">
	<div class="content">
		<h2 id="return-heading" use:reveal={{ delay: 60 }}>
			What the dish earns climbs the same thread, <em>back to the one who asked.</em>
		</h2>
		<p use:reveal={{ delay: 100 }}>
			Belief goes down borrowed; it comes back watched. The next person to touch the same edge
			stands on what the dish saw.
		</p>
		<p class="lede" use:reveal={{ delay: 140 }}>
			Cure is the thread applied to a disease. Agelessness is the thread applied over time.
		</p>

		<div class="people" use:reveal>
			<div class="person">
				<div class="person-head">
					<h3>Eric Jing Mockler</h3>
					<span class="links">
						<a
							href="https://www.linkedin.com/in/ejmockler/"
							target="_blank"
							rel="noopener noreferrer"
							aria-label="Eric Jing Mockler on LinkedIn"><Linkedin size={16} strokeWidth={1.8} /></a
						>
						<a
							href="https://github.com/ejmockler"
							target="_blank"
							rel="noopener noreferrer"
							aria-label="Eric Jing Mockler on GitHub"><Github size={16} strokeWidth={1.8} /></a
						>
					</span>
				</div>
				<p class="role">CEO · cofounder</p>
				<p>
					Bioengineering, cognitive science, neuroscience at UC Santa Cruz. Genomic pipelines over
					10,000+ genomes at Gladstone and AnswerALS. Designs the instrument and the gate.
				</p>
			</div>
			<div class="person">
				<div class="person-head">
					<h3>Karen Sachs, PhD</h3>
					<span class="links">
						<a
							href="https://www.linkedin.com/in/karen-sachs-b174313/"
							target="_blank"
							rel="noopener noreferrer"
							aria-label="Karen Sachs on LinkedIn"><Linkedin size={16} strokeWidth={1.8} /></a
						>
					</span>
				</div>
				<p class="role">CSO/CTO · cofounder</p>
				<p>
					MIT PhD, biological engineering. Stanford Medicine postdoc. Causal networks from
					single-cell perturbation data; Science Breakthrough of the Year runner-up. 60+ papers.
				</p>
			</div>
		</div>

		<div class="contact" use:reveal>
			<p>If you run a wet lab, or hold perturbation data, write.</p>
			<div class="cta-group left">
				<button class="cta-primary" on:click={() => (showContact = true)}>Write to us</button>
				<button class="cta-secondary" on:click={() => (showUpdates = true)}>Follow</button>
			</div>
		</div>
	</div>
</section>

<Modal bind:isOpen={showContact} title="Write to us" maxWidth="600px">
	<PartnershipInquiry
		on:submit={() => (showContact = false)}
		on:close={() => (showContact = false)}
	/>
</Modal>

<Modal bind:isOpen={showUpdates} title="Follow" maxWidth="500px">
	<EmailCapture on:submit={() => (showUpdates = false)} on:close={() => (showUpdates = false)} />
</Modal>

<style>
	.background-layer {
		position: fixed;
		inset: 0;
		z-index: -1;
	}

	/* ---------- reveal (owned by use:reveal) ---------- */

	:global([data-reveal]) {
		opacity: 0;
		transform: translateY(14px);
		transition:
			opacity var(--t-settle) var(--ease-out),
			transform var(--t-settle) var(--ease-out);
		transition-delay: var(--reveal-delay, 0ms);
	}

	:global([data-reveal][data-revealed]) {
		opacity: 1;
		transform: none;
	}

	@media (prefers-reduced-motion: reduce) {
		:global([data-reveal]) {
			opacity: 1;
			transform: none;
			transition: none;
		}
	}

	/* ---------- hero ---------- */

	.hero {
		min-height: 100vh;
		display: grid;
		place-items: center;
	}

	.container-wrapper {
		width: min(90vw, 800px);
		height: min(90vh, 800px);
		display: grid;
		place-items: center;
	}

	.logo-container {
		width: min(30vw, 300px);
		height: min(30vw, 300px);
		display: flex;
		align-items: center;
		justify-content: center;
		margin: -0.5rem auto 1.25rem;
	}

	:global(.logo-container svg) {
		width: 100%;
		height: 100%;
		filter: drop-shadow(0 10px 32px rgba(76, 201, 240, 0.2));
	}

	h1 {
		font-family: var(--font-display);
		font-size: clamp(1.9rem, 4.6vw, 3.3rem);
		line-height: 1.08;
		letter-spacing: -0.012em;
		margin: 0 auto 1rem;
		max-width: 22ch;
		text-align: center;
		background: linear-gradient(
			135deg,
			var(--ink-100) 0%,
			rgba(128, 255, 219, 0.9) 60%,
			rgba(76, 201, 240, 0.92) 100%
		);
		-webkit-background-clip: text;
		background-clip: text;
		color: transparent;
	}

	.tagline {
		font-family: var(--font-display);
		font-style: italic;
		font-size: clamp(1.1rem, 2.4vw, 1.45rem);
		color: var(--ink-70);
		text-align: center;
		margin: 0 auto 2.5rem;
	}

	/* ---------- CTAs ---------- */

	.cta-group {
		display: flex;
		gap: 0.75rem;
		justify-content: center;
		flex-wrap: wrap;
	}

	.cta-group.left {
		justify-content: flex-start;
	}

	.cta-primary,
	.cta-secondary {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		gap: 0.5rem;
		min-height: 44px;
		padding: 0.65rem 1.3rem;
		border-radius: 2px;
		font-family: var(--font-mono);
		font-size: 0.8rem;
		letter-spacing: 0.08em;
		text-transform: uppercase;
		cursor: pointer;
		border: 1px solid transparent;
		min-width: 8.5rem;
		transition:
			background-color var(--t-snap) var(--ease-out),
			border-color var(--t-snap) var(--ease-out),
			color var(--t-snap) var(--ease-out),
			transform var(--t-snap) var(--ease-out);
	}

	.cta-primary {
		background: var(--aeon-biolum);
		color: var(--aeon-deep-space);
	}

	.cta-primary:hover,
	.cta-primary:focus-visible {
		background: #a3ffe6;
	}

	.cta-primary:active {
		transform: translateY(1px);
	}

	.cta-secondary {
		background: transparent;
		color: var(--ink-70);
		border-color: var(--ink-30);
	}

	.cta-secondary:hover,
	.cta-secondary:focus-visible {
		border-color: var(--aeon-biolum);
		color: var(--ink-100);
	}

	.cta-primary:focus-visible,
	.cta-secondary:focus-visible {
		outline: 1px solid var(--aeon-biolum);
		outline-offset: 3px;
	}

	/* ---------- levels ---------- */

	.level {
		padding: clamp(5rem, 12vh, 9rem) 2rem;
		background: rgba(26, 27, 47, 0.84);
		backdrop-filter: blur(10px);
		border-top: 1px solid var(--ink-12);
		scroll-margin-top: 0;
	}

	.content {
		max-width: 60rem;
		margin: 0 auto;
	}

	.content.wide {
		max-width: 78rem;
	}

	.canvas-level {
		padding-top: 0;
	}

	@media (min-width: 901px) {
		.content.wide {
			padding-left: 6rem;
		}
	}

	.level h2 {
		font-family: var(--font-display);
		font-size: clamp(1.9rem, 4vw, 3rem);
		line-height: 1.08;
		letter-spacing: -0.012em;
		color: var(--ink-100);
		margin: 0 0 2.5rem;
		max-width: 30ch;
	}

	.level h2 em {
		font-style: italic;
		color: var(--ink-50);
	}

	.level p {
		font-size: 1.12rem;
		line-height: 1.6;
		color: var(--ink-70);
		max-width: 58ch;
		margin: 0 0 1rem;
		font-variation-settings: 'opsz' 18;
	}

	.level p.lede {
		font-family: var(--font-display);
		font-size: clamp(1.3rem, 2.4vw, 1.7rem);
		line-height: 1.3;
		color: var(--ink-100);
		max-width: 34ch;
		margin-bottom: 3rem;
	}

	.level p.after {
		margin-top: 2.5rem;
		color: var(--ink-50);
	}

	.level a {
		color: var(--aeon-biolum);
		text-decoration: underline;
		text-decoration-color: rgba(128, 255, 219, 0.35);
		text-underline-offset: 3px;
	}

	.level a:hover {
		text-decoration-color: var(--aeon-biolum);
	}

	/* ---------- diagram / facts / status ---------- */

	.diagram {
		margin: 0 0 2.5rem;
		padding: 1.25rem;
		border: 1px solid var(--ink-12);
		border-radius: 4px;
		background: rgba(26, 27, 47, 0.55);
		overflow-x: auto;
	}

	.facts {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(14rem, 1fr));
		gap: 1.25rem 2rem;
		margin: 0 0 2.5rem;
	}

	.facts > div {
		border-top: 1px solid var(--ink-12);
		padding-top: 0.7rem;
	}

	.facts dt {
		font-family: var(--font-mono);
		font-size: 0.72rem;
		letter-spacing: 0.12em;
		text-transform: uppercase;
		color: var(--aeon-biolum);
		margin-bottom: 0.4rem;
	}

	.facts dd {
		margin: 0;
		font-size: 0.98rem;
		line-height: 1.5;
		color: var(--ink-70);
	}

	.status {
		font-family: var(--font-mono);
		font-size: 0.76rem !important;
		line-height: 1.8 !important;
		color: var(--ink-50) !important;
		max-width: none !important;
		margin: 0 !important;
	}

	.status .k {
		color: var(--aeon-biolum);
		letter-spacing: 0.12em;
		text-transform: uppercase;
		margin-right: 0.6rem;
	}

	.chain {
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		gap: 0.4rem;
		font-family: var(--font-mono);
		font-size: 0.76rem !important;
		margin: 2.5rem 0 1.5rem !important;
		max-width: none !important;
	}

	.chain > span:not(.arrow) {
		padding: 0.25rem 0.65rem;
		border: 1px solid rgba(128, 255, 219, 0.35);
		border-radius: 999px;
		color: var(--aeon-biolum);
	}

	.chain .arrow {
		color: var(--ink-30);
	}

	/* the stake, arriving from the canvas above */
	.chain.stake {
		margin: 0 0 3rem !important;
	}

	.chain.stake .q {
		font-style: italic;
		color: var(--ink-100);
		border-color: var(--ink-30);
	}

	/* ---------- people / contact ---------- */

	.people {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(17rem, 1fr));
		gap: 2rem 3rem;
		margin: 0 0 3rem;
	}

	.person {
		border-top: 1px solid var(--ink-12);
		padding-top: 1rem;
	}

	.person-head {
		display: flex;
		justify-content: space-between;
		align-items: baseline;
		gap: 1rem;
	}

	.person h3 {
		font-family: var(--font-display);
		font-size: 1.35rem;
		margin: 0;
		color: var(--ink-100);
	}

	.links {
		display: flex;
		gap: 0.6rem;
	}

	.links a {
		color: var(--ink-30);
		text-decoration: none;
		display: inline-flex;
	}

	.links a:hover {
		color: var(--aeon-biolum);
	}

	.person .role {
		font-family: var(--font-mono);
		font-size: 0.7rem !important;
		letter-spacing: 0.1em;
		color: var(--ink-50) !important;
		margin: 0.2rem 0 0.7rem !important;
	}

	.person p {
		font-size: 0.98rem;
		line-height: 1.55;
	}

	.contact {
		border-top: 1px solid var(--ink-12);
		padding-top: 2rem;
	}

	.contact p {
		margin-bottom: 1.5rem;
	}

	/* ---------- responsive ---------- */

	@media (max-width: 640px) {
		.level {
			padding: 4rem 1.25rem;
		}

		.cta-primary,
		.cta-secondary {
			width: 100%;
		}
	}
</style>
