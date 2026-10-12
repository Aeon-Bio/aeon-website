<script lang="ts">
	export let opacity = 0.9;
</script>

<div class="viewport-gradient" style="opacity: {opacity}"></div>
<div class="grain" aria-hidden="true"></div>

<style>
	.viewport-gradient {
		position: fixed;
		inset: 0;
		z-index: 0;
		pointer-events: none;
		background: linear-gradient(180deg, transparent 0%, var(--aeon-deep-space) 75%);
	}

	/* dither: a faint static grain so the long dark ramp does not band into stripes */
	.grain {
		position: fixed;
		inset: 0;
		z-index: 0;
		pointer-events: none;
		opacity: 0.035;
		background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='160' height='160'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2' stitchTiles='stitch'/%3E%3CfeColorMatrix values='0 0 0 0 1 0 0 0 0 1 0 0 0 0 1 0 0 0 1 0'/%3E%3C/filter%3E%3Crect width='160' height='160' filter='url(%23n)'/%3E%3C/svg%3E");
		background-size: 160px 160px;
	}
</style>
