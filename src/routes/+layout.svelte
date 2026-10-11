<script lang="ts">
	import '../app.css';
</script>

<div class="app">
	<main>
		<slot />
	</main>

	<footer></footer>
</div>

<style>
	.app {
		display: flex;
		flex-direction: column;
		min-height: 100vh;
	}

	main {
		flex: 1;
		display: flex;
		flex-direction: column;
		width: 100%;
		margin: 0;
		padding: 0;
		box-sizing: border-box;
	}

	footer {
		display: none;
	}

	@media (min-width: 480px) {
		footer {
			padding: 12px 0;
		}
	}
</style>
