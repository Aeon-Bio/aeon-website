/**
 * Spatial hash grid for efficient particle collision detection
 * Reduces O(n²) to approximately O(n) for particle interactions
 */

import type { Particle } from './particlePool';

export class SpatialHashGrid {
	private grid: Map<string, Particle[]> = new Map();
	private cellSize: number;
	private width: number;
	private height: number;

	constructor(cellSize: number, width: number, height: number) {
		this.cellSize = cellSize;
		this.width = width;
		this.height = height;
	}

	private getKey(x: number, y: number): string {
		const gridX = Math.floor(x / this.cellSize);
		const gridY = Math.floor(y / this.cellSize);
		return `${gridX},${gridY}`;
	}

	clear() {
		this.grid.clear();
	}

	insert(particle: Particle) {
		const key = this.getKey(particle.x, particle.y);

		if (!this.grid.has(key)) {
			this.grid.set(key, []);
		}

		this.grid.get(key)!.push(particle);
	}

	getNearbyParticles(particle: Particle, radius: number): Particle[] {
		const nearby: Particle[] = [];
		const cellsToCheck = Math.ceil(radius / this.cellSize);

		const centerX = Math.floor(particle.x / this.cellSize);
		const centerY = Math.floor(particle.y / this.cellSize);

		for (let x = centerX - cellsToCheck; x <= centerX + cellsToCheck; x++) {
			for (let y = centerY - cellsToCheck; y <= centerY + cellsToCheck; y++) {
				const key = `${x},${y}`;
				const particles = this.grid.get(key);

				if (particles) {
					for (const other of particles) {
						if (other !== particle) {
							const dx = other.x - particle.x;
							const dy = other.y - particle.y;
							const distance = Math.sqrt(dx * dx + dy * dy);

							if (distance <= radius) {
								nearby.push(other);
							}
						}
					}
				}
			}
		}

		return nearby;
	}

	resize(width: number, height: number) {
		this.width = width;
		this.height = height;
		this.clear();
	}
}
