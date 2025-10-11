<script lang="ts">
	import { BarChart, Info } from 'lucide-svelte';
	import type { PersonalMethylationMetrics, PopulationModes } from '../../../types/insights';
	import { fade } from 'svelte/transition';

	export let metrics: PersonalMethylationMetrics;
	export let modes: PopulationModes[];
	export let direction: 'hyper' | 'hypo';

	// Helper function for ordinal suffixes
	function getOrdinalSuffix(n: number): string {
		const lastDigit = n % 10;
		const lastTwoDigits = n % 100;

		if (lastTwoDigits >= 11 && lastTwoDigits <= 13) {
			return 'th';
		}

		switch (lastDigit) {
			case 1:
				return 'st';
			case 2:
				return 'nd';
			case 3:
				return 'rd';
			default:
				return 'th';
		}
	}

	// Format percentile nicely
	$: formattedPercentile =
		metrics.percentile === 100
			? '100th'
			: metrics.percentile < 0.01
				? '< 0.01th'
				: metrics.percentile < 0.1
					? `< ${metrics.percentile.toFixed(1)}<span class="text-xs align-top">st</span>`
					: metrics.percentile > 99.9
						? `> ${metrics.percentile.toFixed(1)}<span class="text-xs align-top">th</span>`
						: (() => {
								const displayedValue = metrics.percentile.toFixed(1);
								const lastDigit = parseInt(displayedValue.slice(-1));
								return `${displayedValue}<span class="text-xs align-top">${getOrdinalSuffix(lastDigit)}</span>`;
							})();

	let combinedGradient: string;

	// Gaussian-like function for combined gradient
	function gaussian(x: number, center: number, spread: number): number {
		const exponent = -Math.pow(x - center, 2) / (2 * Math.pow(spread, 2));
		return Math.exp(exponent);
	}

	// Calculate combined gradient
	$: {
		const steps = 100; // Number of steps for the gradient
		const gradientStops = [];
		const opacityScale = 2; // Scale factor for the opacity

		for (let i = 0; i <= steps; i++) {
			const position = i / steps;
			let opacity = 0;

			if (modes) {
				modes.forEach((mode) => {
					const gaussianValue = gaussian(position, mode.center, mode.spread);
					opacity += (gaussianValue * mode.density) / 100;
				});
			}

			// Scale and add base opacity
			opacity = Math.min(1, opacity * opacityScale);

			gradientStops.push(`rgba(156, 163, 175,${opacity}) ${position * 100}%`);
		}

		combinedGradient = `linear-gradient(to right, ${gradientStops.join(',')})`;
	}

	// Calculate label positions with collision avoidance
	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	$: labelPositions = (() => {
		const minSpacing = 0.1; // Minimum 10% spacing between labels
		const labels = [
			...(modes?.map((mode, i) => ({
				pos: mode.center,
				text: `Peak ${i + 1}`,
				priority: 2,
				index: i
			})) || [])
		].sort((a, b) => a.pos - b.pos);

		// If labels are too close, hide lower priority ones
		for (let i = 1; i < labels.length; i++) {
			const prev = labels[i - 1];
			const curr = labels[i];
			if (curr.pos - prev.pos < minSpacing) {
				// Hide the lower priority label
				if (prev.priority < curr.priority) {
					prev.hidden = true;
				} else if (curr.priority < prev.priority) {
					curr.hidden = true;
				}
			}
		}

		return labels
			.filter((label) => !label.hidden)
			.map((label) => ({
				...label,
				yOffset: label.index % 2 === 0 ? 20 : 15 // Stagger labels vertically
			}));
	})();

	let showStatsInfo = false;
	// eslint-disable-next-line no-undef
	let tooltipTimeout: NodeJS.Timeout;

	function handleTooltipEnter() {
		clearTimeout(tooltipTimeout);
		showStatsInfo = true;
	}

	function handleTooltipLeave() {
		tooltipTimeout = setTimeout(() => {
			showStatsInfo = false;
		}, 100);
	}
</script>

<div class="bg-aeon-surface-1 rounded-lg">
	<div class="flex items-center justify-between p-6 pb-0">
		<h4 class="font-medium text-white flex items-center gap-2">
			<BarChart class="h-4 w-4 text-aeon-primary" />
			Methylation Status
		</h4>
		<div class="relative">
			<button
				class="p-1.5 hover:bg-aeon-surface-1 rounded-lg transition-colors"
				on:mouseenter={handleTooltipEnter}
				on:mouseleave={handleTooltipLeave}
			>
				<Info class="h-4 w-4 text-aeon-primary" />
			</button>

			{#if showStatsInfo}
				<div
					class="stats-tooltip"
					transition:fade={{ duration: 150 }}
					on:mouseenter={handleTooltipEnter}
					on:mouseleave={handleTooltipLeave}
				>
					<p class="text-sm text-gray-400 mb-2">
						This chart shows how your methylation level compares to the population distribution.
					</p>
					<ul class="space-y-2">
						<li class="grid grid-cols-[auto_1fr] gap-2">
							<strong>Your Level:</strong>
							<span>Percentage of your cells where methylation is seen.</span>
						</li>
						<li class="grid grid-cols-[auto_1fr] gap-2">
							<strong>Population:</strong>
							<span>Closest percentage peak seen in the population.</span>
						</li>
						<li class="grid grid-cols-[auto_1fr] gap-2">
							<strong>Deviation:</strong>
							<span>Standard deviation from the closest peak.</span>
						</li>
						<li class="grid grid-cols-[auto_1fr] gap-2">
							<strong>Percentile:</strong>
							<span>Your rank within the population.</span>
						</li>
					</ul>
				</div>
			{/if}
		</div>
	</div>
	<div class="p-6 space-y-8">
		<!-- Visualization -->
		<div class="relative">
			<!-- Labels -->
			<div
				class="absolute text-[#4CC9F0] text-sm whitespace-nowrap transition-all"
				style:left={`${metrics.value * 100}%`}
				style:transform="translateX(-50%)"
				style:bottom="-20px"
			>
				You
			</div>

			<!-- Bar -->
			<div class="relative h-24 w-full rounded-lg overflow-hidden border border-gray-700">
				<!-- Combined Background -->
				<div class="absolute inset-0" style:background={combinedGradient} />

				{#each modes as mode (mode.center)}
					<div class="absolute top-0 h-full" style:left={`${mode.center * 100}%`}>
						<div class="absolute h-full w-[1px] bg-gray-400/50" />
					</div>
				{/each}

				<!-- Your Value Marker -->
				<div class="absolute top-0 h-full" style:left={`${metrics.value * 100}%`}>
					<div class="absolute h-full w-0.5 bg-[#4CC9F0] shadow-[0_0_8px_rgba(76,201,240,0.3)]" />
				</div>
			</div>

			<!-- Axis Labels -->
			<div
				class="absolute top-[-18px] left-0 right-0 flex justify-between text-xs text-gray-500 px-2"
			>
				<span>0%</span>
				<span>25%</span>
				<span>50%</span>
				<span>75%</span>
				<span>100%</span>
			</div>
		</div>

		<!-- Metrics -->
		<div class="grid grid-cols-2 gap-x-12 gap-y-4">
			<div>
				<div class="text-gray-500 text-sm mb-1">Your Level</div>
				<div class="text-[#4CC9F0] text-2xl font-medium">
					{(metrics.value * 100).toFixed(1)}%
				</div>
			</div>
			<div>
				<div class="text-gray-500 text-sm mb-1">Population</div>
				<div class="flex items-baseline gap-2">
					<span class="text-white text-2xl font-medium">
						{#if modes && modes.length > 0}
							{(() => {
								const sortedModes = [...modes].sort((a, b) => a.center - b.center);
								const relevantMode =
									metrics.methylation_state === 'hypo'
										? sortedModes[0]
										: sortedModes[sortedModes.length - 1];
								return (relevantMode.center * 100).toFixed(1);
							})()}%
						{/if}
					</span>
				</div>
			</div>
			<div>
				<div class="text-gray-500 text-sm mb-1">Deviation</div>
				<div class="text-white text-2xl font-medium">
					{#if metrics.deviations.mode_deviation === 0}
						No Deviation
					{:else}
						{Math.abs(metrics.deviations.mode_deviation).toFixed(1)}x
						{metrics.deviations.mode_deviation > 0 ? 'higher' : 'lower'}
					{/if}
				</div>
				<div class="text-gray-400 text-sm">from typical</div>
			</div>
			<div>
				<div class="text-gray-500 text-sm mb-1">Percentile</div>
				<div class="text-white text-2xl font-medium">
					<!-- eslint-disable-next-line svelte/no-at-html-tags -->
					{@html formattedPercentile}
				</div>
			</div>
		</div>
	</div>
</div>

<style>
	.stats-tooltip {
		position: absolute;
		right: 0;
		top: 100%;
		margin-top: 0.5rem;
		background: var(--aeon-surface-0);
		border-radius: 0.75rem;
		padding: 0.75rem 1rem;
		width: max-content;
		max-width: 300px;
		font-size: 0.875rem;
		line-height: 1.4;
		color: var(--aeon-biolum);
		box-shadow:
			0 0 0 1px rgba(76, 201, 240, 0.1),
			0 4px 20px rgba(0, 0, 0, 0.4);
		z-index: 10;
	}

	.stats-tooltip::before {
		content: '';
		position: absolute;
		inset: -1px;
		border-radius: inherit;
		padding: 1px;
		background: linear-gradient(45deg, rgba(76, 201, 240, 0.15), rgba(128, 255, 219, 0.15));
		mask:
			linear-gradient(#fff 0 0) content-box,
			linear-gradient(#fff 0 0);
		-webkit-mask-composite: xor;
		mask-composite: exclude;
		pointer-events: none;
	}

	.stats-tooltip strong {
		color: white;
	}

	.text-xs.align-top {
		line-height: 1.2rem;
	}
</style>
