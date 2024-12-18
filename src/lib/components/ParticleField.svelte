<script lang="ts">
    import { onMount } from 'svelte';
    import { spring } from 'svelte/motion';
    import { gridActivity } from '../stores/grid';
    import { interactionState } from '../stores/interaction';
    
    export let particleCount = 448;
    export let baseSpeed = 0.12;
    
    interface Particle {
      x: number;
      y: number;
      vx: number;
      vy: number;
      radius: number;
      opacity: number;
      energy: number;
      fadeIn: number;
    }
    
    // Reference width for scaling
    let REFERENCE_WIDTH = 1920;
    
    let canvas: HTMLCanvasElement;
    let ctx: CanvasRenderingContext2D;
    let width = REFERENCE_WIDTH;
    let height: number;
    let particles: Particle[] = [];
    
    // Track system state
    $: focusPoint = $gridActivity.focusPoint;
    $: systemActivity = $gridActivity.activity;
    
    const CONNECTION_DISTANCE = 200;
    const CONNECTION_BASE_OPACITY = 0.3;
    const EDGE_BOOST = 0.8;
    const MIN_LINE_WIDTH = 0.8;
    const MAX_LINE_WIDTH = 2.5;
    const FADE_IN_SPEED = 8;
    const PERSPECTIVE = 1000;
    const ROTATION = 60;
    const CLUSTER_PROBABILITY = 0.2;
    const CLUSTER_RADIUS = 100;
    const CLUSTER_DENSITY = 0.2;
    const MIN_CLUSTER_SIZE = 3;
    const REPULSION_DISTANCE = 30;
    const REPULSION_STRENGTH = 1;
    const MIN_PARTICLE_DISTANCE = 25;
    const GRID_SCALE = 50;
    
    // Add DPR as a component-level variable
    let dpr: number;
    
    let animationFrame: number;
    let updateInterval: ReturnType<typeof setInterval>;
    
    // Increase base alignment strength
    const BASE_ALIGNMENT_STRENGTH = 0.05; // Was 0.001
    const ENERGY_ALIGNMENT_BOOST = 0.01;   // Was 0.003
    
    // Base constants for 1920px width
    const BASE_PARTICLE_COUNT = 448;
    const MIN_PARTICLE_COUNT = 100;
    const BASE_CONNECTION_DISTANCE = 200;
    const BASE_MIN_PARTICLE_DISTANCE = 25;
    const BASE_CLUSTER_RADIUS = 100;
    const BASE_SPEED = 0.06;
  
    
    // Resolution-aware reactive variables
    let connectionDistance = BASE_CONNECTION_DISTANCE;
    let minParticleDistance = BASE_MIN_PARTICLE_DISTANCE;
    let clusterRadius = BASE_CLUSTER_RADIUS;
    let speed = BASE_SPEED;
    
    // Initialize with default particle count
    $: particleCount = MIN_PARTICLE_COUNT;
    
    $: {
      // Simple linear scale based on width
      const scale = Math.min(width / REFERENCE_WIDTH, 1);
      
      // Scale down particle count with minimum
      particleCount = Math.max(
        MIN_PARTICLE_COUNT,
        Math.round(BASE_PARTICLE_COUNT * scale)
      );
    }
    
    function getWorldSpaceBounds() {
      const angle = ROTATION * (Math.PI / 180);
      
      return {
        minX: 0,
        maxX: width,
        minY: 0,
        maxY: height / Math.cos(angle)
      };
    }
    
    function isOverlapping(x: number, y: number, radius: number) {
      return particles.some(p => {
        const dx = p.x - x;
        const dy = p.y - y;
        const minDist = (p.radius + radius) * 2; // Double the combined radii for more spacing
        return Math.hypot(dx, dy) < minDist;
      });
    }
    
    function createParticle(index: number): Particle {
      const bounds = getWorldSpaceBounds();
      const useCluster = Math.random() < CLUSTER_PROBABILITY;
      const fadeDelay = index * 1.5;
      const radius = Math.random() * 1.5 + 0.5;
      
      let attempts = 0;
      let x, y;
      
      do {
        if (useCluster && particles.length >= MIN_CLUSTER_SIZE) {
          // Cluster logic in world space
          const potentialCenters = particles.filter(p => 
            particles.filter(other => 
              Math.hypot(other.x - p.x, other.y - p.y) < CLUSTER_RADIUS
            ).length >= MIN_CLUSTER_SIZE
          );
          
          if (potentialCenters.length > 0) {
            const center = potentialCenters[Math.floor(Math.random() * potentialCenters.length)];
            const angle = Math.random() * Math.PI * 2;
            const dist = Math.random() * CLUSTER_RADIUS * CLUSTER_DENSITY;
            x = center.x + Math.cos(angle) * dist;
            y = center.y + Math.sin(angle) * dist;
          }
        }
        
        if (!x || !y) {
          // Create particles in visible area
          x = bounds.minX + Math.random() * (bounds.maxX - bounds.minX);
          // Bias towards visible area by using inverse of rotation
          const visibleHeight = height / Math.cos(ROTATION * Math.PI / 180);
          y = bounds.minY + Math.random() * visibleHeight;
        }
        
        attempts++;
      } while (isOverlapping(x, y, radius) && attempts < 10);
      
      return {
        x,
        y,
        vx: (Math.random() - 0.5) * baseSpeed,
        vy: (Math.random() - 0.5) * baseSpeed,
        radius,
        opacity: Math.random() * 0.4 + 0.2,
        energy: 0,
        fadeIn: -fadeDelay
      };
    }

    function projectToGrid(x: number, y: number) {
      const angle = ROTATION * (Math.PI / 180);
      
      return {
        x: x,
        y: y * Math.cos(angle)
      };
    }
    
    function updateParticles(dt: number) {
      const bounds = getWorldSpaceBounds();
      
      particles.forEach(p => {
        p.fadeIn = Math.min(1, p.fadeIn + FADE_IN_SPEED);
        
        if (p.fadeIn <= 0) return;
        
        const fadeScale = p.fadeIn ** 1.5;
        
        // Apply base movement
        p.x += p.vx * dt * fadeScale;
        p.y += p.vy * dt * fadeScale;
        
        // Grid alignment with stronger force
        const projected = projectToGrid(p.x, p.y);
        const gridX = Math.round(projected.x / GRID_SCALE) * GRID_SCALE;
        const gridY = Math.round(projected.y / GRID_SCALE) * GRID_SCALE;
        
        const angle = ROTATION * (Math.PI / 180);
        const alignmentStrength = BASE_ALIGNMENT_STRENGTH + (p.energy * ENERGY_ALIGNMENT_BOOST);
        
        // Stronger grid alignment
        p.vx += (gridX - p.x) * alignmentStrength * dt;
        p.vy += ((gridY / Math.cos(angle)) - p.y) * alignmentStrength * dt;
        
        // Energy and focus point interaction
        if (focusPoint) {
          const dx = focusPoint.x - p.x;
          const dy = focusPoint.y - p.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          const influence = Math.max(0, 1 - dist / 300);
          p.energy = influence * systemActivity;
        } else {
          p.energy *= 0.95;
        }
        
        // Add random motion
        const randomFactor = 1 - p.energy * 0.8;
        p.vx += (Math.random() - 0.5) * 0.03 * randomFactor; // Increased random motion
        p.vy += (Math.random() - 0.5) * 0.03 * randomFactor;
        
        // Speed limiting
        const maxSpeed = baseSpeed * (1 + p.energy);
        const speed = Math.sqrt(p.vx * p.vx + p.vy * p.vy);
        if (speed > maxSpeed) {
          p.vx = (p.vx / speed) * maxSpeed;
          p.vy = (p.vy / speed) * maxSpeed;
        }
        
        // World wrapping
        const buffer = 50;
        if (p.x < bounds.minX - buffer) p.x = bounds.maxX + buffer;
        if (p.x > bounds.maxX + buffer) p.x = bounds.minX - buffer;
        if (p.y < bounds.minY - buffer) p.y = bounds.maxY + buffer;
        if (p.y > bounds.maxY + buffer) p.y = bounds.minY - buffer;
        
        const nearbyParticles = particles.filter(other => 
          other !== p && Math.hypot(other.x - p.x, other.y - p.y) < CLUSTER_RADIUS
        );
        
        if (nearbyParticles.length >= MIN_CLUSTER_SIZE) {
          const centerX = nearbyParticles.reduce((sum, p) => sum + p.x, 0) / nearbyParticles.length;
          const centerY = nearbyParticles.reduce((sum, p) => sum + p.y, 0) / nearbyParticles.length;
          
          const dx = centerX - p.x;
          const dy = centerY - p.y;
          const dist = Math.hypot(dx, dy);
          
          if (dist > 0) {
            const cohesionStrength = 0.0002 * dt;
            p.vx += (dx / dist) * cohesionStrength;
            p.vy += (dy / dist) * cohesionStrength;
          }
        }
        
        particles.forEach(other => {
          if (other === p) return;
          
          const dx = other.x - p.x;
          const dy = other.y - p.y;
          const dist = Math.hypot(dx, dy);
          
          if (dist < MIN_PARTICLE_DISTANCE) {
            const force = (REPULSION_STRENGTH * dt) / Math.max(1, dist);
            p.vx -= (dx / dist) * force;
            p.vy -= (dy / dist) * force;
          } else if (dist < REPULSION_DISTANCE) {
            const force = (REPULSION_STRENGTH * dt * (1 - dist / REPULSION_DISTANCE)) * 0.5;
            p.vx -= (dx / dist) * force;
            p.vy -= (dy / dist) * force;
          } else if (dist < CONNECTION_DISTANCE) {
            const force = 0.000005 * dt;
            p.vx += dx * force;
            p.vy += dy * force;
          }
        });
      });
    }
    
    function draw() {
      ctx.clearRect(0, 0, width, height);
      
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          if (particles[i].fadeIn <= 0 || particles[j].fadeIn <= 0) continue;
          
          const p1 = projectToGrid(particles[i].x, particles[i].y);
          const p2 = projectToGrid(particles[j].x, particles[j].y);
          
          const dx = p1.x - p2.x;
          const dy = p1.y - p2.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          
          if (dist < CONNECTION_DISTANCE && dist > MIN_PARTICLE_DISTANCE) {
            const combinedFade = particles[i].fadeIn * particles[j].fadeIn;
            
            const distanceFactor = Math.pow(1 - dist / CONNECTION_DISTANCE, 1.2);
            const edgeEmphasis = EDGE_BOOST * Math.pow(dist / CONNECTION_DISTANCE, 0.8);
            
            const baseOpacity = CONNECTION_BASE_OPACITY * distanceFactor * combinedFade;
            const edgeOpacity = baseOpacity * (1 + edgeEmphasis);
            
            const gradient = ctx.createLinearGradient(
              p1.x, p1.y,
              p2.x, p2.y
            );
            
            gradient.addColorStop(0, `rgba(76, 201, 240, ${edgeOpacity})`);
            gradient.addColorStop(0.15, `rgba(76, 201, 240, ${baseOpacity})`);
            gradient.addColorStop(0.5, `rgba(76, 201, 240, ${baseOpacity})`);
            gradient.addColorStop(0.85, `rgba(76, 201, 240, ${baseOpacity})`);
            gradient.addColorStop(1, `rgba(76, 201, 240, ${edgeOpacity})`);
            
            const width = Math.min(
              MAX_LINE_WIDTH,  // Scale line width
              MIN_LINE_WIDTH + distanceFactor * (2 + edgeEmphasis * 1.5)
            );
            
            ctx.beginPath();
            ctx.strokeStyle = gradient;
            ctx.lineWidth = width;
            ctx.moveTo(p1.x, p1.y);
            ctx.lineTo(p2.x, p2.y);
            ctx.stroke();
          }
        }
      }
      
      particles.forEach(p => {
        if (p.fadeIn <= 0) return;
        
        const projected = projectToGrid(p.x, p.y);
        const particleColor = `rgba(76, 201, 240, ${p.opacity * p.fadeIn})`;
        
        ctx.beginPath();
        ctx.arc(
          projected.x,
          projected.y,
          (p.radius * (1 + (p.y / PERSPECTIVE))) / dpr, // Scale radius
          0,
          Math.PI * 2
        );
        ctx.fillStyle = particleColor;
        ctx.fill();
      });
      
      requestAnimationFrame(draw);
    }
    
    onMount(() => {
      ctx = canvas.getContext('2d')!;
      dpr = 1; // Force DPI to 1
      
      // Get physical screen dimensions
      width = window.innerWidth;
      height = window.innerHeight;
      
      // Set canvas size in pixels
      canvas.width = width;
      canvas.height = height;
      
      // Set canvas CSS size
      canvas.style.width = width + 'px';
      canvas.style.height = height + 'px';
      
      // No DPI scaling for context
      ctx.scale(1, 1);
      
      // Get initial width
      width = window.innerWidth;
      
      // Update particle count
      const scale = Math.min(width / REFERENCE_WIDTH, 1);
      particleCount = Math.max(
        MIN_PARTICLE_COUNT,
        Math.round(BASE_PARTICLE_COUNT * scale)
      );
      
      // Initialize particles after width is known
      particles = Array(particleCount)
        .fill(null)
        .map((_, i) => createParticle(i));
      
      animationFrame = requestAnimationFrame(draw);
      updateInterval = setInterval(() => updateParticles(1), 1000 / 60);
      
      return () => {
        cancelAnimationFrame(animationFrame);
        clearInterval(updateInterval);
        if (ctx && canvas) {
          ctx.clearRect(0, 0, canvas.width, canvas.height);
        }
        particles = [];
      };
    });
  </script>
  
  <canvas
    bind:this={canvas}
    class="particle-field"
    style="transform-origin: top; transform: perspective({PERSPECTIVE}px) rotateX({ROTATION}deg)"
  >
  </canvas>
  <style>
    .particle-field {
      position: fixed;
      inset: 0;
      z-index: -2;
      pointer-events: none;
      backface-visibility: hidden;
      will-change: transform;
    }
  </style>