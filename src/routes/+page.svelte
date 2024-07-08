<script>
	import aeonLogo from '$lib/images/aeon.svg';
	import '@fontsource/montserrat';
</script>

<svelte:head>
	<title>Aeon</title>
	<meta name="description" content="Aeon Biosciences Welcome Page" />
</svelte:head>

<section>
	<h1>
		<span class="welcome">
			<picture>
				<source srcset={aeonLogo} type="image/svg" />
				<img src={aeonLogo} alt="Aeon" />
			</picture>
		</span>

		Aeon Biosciences
	</h1>

	<h2>
		<span class="subheader">Mapping biomolecules beyond foundation models,</span>
		<br />
		<span class="subheader">for the future of medicine & longevity.</span>
	</h2>
</section>

<style>
	section {
		display: flex;
		flex-direction: column;
		justify-content: center;
		align-items: center;
		flex: 0.6;
		max-height: 100vh;
		overflow: clip;
	}

	h2 {
		font-size: calc(0.1em + 1vw + 1vh);
	}

	h1,
	h2 {
		width: 100%;
		font-family: 'Montserrat', sans-serif;
		color: whitesmoke;
		text-align: center;
	}

	.subheader {
		white-space: nowrap;
	}

	.welcome {
		display: block;
		position: relative;
		width: 100%;
		height: 0;
		padding: 0 0 calc(100% * 495 / 2048) 0;
	}

	.welcome img {
		position: absolute;
		width: 100%;
		height: 100%;
		top: 0;
		display: block;
	}
</style>
