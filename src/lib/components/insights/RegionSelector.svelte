<script lang="ts">
	import type { AssociatedRegion } from '$lib/types/insights';
	import BaseSelector from './BaseSelector.svelte';

	export let regions: AssociatedRegion[];
	export let selectedIndex: number = 0;

	function getDisplayText(region: AssociatedRegion): string {
		return region.matched_probe || region.matched_gene || '';
	}
</script>

<BaseSelector items={regions} bind:selectedIndex {getDisplayText} label="Region" />
