/**
 * Particle pooling system to reduce garbage collection
 */

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

export class ParticlePool {
  private pool: Particle[] = [];
  private activeParticles: Particle[] = [];
  private nextId = 0;
  private readonly maxPoolSize: number;
  
  constructor(initialSize: number = 500, maxSize: number = 1000) {
    this.maxPoolSize = maxSize;
    this.initializePool(initialSize);
  }
  
  private initializePool(size: number) {
    for (let i = 0; i < size; i++) {
      this.pool.push(this.createEmptyParticle());
    }
  }
  
  private createEmptyParticle(): Particle {
    return {
      x: 0,
      y: 0,
      vx: 0,
      vy: 0,
      radius: 1,
      opacity: 0.5,
      energy: 0,
      fadeIn: 0,
      active: false,
      id: this.nextId++
    };
  }
  
  acquire(): Particle {
    let particle = this.pool.pop();
    
    if (!particle) {
      particle = this.createEmptyParticle();
    }
    
    particle.active = true;
    this.activeParticles.push(particle);
    return particle;
  }
  
  release(particle: Particle) {
    const index = this.activeParticles.indexOf(particle);
    if (index > -1) {
      this.activeParticles.splice(index, 1);
      particle.active = false;
      
      // Reset particle state
      particle.energy = 0;
      particle.fadeIn = 0;
      
      // Return to pool if not at max capacity
      if (this.pool.length < this.maxPoolSize) {
        this.pool.push(particle);
      }
    }
  }
  
  getActiveParticles(): Particle[] {
    return this.activeParticles;
  }
  
  getActiveCount(): number {
    return this.activeParticles.length;
  }
  
  getPoolSize(): number {
    return this.pool.length;
  }
  
  clear() {
    // Return all active particles to pool
    for (const particle of this.activeParticles) {
      particle.active = false;
      particle.energy = 0;
      particle.fadeIn = 0;
      
      if (this.pool.length < this.maxPoolSize) {
        this.pool.push(particle);
      }
    }
    this.activeParticles.length = 0;
  }
}