<script lang="ts">
	export let opacity = 0.9;
</script>

<div class="viewport-gradient" style="opacity: {opacity}"></div>

<style>
	.viewport-gradient {
		position: fixed;
		inset: 0;
		z-index: 0;
		pointer-events: none;
		background: linear-gradient(180deg, transparent 0%, var(--aeon-deep-space) 75%);
	}
</style>
