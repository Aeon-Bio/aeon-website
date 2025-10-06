/**
 * Animation utilities for Aeon Bio landing page
 * Implements scroll-triggered section reveals and sophisticated interaction patterns
 */

import { writable, type Writable } from 'svelte/store';

// Motion preference detection
export const prefersReducedMotion = writable(false);

// Global animation store to coordinate system-wide effects
export const animationState = writable({
	activeSection: '',
	scrollVelocity: 0,
	sectionTransitions: new Map<string, boolean>()
});

// Easing functions for physics-based animations
export const easings = {
	// Smooth bounce for element reveals
	easeOutElastic: (t: number): number => {
		const c4 = (2 * Math.PI) / 3;
		return t === 0 ? 0 : t === 1 ? 1 : 
			Math.pow(2, -10 * t) * Math.sin((t * 10 - 0.75) * c4) + 1;
	},
	
	// Smooth overshoot for scale animations
	easeOutBack: (t: number): number => {
		const c1 = 1.70158;
		const c3 = c1 + 1;
		return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2);
	},
	
	// Fluid motion for slide animations
	easeOutCubic: (t: number): number => {
		return 1 - Math.pow(1 - t, 3);
	},
	
	// Subtle entrance animation
	easeOutQuart: (t: number): number => {
		return 1 - Math.pow(1 - t, 4);
	}
};

// Custom animation duration calculator based on content complexity
export function calculateDuration(elementType: 'text' | 'card' | 'visualization' | 'hero'): number {
	const baseDurations = {
		text: 600,
		card: 800,
		visualization: 1200,
		hero: 1000
	};
	return baseDurations[elementType];
}

// Stagger delay calculator for sequential reveals
export function calculateStagger(index: number, baseDelay: number = 100): number {
	return index * baseDelay;
}

/**
 * Enhanced Intersection Observer setup extending FactorGraph implementation
 * Supports multiple thresholds and sophisticated visibility detection
 */
export interface IntersectionConfig {
	threshold?: number | number[];
	rootMargin?: string;
	triggerOnce?: boolean;
	onIntersect?: (entry: IntersectionObserverEntry) => void;
	onExit?: (entry: IntersectionObserverEntry) => void;
}

export function createIntersectionObserver(
	element: HTMLElement,
	config: IntersectionConfig = {}
): () => void {
	const {
		threshold = 0.1,
		rootMargin = '-10% 0px -10% 0px',
		triggerOnce = false,
		onIntersect,
		onExit
	} = config;

	let hasTriggered = false;

	const observer = new IntersectionObserver(
		(entries) => {
			entries.forEach(entry => {
				if (entry.isIntersecting) {
					if (!hasTriggered || !triggerOnce) {
						onIntersect?.(entry);
						if (triggerOnce) hasTriggered = true;
					}
				} else if (!triggerOnce) {
					onExit?.(entry);
				}
			});
		},
		{ threshold, rootMargin }
	);

	observer.observe(element);
	return () => observer.disconnect();
}

/**
 * Staggered reveal animation system
 * Creates cascading animations with configurable timing and effects
 */
export interface StaggeredRevealConfig {
	elements: HTMLElement[];
	staggerDelay?: number;
	animation: 'fadeIn' | 'slideUp' | 'slideLeft' | 'slideRight' | 'scaleUp';
	duration?: number;
	easing?: keyof typeof easings;
	startDelay?: number;
}

export function createStaggeredReveal(config: StaggeredRevealConfig): Promise<void> {
	const {
		elements,
		staggerDelay = 100,
		animation,
		duration = 600,
		easing = 'easeOutQuart',
		startDelay = 0
	} = config;

	return new Promise((resolve) => {
		const promises: Promise<void>[] = [];

		elements.forEach((element, index) => {
			const delay = startDelay + calculateStagger(index, staggerDelay);
			
			const promise = animateElement(element, {
				type: animation,
				duration,
				delay,
				easing: easings[easing]
			});
			
			promises.push(promise);
		});

		Promise.all(promises).then(() => resolve());
	});
}

/**
 * Individual element animation system
 * Supports various animation types with CSS transforms and opacity
 */
export interface ElementAnimationConfig {
	type: 'fadeIn' | 'slideUp' | 'slideLeft' | 'slideRight' | 'scaleUp';
	duration: number;
	delay?: number;
	easing?: (t: number) => number;
	onComplete?: () => void;
}

export function animateElement(
	element: HTMLElement,
	config: ElementAnimationConfig
): Promise<void> {
	const { type, duration, delay = 0, easing = easings.easeOutQuart, onComplete } = config;

	return new Promise((resolve) => {
		// Apply initial state
		applyInitialState(element, type);

		setTimeout(() => {
			const startTime = performance.now();
			
			function animate(currentTime: number) {
				const elapsed = currentTime - startTime;
				const progress = Math.min(elapsed / duration, 1);
				const easedProgress = easing(progress);

				applyAnimationState(element, type, easedProgress);

				if (progress < 1) {
					requestAnimationFrame(animate);
				} else {
					onComplete?.();
					resolve();
				}
			}

			requestAnimationFrame(animate);
		}, delay);
	});
}

function applyInitialState(element: HTMLElement, type: string): void {
	element.style.transition = 'none';
	
	switch (type) {
		case 'fadeIn':
			element.style.opacity = '0';
			break;
		case 'slideUp':
			element.style.opacity = '0';
			element.style.transform = 'translateY(30px)';
			break;
		case 'slideLeft':
			element.style.opacity = '0';
			element.style.transform = 'translateX(-30px)';
			break;
		case 'slideRight':
			element.style.opacity = '0';
			element.style.transform = 'translateX(30px)';
			break;
		case 'scaleUp':
			element.style.opacity = '0';
			element.style.transform = 'scale(0.8)';
			break;
	}
}

function applyAnimationState(element: HTMLElement, type: string, progress: number): void {
	const opacity = progress;
	
	switch (type) {
		case 'fadeIn':
			element.style.opacity = opacity.toString();
			break;
		case 'slideUp':
			element.style.opacity = opacity.toString();
			element.style.transform = `translateY(${30 * (1 - progress)}px)`;
			break;
		case 'slideLeft':
			element.style.opacity = opacity.toString();
			element.style.transform = `translateX(${-30 * (1 - progress)}px)`;
			break;
		case 'slideRight':
			element.style.opacity = opacity.toString();
			element.style.transform = `translateX(${30 * (1 - progress)}px)`;
			break;
		case 'scaleUp':
			element.style.opacity = opacity.toString();
			element.style.transform = `scale(${0.8 + (0.2 * progress)})`;
			break;
	}
}

/**
 * Scroll velocity tracker for background particle system
 * Calculates scroll velocity and direction for responsive visual effects
 */
export class ScrollVelocityTracker {
	private lastScrollY = 0;
	private lastTimestamp = 0;
	private velocity = 0;
	private rafId?: number;
	
	public onVelocityChange?: (velocity: number, direction: 'up' | 'down' | 'none') => void;

	constructor() {
		this.handleScroll = this.handleScroll.bind(this);
		this.update = this.update.bind(this);
	}

	start(): void {
		window.addEventListener('scroll', this.handleScroll, { passive: true });
		this.lastScrollY = window.scrollY;
		this.lastTimestamp = performance.now();
		this.update();
	}

	stop(): void {
		window.removeEventListener('scroll', this.handleScroll);
		if (this.rafId) {
			cancelAnimationFrame(this.rafId);
		}
	}

	private handleScroll(): void {
		const currentTime = performance.now();
		const currentScrollY = window.scrollY;
		const deltaY = currentScrollY - this.lastScrollY;
		const deltaTime = currentTime - this.lastTimestamp;

		if (deltaTime > 0) {
			this.velocity = deltaY / deltaTime;
		}

		this.lastScrollY = currentScrollY;
		this.lastTimestamp = currentTime;
	}

	private update(): void {
		// Decay velocity when not scrolling
		this.velocity *= 0.95;

		const direction = this.velocity > 0.1 ? 'down' : 
						 this.velocity < -0.1 ? 'up' : 'none';

		this.onVelocityChange?.(this.velocity, direction);

		// Update animation state store
		animationState.update(state => ({
			...state,
			scrollVelocity: this.velocity
		}));

		this.rafId = requestAnimationFrame(this.update);
	}

	getVelocity(): number {
		return this.velocity;
	}
}

/**
 * Section boundary detector for coordinating background effects
 * Tracks which section is currently active and manages section transitions
 */
export class SectionBoundaryDetector {
	private sections: Map<string, HTMLElement> = new Map();
	private observers: IntersectionObserver[] = [];
	private currentSection = '';

	public onSectionChange?: (sectionId: string, previousSection: string) => void;

	addSection(id: string, element: HTMLElement): void {
		this.sections.set(id, element);
		this.createObserver(id, element);
	}

	private createObserver(id: string, element: HTMLElement): void {
		const observer = new IntersectionObserver(
			(entries) => {
				entries.forEach(entry => {
					if (entry.isIntersecting && entry.intersectionRatio > 0.3) {
						const previousSection = this.currentSection;
						this.currentSection = id;
						
						// Update animation state
						animationState.update(state => ({
							...state,
							activeSection: id,
							sectionTransitions: new Map(state.sectionTransitions).set(id, true)
						}));

						this.onSectionChange?.(id, previousSection);
					}
				});
			},
			{
				threshold: [0.1, 0.3, 0.5, 0.7],
				rootMargin: '-20% 0px -20% 0px'
			}
		);

		observer.observe(element);
		this.observers.push(observer);
	}

	getCurrentSection(): string {
		return this.currentSection;
	}

	destroy(): void {
		this.observers.forEach(observer => observer.disconnect());
		this.observers = [];
		this.sections.clear();
	}
}

/**
 * Initialize motion preferences detection
 * Sets up media query listener for prefers-reduced-motion
 */
export function initMotionPreferences(): () => void {
	const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
	
	function updatePreference() {
		prefersReducedMotion.set(mediaQuery.matches);
	}

	updatePreference();
	mediaQuery.addEventListener('change', updatePreference);

	return () => {
		mediaQuery.removeEventListener('change', updatePreference);
	};
}

/**
 * Respect motion preferences in animations
 * Returns modified duration and easing for reduced motion
 */
export function respectMotionPreferences(
	duration: number,
	easing: (t: number) => number,
	reducedMotion: boolean
): { duration: number; easing: (t: number) => number } {
	if (reducedMotion) {
		return {
			duration: Math.min(duration * 0.3, 200), // Much faster
			easing: (t: number) => t // Linear, no complex physics
		};
	}
	return { duration, easing };
}

/**
 * Create a coordinated animation controller for the entire page
 * Manages scroll tracking, section detection, and background coordination
 */
export class PageAnimationController {
	private scrollTracker: ScrollVelocityTracker;
	private sectionDetector: SectionBoundaryDetector;
	private motionCleanup?: () => void;

	constructor() {
		this.scrollTracker = new ScrollVelocityTracker();
		this.sectionDetector = new SectionBoundaryDetector();

		// Initialize motion preferences
		this.motionCleanup = initMotionPreferences();

		// Coordinate scroll velocity with background effects
		this.scrollTracker.onVelocityChange = (velocity, direction) => {
			// This will be used by particle system and grid effects
			document.documentElement.style.setProperty('--scroll-velocity', velocity.toString());
			document.documentElement.style.setProperty('--scroll-direction', direction);
		};

		// Coordinate section changes with background effects
		this.sectionDetector.onSectionChange = (sectionId, previousSection) => {
			// Trigger section-specific background effects
			document.documentElement.style.setProperty('--active-section', sectionId);
			
			// Emit custom event for other components to listen to
			window.dispatchEvent(new CustomEvent('section-change', {
				detail: { current: sectionId, previous: previousSection }
			}));
		};
	}

	start(): void {
		this.scrollTracker.start();
	}

	addSection(id: string, element: HTMLElement): void {
		this.sectionDetector.addSection(id, element);
	}

	destroy(): void {
		this.scrollTracker.stop();
		this.sectionDetector.destroy();
		this.motionCleanup?.();
	}
}