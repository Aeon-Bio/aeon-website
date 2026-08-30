/**
 * use:progress — reports how far an element has travelled through the viewport,
 * 0 when its top reaches the bottom edge, 1 when its bottom leaves the top edge.
 * Cheap: one passive scroll listener, one rAF, only while near the viewport.
 */
export function progress(node: HTMLElement, onProgress: (p: number) => void) {
	if (typeof window === 'undefined') return;

	let raf = 0;
	let near = false;
	let last = -1;

	const compute = () => {
		raf = 0;
		const r = node.getBoundingClientRect();
		const vh = window.innerHeight;
		const p = Math.min(1, Math.max(0, (vh - r.top) / (vh + r.height)));
		if (Math.abs(p - last) > 0.002) {
			last = p;
			onProgress(p);
		}
	};

	const schedule = () => {
		if (!near || raf) return;
		raf = requestAnimationFrame(compute);
	};

	const io = new IntersectionObserver(
		([e]) => {
			near = e.isIntersecting;
			if (near) schedule();
		},
		{ rootMargin: '25% 0px 25% 0px' }
	);
	io.observe(node);

	window.addEventListener('scroll', schedule, { passive: true });
	window.addEventListener('resize', schedule, { passive: true });
	compute();

	return {
		update(fn: (p: number) => void) {
			onProgress = fn;
		},
		destroy() {
			io.disconnect();
			window.removeEventListener('scroll', schedule);
			window.removeEventListener('resize', schedule);
			if (raf) cancelAnimationFrame(raf);
		}
	};
}
