<script lang="ts">
	import { createEventDispatcher, onMount, onDestroy } from 'svelte';
	import { spring } from 'svelte/motion';

	const dispatch = createEventDispatcher();
	let container: HTMLElement;
	let mousePosition = { x: 50, y: 50 };
	let molecularGlowIntensity = 0;

	// Spring for smooth molecular glow transitions
	const glowSpring = spring(0, {
		stiffness: 0.08,
		damping: 0.7
	});

	$: glowSpring.set(molecularGlowIntensity);

	function handleMouseMove(e: MouseEvent) {
		const rect = container.getBoundingClientRect();
		mousePosition = {
			x: ((e.clientX - rect.left) / rect.width) * 100,
			y: ((e.clientY - rect.top) / rect.height) * 100
		};
	}

	function handleMouseEnter() {
		dispatch('hover', { element: container });
	}

	function handleMouseLeave() {
		dispatch('leave');
	}

	// Handle section animation events for molecular glow
	function handleSectionActivated(event: Event) {
		const customEvent = event as CustomEvent;
		const { backgroundEffect } = customEvent.detail;

		if (backgroundEffect === 'molecular-glow') {
			// Create pulsing molecular glow effect
			molecularGlowIntensity = 1.0;

			// Create breathing effect
			const pulseInterval = setInterval(() => {
				molecularGlowIntensity = 0.3 + Math.sin(Date.now() * 0.003) * 0.2;
			}, 50);

			// Clean up after animation completes
			setTimeout(() => {
				clearInterval(pulseInterval);
				molecularGlowIntensity = 0;
			}, 2000);
		}
	}

	function handleSectionDeactivated(event: Event) {
		const customEvent = event as CustomEvent;
		const { backgroundEffect } = customEvent.detail;
		if (backgroundEffect === 'molecular-glow') {
			molecularGlowIntensity = 0;
		}
	}

	onMount(() => {
		window.addEventListener('section-activated', handleSectionActivated as EventListener);
		window.addEventListener('section-deactivated', handleSectionDeactivated as EventListener);
	});

	onDestroy(() => {
		if (typeof window !== 'undefined') {
			window.removeEventListener('section-activated', handleSectionActivated as EventListener);
			window.removeEventListener('section-deactivated', handleSectionDeactivated as EventListener);
		}
	});
</script>

<div
	role="group"
	bind:this={container}
	class="molecular-container"
	on:mouseenter={handleMouseEnter}
	on:mouseleave={handleMouseLeave}
	on:mousemove={handleMouseMove}
	style="
    --mouse-x: {mousePosition.x}%;
    --mouse-y: {mousePosition.y}%;
    --molecular-glow: {$glowSpring};
  "
>
	<div class="glow-effect"></div>
	<div class="content">
		<slot />
	</div>
</div>

<style>
	.molecular-container {
		position: relative;
		border-radius: 1.5rem;
		background: var(--aeon-surface-1);
		backdrop-filter: blur(20px);
		transition: all 0.6s cubic-bezier(0.16, 1, 0.3, 1);
		padding: 3rem;
		box-shadow:
			0 0 0 1px rgba(76, 201, 240, calc(0.1 + var(--molecular-glow) * 0.3)),
			0 4px 20px rgba(0, 0, 0, 0.4),
			0 0 60px rgba(76, 201, 240, calc(0.1 + var(--molecular-glow) * 0.4)),
			0 0 120px rgba(128, 255, 219, calc(var(--molecular-glow) * 0.3));
	}

	.molecular-container::before {
		content: '';
		position: absolute;
		inset: -1px;
		border-radius: inherit;
		padding: 1px;
		background: linear-gradient(45deg, rgba(76, 201, 240, 0.1), rgba(128, 255, 219, 0.1));
		mask:
			linear-gradient(#fff 0 0) content-box,
			linear-gradient(#fff 0 0);
		-webkit-mask-composite: xor;
		mask-composite: exclude;
		pointer-events: none;
	}

	.glow-effect {
		position: absolute;
		inset: 0;
		border-radius: inherit;
		background: radial-gradient(
			1000px circle at var(--mouse-x) var(--mouse-y),
			rgba(128, 255, 219, 0.06),
			transparent 40%
		);
		opacity: 0;
		transition: opacity 0.3s ease-out;
		transform: translateZ(0);
		will-change: opacity;
	}

	.molecular-container:hover .glow-effect {
		opacity: 1;
	}

	.content {
		position: relative;
		z-index: 1;
	}
</style>
