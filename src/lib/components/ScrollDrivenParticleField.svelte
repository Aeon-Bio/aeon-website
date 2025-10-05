<script lang="ts">
  import { onMount, onDestroy } from 'svelte';
  import { spring } from 'svelte/motion';
  import { gridActivity } from '../stores/grid';
  import { interactionState } from '../stores/interaction';
  import { scrollTracker, currentSection, scrollVelocity, scrollProgress } from '../stores/scroll';
  import { PerformanceMonitor, detectDeviceCapabilities, getQualitySettings, prefersReducedMotion, throttle } from '../utils/performance';
  import { SpatialHashGrid } from '../utils/spatialHash';
  
  // Performance and quality settings - initialized in onMount
  let deviceCapabilities: any;
  let qualitySettings: any = { particleCount: 250, connectionDistance: 100, maxConnections: 3 };
  let reducedMotion = false;
  
  export let particleCount = 250; // Default value, will be updated in onMount
  export let baseSpeed = 0.06;
  
  interface Particle {
    x: number;
    y: number;
    vx: number;
    vy: number;
    radius: number;
    opacity: number;
    energy: number;
    fadeIn: number;
    // Scroll-specific properties
    parallaxSpeed: number; // 0.1 - 2.0 for different movement speeds
    depthLayer: number; // 1-5 for depth-based parallax
    scrollOffset: number; // accumulated scroll offset for this particle
    baseY: number; // original Y position
    baseX: number; // original X position  
    sectionAffinity: string; // which section affects this particle most
  }
  
  // Reference width for scaling
  let REFERENCE_WIDTH = 1920;
  
  let canvas: HTMLCanvasElement;
  let ctx: CanvasRenderingContext2D;
  let width = REFERENCE_WIDTH;
  let height: number;
  let particles: Particle[] = [];
  
  // Performance optimizations
  let spatialGrid: SpatialHashGrid;
  let performanceMonitor = new PerformanceMonitor();
  let currentFPS = 60;
  let connectionPairs: Array<[Particle, Particle]> = [];
  let lastUpdateTime = 0;
  let accumulator = 0;
  const FIXED_TIMESTEP = 1000 / qualitySettings.updateFrequency;
  
  // Track system state
  $: focusPoint = $gridActivity.focusPoint;
  $: systemActivity = $gridActivity.activity;
  $: scrollPosition = $scrollTracker;
  $: currentSectionId = $currentSection;
  $: velocity = $scrollVelocity;
  $: pageProgress = $scrollProgress;
  
  // Section-specific configurations
  const sectionConfigs = {
    'hero-section': {
      particleColor: 'rgba(76, 201, 240, %%OPACITY%%)',
      connectionColor: 'rgba(76, 201, 240, %%OPACITY%%)',
      clusterStrength: 0.3,
      energyMultiplier: 1.0,
      parallaxIntensity: 0.5
    },
    'problem-section': {
      particleColor: 'rgba(240, 76, 120, %%OPACITY%%)',
      connectionColor: 'rgba(240, 76, 120, %%OPACITY%%)',
      clusterStrength: 0.6,
      energyMultiplier: 1.2,
      parallaxIntensity: 0.7
    },
    'approach-section': {
      particleColor: 'rgba(128, 255, 219, %%OPACITY%%)',
      connectionColor: 'rgba(128, 255, 219, %%OPACITY%%)',
      clusterStrength: 0.4,
      energyMultiplier: 0.8,
      parallaxIntensity: 0.3
    },
    'applications-section': {
      particleColor: 'rgba(76, 201, 240, %%OPACITY%%)',
      connectionColor: 'rgba(76, 201, 240, %%OPACITY%%)',
      clusterStrength: 0.5,
      energyMultiplier: 1.1,
      parallaxIntensity: 0.6
    },
    'partnership-section': {
      particleColor: 'rgba(180, 76, 240, %%OPACITY%%)',
      connectionColor: 'rgba(180, 76, 240, %%OPACITY%%)',
      clusterStrength: 0.7,
      energyMultiplier: 1.3,
      parallaxIntensity: 0.4
    },
    'science-section': {
      particleColor: 'rgba(76, 240, 180, %%OPACITY%%)',
      connectionColor: 'rgba(76, 240, 180, %%OPACITY%%)',
      clusterStrength: 0.3,
      energyMultiplier: 0.9,
      parallaxIntensity: 0.8
    },
    'closing-cta-section': {
      particleColor: 'rgba(255, 200, 76, %%OPACITY%%)',
      connectionColor: 'rgba(255, 200, 76, %%OPACITY%%)',
      clusterStrength: 0.4,
      energyMultiplier: 1.0,
      parallaxIntensity: 0.5
    }
  };
  
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
  
  // Parallax constants
  const PARALLAX_MULTIPLIER = 0.3; // How much scroll affects particles
  const DEPTH_PARALLAX_RANGE = [0.1, 2.0]; // Speed range for different depth layers
  
  let dpr: number;
  let animationFrame: number;
  // Remove setInterval - unified RAF loop only
  let lastFrameTime = 0;
  
  // Base alignment strength
  const BASE_ALIGNMENT_STRENGTH = 0.05;
  const ENERGY_ALIGNMENT_BOOST = 0.01;
  
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
      const minDist = (p.radius + radius) * 2;
      return Math.hypot(dx, dy) < minDist;
    });
  }
  
  function createParticle(index: number): Particle {
    const bounds = getWorldSpaceBounds();
    const useCluster = Math.random() < CLUSTER_PROBABILITY;
    const fadeDelay = index * 1.5;
    const radius = Math.random() * 1.5 + 0.5;
    
    // Assign depth layer and parallax properties
    const depthLayer = Math.floor(Math.random() * 5) + 1;
    const parallaxSpeed = DEPTH_PARALLAX_RANGE[0] + 
      (DEPTH_PARALLAX_RANGE[1] - DEPTH_PARALLAX_RANGE[0]) * (depthLayer / 5);
    
    // Assign section affinity
    const sections = Object.keys(sectionConfigs);
    const sectionAffinity = sections[Math.floor(Math.random() * sections.length)];
    
    let attempts = 0;
    let x, y;
    
    do {
      if (useCluster && particles.length >= MIN_CLUSTER_SIZE) {
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
        x = bounds.minX + Math.random() * (bounds.maxX - bounds.minX);
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
      fadeIn: -fadeDelay,
      parallaxSpeed,
      depthLayer,
      scrollOffset: 0,
      baseY: y,
      baseX: x,
      sectionAffinity
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
    const currentConfig = currentSectionId ? sectionConfigs[currentSectionId] : sectionConfigs['hero-section'];
    
    particles.forEach(p => {
      p.fadeIn = Math.min(1, p.fadeIn + FADE_IN_SPEED);
      
      if (p.fadeIn <= 0) return;
      
      const fadeScale = p.fadeIn ** 1.5;
      
      // Apply position-based parallax movement
      const scrollY = scrollPosition.y || 0;
      const parallaxOffset = scrollY * PARALLAX_MULTIPLIER * p.parallaxSpeed;
      
      // Calculate final positions with parallax
      p.x = p.baseX + (p.vx * dt * fadeScale);
      p.y = p.baseY + parallaxOffset + (p.vy * dt * fadeScale);
      
      // Section-specific behavior
      if (p.sectionAffinity === currentSectionId) {
        // Increase energy for particles that match current section
        p.energy = Math.min(1, p.energy + 0.02 * dt);
        
        // Apply section-specific clustering
        const clusterStrength = currentConfig?.clusterStrength || 0.3;
        if (focusPoint) {
          const dx = focusPoint.x - p.x;
          const dy = focusPoint.y - p.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          const influence = Math.max(0, 1 - dist / 300) * clusterStrength;
          
          p.vx += (dx / dist) * influence * 0.001 * dt;
          p.vy += (dy / dist) * influence * 0.001 * dt;
        }
      } else {
        // Decay energy for non-matching sections
        p.energy *= 0.98;
      }
      
      // Grid alignment with proper coordinate transforms
      const projected = projectToGrid(p.x, p.y);
      const gridX = Math.round(projected.x / GRID_SCALE) * GRID_SCALE;
      const gridY = Math.round(projected.y / GRID_SCALE) * GRID_SCALE;
      
      const angle = ROTATION * (Math.PI / 180);
      const alignmentStrength = BASE_ALIGNMENT_STRENGTH + (p.energy * ENERGY_ALIGNMENT_BOOST);
      
      // Grid convergence forces - apply to base positions
      const targetX = gridX;
      const targetY = gridY / Math.cos(angle); // Transform back to world space
      
      p.vx += (targetX - p.baseX) * alignmentStrength * dt;
      p.vy += (targetY - p.baseY) * alignmentStrength * dt;
      
      // Add random motion influenced by current section
      const energyMultiplier = currentConfig?.energyMultiplier || 1.0;
      const randomFactor = (1 - p.energy * 0.8) * energyMultiplier;
      p.vx += (Math.random() - 0.5) * 0.02 * randomFactor;
      p.vy += (Math.random() - 0.5) * 0.02 * randomFactor;
      
      // Speed limiting
      const maxSpeed = baseSpeed * (1 + p.energy);
      const speed = Math.sqrt(p.vx * p.vx + p.vy * p.vy);
      if (speed > maxSpeed) {
        p.vx = (p.vx / speed) * maxSpeed;
        p.vy = (p.vy / speed) * maxSpeed;
      }
      
      // World wrapping for base positions
      const buffer = 50;
      if (p.baseX < bounds.minX - buffer) p.baseX = bounds.maxX + buffer;
      if (p.baseX > bounds.maxX + buffer) p.baseX = bounds.minX - buffer;
      if (p.baseY < bounds.minY - buffer) p.baseY = bounds.maxY + buffer;
      if (p.baseY > bounds.maxY + buffer) p.baseY = bounds.minY - buffer;
    });
  }
  
  function getCurrentSectionColor() {
    const config = currentSectionId ? sectionConfigs[currentSectionId] : sectionConfigs['hero-section'];
    return {
      particle: config.particleColor,
      connection: config.connectionColor
    };
  }
  
  function tick(currentTime: number) {
    if (lastFrameTime === 0) lastFrameTime = currentTime;
    const deltaTime = (currentTime - lastFrameTime) / 16.67; // Normalize to 60fps
    lastFrameTime = currentTime;
    
    const frameStartTime = performance.now();
    const FRAME_BUDGET = 16.67; // 60fps target
    
    // Update particles
    updateParticles(deltaTime);
    
    // Check frame budget before rendering
    const updateTime = performance.now() - frameStartTime;
    if (updateTime > FRAME_BUDGET * 0.6) {
      // Skip this frame if update took too long
      requestAnimationFrame(tick);
      return;
    }
    
    // Draw frame
    ctx.clearRect(0, 0, width, height);
    const colors = getCurrentSectionColor();
    
    // Rebuild spatial grid for current frame
    spatialGrid.clear();
    particles.forEach(p => {
      if (p.fadeIn > 0) {
        spatialGrid.insert(p);
      }
    });
    
    // Draw connections using spatial optimization
    const processedPairs = new Set<string>();
    
    particles.forEach(particle => {
      if (particle.fadeIn <= 0) return;
      
      const nearby = spatialGrid.getNearbyParticles(particle, CONNECTION_DISTANCE);
      
      nearby.forEach(other => {
        if (other.fadeIn <= 0) return;
        
        // Avoid duplicate connections
        const pairKey = particle.x < other.x ? 
          `${particle.x},${particle.y}-${other.x},${other.y}` :
          `${other.x},${other.y}-${particle.x},${particle.y}`;
        
        if (processedPairs.has(pairKey)) return;
        processedPairs.add(pairKey);
        
        const p1 = projectToGrid(particle.x, particle.y);
        const p2 = projectToGrid(other.x, other.y);
        
        const dx = p1.x - p2.x;
        const dy = p1.y - p2.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        
        if (dist > MIN_PARTICLE_DISTANCE) {
          const combinedFade = particle.fadeIn * other.fadeIn;
          
          const distanceFactor = Math.pow(1 - dist / CONNECTION_DISTANCE, 1.2);
          const edgeEmphasis = EDGE_BOOST * Math.pow(dist / CONNECTION_DISTANCE, 0.8);
          
          const baseOpacity = CONNECTION_BASE_OPACITY * distanceFactor * combinedFade;
          const edgeOpacity = baseOpacity * (1 + edgeEmphasis);
          
          const gradient = ctx.createLinearGradient(p1.x, p1.y, p2.x, p2.y);
          
          const connectionColor = colors.connection.replace('%%OPACITY%%', edgeOpacity.toString());
          const connectionColorMid = colors.connection.replace('%%OPACITY%%', baseOpacity.toString());
          
          gradient.addColorStop(0, connectionColor);
          gradient.addColorStop(0.15, connectionColorMid);
          gradient.addColorStop(0.5, connectionColorMid);
          gradient.addColorStop(0.85, connectionColorMid);
          gradient.addColorStop(1, connectionColor);
          
          const lineWidth = Math.min(
            MAX_LINE_WIDTH,
            MIN_LINE_WIDTH + distanceFactor * (2 + edgeEmphasis * 1.5)
          );
          
          ctx.beginPath();
          ctx.strokeStyle = gradient;
          ctx.lineWidth = lineWidth;
          ctx.moveTo(p1.x, p1.y);
          ctx.lineTo(p2.x, p2.y);
          ctx.stroke();
        }
      });
    });
    
    // Draw particles
    particles.forEach(p => {
      if (p.fadeIn <= 0) return;
      
      const projected = projectToGrid(p.x, p.y);
      const opacity = p.opacity * p.fadeIn;
      
      // Enhanced opacity for particles matching current section
      const sectionBoost = (p.sectionAffinity === currentSectionId) ? 1.3 : 1.0;
      const finalOpacity = Math.min(1, opacity * sectionBoost);
      
      const particleColor = colors.particle.replace('%%OPACITY%%', finalOpacity.toString());
      
      ctx.beginPath();
      ctx.arc(
        projected.x,
        projected.y,
        (p.radius * (1 + (p.y / PERSPECTIVE))) / dpr,
        0,
        Math.PI * 2
      );
      ctx.fillStyle = particleColor;
      ctx.fill();
    });
    
    requestAnimationFrame(tick);
  }
  
  // Listen for section animation events to coordinate particle behavior
  let sectionAnimationIntensity = 0;
  
  function handleSectionActivated(event: CustomEvent) {
    const { sectionId, backgroundEffect } = event.detail;
    
    if (backgroundEffect === 'particle-drift') {
      // Enhance particle drift during section activation
      sectionAnimationIntensity = 1.0;
      
      // Gradually fade intensity
      const fadeInterval = setInterval(() => {
        sectionAnimationIntensity *= 0.95;
        if (sectionAnimationIntensity < 0.01) {
          sectionAnimationIntensity = 0;
          clearInterval(fadeInterval);
        }
      }, 50);
    }
  }
  
  function handleSectionDeactivated(event: CustomEvent) {
    const { backgroundEffect } = event.detail;
    if (backgroundEffect === 'particle-drift') {
      sectionAnimationIntensity *= 0.8;
    }
  }

  onMount(() => {
    // Initialize performance settings on client side
    deviceCapabilities = detectDeviceCapabilities();
    qualitySettings = getQualitySettings(deviceCapabilities.preferredQuality);
    reducedMotion = prefersReducedMotion();
    particleCount = qualitySettings.particleCount;
    
    ctx = canvas.getContext('2d')!;
    dpr = 1;
    
    width = window.innerWidth;
    height = window.innerHeight;
    
    canvas.width = width;
    canvas.height = height;
    
    canvas.style.width = width + 'px';
    canvas.style.height = height + 'px';
    
    ctx.scale(1, 1);
    
    const scale = Math.min(width / REFERENCE_WIDTH, 1);
    particleCount = Math.max(
      MIN_PARTICLE_COUNT,
      Math.round(BASE_PARTICLE_COUNT * scale)
    );
    
    // Initialize spatial grid with appropriate cell size
    spatialGrid = new SpatialHashGrid(CONNECTION_DISTANCE, width, height);
    
    particles = Array(particleCount)
      .fill(null)
      .map((_, i) => createParticle(i));
    
    // Listen for section animation events
    window.addEventListener('section-activated', handleSectionActivated);
    window.addEventListener('section-deactivated', handleSectionDeactivated);
    
    animationFrame = requestAnimationFrame(tick);
    
    return () => {
      cancelAnimationFrame(animationFrame);
      if (typeof window !== 'undefined') {
        window.removeEventListener('section-activated', handleSectionActivated);
        window.removeEventListener('section-deactivated', handleSectionDeactivated);
      }
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
    z-index: -1;
    pointer-events: none;
    backface-visibility: hidden;
    will-change: transform;
  }
</style>