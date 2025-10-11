<script lang="ts">
	import GridSystem from '$lib/components/GridSystem.svelte';
	import ScrollDrivenParticleField from '$lib/components/ScrollDrivenParticleField.svelte';
	import EnergyFlow from '$lib/components/EnergyFlow.svelte';
	import MolecularContainer from '$lib/components/MolecularContainer.svelte';
	import Modal from '$lib/components/ui/Modal.svelte';
	import PartnershipInquiry from '$lib/components/forms/PartnershipInquiry.svelte';
	import EmailCapture from '$lib/components/forms/EmailCapture.svelte';
	import FactorGraph from '$lib/components/visualizations/FactorGraph.svelte';
	import ComparisonChart from '$lib/components/visualizations/ComparisonChart.svelte';
	import SectionReveal from '$lib/components/SectionReveal.svelte';
	import { interactionState } from '$lib/stores/interaction';
	import { sectionManager } from '$lib/stores/scroll';
	import AeonLogo from '$lib/images/AeonLogo.svelte';
	import { onMount } from 'svelte';
	import { fade } from 'svelte/transition';
	import ViewportGradient from '$lib/components/ViewportGradient.svelte';
	import { Linkedin, Github } from 'lucide-svelte';

	function handleContainerHover(event: CustomEvent) {
		const element = event.detail.element;
		interactionState.update((state) => ({
			...state,
			hoveredElement: element,
			systemActivity: 0.8
		}));
	}

	function handleContainerLeave() {
		interactionState.update((state) => ({
			...state,
			hoveredElement: null,
			systemActivity: 0
		}));
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

	// Modal state
	let showPartnershipModal = false;
	let showEmailModal = false;

	// CTA handlers
	function openPartnershipModal() {
		showPartnershipModal = true;
	}

	function openEmailModal() {
		showEmailModal = true;
	}

	function closePartnershipModal() {
		showPartnershipModal = false;
	}

	function closeEmailModal() {
		showEmailModal = false;
	}

	function handlePartnershipSubmit(event: CustomEvent) {
		console.log('Partnership inquiry submitted:', event.detail);
		// Analytics tracking would go here
		closePartnershipModal();
	}

	function handleEmailSubmit(event: CustomEvent) {
		console.log('Email signup submitted:', event.detail);
		// Analytics tracking would go here
		closeEmailModal();
	}

	onMount(() => {
		window.addEventListener('resize', handleResize);

		// Register sections for scroll tracking
		const cleanupSections = sectionManager.registerSections([
			'hero-section',
			'problem-section',
			'approach-section',
			'applications-section',
			'partnership-section',
			'science-section',
			'closing-cta-section'
		]);

		return () => {
			window.removeEventListener('resize', handleResize);
			cleanupSections?.();
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

<div class="content-layer" aria-hidden="true"></div>

<SectionReveal
	sectionId="hero"
	initiallyVisible={true}
	animationType="fadeIn"
	staggerDelay={100}
	duration={1000}
	backgroundEffect="molecular-glow"
	childSelector=".hero-item"
>
	<section id="hero-section" class="hero" aria-labelledby="hero-heading">
		<div class="container-wrapper">
			<MolecularContainer on:hover={handleContainerHover} on:leave={handleContainerLeave}>
				<div class="logo-container hero-item" role="img" aria-label="Aeon Bio company logo">
					<AeonLogo />
				</div>
				<h1 id="hero-heading" class="hero-item">
					Building the information layer of health through biomolecular causality
				</h1>
				<p class="tagline hero-item">Decode mechanisms. Prevent disease.</p>
				<div class="cta-group hero-item" role="group" aria-label="Main actions">
					<button
						class="cta-primary"
						on:click={openPartnershipModal}
						aria-describedby="partnership-desc">Explore Partnership Opportunities</button
					>
					<button class="cta-secondary" on:click={openEmailModal} aria-describedby="updates-desc"
						>Stay Updated</button
					>
				</div>
				<div class="visually-hidden">
					<span id="partnership-desc"
						>Opens a form to inquire about collaboration opportunities with Aeon Bio</span
					>
					<span id="updates-desc">Opens a form to subscribe to updates and news from Aeon Bio</span>
				</div>
			</MolecularContainer>
		</div>
	</section>
</SectionReveal>

<!-- Section 2: The Problem -->
<SectionReveal
	sectionId="problem"
	animationType="slideUp"
	staggerDelay={150}
	duration={800}
	backgroundEffect="particle-drift"
	childSelector=".problem-item"
>
	<section id="problem-section" class="problem-section">
		<div class="content-wrapper">
			<h2 class="problem-item">Why current approaches fall short</h2>
			<p class="problem-intro problem-item">
				Healthcare generates unprecedented data—genomics, transcriptomics, epigenomics,
				metabolomics, biometrics—yet these remain fragmented and underutilized.
			</p>
			<p class="problem-item">
				Current AI approaches find correlations in this data. But correlation isn't causation.
				Without understanding why a molecular pattern leads to disease, recommendations remain
				guesswork.
			</p>

			<!-- Interactive comparison visualization -->
			<div class="comparison-explanation">
				<div class="explanation-item problem-item slide-left">
					<h3>The Correlation Trap</h3>
					<p>
						Traditional approaches find statistical associations but miss the underlying mechanisms.
						High correlation doesn't guarantee causation—leading to ineffective interventions based
						on spurious relationships.
					</p>
				</div>
				<div class="explanation-item problem-item slide-right">
					<h3>True Causal Understanding</h3>
					<p>
						Aeon Bio maps direct biomolecular pathways from molecular state through biological
						functions to health outcomes, revealing actionable mechanisms you can influence.
					</p>
				</div>
			</div>

			<!-- Interactive comparison visualization -->
			<div class="comparison-visual-enhanced problem-item">
				<ComparisonChart height={360} />
			</div>
			<p class="solution-teaser problem-item">Aeon Bio changes this.</p>
		</div>
	</section>
</SectionReveal>

<!-- Section 3: Our Approach -->
<SectionReveal
	sectionId="approach"
	animationType="scaleUp"
	staggerDelay={120}
	duration={900}
	backgroundEffect="molecular-glow"
	childSelector=".approach-item"
>
	<section id="approach-section" class="approach-section">
		<div class="content-wrapper">
			<h2 class="approach-item">Factor graphs meet multi-omics data</h2>
			<div class="factor-graph-visual approach-item">
				<FactorGraph height={560} />
			</div>
			<p class="approach-item">
				We integrate multi-omics data (genomic, epigenetic, metabolomic, biometric) with scientific
				literature through factor graphs—probabilistic models that map causal relationships at every
				biological scale.
			</p>
			<p class="approach-item">Think of it as a living map of human biology:</p>
			<div class="approach-breakdown">
				<div class="breakdown-item approach-item">
					<strong>Molecules</strong> → observed from your data (genes, metabolites, proteins)
				</div>
				<div class="breakdown-item approach-item">
					<strong>Biological functions</strong> → learned from 150,000+ research papers
				</div>
				<div class="breakdown-item approach-item">
					<strong>Causal pathways</strong> → inferred through belief propagation
				</div>
				<div class="breakdown-item approach-item">
					<strong>Health outcomes</strong> → predicted years before clinical symptoms
				</div>
			</div>
			<p class="approach-item">
				Unlike foundation models that pattern-match, our approach reasons about why molecular states
				lead to specific health trajectories. Every recommendation traces back to a causal
				mechanism.
			</p>
			<div class="callout-box approach-item">
				<h3>Beyond Foundation Models</h3>
				<p>
					We use foundation models as probability distributions—inputs to our factor graphs, not
					endpoints. This enables true causal reasoning instead of sophisticated correlation.
				</p>
			</div>
		</div>
	</section>
</SectionReveal>

<!-- Section 4: Applications -->
<section id="applications-section" class="applications-section">
	<div class="content-wrapper">
		<h2>From molecules to medicine</h2>
		<div class="use-cases">
			<div class="use-case-card">
				<h3>Disease Prevention</h3>
				<h4>Detect disease-trending processes before clinical symptoms</h4>
				<p>
					Traditional diagnostics catch disease after damage occurs. Our causal models identify
					molecular trajectories toward inflammation, metabolic syndrome, and cardiovascular disease
					years earlier—when intervention is most effective.
				</p>
			</div>
			<div class="use-case-card">
				<h3>Personalized Interventions</h3>
				<h4>Recommendations rooted in your molecular causality</h4>
				<p>
					Rather than generic advice, we trace your specific molecular state through biological
					pathways to identify personalized interventions—lifestyle changes, supplements,
					therapies—with clear mechanistic rationale.
				</p>
			</div>
			<div class="use-case-card">
				<h3>Research & Development</h3>
				<h4>Partner to build custom causal models for your data</h4>
				<p>
					We create specialized factor graph models tailored to specific data modalities: genomic
					variants, methylation patterns, metabolomics, clinical biomarkers. Each implementation
					strengthens the network for all partners.
				</p>
			</div>
		</div>
	</div>
</section>

<!-- Section 5: Partnership Opportunities -->
<section id="partnership-section" class="partnership-section">
	<div class="content-wrapper">
		<h2>Build the future of precision health with us</h2>
		<div class="partnership-types">
			<div class="partnership-card">
				<h3>Co-Development Partnerships</h3>
				<p>
					Collaborate on novel applications of causal biomolecular modeling. We bring the factor
					graph infrastructure and causal AI expertise—you bring domain knowledge and data.
				</p>
				<p class="ideal-for">
					Ideal for: Biotech companies, longevity clinics, research institutions exploring new
					therapeutic targets.
				</p>
			</div>
			<div class="partnership-card">
				<h3>Data Partnerships</h3>
				<p>
					Provide specialized data modalities (methylation, proteomics, clinical outcomes) to help
					build and validate causal models. Gain insights from the resulting models.
				</p>
				<p class="ideal-for">
					Ideal for: Testing companies, health platforms with unique datasets, clinical research
					organizations.
				</p>
			</div>
			<div class="partnership-card">
				<h3>Research Collaborations</h3>
				<p>
					Joint research initiatives to advance the science of biomolecular causality and precision
					health.
				</p>
				<p class="ideal-for">
					Ideal for: Academic labs, consortium partners, organizations pushing the boundaries of
					computational biology.
				</p>
			</div>
		</div>
		<div class="partnership-cta">
			<button class="cta-primary" on:click={openPartnershipModal}
				>Explore how we can work together</button
			>
		</div>
	</div>
</section>

<!-- Section 6: The Science -->
<section id="science-section" class="science-section">
	<div class="content-wrapper">
		<h2>Built on pioneering research in causal AI</h2>
		<div class="founder-profiles">
			<div class="founder-card">
				<div class="founder-card-header">
					<h3>Eric Jing Mockler – CEO & Cofounder</h3>
					<div class="founder-links" role="group" aria-label="Eric Jing Mockler contact links">
						<a
							class="founder-link"
							href="https://www.linkedin.com/in/ejmockler/"
							target="_blank"
							rel="noopener noreferrer"
							aria-label="Eric Jing Mockler on LinkedIn"
							title="Eric Jing Mockler on LinkedIn"
						>
							<Linkedin size={22} strokeWidth={1.8} />
						</a>
						<a
							class="founder-link"
							href="https://github.com/ejmockler"
							target="_blank"
							rel="noopener noreferrer"
							aria-label="Eric Jing Mockler on GitHub"
							title="Eric Jing Mockler on GitHub"
						>
							<Github size={22} strokeWidth={1.8} />
						</a>
					</div>
				</div>
				<ul>
					<li>UC Santa Cruz: Bioengineering, Cognitive Science, Neuroscience</li>
					<li>
						Architected genomic pipelines processing 10,000+ genomes (Gladstone Institutes,
						AnswerALS consortium)
					</li>
					<li>Open-source contributor to causal genomics methods</li>
					<li>Specializes in scalable bioinformatics infrastructure</li>
				</ul>
			</div>
			<div class="founder-card">
				<div class="founder-card-header">
					<h3>Karen Sachs, PhD – CSO/CTO & Cofounder</h3>
					<div class="founder-links" role="group" aria-label="Karen Sachs contact links">
						<a
							class="founder-link"
							href="https://www.linkedin.com/in/karen-sachs-b174313/"
							target="_blank"
							rel="noopener noreferrer"
							aria-label="Karen Sachs on LinkedIn"
							title="Karen Sachs on LinkedIn"
						>
							<Linkedin size={22} strokeWidth={1.8} />
						</a>
					</div>
				</div>
				<ul>
					<li>MIT PhD in Biological Engineering, Stanford Medicine postdoc</li>
					<li>Pioneer in single-cell causal inference and CyTOF technology</li>
					<li>60+ publications, 8,000+ citations</li>
					<li>Science Breakthrough of the Year runner-up</li>
					<li>$2.5M SBIR grant for Causal AI drug development</li>
				</ul>
			</div>
		</div>
	</div>
</section>

<!-- Section 7: Closing CTA -->
<section id="closing-cta-section" class="closing-cta-section">
	<div class="content-wrapper">
		<h2>Ready to explore what's possible?</h2>
		<p>
			Whether you're developing precision therapeutics, building health platforms, or advancing
			longevity science—Aeon Bio's causal modeling infrastructure can accelerate your work.
		</p>
		<p>Let's discuss how biomolecular causality can transform your approach to human health.</p>
		<div class="final-cta-group">
			<button class="cta-primary" on:click={openPartnershipModal}>Partner with Us</button>
			<button class="cta-secondary" on:click={openEmailModal}>Stay Updated</button>
		</div>
	</div>
</section>

<!-- Modals -->
<Modal
	bind:isOpen={showPartnershipModal}
	title="Partnership Inquiry"
	maxWidth="600px"
	on:close={closePartnershipModal}
>
	<PartnershipInquiry on:submit={handlePartnershipSubmit} on:close={closePartnershipModal} />
</Modal>

<Modal
	bind:isOpen={showEmailModal}
	title="Stay Updated"
	maxWidth="500px"
	on:close={closeEmailModal}
>
	<EmailCapture on:submit={handleEmailSubmit} on:close={closeEmailModal} />
</Modal>

<style>
	.background-layer {
		position: fixed;
		inset: 0;
		z-index: -1;
	}

	.content-layer {
		position: fixed;
		inset: 0;
		z-index: 0;
		pointer-events: none;
	}

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
		width: min(32vw, 320px);
		height: min(32vw, 320px);
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
		font-size: clamp(1.6rem, 4vw, 2.75rem);
		margin: 0 auto 1.1rem;
		max-width: 32ch;
		background: linear-gradient(
			135deg,
			rgba(255, 255, 255, 0.96) 0%,
			rgba(128, 255, 219, 0.9) 55%,
			rgba(76, 201, 240, 0.92) 100%
		);
		-webkit-background-clip: text;
		background-clip: text;
		color: transparent;
		text-align: center;
		line-height: 1.18;
		text-shadow:
			0 18px 45px rgba(76, 201, 240, 0.22),
			0 2px 8px rgba(16, 41, 66, 0.4);
	}

	.tagline {
		font-size: clamp(1rem, 2.5vw, 1.3rem);
		max-width: 40ch;
		margin: 0 auto 2.75rem;
		text-align: center;
		background: linear-gradient(130deg, rgba(192, 228, 255, 0.75), rgba(128, 255, 219, 0.7));
		-webkit-background-clip: text;
		background-clip: text;
		color: transparent;
		line-height: 1.65;
		text-shadow: 0 8px 24px rgba(76, 201, 240, 0.18);
	}

	.cta-group {
		display: flex;
		gap: 1rem;
		justify-content: center;
		flex-wrap: wrap;
	}

	.cta-primary,
	.cta-secondary {
		min-height: 44px;
		padding: 0.75rem 1.5rem;
		border-radius: 0.5rem;
		font-size: 1rem;
		font-weight: 500;
		transition: all 0.3s ease;
		cursor: pointer;
		border: none;
		min-width: 200px;
	}

	.cta-primary {
		background: linear-gradient(45deg, var(--aeon-primary), var(--aeon-biolum));
		color: var(--aeon-deep-space);
	}

	.cta-primary:hover,
	.cta-primary:focus {
		transform: translateY(-2px);
		box-shadow: 0 8px 25px rgba(76, 201, 240, 0.3);
	}

	.cta-primary:focus {
		outline: 2px solid var(--aeon-biolum);
		outline-offset: 2px;
	}

	.cta-secondary {
		background: rgba(255, 255, 255, 0.1);
		color: rgba(255, 255, 255, 0.9);
		border: 1px solid rgba(128, 255, 219, 0.3);
	}

	.cta-secondary:hover,
	.cta-secondary:focus {
		background: rgba(128, 255, 219, 0.1);
		border-color: var(--aeon-biolum);
		color: white;
	}

	.cta-secondary:focus {
		outline: 2px solid var(--aeon-biolum);
		outline-offset: 2px;
	}

	/* Section Layouts */
	.problem-section,
	.approach-section,
	.applications-section,
	.partnership-section,
	.science-section,
	.closing-cta-section {
		padding: 4rem 2rem;
		background: rgba(26, 27, 47, 0.8);
		backdrop-filter: blur(10px);
		border-top: 1px solid rgba(128, 255, 219, 0.1);
	}

	.content-wrapper {
		max-width: 1000px;
		margin: 0 auto;
	}

	/* Typography */
	section h2 {
		font-size: clamp(1.8rem, 4vw, 2.5rem);
		margin: 0 0 2rem;
		background: linear-gradient(to right, var(--aeon-primary), var(--aeon-biolum));
		-webkit-background-clip: text;
		background-clip: text;
		color: transparent;
		text-align: center;
	}

	section h3 {
		font-size: clamp(1.2rem, 3vw, 1.5rem);
		color: var(--aeon-biolum);
		margin-bottom: 1rem;
	}

	section h4 {
		font-size: 1.1rem;
		color: rgba(255, 255, 255, 0.8);
		margin-bottom: 0.5rem;
		font-weight: 400;
	}

	section p {
		font-size: clamp(1rem, 2vw, 1.1rem);
		line-height: 1.7;
		color: rgba(255, 255, 255, 0.9);
		margin-bottom: 1.5rem;
	}

	/* Problem Section */
	.problem-intro {
		font-size: clamp(1rem, 2.5vw, 1.15rem);
		text-align: left;
		color: rgba(255, 255, 255, 0.85);
		line-height: 1.6;
		margin-bottom: 2rem;
	}

	.comparison-visual-enhanced {
		margin: 2.5rem 0;
		display: flex;
		justify-content: center;
		padding: 0 1rem;
	}

	.comparison-visual-enhanced :global(.comparison-chart-container) {
		flex: 1;
	}

	.comparison-explanation {
		display: grid;
		grid-template-columns: 1fr 1fr;
		gap: 2rem;
		margin: 2rem 0;
	}

	.explanation-item {
		padding: 1.5rem;
		border: 1px solid rgba(128, 255, 219, 0.2);
		border-radius: 0.5rem;
		background: rgba(128, 255, 219, 0.05);
		transition:
			transform 0.3s ease,
			border-color 0.3s ease;
	}

	.explanation-item:hover {
		transform: translateY(-3px);
		border-color: var(--aeon-biolum);
		background: rgba(128, 255, 219, 0.08);
	}

	.explanation-item h3 {
		color: var(--aeon-biolum);
		margin-bottom: 0.75rem;
	}

	/* Legacy styles for backward compatibility */
	.comparison-visual {
		display: grid;
		grid-template-columns: 1fr 1fr;
		gap: 2rem;
		margin: 2rem 0;
	}

	.comparison-item {
		padding: 1.5rem;
		border: 1px solid rgba(76, 201, 240, 0.2);
		border-radius: 0.5rem;
		background: rgba(255, 255, 255, 0.05);
	}

	.problem-statement {
		font-size: 1.2rem;
		text-align: center;
		margin: 2rem 0;
		color: rgba(255, 255, 255, 0.8);
	}

	.solution-teaser {
		font-size: 1.3rem;
		font-weight: 600;
		text-align: center;
		color: var(--aeon-biolum);
		margin: 1rem 0 0;
	}

	/* Approach Section */
	.factor-graph-visual {
		margin: 3rem auto 4rem;
		width: 100%;
		max-width: 1000px;
		padding: 0 1rem;
	}

	.approach-breakdown {
		margin: 2rem 0;
		display: grid;
		gap: 1rem;
	}

	.breakdown-item {
		padding: 1rem;
		border-left: 3px solid var(--aeon-biolum);
		background: rgba(128, 255, 219, 0.05);
		font-size: 1rem;
	}

	.callout-box {
		margin: 2rem 0;
		padding: 2rem;
		background: rgba(76, 201, 240, 0.1);
		border: 1px solid rgba(76, 201, 240, 0.3);
		border-radius: 0.5rem;
	}

	.callout-box h3 {
		margin-top: 0;
		color: var(--aeon-primary);
	}

	/* Applications Section */
	.use-cases {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
		gap: 2rem;
		margin: 2rem 0;
	}

	.use-case-card {
		padding: 2rem;
		background: rgba(255, 255, 255, 0.05);
		border: 1px solid rgba(128, 255, 219, 0.2);
		border-radius: 0.5rem;
		transition:
			transform 0.3s ease,
			border-color 0.3s ease;
	}

	.use-case-card:hover {
		transform: translateY(-5px);
		border-color: var(--aeon-biolum);
	}

	/* Partnership Section */
	.partnership-types {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
		gap: 2rem;
		margin: 2rem 0;
	}

	.partnership-card {
		padding: 2rem;
		background: rgba(76, 201, 240, 0.05);
		border: 1px solid rgba(76, 201, 240, 0.2);
		border-radius: 0.5rem;
		transition: transform 0.3s ease;
	}

	.partnership-card:hover {
		transform: translateY(-5px);
		background: rgba(76, 201, 240, 0.1);
	}

	.ideal-for {
		font-style: italic;
		color: rgba(255, 255, 255, 0.7);
		font-size: 0.9rem;
	}

	.partnership-cta {
		text-align: center;
		margin-top: 3rem;
	}

	/* Science Section */
	.founder-profiles {
		display: grid;
		gap: 2rem;
		margin: 2rem 0;
	}

	.founder-card {
		padding: 2rem;
		background: rgba(255, 255, 255, 0.05);
		border: 1px solid rgba(128, 255, 219, 0.2);
		border-radius: 0.5rem;
	}

	.founder-card-header {
		display: flex;
		justify-content: space-between;
		align-items: flex-start;
		gap: 1.5rem;
		flex-wrap: wrap;
	}

	.founder-card-header h3 {
		margin-bottom: 0.5rem;
	}

	.founder-card ul {
		margin: 1rem 0;
		padding-left: 1.5rem;
	}

	.founder-card li {
		margin-bottom: 0.5rem;
		color: rgba(255, 255, 255, 0.8);
	}

	.founder-links {
		display: flex;
		gap: 0.75rem;
		margin-top: 0.25rem;
	}

	.founder-link {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		width: 2.5rem;
		height: 2.5rem;
		border-radius: 999px;
		background: rgba(128, 255, 219, 0.12);
		border: 1px solid rgba(128, 255, 219, 0.4);
		color: var(--aeon-biolum);
		transition:
			transform 0.2s ease,
			background-color 0.2s ease,
			border-color 0.2s ease;
	}

	.founder-link:hover,
	.founder-link:focus {
		transform: translateY(-2px);
		background: rgba(128, 255, 219, 0.2);
		border-color: var(--aeon-biolum);
	}

	.founder-link:focus-visible {
		outline: 2px solid var(--aeon-biolum);
		outline-offset: 2px;
	}

	/* Closing CTA Section */
	.closing-cta-section {
		text-align: center;
	}

	.final-cta-group {
		display: flex;
		gap: 1rem;
		justify-content: center;
		flex-wrap: wrap;
		margin-top: 2rem;
	}

	/* Responsive Design */
	@media (max-width: 768px) {
		.comparison-visual {
			grid-template-columns: 1fr;
		}

		.comparison-explanation {
			grid-template-columns: 1fr;
			gap: 1.5rem;
		}

		.explanation-item {
			padding: 1rem;
		}

		.comparison-visual-enhanced {
			margin: 2rem 0;
		}

		/* Enhanced touch targets for mobile */
		.cta-primary,
		.cta-secondary {
			min-height: 48px;
			min-width: 100%;
			justify-content: center;
			font-size: 1.1rem;
		}

		.cta-group,
		.final-cta-group {
			flex-direction: column;
			align-items: stretch;
			gap: 1rem;
		}

		/* Mobile section spacing */
		.problem-section,
		.approach-section,
		.applications-section,
		.partnership-section,
		.science-section,
		.closing-cta-section {
			padding: 2rem 1rem;
		}

		/* Mobile cards and grids */
		.use-cases {
			grid-template-columns: 1fr;
			gap: 1.5rem;
		}

		.partnership-types {
			grid-template-columns: 1fr;
			gap: 1.5rem;
		}

		.founder-profiles {
			gap: 1.5rem;
		}

		/* Improved mobile typography */
		h1 {
			font-size: clamp(1.2rem, 6vw, 1.8rem);
			line-height: 1.3;
		}

		.tagline {
			font-size: clamp(0.85rem, 4vw, 1rem);
			line-height: 1.5;
		}
	}
</style>
