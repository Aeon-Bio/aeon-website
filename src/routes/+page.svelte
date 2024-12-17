<script lang="ts">
	import GridSystem from '$lib/components/GridSystem.svelte';
	import ParticleField from '$lib/components/ParticleField.svelte';
	import EnergyFlow from '$lib/components/EnergyFlow.svelte';
	import MolecularContainer from '$lib/components/MolecularContainer.svelte';
	import { interactionState } from '$lib/stores/interaction';
	import AeonLogo from '$lib/images/AeonLogo.svelte';
	
	const molecularProps = {
		scale: 1,
		intensity: 0.5,
		interaction: 'attract'
	};

	function handleContainerHover(event: CustomEvent) {
		const element = event.detail.element;
		interactionState.update(state => ({
			...state,
			hoveredElement: element,
			systemActivity: 0.8
		}));
	}

	function handleContainerLeave() {
		interactionState.update(state => ({
			...state,
			hoveredElement: null,
			systemActivity: 0
		}));
	}
</script>

<GridSystem />
<ParticleField />
<EnergyFlow />

<main class="hero">
	<MolecularContainer 
		props={molecularProps}
		on:hover={handleContainerHover}
		on:leave={handleContainerLeave}
	>
		<div class="logo-container">
			<AeonLogo />
		</div>
		<h1>Aeon Biosciences</h1>
		<p class="tagline">
			Mapping biomolecules beyond foundation models,
			<br />
			for the future of medicine & longevity.
		</p>
	</MolecularContainer>
</main>

<style>
	.hero {
		min-height: 100vh;
		display: grid;
		place-items: center;
		padding: 1rem;
	}
	
	.logo-container {
		width: 300px;
		height: 300px;
		margin: 0 auto;
	}
	
	h1 {
		font-size: 2.5rem;
		margin: 2rem 0 1rem;
		background: linear-gradient(
			to right,
			var(--aeon-primary),
			var(--aeon-biolum)
		);
		-webkit-background-clip: text;
		color: transparent;
		text-align: center;
	}
	
	.tagline {
		font-size: 1.2rem;
		text-align: center;
		color: rgba(255, 255, 255, 0.8);
		line-height: 1.6;
	}
</style>
