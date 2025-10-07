<script lang="ts">
  import { gridActivity } from '../stores/grid';
  import { scrollTracker, currentSection, scrollVelocity, scrollProgress } from '../stores/scroll';
  import { spring } from 'svelte/motion';
  
  export let scale = 50;
  
  $: baseIntensity = $gridActivity.baseIntensity;
  $: systemActivity = $gridActivity.activity;
  $: scrollPosition = $scrollTracker;
  $: currentSectionId = $currentSection;
  $: velocity = $scrollVelocity;
  $: pageProgress = $scrollProgress;
  
  // Spring-based activity for smooth transitions
  const activitySpring = spring(0, {
    stiffness: 0.06,
    damping: 0.65
  });
  
  // Scroll-based intensity spring
  const scrollIntensitySpring = spring(0, {
    stiffness: 0.08,
    damping: 0.7
  });
  
  // Section-specific grid configurations
  const sectionGridConfigs = {
    'hero-section': {
      baseColor: 'rgba(76, 201, 240, %%INTENSITY%%)',
      accentColor: 'rgba(128, 255, 219, %%INTENSITY%%)',
      scale: 50,
      perspectiveShift: 0
    },
    'problem-section': {
      baseColor: 'rgba(240, 76, 120, %%INTENSITY%%)',
      accentColor: 'rgba(255, 150, 150, %%INTENSITY%%)',
      scale: 45,
      perspectiveShift: -5
    },
    'approach-section': {
      baseColor: 'rgba(128, 255, 219, %%INTENSITY%%)',
      accentColor: 'rgba(76, 201, 240, %%INTENSITY%%)',
      scale: 55,
      perspectiveShift: 3
    },
    'applications-section': {
      baseColor: 'rgba(76, 201, 240, %%INTENSITY%%)',
      accentColor: 'rgba(180, 220, 255, %%INTENSITY%%)',
      scale: 48,
      perspectiveShift: -2
    },
    'partnership-section': {
      baseColor: 'rgba(180, 76, 240, %%INTENSITY%%)',
      accentColor: 'rgba(220, 150, 255, %%INTENSITY%%)',
      scale: 52,
      perspectiveShift: 4
    },
    'science-section': {
      baseColor: 'rgba(76, 240, 180, %%INTENSITY%%)',
      accentColor: 'rgba(150, 255, 200, %%INTENSITY%%)',
      scale: 46,
      perspectiveShift: -3
    },
    'closing-cta-section': {
      baseColor: 'rgba(255, 200, 76, %%INTENSITY%%)',
      accentColor: 'rgba(255, 220, 150, %%INTENSITY%%)',
      scale: 50,
      perspectiveShift: 0
    }
  };
  
  $: {
    activitySpring.set(systemActivity);
  }
  
  $: {
    // Calculate scroll-based intensity
    const velocityIntensity = Math.min(velocity / 1000, 0.5); // Cap at 0.5
    const progressIntensity = Math.sin(pageProgress * Math.PI) * 0.2; // Sine wave based on progress
    const scrollIntensity = velocityIntensity + progressIntensity;
    scrollIntensitySpring.set(scrollIntensity);
  }
  
  $: currentConfig = currentSectionId ? sectionGridConfigs[currentSectionId] : sectionGridConfigs['hero-section'];
  $: currentScale = currentConfig.scale;
  $: perspectiveShift = currentConfig.perspectiveShift;
  
  // Calculate grid intensities
  $: combinedActivity = $activitySpring + $scrollIntensitySpring;
  $: gridBaseIntensity = baseIntensity * (1 + combinedActivity * 0.5);
  $: gridAccentIntensity = combinedActivity * 0.12;
  
  // Parallax effect for grid
  $: gridParallaxY = scrollPosition.y * 0.1; // Subtle parallax movement
  $: gridRotation = 60 + perspectiveShift + (scrollPosition.velocity * 0.001); // Slight rotation based on scroll velocity
</script>

<div class="grid-container">
  <div 
    class="grid-pattern" 
    style="
      --scale: {currentScale}px;
      --base-intensity: {gridBaseIntensity};
      --accent-intensity: {gridAccentIntensity};
      --base-color: {currentConfig.baseColor.replace('%%INTENSITY%%', gridBaseIntensity.toString())};
      --accent-color: {currentConfig.accentColor.replace('%%INTENSITY%%', gridAccentIntensity.toString())};
      --parallax-y: {gridParallaxY}px;
      --rotation: {gridRotation}deg;
    "
  ></div>
  <div class="grid-fade"></div>
</div>

<style>
  .grid-container {
    position: fixed;
    inset: 0;
    pointer-events: none;
    z-index: 1;
    overflow: hidden;
  }

  .grid-pattern {
    position: absolute;
    width: 100%;
    height: 100%;
    background-image: 
      linear-gradient(var(--base-color) 1px, transparent 1px),
      linear-gradient(90deg, var(--base-color) 1px, transparent 1px);
    background-size: var(--scale) var(--scale);
    transform: perspective(1000px) rotateX(var(--rotation)) translateZ(0) translateY(var(--parallax-y));
    transform-origin: top;
    backface-visibility: hidden;
    will-change: transform, opacity;
    transition: background-image 0.8s cubic-bezier(0.16, 1, 0.3, 1);
  }

  .grid-pattern::after {
    content: '';
    position: absolute;
    inset: 0;
    background-image: 
      linear-gradient(var(--accent-color) 1px, transparent 1px),
      linear-gradient(90deg, var(--accent-color) 1px, transparent 1px);
    background-size: var(--scale) var(--scale);
    filter: blur(0.5px);
    transform: translateZ(0);
    opacity: 0.8;
    transition: background-image 0.8s cubic-bezier(0.16, 1, 0.3, 1);
  }

  .grid-fade {
    position: absolute;
    inset: 0;
    background: linear-gradient(
      180deg,
      transparent 0%,
      var(--aeon-deep-space) 75%
    );
    opacity: 0.9;
  }
</style>