<script lang="ts">
	import type { Finding } from '../types';
	import RecommendationItem from '../RecommendationItem.svelte';

	export let finding: Finding;
</script>

<div class="space-y-6">
	{#each finding.recommendations as recommendation (recommendation.recommendation)}
		<RecommendationItem {recommendation} />
	{/each}
</div>
