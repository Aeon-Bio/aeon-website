export interface Particle {
	x: number;
	y: number;
	vx: number;
	vy: number;
	radius: number;
	opacity: number;
	energy: number;
	fadeIn: number;
	active: boolean;
	id: number;
	// Optional scroll-specific properties
	parallaxSpeed?: number;
	depthLayer?: number;
	scrollOffset?: number;
	baseY?: number;
	sectionAffinity?: string;
}
