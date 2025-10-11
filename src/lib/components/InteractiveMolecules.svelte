<script lang="ts">
	import { onMount } from 'svelte';
	import { currentSection } from '../stores/scroll';
	import { fade, scale } from 'svelte/transition';

	interface Molecule {
		id: string;
		x: number;
		y: number;
		size: number;
		type: 'protein' | 'dna' | 'metabolite' | 'drug' | 'biomarker';
		name: string;
		description: string;
		connections: string[];
		sectionAffinity: string;
		opacity: number;
		pulsating: boolean;
	}

	interface Tooltip {
		molecule: Molecule;
		x: number;
		y: number;
		visible: boolean;
	}

	let molecules: Molecule[] = [];
	let tooltip: Tooltip | null = null;
	let container: HTMLDivElement;
	let width = 0;
	let height = 0;

	$: currentSectionId = $currentSection;

	// Molecule database with scientific information
	const moleculeData = {
		'hero-section': [
			{
				id: 'dna-helix',
				type: 'dna' as const,
				name: 'DNA Double Helix',
				description:
					'Contains genetic instructions that influence protein expression and cellular behavior. Methylation patterns can silence or activate genes.',
				connections: ['histone-h3', 'dnmt1']
			},
			{
				id: 'histone-h3',
				type: 'protein' as const,
				name: 'Histone H3',
				description:
					'Packaging protein that helps organize DNA. Chemical modifications affect gene accessibility and expression patterns.',
				connections: ['dna-helix', 'hdac1']
			}
		],
		'problem-section': [
			{
				id: 'inflammatory-marker',
				type: 'biomarker' as const,
				name: 'C-Reactive Protein (CRP)',
				description:
					'Acute-phase protein indicating systemic inflammation. Elevated levels predict cardiovascular disease risk.',
				connections: ['il-6', 'tnf-alpha']
			},
			{
				id: 'il-6',
				type: 'protein' as const,
				name: 'Interleukin-6',
				description:
					'Pro-inflammatory cytokine that triggers CRP production in the liver. Links cellular stress to systemic inflammation.',
				connections: ['inflammatory-marker', 'nf-kb']
			}
		],
		'approach-section': [
			{
				id: 'factor-graph-node',
				type: 'protein' as const,
				name: 'Factor Graph Node',
				description:
					'Probabilistic model connecting molecular observations to biological functions through causal relationships.',
				connections: ['belief-propagation', 'molecular-pathway']
			},
			{
				id: 'belief-propagation',
				type: 'metabolite' as const,
				name: 'Belief Propagation',
				description:
					'Algorithm that infers causal relationships by passing probability messages between connected nodes in the factor graph.',
				connections: ['factor-graph-node']
			}
		],
		'applications-section': [
			{
				id: 'telomere',
				type: 'dna' as const,
				name: 'Telomere',
				description:
					'Protective DNA-protein structures at chromosome ends. Shortening predicts cellular aging and disease risk.',
				connections: ['telomerase', 'oxidative-stress']
			},
			{
				id: 'nad-plus',
				type: 'metabolite' as const,
				name: 'NAD+',
				description:
					'Essential coenzyme for cellular energy production and DNA repair. Declining levels are linked to aging processes.',
				connections: ['sirtuin', 'mitochondria']
			}
		],
		'partnership-section': [
			{
				id: 'multiomics-data',
				type: 'biomarker' as const,
				name: 'Multi-omics Integration',
				description:
					'Combining genomic, epigenetic, metabolomic, and proteomic data to build comprehensive causal models.',
				connections: ['data-pipeline', 'ai-inference']
			},
			{
				id: 'personalized-medicine',
				type: 'drug' as const,
				name: 'Personalized Intervention',
				description:
					'Targeted therapies based on individual molecular causality patterns rather than population averages.',
				connections: ['multiomics-data']
			}
		],
		'science-section': [
			{
				id: 'single-cell',
				type: 'protein' as const,
				name: 'Single Cell Analysis',
				description:
					'Technology enabling measurement of molecular states in individual cells, revealing cellular heterogeneity and signaling dynamics.',
				connections: ['cytof', 'signaling-pathway']
			},
			{
				id: 'bayesian-network',
				type: 'biomarker' as const,
				name: 'Bayesian Network',
				description:
					'Probabilistic graphical model representing conditional dependencies between variables. Forms the foundation of causal inference.',
				connections: ['causal-discovery', 'prior-knowledge']
			}
		],
		'closing-cta-section': [
			{
				id: 'precision-health',
				type: 'drug' as const,
				name: 'Precision Health Future',
				description:
					'Healthcare guided by individual molecular causality maps, enabling prevention before disease manifests.',
				connections: ['predictive-modeling', 'intervention-design']
			}
		]
	};

	const moleculeColors = {
		protein: '#4CC9F0',
		dna: '#80FFDB',
		metabolite: '#B476F0',
		drug: '#FFD84C',
		biomarker: '#FF6B9D'
	};

	function createMolecules() {
		molecules = [];

		Object.entries(moleculeData).forEach(([section, sectionMolecules]) => {
			sectionMolecules.forEach((mol) => {
				const molecule: Molecule = {
					id: mol.id,
					x: Math.random() * (width - 100) + 50,
					y: Math.random() * (height - 100) + 50,
					size: 8 + Math.random() * 6,
					type: mol.type,
					name: mol.name,
					description: mol.description,
					connections: mol.connections,
					sectionAffinity: section,
					opacity: 0.3,
					pulsating: false
				};
				molecules.push(molecule);
			});
		});

		// Ensure no overlap
		molecules.forEach((mol, i) => {
			molecules.slice(i + 1).forEach((other) => {
				const dx = mol.x - other.x;
				const dy = mol.y - other.y;
				const dist = Math.sqrt(dx * dx + dy * dy);
				const minDist = mol.size + other.size + 20;

				if (dist < minDist) {
					const angle = Math.atan2(dy, dx);
					const overlap = minDist - dist;
					mol.x += Math.cos(angle) * overlap * 0.5;
					mol.y += Math.sin(angle) * overlap * 0.5;
					other.x -= Math.cos(angle) * overlap * 0.5;
					other.y -= Math.sin(angle) * overlap * 0.5;
				}
			});
		});
	}

	function updateMoleculeVisibility() {
		molecules.forEach((mol) => {
			if (mol.sectionAffinity === currentSectionId) {
				mol.opacity = 0.8;
				mol.pulsating = true;
			} else {
				mol.opacity = 0.2;
				mol.pulsating = false;
			}
		});
		molecules = molecules; // Trigger reactivity
	}

	function handleMoleculeClick(molecule: Molecule, event: MouseEvent) {
		const rect = container.getBoundingClientRect();
		tooltip = {
			molecule,
			x: event.clientX - rect.left,
			y: event.clientY - rect.top,
			visible: true
		};
	}

	function handleMoleculeHover(molecule: Molecule) {
		// Enhance connected molecules
		molecules.forEach((mol) => {
			if (molecule.connections.includes(mol.id) || mol.connections.includes(molecule.id)) {
				mol.opacity = Math.max(mol.opacity, 0.6);
			}
		});
		molecules = molecules;
	}

	function handleMoleculeLeave() {
		updateMoleculeVisibility();
	}

	function closeTooltip() {
		tooltip = null;
	}

	function handleResize() {
		if (container) {
			width = container.clientWidth;
			height = container.clientHeight;
			createMolecules();
		}
	}

	$: if (currentSectionId) {
		updateMoleculeVisibility();
	}

	onMount(() => {
		handleResize();
		window.addEventListener('resize', handleResize);

		return () => {
			if (typeof window !== 'undefined') {
				window.removeEventListener('resize', handleResize);
			}
		};
	});
</script>

<div
	bind:this={container}
	class="interactive-molecules"
	on:click={closeTooltip}
	on:keydown={closeTooltip}
	role="button"
	tabindex="0"
>
	{#each molecules as molecule (molecule.id)}
		<div
			class="molecule"
			class:pulsating={molecule.pulsating}
			style="
        left: {molecule.x}px;
        top: {molecule.y}px;
        width: {molecule.size * 2}px;
        height: {molecule.size * 2}px;
        background: {moleculeColors[molecule.type]};
        opacity: {molecule.opacity};
      "
			on:click|stopPropagation={(e) => handleMoleculeClick(molecule, e)}
			on:mouseenter={() => handleMoleculeHover(molecule)}
			on:mouseleave={handleMoleculeLeave}
			on:keydown={(e) => e.key === 'Enter' && handleMoleculeClick(molecule, e)}
			role="button"
			tabindex="0"
			aria-label={`${molecule.name} - ${molecule.type}`}
			transition:scale={{ duration: 300, delay: Math.random() * 1000 }}
		>
			<div class="molecule-inner"></div>
		</div>
	{/each}

	{#if tooltip}
		<div
			class="tooltip"
			style="left: {tooltip.x}px; top: {tooltip.y}px;"
			transition:fade={{ duration: 200 }}
			on:click|stopPropagation
			on:keydown|stopPropagation
			role="tooltip"
		>
			<div class="tooltip-header">
				<h3>{tooltip.molecule.name}</h3>
				<span class="molecule-type">{tooltip.molecule.type}</span>
			</div>
			<p>{tooltip.molecule.description}</p>
			{#if tooltip.molecule.connections.length > 0}
				<div class="connections">
					<strong>Connected to:</strong>
					<ul>
						{#each tooltip.molecule.connections as connectionId (connectionId)}
							{@const connectedMol = molecules.find((m) => m.id === connectionId)}
							{#if connectedMol}
								<li>{connectedMol.name}</li>
							{/if}
						{/each}
					</ul>
				</div>
			{/if}
			<button class="close-tooltip" on:click={closeTooltip}>×</button>
		</div>
	{/if}
</div>

<style>
	.interactive-molecules {
		position: fixed;
		inset: 0;
		z-index: 3;
		pointer-events: none;
	}

	.molecule {
		position: absolute;
		border-radius: 50%;
		cursor: pointer;
		pointer-events: auto;
		transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
		display: flex;
		align-items: center;
		justify-content: center;
		box-shadow: 0 0 20px rgba(255, 255, 255, 0.1);
	}

	.molecule:hover {
		transform: scale(1.2);
		box-shadow: 0 0 30px rgba(255, 255, 255, 0.3);
	}

	.molecule.pulsating {
		animation: pulse 2s ease-in-out infinite;
	}

	.molecule-inner {
		width: 60%;
		height: 60%;
		border-radius: 50%;
		background: rgba(255, 255, 255, 0.3);
		box-shadow: inset 0 0 10px rgba(255, 255, 255, 0.2);
	}

	.tooltip {
		position: absolute;
		background: rgba(26, 27, 47, 0.95);
		border: 1px solid rgba(128, 255, 219, 0.3);
		border-radius: 8px;
		padding: 1rem;
		max-width: 300px;
		backdrop-filter: blur(10px);
		box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
		z-index: 10;
		pointer-events: auto;
		transform: translate(-50%, -100%);
		margin-top: -10px;
	}

	.tooltip-header {
		display: flex;
		justify-content: space-between;
		align-items: flex-start;
		margin-bottom: 0.5rem;
		gap: 0.5rem;
	}

	.tooltip h3 {
		margin: 0;
		color: var(--aeon-biolum);
		font-size: 1rem;
		font-weight: 600;
		line-height: 1.2;
	}

	.molecule-type {
		background: var(--aeon-primary);
		color: var(--aeon-deep-space);
		padding: 0.2rem 0.5rem;
		border-radius: 4px;
		font-size: 0.75rem;
		font-weight: 500;
		text-transform: uppercase;
		white-space: nowrap;
	}

	.tooltip p {
		margin: 0 0 1rem 0;
		color: rgba(255, 255, 255, 0.9);
		font-size: 0.9rem;
		line-height: 1.4;
	}

	.connections {
		margin-top: 1rem;
	}

	.connections strong {
		color: var(--aeon-primary);
		font-size: 0.85rem;
	}

	.connections ul {
		margin: 0.5rem 0 0 0;
		padding-left: 1rem;
		list-style: none;
	}

	.connections li {
		color: rgba(255, 255, 255, 0.8);
		font-size: 0.8rem;
		margin-bottom: 0.2rem;
		position: relative;
	}

	.connections li::before {
		content: '→';
		position: absolute;
		left: -1rem;
		color: var(--aeon-biolum);
	}

	.close-tooltip {
		position: absolute;
		top: 0.5rem;
		right: 0.5rem;
		background: none;
		border: none;
		color: rgba(255, 255, 255, 0.6);
		font-size: 1.2rem;
		cursor: pointer;
		padding: 0;
		width: 20px;
		height: 20px;
		display: flex;
		align-items: center;
		justify-content: center;
		border-radius: 50%;
		transition: all 0.2s ease;
	}

	.close-tooltip:hover {
		background: rgba(255, 255, 255, 0.1);
		color: white;
	}

	@keyframes pulse {
		0%,
		100% {
			transform: scale(1);
			box-shadow: 0 0 20px rgba(255, 255, 255, 0.1);
		}
		50% {
			transform: scale(1.05);
			box-shadow: 0 0 30px rgba(255, 255, 255, 0.2);
		}
	}

	@media (max-width: 768px) {
		.tooltip {
			max-width: 250px;
			font-size: 0.9rem;
		}

		.molecule {
			transform: scale(0.8);
		}

		.molecule:hover {
			transform: scale(1);
		}
	}
</style>
