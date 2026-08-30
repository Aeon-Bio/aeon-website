<!--
  The ot2-harness authority path. A request travels down the stack as the
  reader scrolls; each layer lights when the request reaches it. Hovering a
  denied capability shows which layer refuses it.
-->
<script lang="ts">
	export let progress = 0;

	const layers = [
		{ name: 'agent', note: 'proposes a plan, reads context' },
		{ name: 'adapter', note: 'MCP · CLI · HTTP — allow-listed, holds no state' },
		{ name: 'daemon', note: 'the one owner of the robot session' },
		{ name: 'session', note: 'fixture identity · orientation · approvals' },
		{ name: 'gates', note: 'validator · lock · registry · evidence' },
		{ name: 'client', note: 'narrow Opentrons HTTP, only the step in hand' },
		{ name: 'OT-2', note: '' }
	];

	const denied = [
		{ what: 'raw coordinate moves', by: 1 },
		{ what: 'arbitrary HTTP or Python', by: 1 },
		{ what: 'setting offsets directly', by: 3 },
		{ what: 'minting its own approval', by: 3 },
		{ what: 'restating fixture orientation', by: 3 },
		{ what: 'skipping fixture QC', by: 4 }
	];

	let hovered: number | null = null;

	$: reached = Math.floor(Math.min(1, Math.max(0, (progress - 0.2) / 0.45)) * layers.length);
</script>

<div class="stack">
	<ol class="layers" aria-label="Authority path from agent to OT-2">
		{#each layers as layer, i (layer.name)}
			<li
				class:lit={i < reached}
				class:refusing={hovered !== null && denied[hovered].by === i}
				class:terminal={i === 0 || i === layers.length - 1}
			>
				<span class="name">{layer.name}</span>
				{#if layer.note}<span class="note">{layer.note}</span>{/if}
			</li>
		{/each}
	</ol>

	<div class="denied">
		<p class="denied-title">the agent never gets</p>
		<ul>
			{#each denied as d, i (d.what)}
				<li>
					<button
						type="button"
						on:mouseenter={() => (hovered = i)}
						on:mouseleave={() => (hovered = null)}
						on:focus={() => (hovered = i)}
						on:blur={() => (hovered = null)}
					>
						<span class="x" aria-hidden="true">×</span>{d.what}
						<span class="by">refused at {layers[d.by].name}</span>
					</button>
				</li>
			{/each}
		</ul>
	</div>
</div>

<style>
	.stack {
		display: grid;
		grid-template-columns: minmax(0, 3fr) minmax(0, 2fr);
		gap: 2.5rem;
		font-family: var(--font-mono);
	}

	.layers {
		list-style: none;
		margin: 0;
		padding: 0;
	}

	.layers li {
		position: relative;
		padding: 0.6rem 0.9rem 0.6rem 1.7rem;
		border: 1px solid var(--ink-12);
		border-radius: 0.3rem;
		margin-bottom: 0.55rem;
		display: flex;
		flex-wrap: wrap;
		gap: 0.25rem 1rem;
		align-items: baseline;
		color: var(--ink-30);
		transition:
			color var(--t-move) var(--ease-out),
			border-color var(--t-move) var(--ease-out),
			background-color var(--t-move) var(--ease-out);
	}

	.layers li::before {
		content: '';
		position: absolute;
		left: 0.75rem;
		top: 50%;
		width: 5px;
		height: 5px;
		border-radius: 50%;
		background: currentColor;
		transform: translateY(-50%);
	}

	.layers li::after {
		content: '↓';
		position: absolute;
		left: 0.5rem;
		bottom: -0.78rem;
		font-size: 0.75rem;
		line-height: 1;
		color: var(--ink-12);
		transition: color var(--t-move) var(--ease-out);
	}

	.layers li:last-child::after {
		content: none;
	}

	.layers li.lit {
		color: var(--ink-100);
		border-color: rgba(76, 201, 240, 0.35);
		background: rgba(76, 201, 240, 0.05);
	}

	.layers li.lit::before {
		background: var(--aeon-primary);
		box-shadow: 0 0 8px rgba(76, 201, 240, 0.6);
	}

	.layers li.lit::after {
		color: rgba(76, 201, 240, 0.6);
	}

	.layers li.terminal.lit {
		border-color: rgba(128, 255, 219, 0.45);
		background: rgba(128, 255, 219, 0.07);
	}

	.layers li.terminal.lit::before {
		background: var(--aeon-biolum);
	}

	.layers li.refusing {
		border-color: var(--aeon-warn);
		background: rgba(240, 96, 120, 0.08);
		color: var(--ink-100);
	}

	.layers li.refusing::before {
		background: var(--aeon-warn);
		box-shadow: 0 0 10px rgba(240, 96, 120, 0.7);
	}

	.name {
		font-size: 0.84rem;
	}

	.note {
		font-size: 0.72rem;
		color: var(--ink-50);
	}

	.denied-title {
		font-size: 0.72rem;
		letter-spacing: 0.1em;
		text-transform: uppercase;
		color: var(--ink-50);
		margin: 0 0 0.75rem;
	}

	.denied ul {
		list-style: none;
		margin: 0;
		padding: 0;
	}

	.denied button {
		font-family: inherit;
		font-size: 0.86rem;
		line-height: 1.5;
		padding: 0.35rem 0;
		color: var(--ink-70);
		background: none;
		border: 0;
		cursor: default;
		display: flex;
		flex-wrap: wrap;
		gap: 0 0.6rem;
		align-items: baseline;
		text-align: left;
		width: 100%;
	}

	.denied button:hover,
	.denied button:focus-visible {
		color: var(--ink-100);
		outline: none;
	}

	.x {
		color: var(--aeon-warn);
	}

	.by {
		font-size: 0.68rem;
		color: var(--ink-30);
		opacity: 0;
		transition: opacity var(--t-snap) var(--ease-out);
	}

	.denied button:hover .by,
	.denied button:focus-visible .by {
		opacity: 1;
	}

	@media (max-width: 800px) {
		.stack {
			grid-template-columns: 1fr;
		}
	}
</style>
