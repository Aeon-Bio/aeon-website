export interface PhysicsVector {
	x: number;
	y: number;
}

export interface PhysicsParticle {
	x: number;
	y: number;
	vx: number;
	vy: number;
	energy: number;
	fadeIn: number;
	radius: number;
}

export interface PhysicsBounds {
	minX: number;
	maxX: number;
	minY: number;
	maxY: number;
}

export interface PhysicsOptions<T extends PhysicsParticle = PhysicsParticle> {
	dt: number;
	baseSpeed: number;
	rotation: number;
	gridScale: number;
	minParticleDistance: number;
	repulsionDistance: number;
	repulsionStrength: number;
	connectionDistance: number;
	clusterRadius: number;
	minClusterSize: number;
	baseAlignmentStrength: number;
	energyAlignmentBoost: number;
	randomMotionMagnitude: number;
	bounds: PhysicsBounds;
	focusPoint?: PhysicsVector | null;
	systemActivity: number;
	neighborLookup?: (particle: T, radius: number) => T[];
	cohesionFactor?: number;
	randomDampening?: number;
}

const DEFAULTS = {
	cohesionFactor: 0.0002,
	randomDampening: 0.8
} as const;

function projectToGrid(x: number, y: number, rotation: number, result: PhysicsVector) {
	const angle = (rotation * Math.PI) / 180;
	result.x = x;
	result.y = y * Math.cos(angle);
	return result;
}

export function applyParticlePhysics<T extends PhysicsParticle>(
	particles: T[],
	options: PhysicsOptions<T>
) {
	const {
		dt,
		baseSpeed,
		rotation,
		gridScale,
		minParticleDistance,
		repulsionDistance,
		repulsionStrength,
		connectionDistance,
		clusterRadius,
		minClusterSize,
		baseAlignmentStrength,
		energyAlignmentBoost,
		randomMotionMagnitude,
		bounds,
		focusPoint,
		systemActivity,
		neighborLookup
	} = options;

	const cohesionFactor = options.cohesionFactor ?? DEFAULTS.cohesionFactor;
	const randomDampening = options.randomDampening ?? DEFAULTS.randomDampening;

	const angle = (rotation * Math.PI) / 180;
	const reusableProjection: PhysicsVector = { x: 0, y: 0 };

	for (const particle of particles) {
		if (particle.fadeIn <= 0) continue;

		const fadeScale = Math.pow(particle.fadeIn, 1.5);

		particle.x += particle.vx * dt * fadeScale;
		particle.y += particle.vy * dt * fadeScale;

		const projected = projectToGrid(particle.x, particle.y, rotation, reusableProjection);
		const gridX = Math.round(projected.x / gridScale) * gridScale;
		const gridY = Math.round(projected.y / gridScale) * gridScale;

		const alignmentStrength = baseAlignmentStrength + particle.energy * energyAlignmentBoost;

		particle.vx += (gridX - particle.x) * alignmentStrength * dt;
		particle.vy += (gridY / Math.cos(angle) - particle.y) * alignmentStrength * dt;

		if (focusPoint) {
			const dx = focusPoint.x - particle.x;
			const dy = focusPoint.y - particle.y;
			const dist = Math.hypot(dx, dy);
			const influence = Math.max(0, 1 - dist / 300);
			const focusEnergy = influence * systemActivity;
			particle.energy = Math.max(particle.energy * 0.9, focusEnergy);
		} else {
			particle.energy *= 0.95;
		}
		particle.energy = Math.min(1, particle.energy);

		const randomFactor = 1 - particle.energy * randomDampening;
		particle.vx += (Math.random() - 0.5) * randomMotionMagnitude * randomFactor;
		particle.vy += (Math.random() - 0.5) * randomMotionMagnitude * randomFactor;

		const maxSpeed = baseSpeed * (1 + particle.energy);
		const speed = Math.hypot(particle.vx, particle.vy);
		if (speed > maxSpeed && speed > 0) {
			const scale = maxSpeed / speed;
			particle.vx *= scale;
			particle.vy *= scale;
		}

		const buffer = 50;
		if (particle.x < bounds.minX - buffer) particle.x = bounds.maxX + buffer;
		if (particle.x > bounds.maxX + buffer) particle.x = bounds.minX - buffer;
		if (particle.y < bounds.minY - buffer) particle.y = bounds.maxY + buffer;
		if (particle.y > bounds.maxY + buffer) particle.y = bounds.minY - buffer;

		const neighborParticles = neighborLookup
			? neighborLookup(particle, connectionDistance)
			: particles;

		if (neighborLookup && neighborParticles.length >= minClusterSize) {
			let centerX = 0;
			let centerY = 0;
			let count = 0;
			for (const other of neighborParticles) {
				centerX += other.x;
				centerY += other.y;
				count++;
				if (count >= minClusterSize) break;
			}
			if (count > 0) {
				centerX /= count;
				centerY /= count;
				const dx = centerX - particle.x;
				const dy = centerY - particle.y;
				const dist = Math.hypot(dx, dy);
				if (dist > 0) {
					const cohesionStrength = cohesionFactor * dt;
					particle.vx += (dx / dist) * cohesionStrength;
					particle.vy += (dy / dist) * cohesionStrength;
				}
			}
		}

		for (const other of neighborParticles) {
			if (other === particle) continue;

			const dx = other.x - particle.x;
			const dy = other.y - particle.y;
			const dist = Math.hypot(dx, dy);
			if (dist === 0) continue;

			if (dist < minParticleDistance) {
				const force = (repulsionStrength * dt) / Math.max(1, dist);
				particle.vx -= (dx / dist) * force;
				particle.vy -= (dy / dist) * force;
			} else if (dist < repulsionDistance) {
				const force = repulsionStrength * dt * (1 - dist / repulsionDistance) * 0.5;
				particle.vx -= (dx / dist) * force;
				particle.vy -= (dy / dist) * force;
			} else if (dist < clusterRadius) {
				const force = 0.000005 * dt;
				particle.vx += dx * force;
				particle.vy += dy * force;
			}
		}
	}
}
