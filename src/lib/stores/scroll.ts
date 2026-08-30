import { derived, readable } from 'svelte/store';
import { browser } from '$app/environment';

interface ScrollPosition {
	y: number;
	velocity: number;
	direction: 'up' | 'down' | 'static';
	normalizedProgress: number; // 0-1 based on document height
}

const initialPosition: ScrollPosition = {
	y: 0,
	velocity: 0,
	direction: 'static',
	normalizedProgress: 0
};

// Performance-optimized scroll tracking
export const scrollTracker = readable(initialPosition, (set) => {
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

export const scrollProgress = derived(scrollTracker, ($position) => $position.normalizedProgress);
