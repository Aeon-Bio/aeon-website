<!--
  Section view across one Aevum row, driven by scroll.
  `progress` 0→1 as the reader moves through the section:
    0.22–0.42  pipette descends off-axis into a well
    0.38–0.52  the well answers (glow)
    0.44–0.72  observer head slides under that well and reads
  Geometry is schematic, not to scale.
-->
<script lang="ts">
	export let progress = 0;
	/** the question the dialogue staked on this plate, if the reader carried one down */
	export let stake: string | null = null;

	const clamp01 = (v: number) => Math.min(1, Math.max(0, v));
	const seg = (p: number, a: number, b: number) => clamp01((p - a) / (b - a));
	const easeOut = (t: number) => 1 - Math.pow(1 - t, 3);

	$: descend = easeOut(seg(progress, 0.22, 0.42));
	$: answer = easeOut(seg(progress, 0.38, 0.52));
	$: observe = easeOut(seg(progress, 0.44, 0.72));

	// Pipette tip rests at y=108 (top of headspace); reaches y=196 in the well.
	$: tipY = 108 + descend * 88;
	// Observer head starts under tile 0 (x=213) and arrives under the well (x=368).
	$: obsDx = -155 + observe * 155;
</script>

<svg viewBox="0 0 880 400" role="img" aria-labelledby="instrument-diagram-title" class="instrument">
	<title id="instrument-diagram-title"
		>Section view of one Aevum row: pipette above, four plate tiles under a shared lid, observer
		head in the dry bay below, on the OT-2 deck.</title
	>

	<defs>
		<marker
			id="arr"
			viewBox="0 0 8 8"
			refX="7"
			refY="4"
			markerWidth="6"
			markerHeight="6"
			orient="auto"
		>
			<path d="M0,0 L8,4 L0,8 Z" fill="currentColor" />
		</marker>
		<radialGradient id="well-glow" cx="50%" cy="50%" r="50%">
			<stop offset="0%" stop-color="#80ffdb" stop-opacity="0.9" />
			<stop offset="100%" stop-color="#80ffdb" stop-opacity="0" />
		</radialGradient>
	</defs>

	<g class="deck">
		<rect x="60" y="352" width="760" height="10" />
		<text x="60" y="380" class="label">OT-2 deck · dry kinematic reference</text>
		{#if stake}
			<text
				x="820"
				y="380"
				class="label stake"
				text-anchor="end"
				style:opacity={0.25 + answer * 0.75}>asks · “{stake}”</text
			>
		{/if}
	</g>

	<g class="bay">
		<rect x="120" y="236" width="640" height="116" />
		<path d="M140,300 H740" class="corridor" />
		<text x="750" y="258" class="label" text-anchor="end">dry inverted bay</text>
	</g>

	<g class="observer" style:transform={`translateX(${obsDx}px)`}>
		<rect x="342" y="288" width="52" height="40" rx="3" />
		<path d="M368,288 V246" />
		<circle cx="368" cy="244" r="4" />
		<path d="M368,244 V214" class="beam" style:opacity={observe > 0.85 ? 1 : 0} />
		<text x="368" y="345" class="label" text-anchor="middle">observer</text>
	</g>

	<g class="tiles">
		{#each [0, 1, 2, 3] as i (i)}
			{@const x = 140 + i * 155}
			<rect {x} y="214" width="135" height="22" class="support" />
			<rect x={x + 28} y="214" width="79" height="22" class="aperture" />
			<rect x={x + 8} y="184" width="119" height="30" class="plate" />
			<path d={`M${x + 12},213 H${x + 123}`} class="glass" />
			{#each [0, 1, 2, 3, 4] as w (w)}
				<rect x={x + 22 + w * 19} y="190" width="12" height="21" class="well" />
			{/each}
			<circle cx={x + 8} cy="236" r="3" class="datum" />
			<circle cx={x + 127} cy="236" r="3" class="datum" />
		{/each}
		<circle cx="368" cy="201" r="26" fill="url(#well-glow)" style:opacity={answer} />
	</g>

	<g class="lid">
		<path d="M136,182 H760" class="mat" />
		<rect x="120" y="120" width="640" height="62" rx="4" class="headspace" />
		<rect x="120" y="108" width="640" height="12" rx="3" class="cap" />
		<text x="440" y="158" class="label" text-anchor="middle"
			>shared headspace · CO₂ / RH · four plates</text
		>
		<path d="M70,150 H118" class="flow" marker-end="url(#arr)" />
		<path d="M762,150 H810" class="flow" marker-end="url(#arr)" />
		<text x="66" y="140" class="label">supply</text>
		<text x="812" y="140" class="label" text-anchor="end">return</text>
	</g>

	<g class="pipette" style:transform={`translateY(${tipY - 108}px)`}>
		<rect x="366" y="20" width="18" height="60" rx="2" />
		<path d="M375,80 L372,108 L378,108 Z" />
	</g>
	<path d={`M375,108 V${tipY}`} class="tip" />
	<path d="M368,98 V232" class="axis" />
	<path d="M368,98 H375" class="offset" />
	<text x="392" y="60" class="label">P300 · enters 1.5 mm off the well centre</text>
	<text x="380" y="276" class="label">imaging axis stays clear</text>
</svg>

<style>
	.instrument {
		display: block;
		width: 100%;
		min-width: 560px;
		height: auto;
		font-family: var(--font-mono);
		color: rgba(128, 255, 219, 0.9);
	}

	.label {
		font-size: 11px;
		fill: var(--ink-50);
	}

	.label.stake {
		fill: rgba(128, 255, 219, 0.75);
	}

	.deck rect {
		fill: var(--ink-12);
	}

	.bay rect {
		fill: rgba(76, 201, 240, 0.04);
		stroke: rgba(76, 201, 240, 0.35);
		stroke-dasharray: 4 4;
	}

	.corridor {
		stroke: rgba(76, 201, 240, 0.25);
		stroke-dasharray: 2 6;
	}

	.observer,
	.pipette {
		transition: transform 80ms linear;
	}

	.observer rect {
		fill: rgba(76, 201, 240, 0.18);
		stroke: var(--aeon-primary);
	}

	.observer path {
		stroke: var(--aeon-primary);
		stroke-width: 1.5;
	}

	.observer .beam {
		stroke: var(--aeon-biolum);
		stroke-width: 2;
		stroke-dasharray: 2 3;
		transition: opacity var(--t-move) var(--ease-out);
	}

	.observer circle {
		fill: var(--aeon-primary);
	}

	.support {
		fill: rgba(128, 255, 219, 0.1);
		stroke: rgba(128, 255, 219, 0.5);
	}

	.aperture {
		fill: var(--aeon-deep-space);
	}

	.plate {
		fill: rgba(255, 255, 255, 0.05);
		stroke: var(--ink-50);
	}

	.glass {
		stroke: var(--aeon-biolum);
		stroke-width: 2;
	}

	.well {
		fill: none;
		stroke: var(--ink-30);
	}

	.datum {
		fill: var(--aeon-biolum);
	}

	.mat {
		stroke: var(--ink-50);
		stroke-width: 3;
		stroke-linecap: round;
	}

	.headspace {
		fill: rgba(128, 255, 219, 0.05);
		stroke: rgba(128, 255, 219, 0.4);
	}

	.cap {
		fill: var(--ink-12);
	}

	.flow {
		stroke: rgba(128, 255, 219, 0.7);
		stroke-width: 1.5;
		color: rgba(128, 255, 219, 0.7);
	}

	.pipette rect,
	.pipette path {
		fill: var(--ink-70);
	}

	.tip {
		stroke: var(--ink-70);
		stroke-width: 2;
	}

	.axis {
		stroke: var(--aeon-biolum);
		stroke-dasharray: 3 3;
	}

	.offset {
		stroke: var(--aeon-biolum);
	}

	@media (prefers-reduced-motion: reduce) {
		.observer,
		.pipette {
			transition: none;
		}
	}
</style>
