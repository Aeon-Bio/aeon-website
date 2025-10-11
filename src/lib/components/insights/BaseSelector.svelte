<script lang="ts">
	import { ChevronLeft, ChevronRight } from 'lucide-svelte';

	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	export let items: any[];
	export let selectedIndex: number = 0;
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	export let getDisplayText: (item: any) => string;
	export let label: string = 'Item';

	function next() {
		selectedIndex = (selectedIndex + 1) % items.length;
	}

	function previous() {
		selectedIndex = selectedIndex === 0 ? items.length - 1 : selectedIndex - 1;
	}

	$: hasMultiple = items.length > 1;
</script>

<div
	class="flex items-center gap-2 w-fit py-2 m-auto {hasMultiple
		? 'justify-between'
		: 'justify-center'}"
>
	{#if hasMultiple}
		<button class="p-1 hover:bg-aeon-surface-0 rounded-full transition-colors" on:click={previous}>
			<ChevronLeft class="h-4 w-4" />
		</button>
	{/if}

	<div class="text-sm text-aeon-biolum">
		{#if hasMultiple}
			{label} {selectedIndex + 1} of {items.length}
		{/if}
		<span class="text-aeon-primary {hasMultiple ? 'ml-2' : ''}">
			{getDisplayText(items[selectedIndex])}
		</span>
	</div>

	{#if hasMultiple}
		<button class="p-1 hover:bg-aeon-surface-0 rounded-full transition-colors" on:click={next}>
			<ChevronRight class="h-4 w-4" />
		</button>
	{/if}
</div>
