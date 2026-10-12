<script lang="ts">
	import '../app.css';
	import { setContext, type Snippet } from 'svelte';
	import { page } from '$app/state';
	import { I18N, messages, isLang, type Lang } from '$lib/i18n';

	let { data, children }: { data: { lang?: Lang }; children: Snippet } = $props();

	const lang: Lang = $derived(isLang(data.lang) ? data.lang : 'en');

	// getters keep the context current; the {#key} below remounts the page when the language changes
	setContext(I18N, {
		get lang() {
			return lang;
		},
		get m() {
			return messages[lang];
		}
	});

	$effect(() => {
		document.documentElement.lang = lang;
	});

	const isHome = $derived(page.route.id === '/[[lang=lang]]');
</script>

<svelte:head>
	{#if isHome}
		<link rel="alternate" hreflang="en" href="https://aeon.science/" />
		<link rel="alternate" hreflang="ja" href="https://aeon.science/ja" />
		<link rel="alternate" hreflang="x-default" href="https://aeon.science/" />
	{/if}
</svelte:head>

<div class="app">
	<main>
		{#key lang}
			{@render children()}
		{/key}
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
