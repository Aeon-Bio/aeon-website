<script lang="ts">
	import Modal from '$lib/components/ui/Modal.svelte';
	import PartnershipInquiry from '$lib/components/forms/PartnershipInquiry.svelte';
	import EmailCapture from '$lib/components/forms/EmailCapture.svelte';
	import InstrumentSection from '$lib/components/diagrams/InstrumentSection.svelte';
	import AeonMarkLive from '$lib/images/AeonMarkLive.svelte';
	import ViewportGradient from '$lib/components/ViewportGradient.svelte';
	import { reveal } from '$lib/actions/reveal';
	import { Linkedin, Github, GraduationCap } from 'lucide-svelte';
	import { useMessages, useLang, pathFor } from '$lib/i18n';

	const m = useMessages();
	const lang = useLang();

	/** the other language: its link sets the cookie through ?lang= in hooks.server.ts */
	const other = lang === 'ja' ? 'en' : 'ja';
	const switchHref = `${pathFor(other)}?lang=${other}`;

	/** a message may carry explicit phrase breaks as \n; each becomes a <br> */
	const lines = (s: string): string[] => s.split('\n');

	/** the write-to-us block */
	const SHOW_CONTACT = true;

	let showContact = false;
	let showUpdates = false;

</script>

<svelte:head>
	<title>{m.meta.title}</title>
	<meta name="description" content={m.meta.description} />
	<meta property="og:title" content={m.meta.ogTitle} />
	<meta property="og:type" content="website" />
	<meta property="og:url" content={lang === 'ja' ? 'https://aeon.science/ja' : 'https://aeon.science/'} />
	<meta property="og:locale" content={m.meta.ogLocale} />
	<meta property="og:description" content={m.meta.ogDescription} />
	<meta name="twitter:card" content="summary" />
</svelte:head>

<!-- the ground is the room's own light: one gradient and nothing scattered on it -->
<div class="background-layer" aria-hidden="true">
	<ViewportGradient opacity={0.9} />
</div>

<!-- 00 · the card at viewport scale: text in the mark's light, the mark owns the right -->
<section id="hero-section" class="hero" aria-labelledby="hero-heading">
	<div class="hero-grid">
		<div class="hero-text">
			<div class="hero-head">
				<div class="wordmark-row">
					<p class="wordmark">aeon<span>.science</span></p>
					<a class="lang-switch" href={switchHref} hreflang={other} lang={other}>{m.switch.label}</a>
				</div>
				<p class="line">{m.hero.line}</p>
			</div>
			<div class="hero-foot">
				<h1 id="hero-heading">{#each lines(m.hero.h1) as part, i}{#if i}<br />{/if}{part}{/each}</h1>
				<a class="cue" href="#dish-section">{m.hero.cue} <span aria-hidden="true">↓</span></a>
			</div>
		</div>
		<div class="hero-mark">
			<AeonMarkLive />
		</div>
	</div>
</section>

<!-- 01 · dish -->
<!-- one screen: one sentence hung on the exposure, sized by the viewport so the words are
     never read apart from the figure. The figure says the rest. -->
<section id="dish-section" class="level dish" aria-labelledby="dish-heading">
	<div class="content dish-grid">
		<h2 id="dish-heading" use:reveal={{ delay: 60 }}>
			{#each lines(m.dish.h2a) as part, i}{#if i}<br />{/if}{part}{/each}
			<em class="h-em">{#each lines(m.dish.h2b) as part, i}{#if i}<br />{/if}{part}{/each}</em>
		</h2>
		<figure class="diagram" use:reveal={{ delay: 140 }}>
			<InstrumentSection />
		</figure>
	</div>
</section>

<!-- 02 · readout -->
<section id="readout-section" class="level readout" aria-labelledby="readout-heading">
	<div class="content">
		<h2 id="readout-heading" use:reveal={{ delay: 60 }}>
			{#each lines(m.readout.h2a) as part, i}{#if i}<br />{/if}{part}{/each}
			<em class="h-em">{#each lines(m.readout.h2b) as part, i}{#if i}<br />{/if}{part}{/each}</em>
		</h2>
		<p use:reveal={{ delay: 100 }}>
			{m.readout.pBefore}<a
				href="https://doi.org/10.1126/science.1105809"
				target="_blank"
				rel="noopener noreferrer">{m.readout.pLink}</a
			>{m.readout.pAfter}
		</p>
	</div>
</section>

<!-- 03 · return -->
<section id="return-section" class="level" aria-labelledby="return-heading">
	<div class="content">
		<h2 id="return-heading" use:reveal={{ delay: 60 }}>{m.founders.h2}</h2>

		<div class="people" use:reveal>
			<div class="person">
				<div class="person-figure">
					<img
						src="/founders/eric-mockler-384.webp"
						width="384"
						height="512"
						loading="lazy"
						decoding="async"
						alt={m.eric.alt}
					/>
				</div>
				<div class="person-head">
					<h3>{m.eric.name}</h3>
					<span class="links">
						<a
							href="https://www.linkedin.com/in/ejmockler/"
							target="_blank"
							rel="noopener noreferrer"
							aria-label={m.eric.linkedin}><Linkedin size={16} strokeWidth={1.8} /></a
						>
						<a
							href="https://github.com/ejmockler"
							target="_blank"
							rel="noopener noreferrer"
							aria-label={m.eric.github}><Github size={16} strokeWidth={1.8} /></a
						>
						<a
							href="https://scholar.google.com/citations?user=ONHY9lsAAAAJ&hl=en"
							target="_blank"
							rel="noopener noreferrer"
							aria-label={m.eric.scholar}><GraduationCap size={16} strokeWidth={1.8} /></a
						>
					</span>
				</div>
				<p class="role">{m.eric.role}</p>
				<p class="bio">
					{#each m.eric.bio as s}{#if "href" in s}<a href={s.href} target="_blank" rel="noopener noreferrer">{s.t}</a>{:else}{s.t}{/if}{/each}
				</p>
			</div>
			<div class="person">
				<div class="person-figure">
					<img
						src="/founders/karen-sachs-384.webp"
						width="384"
						height="512"
						loading="lazy"
						decoding="async"
						alt={m.karen.alt}
					/>
				</div>
				<div class="person-head">
					<h3>{m.karen.name}</h3>
					<span class="links">
						<a
							href="https://www.linkedin.com/in/karen-sachs-b174313/"
							target="_blank"
							rel="noopener noreferrer"
							aria-label={m.karen.linkedin}><Linkedin size={16} strokeWidth={1.8} /></a
						>
						<a
							href="https://scholar.google.com/citations?user=lS0tvhoAAAAJ&hl=en"
							target="_blank"
							rel="noopener noreferrer"
							aria-label={m.karen.scholar}><GraduationCap size={16} strokeWidth={1.8} /></a
						>
					</span>
				</div>
				<p class="role">{m.karen.role}</p>
				<p class="bio">
					{#each m.karen.bio as s}{#if "href" in s}<a href={s.href} target="_blank" rel="noopener noreferrer">{s.t}</a>{:else}{s.t}{/if}{/each}
				</p>
			</div>
		</div>

		{#if SHOW_CONTACT}
			<div class="contact" use:reveal>
				<p>{m.cta.line}</p>
				<div class="cta-group left">
					<button class="cta-primary" on:click={() => (showContact = true)}>{m.cta.write}</button>
					<button class="cta-secondary" on:click={() => (showUpdates = true)}>{m.cta.follow}</button>
				</div>
			</div>
		{/if}

		<p class="colophon" use:reveal>
			{m.colophon.text}<a
				href="https://github.com/Aeon-Bio"
				target="_blank"
				rel="noopener noreferrer"
				style="white-space: nowrap">{m.colophon.link}</a
			>
		</p>
	</div>
</section>

<Modal bind:isOpen={showContact} title={m.modal.write} maxWidth="600px">
	<PartnershipInquiry on:close={() => (showContact = false)} />
</Modal>

<Modal bind:isOpen={showUpdates} title={m.modal.follow} maxWidth="500px">
	<EmailCapture on:close={() => (showUpdates = false)} />
</Modal>

<style>
	/* ---------- reveal (owned by use:reveal) ---------- */

	/* an entrance is a fade and nothing else: the page never moves except under the hand */
	:global([data-reveal]) {
		opacity: 0;
		transition: opacity var(--t-settle) var(--ease-out);
		transition-delay: var(--reveal-delay, 0ms);
	}

	:global([data-reveal][data-revealed]) {
		opacity: 1;
	}

	@media (prefers-reduced-motion: reduce) {
		:global([data-reveal]) {
			opacity: 1;
			transition: none;
		}
	}

	/* ---------- ground ---------- */

	.background-layer {
		position: fixed;
		inset: 0;
		z-index: -1;
		pointer-events: none;
	}

	/* ---------- hero ---------- */

	.hero {
		min-height: 100vh;
		min-height: 100svh;
		display: grid;
		align-items: center;
		/* clip only sideways: the mark may run off the right edge without widening the
		   page, but its wash must bleed down into the next section. Clipped at the hero's
		   bottom it was a hard line across the seam, the one edge this page refuses. */
		overflow: clip;
	}

	.hero-grid {
		box-sizing: border-box;
		width: min(92vw, 1280px);
		margin-inline: auto;
		min-height: 100svh;
		display: grid;
		grid-template-columns: minmax(0, 5fr) minmax(0, 7fr); /* the mark overflows its track, it does not squeeze the text */
		align-items: center;
	}

	.hero-text {
		display: flex;
		flex-direction: column;
		justify-content: space-between;
		min-height: 84svh;
		padding-block: 8vh;
		position: relative;
		z-index: 1;
	}

	/* the field the attractor owns, including the void around it; the card's wash behind */
	.hero-mark {
		position: relative;
		width: 60vw;
		max-width: 900px;
		justify-self: end;
		transform: translateX(22%);
	}

	/* the halo lives inside the hero: it reaches transparent before the section's edge,
	   so there is nothing to clip and nothing to leak into the dish */
	.hero-mark::before {
		content: '';
		position: absolute;
		inset: -12%;
		background: radial-gradient(
			closest-side,
			rgba(76, 201, 240, 0.14),
			rgba(76, 201, 240, 0.04) 50%,
			transparent 76%
		);
		pointer-events: none;
	}

	/* Same hierarchy as the card: display face, 600 name / 400 muted domain. */
	.wordmark {
		font-family: var(--font-display);
		font-weight: 600;
		letter-spacing: 0.02em;
		font-size: clamp(1.4rem, 3vw, 1.9rem);
		line-height: 1;
		color: var(--ink-100);
		margin: 0;
	}

	/* the wordmark row: the mark's name, and quietly to its right the other language */
	.wordmark-row {
		display: flex;
		align-items: baseline;
		gap: 1.1rem;
	}

	.lang-switch {
		font-family: var(--font-display);
		font-weight: 400;
		font-size: clamp(0.85rem, 1.1vw, 0.95rem);
		line-height: 1;
		color: var(--ink-70);
		text-decoration: none;
		/* a 44px target without moving the row */
		padding-block: 0.9rem;
		margin-block: -0.9rem;
		transition: color var(--t-snap) var(--ease-out);
	}

	.lang-switch:hover,
	.lang-switch:focus-visible {
		color: var(--ink-100);
	}

	.wordmark span {
		font-weight: 400;
		color: var(--ink-50);
	}

	.line {
		font-family: var(--font-display);
		font-style: italic;
		font-weight: 300;
		font-size: clamp(1.05rem, 1.6vw, 1.3rem);
		line-height: 1.3;
		color: var(--ink-70);
		max-width: 40ch;
		margin: 0.6rem 0 0;
	}

	h1 {
		font-family: var(--font-display);
		font-size: clamp(2.6rem, 4.2vw, 3.6rem);
		line-height: 1.06;
		letter-spacing: -0.012em;
		margin: 0 0 1.5rem;
		max-width: 20ch; /* 'Change something.' stays on one line at 3.6 rem */
		text-align: left;
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

	.cue {
		display: inline-flex;
		align-items: center;
		gap: 0.5rem;
		min-height: 44px;
		font-family: var(--font-mono);
		font-size: 0.72rem;
		letter-spacing: 0.12em;
		text-transform: uppercase;
		color: var(--ink-50);
		text-decoration: none;
		transition: color var(--t-snap) var(--ease-out);
	}

	.cue:hover,
	.cue:focus-visible {
		color: var(--aeon-biolum);
	}

	@media (max-width: 1023px) {
		.hero-grid {
			grid-template-columns: minmax(0, 11fr) minmax(0, 9fr); /* 'Change something.' on one line at 3 rem */
		}
		.hero-mark {
			width: 68vw;
		}
		h1 {
			font-size: 3rem;
		}
	}

	@media (max-width: 719px) {
		.hero-grid {
			grid-template-columns: 1fr;
			width: 100%;
			padding-inline: 16px;
			align-content: space-between; /* mark at the top, name block at the foot, like the card */
		}
		.hero-mark {
			order: -1;
			width: 112vw;
			max-width: none;
			justify-self: start;
			margin-left: calc(50% - 56vw - 16px + 16px);
			margin-top: 6vh;
			transform: none;
		}
		.hero-text {
			min-height: 0;
			padding: 0 0 6vh;
			gap: 2.2rem;
		}
		h1 {
			font-size: 2.2rem;
		}
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
		border: 0;
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
		color: var(--ink-100);
	}

	.cta-primary:focus-visible,
	.cta-secondary:focus-visible {
		outline: 1px solid var(--aeon-biolum);
		outline-offset: 3px;
	}

	/* ---------- levels ---------- */

	.level {
		position: relative;
		padding: clamp(5rem, 12vh, 9rem) 2rem;
		overflow: clip; /* the diagram's wash may not widen the document */
		scroll-margin-top: 0;
	}

	.content {
		max-width: 60rem;
		margin: 0 auto;
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

	/* ---------- diagram / status ---------- */

	/* ---------- the dish screen ---------- */

	/* the section is one viewport: text column left, the exposure right, sized by the
	   viewport height so the figure, its sentence and the words around it are seen at once */
	.dish {
		min-height: 100svh;
		padding: 3rem 2rem;
		display: grid;
		align-content: center;
	}

	/* the sentence hangs on the figure: centred on the square, in its light */
	.dish-grid {
		max-width: 76rem;
		display: grid;
		grid-template-columns: minmax(0, 1fr) auto;
		grid-template-areas: 'head fig';
		column-gap: clamp(2rem, 4vw, 4rem);
		align-items: center;
	}

	.dish h2 {
		grid-area: head;
		font-size: clamp(1.9rem, 3vw, 2.6rem);
		max-width: 16ch;
		margin: 0;
	}

	/* the drawing sits on the dark with its own faint wash: no box, no rule */
	.diagram {
		grid-area: fig;
		position: relative;
		width: min(880px, calc(100svh - 6rem), calc(100vw - 4rem));
		margin: 0;
		padding: 0;
	}

	@media (max-width: 63.99rem) {
		.dish {
			padding: clamp(3rem, 8vh, 5rem) 2rem;
		}

		.dish-grid {
			grid-template-columns: minmax(0, 1fr);
			grid-template-areas:
				'head'
				'fig';
		}

		.dish h2 {
			max-width: 30ch;
			margin: 0 0 1.5rem;
		}

		.diagram {
			width: min(100%, max(18rem, calc(100svh - 14rem)));
			margin: 0;
		}
	}

	/* ---------- readout ---------- */

	/* a screen whose centre is the claim; the void around it is composed, not leftover */
	.readout {
		min-height: 100svh;
		display: grid;
		align-content: center;
	}

	.readout h2 {
		max-width: 22ch;
	}

	/* ---------- colophon ---------- */

	.colophon {
		font-family: var(--font-mono);
		font-size: 0.76rem !important;
		line-height: 1.8 !important;
		color: var(--ink-50) !important;
		max-width: none !important;
		margin: 5rem 0 0 !important;
	}

	/* ---------- people / contact ---------- */

	.people {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(17rem, 1fr));
		gap: 2.5rem 3rem;
		margin: 0 0 3rem;
	}

	/* Each founder spans four rows of the parent grid (photo, name, role, bio) so the
	   name rows of both columns sit on one line even when only one photo exists. */
	.person {
		display: grid;
		grid-template-rows: subgrid;
		grid-row: span 4;
		row-gap: 0;
		align-content: start;
		border-top: 0;
	}

	/* The real inside the abstraction: a true-colour photograph, untreated, lit by the
	   card's own wash. 15rem wide (2x of the 480 px asset), 3:4, 2 px radius, no border. */
	.person-figure {
		grid-row: 1;
		position: relative;
		width: 15rem;
		max-width: 100%;
		margin: 0.35rem 0 1.4rem;
	}

	.person-figure::before {
		content: '';
		position: absolute;
		inset: -30%;
		background: radial-gradient(
			closest-side,
			rgba(76, 201, 240, 0.15),
			rgba(76, 201, 240, 0.05) 55%,
			transparent
		);
		pointer-events: none;
	}

	.person-figure img {
		position: relative;
		display: block;
		width: 100%;
		height: auto;
		aspect-ratio: 3 / 4;
		object-fit: cover;
		border-radius: 2px;
	}

	/* the links belong to the name: they sit beside it, not at the column's far edge */
	.person-head {
		grid-row: 2;
		display: flex;
		align-items: center;
		gap: 0.9rem;
	}

	.person h3 {
		font-family: var(--font-display);
		font-size: 1.35rem;
		margin: 0;
		color: var(--ink-100);
	}

	.links {
		display: flex;
		gap: 0.55rem;
		transform: translateY(1px);
	}

	.links a {
		color: var(--ink-50);
		text-decoration: none;
		display: inline-flex;
	}

	.links a:hover {
		color: var(--aeon-biolum);
	}

	.person .role {
		grid-row: 3;
		font-family: var(--font-body);
		font-size: 0.82rem !important;
		letter-spacing: 0.01em;
		color: var(--ink-50) !important;
		margin: 0.25rem 0 0.7rem !important;
	}

	.person p {
		font-size: 0.98rem;
		line-height: 1.55;
	}

	.person .bio {
		grid-row: 4;
		margin: 0;
	}

	.contact {
		border-top: 0;
		margin-top: 1rem;
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
