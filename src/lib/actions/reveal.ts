/**
 * use:reveal — one quiet entrance per element, once, when it enters the viewport.
 * Sets `data-revealed` on the node; CSS owns the motion. Respects reduced motion.
 */
export function reveal(node: HTMLElement, options: { threshold?: number; delay?: number } = {}) {
	const { threshold = 0.18, delay = 0 } = options;
	node.dataset.reveal = '';
	if (delay) node.style.setProperty('--reveal-delay', `${delay}ms`);

	if (typeof window === 'undefined') return;
	if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
		node.dataset.revealed = '';
		return;
	}

	const io = new IntersectionObserver(
		(entries) => {
			for (const e of entries) {
				if (e.isIntersecting) {
					node.dataset.revealed = '';
					io.disconnect();
				}
			}
		},
		{ threshold, rootMargin: '0px 0px -8% 0px' }
	);
	io.observe(node);

	return {
		destroy() {
			io.disconnect();
		}
	};
}
