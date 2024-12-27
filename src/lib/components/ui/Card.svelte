<script lang="ts">
    export let className = '';
</script>

<div class="card {className}">
    <div class="glow-effect"></div>
    <div class="content">
        <slot />
    </div>
</div>

<style>
    .card {
        position: relative;
        border-radius: 1rem;
        background: var(--aeon-surface-1);
        backdrop-filter: blur(20px);
        transition: all 0.6s cubic-bezier(0.16, 1, 0.3, 1);
        box-shadow: 
            0 0 0 1px rgba(76, 201, 240, 0.1),
            0 4px 20px rgba(0, 0, 0, 0.4),
            0 0 60px rgba(76, 201, 240, 0.1);
    }

    .card::before {
        content: '';
        position: absolute;
        inset: -1px;
        border-radius: inherit;
        padding: 1px;
        background: linear-gradient(
            45deg,
            rgba(76, 201, 240, 0.1),
            rgba(128, 255, 219, 0.1)
        );
        mask: linear-gradient(#fff 0 0) content-box,
              linear-gradient(#fff 0 0);
        -webkit-mask-composite: xor;
        mask-composite: exclude;
        pointer-events: none;
    }

    .glow-effect {
        position: absolute;
        inset: 0;
        border-radius: inherit;
        opacity: 0;
        transition: opacity 0.3s ease-out;
    }

    .content {
        position: relative;
        z-index: 1;
    }
</style> 