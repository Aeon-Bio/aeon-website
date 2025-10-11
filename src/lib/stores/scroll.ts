import { writable, derived, readable } from 'svelte/store';
import { browser } from '$app/environment';

interface ScrollPosition {
	y: number;
	velocity: number;
	direction: 'up' | 'down' | 'static';
	normalizedProgress: number; // 0-1 based on document height
}

interface SectionInfo {
	id: string;
	name: string;
	element: HTMLElement | null;
	bounds: DOMRect | null;
	inView: boolean;
	progress: number; // 0-1 how far through this section
}

interface ScrollState {
	position: ScrollPosition;
	sections: SectionInfo[];
	currentSection: string | null;
	previousSection: string | null;
	transitionProgress: number; // 0-1 transition between sections
}

const initialState: ScrollState = {
	position: {
		y: 0,
		velocity: 0,
		direction: 'static',
		normalizedProgress: 0
	},
	sections: [],
	currentSection: null,
	previousSection: null,
	transitionProgress: 0
};

export const scrollState = writable<ScrollState>(initialState);

// Performance-optimized scroll tracking
export const scrollTracker = readable(initialState.position, (set) => {
	if (!browser) return;

	let previousY = 0;
	let previousTime = Date.now();
	let rafId: number;
	let isThrottled = false;

	const updateScrollPosition = () => {
		const currentY = window.scrollY;
		const currentTime = Date.now();
		const deltaTime = currentTime - previousTime;
		const deltaY = currentY - previousY;

		// Calculate velocity (pixels per second)
		const velocity = deltaTime > 0 ? Math.abs(deltaY / deltaTime) * 1000 : 0;

		// Determine direction
		let direction: 'up' | 'down' | 'static' = 'static';
		if (deltaY > 0.5) direction = 'down';
		else if (deltaY < -0.5) direction = 'up';

		// Calculate normalized progress (0-1 through document)
		const documentHeight = document.documentElement.scrollHeight - window.innerHeight;
		const normalizedProgress =
			documentHeight > 0 ? Math.max(0, Math.min(1, currentY / documentHeight)) : 0;

		const position: ScrollPosition = {
			y: currentY,
			velocity: Math.min(velocity, 2000), // Cap velocity to prevent extreme values
			direction,
			normalizedProgress
		};

		set(position);

		previousY = currentY;
		previousTime = currentTime;
		isThrottled = false;
	};

	const throttledScroll = () => {
		if (!isThrottled) {
			isThrottled = true;
			rafId = requestAnimationFrame(updateScrollPosition);
		}
	};

	// Initialize with current position
	updateScrollPosition();

	window.addEventListener('scroll', throttledScroll, { passive: true });

	return () => {
		window.removeEventListener('scroll', throttledScroll);
		if (rafId) cancelAnimationFrame(rafId);
	};
});

// Section detection system
export const sectionManager = {
	registerSections: (sectionIds: string[]) => {
		if (!browser) return;

		const updateSections = () => {
			const sections: SectionInfo[] = sectionIds.map((id) => {
				const element = document.querySelector(`#${id}`) as HTMLElement;
				const bounds = element?.getBoundingClientRect() || null;

				let inView = false;
				let progress = 0;

				if (bounds && element) {
					const windowHeight = window.innerHeight;
					const elementTop = bounds.top + window.scrollY;
					const elementBottom = elementTop + bounds.height;
					const scrollY = window.scrollY;
					const viewportTop = scrollY;
					const viewportBottom = scrollY + windowHeight;

					// Check if section is in view (with some buffer)
					inView =
						elementBottom > viewportTop - windowHeight * 0.2 &&
						elementTop < viewportBottom + windowHeight * 0.2;

					// Calculate progress through section
					if (inView) {
						const visibleTop = Math.max(elementTop, viewportTop);
						const visibleBottom = Math.min(elementBottom, viewportBottom);
						const visibleHeight = Math.max(0, visibleBottom - visibleTop);
						progress = visibleHeight / bounds.height;
					}
				}

				return {
					id,
					name: id.replace('-section', '').replace('-', ' '),
					element,
					bounds,
					inView,
					progress: Math.max(0, Math.min(1, progress))
				};
			});

			// Determine current section (most visible)
			const visibleSections = sections.filter((s) => s.inView);
			let currentSection: string | null = null;
			let maxProgress = 0;

			visibleSections.forEach((section) => {
				if (section.progress > maxProgress) {
					maxProgress = section.progress;
					currentSection = section.id;
				}
			});

			scrollState.update((state) => {
				const previousSection = state.currentSection;

				// Calculate transition progress if switching sections
				let transitionProgress = 0;
				if (currentSection !== previousSection && currentSection) {
					const currentSectionInfo = sections.find((s) => s.id === currentSection);
					transitionProgress = currentSectionInfo?.progress || 0;
				}

				return {
					...state,
					sections,
					currentSection,
					previousSection:
						currentSection !== previousSection ? previousSection : state.previousSection,
					transitionProgress
				};
			});
		};

		// Initial setup
		updateSections();

		// Update on scroll with throttling
		let rafId: number;
		let isThrottled = false;

		const throttledUpdate = () => {
			if (!isThrottled) {
				isThrottled = true;
				rafId = requestAnimationFrame(() => {
					updateSections();
					isThrottled = false;
				});
			}
		};

		window.addEventListener('scroll', throttledUpdate, { passive: true });
		window.addEventListener('resize', updateSections, { passive: true });

		return () => {
			window.removeEventListener('scroll', throttledUpdate);
			window.removeEventListener('resize', updateSections);
			if (rafId) cancelAnimationFrame(rafId);
		};
	}
};

// Derived stores for specific use cases
export const scrollVelocity = derived(scrollTracker, ($position) => $position.velocity);

export const scrollDirection = derived(scrollTracker, ($position) => $position.direction);

export const scrollProgress = derived(scrollTracker, ($position) => $position.normalizedProgress);

export const currentSection = derived(scrollState, ($state) => $state.currentSection);

export const sectionTransition = derived(scrollState, ($state) => ({
	from: $state.previousSection,
	to: $state.currentSection,
	progress: $state.transitionProgress
}));

// Parallax helper functions
export const createParallaxValue = (
	baseValue: number,
	intensity: number = 0.5,
	scrollPosition: number
) => {
	return baseValue + scrollPosition * intensity;
};

export const createScrollBasedOpacity = (
	scrollProgress: number,
	fadeInStart: number = 0,
	fadeInEnd: number = 0.2,
	fadeOutStart: number = 0.8,
	fadeOutEnd: number = 1
) => {
	if (scrollProgress <= fadeInStart) return 0;
	if (scrollProgress <= fadeInEnd) {
		return (scrollProgress - fadeInStart) / (fadeInEnd - fadeInStart);
	}
	if (scrollProgress <= fadeOutStart) return 1;
	if (scrollProgress <= fadeOutEnd) {
		return 1 - (scrollProgress - fadeOutStart) / (fadeOutEnd - fadeOutStart);
	}
	return 0;
};
