<!-- Overview tab content -->
<script lang="ts">
	import { Target, FileText, Network, ChevronRight, ArrowRight } from 'lucide-svelte';
	import type { Finding } from '$lib/types/insights';
	import RecommendationItem from '../RecommendationItem.svelte';
	import MethylationStatus from '../visualizations/MethylationStatus.svelte';
	import RegionSelector from '../RegionSelector.svelte';

	export let finding: Finding;
	let selectedRegionIndex = 0;

	$: uniqueRegions = (() => {
		// eslint-disable-next-line svelte/prefer-svelte-reactivity
		const seen = new Set();
		return finding.provenance.associated_regions.filter((region) => {
			const key = region.matched_probe
				? `${region.matched_gene}-${region.matched_probe}`
				: region.matched_gene;
			if (seen.has(key)) {
				return false;
			}
			seen.add(key);
			return true;
		});
	})();

	// Dispatch event for tab changes
	import { createEventDispatcher } from 'svelte';
	const dispatch = createEventDispatcher<{ tabChange: string }>();

	function handleContextLink() {
		dispatch('tabChange', 'science');
	}
</script>

<div class="space-y-6">
	<!-- Key Recommendation -->
	{#if finding.recommendations.length}
		<div class="bg-aeon-surface-1 p-4 rounded-lg">
			<h4 class="font-medium text-white flex items-center gap-2 mb-4">
				<Target class="h-4 w-4 text-aeon-primary" />
				Key Recommendation
			</h4>
			<div class="space-y-4">
				<RecommendationItem recommendation={finding.recommendations[0]} abbreviated={true} />
				<button
					class="inline-flex items-center gap-2 text-sm text-aeon-primary hover:text-aeon-biolum transition-colors group"
					on:click={() => dispatch('tabChange', 'recommendations')}
				>
					View full recommendation details
					<ArrowRight class="h-4 w-4 group-hover:translate-x-0.5 transition-transform" />
				</button>
			</div>
		</div>
	{/if}

	<!-- Description -->
	<div class="bg-aeon-surface-1 p-6 rounded-lg">
		<h4 class="font-medium text-white flex items-center gap-2 mb-3">
			<FileText class="h-4 w-4 text-aeon-primary" />
			What This Means
		</h4>
		<p class="text-lg leading-relaxed text-[#4CC9F0]">
			{finding.description}
		</p>
	</div>

	<!-- Technical Details Grid -->
	<div class="grid gap-6 grid-cols-1 md:grid-cols-2">
		<div class="bg-aeon-surface-1 rounded-lg">
			{#if uniqueRegions.length > 1}
				<RegionSelector regions={uniqueRegions} bind:selectedIndex={selectedRegionIndex} />
			{/if}
			<MethylationStatus
				metrics={uniqueRegions[selectedRegionIndex].personal_metrics}
				modes={uniqueRegions[selectedRegionIndex].modes}
				direction={uniqueRegions[selectedRegionIndex].direction}
			/>
		</div>

		<!-- Biological Impact -->
		<div class="bg-aeon-surface-1 p-6 rounded-lg">
			<h4 class="font-medium text-white flex items-center gap-2 mb-6">
				<Network class="h-4 w-4 text-aeon-primary" />
				Biological Impact
			</h4>
			<div class="space-y-6">
				<!-- Key Function -->
				<div>
					<div class="text-sm text-gray-400 mb-2">Primary Function</div>
					<div class="text-[#4CC9F0] text-lg">
						{finding.knowledgeContext.establishedFunctions[0]}
					</div>
				</div>

				<!-- Tissue Context -->
				<div>
					<div class="text-sm text-gray-400 mb-1">Where It Matters</div>
					<div class="text-white">
						{finding.knowledgeContext.tissueContext.split('.')[0]}
					</div>
				</div>

				<!-- Health Impact -->
				<div>
					<div class="text-sm text-gray-400 mb-1">Health Relevance</div>
					<div class="text-white">
						{finding.evidence.healthRelevance}
					</div>
				</div>

				<!-- Link to Science tab -->
				<button
					class="text-sm text-aeon-primary hover:text-aeon-biolum transition-colors flex items-center gap-1 group"
					on:click={handleContextLink}
				>
					View full biological context
					<ChevronRight class="h-4 w-4 group-hover:translate-x-0.5 transition-transform" />
				</button>
			</div>
		</div>
	</div>
</div>
