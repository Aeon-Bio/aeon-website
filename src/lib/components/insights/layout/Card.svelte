<!-- Base card with consistent styling -->
<div class="insight-card {$$props.class}">
  <slot />
</div>

<style>
  .insight-card {
    position: relative;
    border-radius: 0.75rem;
    background: var(--aeon-surface-0);
    backdrop-filter: blur(20px);
    overflow: hidden;
    box-shadow: 
      0 4px 6px -1px rgba(0, 0, 0, 0.2),
      0 2px 4px -2px rgba(0, 0, 0, 0.1),
      0 0 0 1px rgba(76, 201, 240, 0.05),
      0 8px 24px -4px rgba(0, 0, 0, 0.3);
    margin-bottom: 1rem;
  }

  .insight-card::before {
    content: '';
    position: absolute;
    inset: -1px;
    border-radius: inherit;
    padding: 1px;
    background: linear-gradient(
      45deg,
      rgba(76, 201, 240, 0.15),
      rgba(128, 255, 219, 0.15)
    );
    mask: linear-gradient(#fff 0 0) content-box,
          linear-gradient(#fff 0 0);
    -webkit-mask-composite: xor;
    mask-composite: exclude;
    pointer-events: none;
  }

  .insight-card::after {
    content: '';
    position: absolute;
    bottom: 0;
    left: 0;
    right: 0;
    height: 40px;
    background: linear-gradient(
      to bottom,
      transparent,
      rgba(17, 24, 39, 0.2)
    );
    pointer-events: none;
  }

  :global(body) {
    background: rgb(17, 24, 39);
  }

  .insight-card {
    --card-padding: 1.5rem;
    --section-spacing: 2rem;
    --text-primary: #4CC9F0;
    --text-secondary: #94A3B8;
    background: rgba(17, 24, 39, 0.95);
  }
</style> 