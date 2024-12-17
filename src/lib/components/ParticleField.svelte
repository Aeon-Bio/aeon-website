<script lang="ts">
    import { onMount } from 'svelte';
    import { spring } from 'svelte/motion';
    import { gridActivity } from '../stores/grid';
    import { interactionState } from '../stores/interaction';
    
    export let particleCount = 85;
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
    
    let canvas: HTMLCanvasElement;
    let ctx: CanvasRenderingContext2D;
    let width: number;
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
    const FADE_IN_SPEED = 0.33;
    
    function createParticle(index: number): Particle {
      const useCluster = Math.random() < 0.4;
      const fadeDelay = index * 1.5;
      
      if (useCluster && particles.length > 0) {
        const center = particles[Math.floor(Math.random() * particles.length)];
        if (center) {
          return {
            x: center.x + (Math.random() - 0.5) * 150,
            y: center.y + (Math.random() - 0.5) * 150,
            vx: (Math.random() - 0.5) * baseSpeed,
            vy: (Math.random() - 0.5) * baseSpeed,
            radius: Math.random() * 1.5 + 0.5,
            opacity: Math.random() * 0.4 + 0.2,
            energy: 0,
            fadeIn: -fadeDelay
          };
        }
      }
      
      return {
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * baseSpeed,
        vy: (Math.random() - 0.5) * baseSpeed,
        radius: Math.random() * 1.5 + 0.5,
        opacity: Math.random() * 0.4 + 0.2,
        energy: 0,
        fadeIn: -fadeDelay
      };
    }
    
    function updateParticles(dt: number) {
      const gridScale = 50;
      
      particles.forEach(p => {
        p.fadeIn = Math.min(1, p.fadeIn + FADE_IN_SPEED);
        
        if (p.fadeIn <= 0) return;
        
        const fadeScale = p.fadeIn ** 1.5;
        
        p.x += p.vx * dt * fadeScale;
        p.y += p.vy * dt * fadeScale;
        
        const gridX = Math.round(p.x / gridScale) * gridScale;
        const gridY = Math.round(p.y / gridScale) * gridScale;
        const alignmentStrength = 0.001 + (p.energy * 0.003);
        
        p.vx += (gridX - p.x) * alignmentStrength;
        p.vy += (gridY - p.y) * alignmentStrength;
        
        if (focusPoint) {
          const dx = focusPoint.x - p.x;
          const dy = focusPoint.y - p.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          const influence = Math.max(0, 1 - dist / 300);
          p.energy = influence * systemActivity;
        } else {
          p.energy *= 0.95;
        }
        
        const randomFactor = 1 - p.energy * 0.8;
        p.vx += (Math.random() - 0.5) * 0.01 * randomFactor;
        p.vy += (Math.random() - 0.5) * 0.01 * randomFactor;
        
        const maxSpeed = baseSpeed * (1 + p.energy);
        const speed = Math.sqrt(p.vx * p.vx + p.vy * p.vy);
        if (speed > maxSpeed) {
          p.vx = (p.vx / speed) * maxSpeed;
          p.vy = (p.vy / speed) * maxSpeed;
        }
        
        if (p.x < 0) p.x = width;
        if (p.x > width) p.x = 0;
        if (p.y < 0) p.y = height;
        if (p.y > height) p.y = 0;
        
        particles.forEach(other => {
          if (other === p) return;
          
          const dx = other.x - p.x;
          const dy = other.y - p.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          
          if (dist < CONNECTION_DISTANCE && dist > 30) {
            const force = 0.00001 * dt;
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
          
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          
          if (dist < CONNECTION_DISTANCE) {
            const combinedEnergy = particles[i].energy + particles[j].energy;
            const combinedFade = particles[i].fadeIn * particles[j].fadeIn;
            
            const distanceFactor = Math.pow(1 - dist / CONNECTION_DISTANCE, 1.5);
            const edgeEmphasis = EDGE_BOOST * Math.pow(dist / CONNECTION_DISTANCE, 0.8);
            const energyBoost = Math.pow(1 + combinedEnergy, 2);
            
            const baseOpacity = CONNECTION_BASE_OPACITY * distanceFactor * energyBoost * combinedFade;
            const edgeOpacity = baseOpacity * (1 + edgeEmphasis);
            
            const gradient = ctx.createLinearGradient(
              particles[i].x, particles[i].y,
              particles[j].x, particles[j].y
            );
            
            gradient.addColorStop(0, `rgba(76, 201, 240, ${edgeOpacity * 1.2})`);
            gradient.addColorStop(0.15, `rgba(76, 201, 240, ${baseOpacity})`);
            gradient.addColorStop(0.5, `rgba(128, 255, 219, ${baseOpacity * 1.8})`);
            gradient.addColorStop(0.85, `rgba(76, 201, 240, ${baseOpacity})`);
            gradient.addColorStop(1, `rgba(76, 201, 240, ${edgeOpacity * 1.2})`);
            
            const width = Math.min(
              MAX_LINE_WIDTH,
              MIN_LINE_WIDTH + distanceFactor * (2 + edgeEmphasis * 1.5)
            );
            
            ctx.beginPath();
            ctx.strokeStyle = gradient;
            ctx.lineWidth = width;
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.stroke();
          }
        }
      }
      
      particles.forEach(p => {
        if (p.fadeIn <= 0) return;
        
        const energyColor = p.energy > 0 
          ? `rgba(128, 255, 219, ${p.opacity * (1 + p.energy * 0.5) * p.fadeIn})`
          : `rgba(76, 201, 240, ${p.opacity * p.fadeIn})`;
          
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius * (1 + p.energy * 0.3), 0, Math.PI * 2);
        ctx.fillStyle = energyColor;
        ctx.fill();
      });
      
      requestAnimationFrame(draw);
    }
    
    onMount(() => {
      ctx = canvas.getContext('2d')!;
      width = window.innerWidth;
      height = window.innerHeight;
      
      canvas.width = width;
      canvas.height = height;
      
      particles = Array(particleCount)
        .fill(null)
        .map((_, i) => createParticle(i));
        
      requestAnimationFrame(draw);
      
      const interval = setInterval(() => updateParticles(1), 1000 / 60);
      return () => clearInterval(interval);
    });
  </script>
  
  <canvas
    bind:this={canvas}
    class="particle-field"
  />
  
  <style>
    .particle-field {
      position: fixed;
      inset: 0;
      z-index: -1;
      pointer-events: none;
    }
  </style>