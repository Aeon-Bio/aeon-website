<!--
  SectionReveal Component
  
  Provides sophisticated scroll-triggered animations for landing page sections.
  Extends the Intersection Observer pattern from FactorGraph.svelte with enhanced
  timing, easing, and coordination capabilities.
  
  Features:
  - Staggered child element reveals with configurable timing
  - Physics-based easing functions for natural motion
  - Background effect coordination via CSS custom properties
  - Accessibility support for prefers-reduced-motion
  - Performance-optimized animation scheduling
-->

<script lang="ts">
	import { onMount, onDestroy } from 'svelte';
	import { fade } from 'svelte/transition';
	import {
		createIntersectionObserver,
		createStaggeredReveal,
		PageAnimationController,
		prefersReducedMotion,
		respectMotionPreferences,
		type StaggeredRevealConfig
	} from '$lib/utils/animations';

	// Animation configuration props
	export let sectionId: string;
	export let threshold = 0.1;
	export let rootMargin = '-10% 0px -10% 0px';
	export let triggerOnce = true;
	export let staggerDelay = 100;
	export let animationType: 'fadeIn' | 'slideUp' | 'slideLeft' | 'slideRight' | 'scaleUp' =
		'fadeIn';
	export let duration = 600;
	export let startDelay = 0;
	export let childSelector = '.reveal-item';

	// Coordinate with background systems
	export let backgroundEffect: 'none' | 'particle-drift' | 'grid-pulse' | 'molecular-glow' = 'none';

	// Hero/critical content support
	export let initiallyVisible = false;

	// Component state
	let sectionElement: HTMLElement;
	let isVisible = false;
	let hasAnimated = false;
	let observerCleanup: (() => void) | null = null;
	let animationController: PageAnimationController | null = null;

	// Track motion preferences
	let reducedMotion = false;
	let motionUnsubscribe: (() => void) | null = null;

	/**
	 * Initialize section reveal when component mounts
	 */
	onMount(() => {
		// Subscribe to motion preferences
		motionUnsubscribe = prefersReducedMotion.subscribe((value) => {
			reducedMotion = value;
		});

		// Handle initially visible content (like hero)
		if (initiallyVisible) {
			isVisible = true;
			hasAnimated = true;
		}

		// Initialize animation controller for this section
		animationController = new PageAnimationController();
		animationController.start();

		// Set up intersection observer with enhanced configuration
		observerCleanup = createIntersectionObserver(sectionElement, {
			threshold,
			rootMargin,
			triggerOnce,
			onIntersect: handleIntersection,
			onExit: handleExit
		});

		// Register this section with the animation controller
		animationController.addSection(sectionId, sectionElement);

		// Apply initial CSS custom properties for background coordination
		updateBackgroundProperties();
	});

	/**
	 * Clean up observers and controllers when component unmounts
	 */
	onDestroy(() => {
		observerCleanup?.();
		animationController?.destroy();
		motionUnsubscribe?.();
	});

	/**
	 * Handle intersection - trigger sophisticated reveal animation
	 */
	async function handleIntersection() {
		if (hasAnimated && triggerOnce) return;

		isVisible = true;
		hasAnimated = true;

		// Update section state for background coordination
		updateBackgroundProperties();

		// Emit section activation event
		window.dispatchEvent(
			new CustomEvent('section-activated', {
				detail: {
					sectionId,
					element: sectionElement,
					backgroundEffect
				}
			})
		);

		// Get child elements for staggered animation
		const childElements = Array.from(
			sectionElement.querySelectorAll(childSelector)
		) as HTMLElement[];

		if (childElements.length === 0) {
			console.warn(
				`SectionReveal: No elements found with selector "${childSelector}" in section "${sectionId}"`
			);
			return;
		}

		// Respect motion preferences for timing and easing
		const { duration: adjustedDuration } = respectMotionPreferences(
			duration,
			(t: number) => t, // Easing will be handled by the animation utility
			reducedMotion
		);

		// Configure staggered reveal animation
		const revealConfig: StaggeredRevealConfig = {
			elements: childElements,
			staggerDelay: reducedMotion ? 0 : staggerDelay, // No stagger for reduced motion
			animation: animationType,
			duration: adjustedDuration,
			easing: reducedMotion ? 'easeOutQuart' : 'easeOutBack',
			startDelay
		};

		try {
			await createStaggeredReveal(revealConfig);

			// Animation complete - emit completion event
			window.dispatchEvent(
				new CustomEvent('section-animation-complete', {
					detail: { sectionId, backgroundEffect }
				})
			);
		} catch (error) {
			console.error(`SectionReveal: Animation failed for section "${sectionId}":`, error);
		}
	}

	/**
	 * Handle intersection exit - manage background state
	 */
	function handleExit() {
		isVisible = false;
		updateBackgroundProperties();

		window.dispatchEvent(
			new CustomEvent('section-deactivated', {
				detail: { sectionId, backgroundEffect }
			})
		);
	}

	/**
	 * Update CSS custom properties for background effect coordination
	 */
	function updateBackgroundProperties() {
		if (!sectionElement) return;

		// Set section-specific background properties
		sectionElement.style.setProperty('--section-visible', isVisible ? '1' : '0');
		sectionElement.style.setProperty('--section-animated', hasAnimated ? '1' : '0');
		sectionElement.style.setProperty('--background-effect', backgroundEffect);

		// Global coordination properties
		document.documentElement.style.setProperty(`--${sectionId}-visible`, isVisible ? '1' : '0');
		document.documentElement.style.setProperty(`--${sectionId}-animated`, hasAnimated ? '1' : '0');
	}

	/**
	 * Manual trigger for programmatic animation
	 */
	export function triggerAnimation() {
		if (!hasAnimated) {
			handleIntersection();
		}
	}

	/**
	 * Reset animation state (useful for development/testing)
	 */
	export function resetAnimation() {
		hasAnimated = false;
		isVisible = false;
		updateBackgroundProperties();

		// Reset child element styles
		const childElements = sectionElement.querySelectorAll(childSelector);
		childElements.forEach((element) => {
			const el = element as HTMLElement;
			el.style.opacity = '0';
			el.style.transform = '';
		});
	}
</script>

<!-- 
  Section container with reveal animation coordination
  The slot content will be animated based on the configured parameters
-->
<section
	bind:this={sectionElement}
	class="section-reveal"
	class:visible={isVisible}
	class:animated={hasAnimated}
	data-section-id={sectionId}
	data-background-effect={backgroundEffect}
>
	{#if isVisible || !triggerOnce}
		<div
			class="section-content"
			transition:fade={{ duration: reducedMotion ? 100 : 300, delay: 0 }}
		>
			<slot />
		</div>
	{:else}
		<!-- Placeholder to maintain layout during initial load -->
		<div class="section-placeholder">
			<slot />
		</div>
	{/if}
</section>

<style>
	.section-reveal {
		/* Base section styles */
		position: relative;
		transition: opacity 0.3s ease;

		/* CSS custom properties for background coordination */
		--section-animation-progress: 0;
		--section-visibility: 0;
	}

	.section-reveal.visible {
		--section-visibility: 1;
	}

	.section-reveal.animated {
		--section-animation-progress: 1;
	}

	.section-content {
		/* Ensure content is ready for animation */
		position: relative;
	}

	.section-placeholder {
		/* Maintain layout space while hidden */
		opacity: 0;
		pointer-events: none;
	}

	/* Global reveal item base styles */
	:global(.reveal-item) {
		/* Items start hidden and will be animated by the reveal system */
		opacity: 0;
		transition: none; /* Disable CSS transitions to avoid conflicts */
	}

	/* Enhanced reveal items for specific animation types */
	:global(.reveal-item.slide-up) {
		transform: translateY(30px);
	}

	:global(.reveal-item.slide-left) {
		transform: translateX(-30px);
	}

	:global(.reveal-item.slide-right) {
		transform: translateX(30px);
	}

	:global(.reveal-item.scale-up) {
		transform: scale(0.8);
	}

	/* Respect reduced motion preferences */
	@media (prefers-reduced-motion: reduce) {
		.section-reveal {
			transition: opacity 0.1s ease;
		}

		:global(.reveal-item) {
			/* Ensure no transforms in reduced motion mode */
			transform: none !important;
			/* Instantly show content without animation */
			opacity: 1 !important;
		}

		/* Disable all spring and transition effects */
		* {
			transition-duration: 0.01s !important;
			animation-duration: 0.01s !important;
		}
	}

	/* Background coordination utilities */
	.section-reveal[data-background-effect='particle-drift'] {
		/* Signal to particle system for drift effects */
		--particle-drift-intensity: var(--section-visibility);
	}

	.section-reveal[data-background-effect='grid-pulse'] {
		/* Signal to grid system for pulse effects */
		--grid-pulse-intensity: var(--section-animation-progress);
	}

	.section-reveal[data-background-effect='molecular-glow'] {
		/* Signal to molecular system for glow effects */
		--molecular-glow-intensity: var(--section-visibility);
	}
</style>
