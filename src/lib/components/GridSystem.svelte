<script lang="ts">
  import { gridActivity } from '../stores/grid';
  
  export let scale = 50;
  export let intensity = 0.15;
  
  $: focusPoint = $gridActivity.focusPoint;
  $: baseIntensity = $gridActivity.baseIntensity;
  $: systemActivity = $gridActivity.activity;
</script>

<div class="grid-container">
  <div 
    class="grid-pattern" 
    style="
      --scale: {scale}px;
      --base-intensity: {baseIntensity};
      --activity: {systemActivity};
      --focus-x: {focusPoint ? focusPoint.x + 'px' : '50%'};
      --focus-y: {focusPoint ? focusPoint.y + 'px' : '50%'};
    "
  />
  <div class="grid-fade" />
</div>

<style>
  .grid-container {
    position: fixed;
    inset: 0;
    pointer-events: none;
    z-index: -1;
    overflow: hidden;
  }

  .grid-pattern {
    position: absolute;
    width: 100%;
    height: 100%;
    background-image: 
      linear-gradient(
        rgba(76, 201, 240, calc(var(--base-intensity) * (1 + var(--activity) * 0.5))) 1px, 
        transparent 1px
      ),
      linear-gradient(
        90deg, 
        rgba(76, 201, 240, calc(var(--base-intensity) * (1 + var(--activity) * 0.5))) 1px, 
        transparent 1px
      );
    background-size: var(--scale) var(--scale);
    transform: perspective(1000px) rotateX(60deg) translateZ(0);
    transform-origin: top;
    backface-visibility: hidden;
    will-change: transform;
    transition: background-image 0.8s cubic-bezier(0.16, 1, 0.3, 1);
  }

  .grid-pattern::after {
    content: '';
    position: absolute;
    inset: 0;
    background: radial-gradient(
      circle at var(--focus-x) var(--focus-y),
      transparent,
      rgba(76, 201, 240, 0.04) 20%,
      transparent 40%
    );
    opacity: var(--activity);
    transition: all 0.8s cubic-bezier(0.16, 1, 0.3, 1);
    transform: translateZ(0);
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