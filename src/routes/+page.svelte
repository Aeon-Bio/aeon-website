<script lang="ts">
	import GridSystem from '$lib/components/GridSystem.svelte';
	import ParticleField from '$lib/components/ParticleField.svelte';
	import MolecularContainer from '$lib/components/MolecularContainer.svelte';
	import { interactionState } from '$lib/stores/interaction';
	import AeonLogo from '$lib/images/AeonLogo.svelte';
	import { onMount } from 'svelte';
	import { fade } from 'svelte/transition';
	import ViewportGradient from '$lib/components/ViewportGradient.svelte';


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

	onMount(() => {
		window.addEventListener('resize', handleResize);
		return () => window.removeEventListener('resize', handleResize);
	});
</script>

<div class="background-layer">
	<GridSystem />
	{#if shouldRenderParticles}
		<div transition:fade={{duration: 300}}>
			<ParticleField />
		</div>
	{/if}
	<ViewportGradient />
</div>

<main class="hero" style="pointer-events: none;">
	<div class="container-wrapper" style="pointer-events: all;">
		<MolecularContainer 
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
	</div>
</main>

<style>
	.background-layer {
		position: fixed;
		inset: 0;
		z-index: -1;
	}
	
	.hero {
		height: 100vh;
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
		margin: 0 auto;
	}
	
	h1 {
		font-size: clamp(1.5rem, 4vw, 2.5rem);
		margin: clamp(1rem, 2vh, 2rem) 0 clamp(0.5rem, 1vh, 1rem);
		background: linear-gradient(
			to top,
			var(--aeon-primary),
			var(--aeon-biolum)
		);
		-webkit-background-clip: text;
		background-clip: text;
		color: transparent;
		text-align: center;
	}
	
	.tagline {
		font-size: clamp(0.9rem, 2vw, 1.2rem);
		text-align: center;
		color: rgba(255, 255, 255, 0.8);
		line-height: 1.6;
	}
</style>
