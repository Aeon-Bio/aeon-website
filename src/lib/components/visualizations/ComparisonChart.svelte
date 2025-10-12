<script lang="ts">
	import { onMount } from 'svelte';
	import { fade, scale } from 'svelte/transition';
	import { WandSparkles, Pointer } from 'lucide-svelte';

	export let height = 400;
	export let interactive = true;

	interface ComparisonDataPoint {
		correlation: number;
		causation: number;
		label: string;
		category: 'misleading' | 'validated' | 'causal';
		biomolecularPath?: string[];
		correlationReason?: string;
		causalMechanism?: string;
	}

	interface VisualizationNode {
		id: string;
		label: string;
		x: number;
		y: number;
		type: 'factor' | 'outcome' | 'confounding';
		active: boolean;
		pulse: number;
	}

	interface CausalConnection {
		from: string;
		to: string;
		type: 'causal' | 'confounding' | 'correlation';
		strength: number;
		active: boolean;
	}

	let container: HTMLDivElement;
	let currentView: 'overview' | 'correlation' | 'causation' = 'overview';
	let hoveredDataPoint: ComparisonDataPoint | null = null;
	let animationId: number;
	let isVisible = false;
	let hoverTimeout: ReturnType<typeof setTimeout>;
	let popoverPosition = { x: 0, y: 0 };
	let shouldUseBottomSheet = false;
	let isTouchDevice = false;
	let hasInteracted = false;
	let portalTarget: HTMLElement;

	// Sample data showing correlation vs causation examples
	const comparisonData: ComparisonDataPoint[] = [
		{
			correlation: 0.85,
			causation: 0.2,
			label: 'Ice cream sales & drowning',
			category: 'misleading',
			correlationReason: 'Both increase in summer',
			causalMechanism: 'Temperature is the confounding variable'
		},
		{
			correlation: 0.75,
			causation: 0.15,
			label: 'Shoe size & reading ability',
			category: 'misleading',
			correlationReason: 'Both correlate with age in children',
			causalMechanism: 'Age drives both variables independently'
		},
		{
			correlation: 0.65,
			causation: 0.8,
			label: 'BRCA1 mutations & breast cancer',
			category: 'causal',
			biomolecularPath: ['BRCA1 gene', 'DNA repair dysfunction', 'Cancer risk'],
			causalMechanism: 'Direct molecular pathway from mutation to disease'
		},
		{
			correlation: 0.7,
			causation: 0.75,
			label: 'Inflammation markers & cardiovascular risk',
			category: 'causal',
			biomolecularPath: ['Inflammatory cytokines', 'Endothelial dysfunction', 'Atherosclerosis'],
			causalMechanism: 'Inflammatory cascade directly damages arteries'
		},
		{
			correlation: 0.6,
			causation: 0.7,
			label: 'Methylation patterns & aging',
			category: 'validated',
			biomolecularPath: ['DNA methylation', 'Gene expression changes', 'Cellular aging'],
			causalMechanism: 'Epigenetic changes drive biological aging process'
		}
	];

	// Nodes for causal pathway visualization
	const correlationNodes: VisualizationNode[] = [
		{
			id: 'supplements',
			label: 'Vitamin E Intake',
			x: 15,
			y: 25,
			type: 'factor',
			active: false,
			pulse: 0
		},
		{
			id: 'health',
			label: 'Health Outcomes',
			x: 85,
			y: 25,
			type: 'factor',
			active: false,
			pulse: 0
		},
		{
			id: 'lifestyle',
			label: 'Healthy Lifestyle',
			x: 50,
			y: 65,
			type: 'confounding',
			active: false,
			pulse: 0
		}
	];

	const causalNodes: VisualizationNode[] = [
		{
			id: 'statin',
			label: 'Statin Treatment',
			x: 12,
			y: 30,
			type: 'factor',
			active: false,
			pulse: 0
		},
		{ id: 'ldl', label: 'LDL Reduction', x: 35, y: 50, type: 'factor', active: false, pulse: 0 },
		{
			id: 'plaque',
			label: 'Plaque Formation',
			x: 65,
			y: 50,
			type: 'factor',
			active: false,
			pulse: 0
		},
		{ id: 'events', label: 'Heart Attacks', x: 88, y: 30, type: 'outcome', active: false, pulse: 0 }
	];

	const correlationConnections: CausalConnection[] = [
		{ from: 'lifestyle', to: 'supplements', type: 'confounding', strength: 0.8, active: false },
		{ from: 'lifestyle', to: 'health', type: 'confounding', strength: 0.8, active: false },
		{ from: 'supplements', to: 'health', type: 'correlation', strength: 0.6, active: false }
	];

	const causalConnections: CausalConnection[] = [
		{ from: 'statin', to: 'ldl', type: 'causal', strength: 0.95, active: false },
		{ from: 'ldl', to: 'plaque', type: 'causal', strength: 0.85, active: false },
		{ from: 'plaque', to: 'events', type: 'causal', strength: 0.9, active: false }
	];

	// Color schemes matching FactorGraph
	const colors = {
		molecular: { primary: '#4cc9f0', secondary: '#7dd3fc' },
		biological: { primary: '#80ffdb', secondary: '#a7f3d0' },
		outcome: { primary: '#fbbf24', secondary: '#fcd34d' },
		misleading: { primary: '#ef4444', secondary: '#f87171' },
		confounding: { primary: '#8b5cf6', secondary: '#a78bfa' }
	};

	function getPointColor(dataPoint: ComparisonDataPoint): string {
		switch (dataPoint.category) {
			case 'misleading':
				return colors.misleading.primary;
			case 'validated':
				return colors.biological.primary;
			case 'causal':
				return colors.outcome.primary;
			default:
				return colors.molecular.primary;
		}
	}

	function getNodeColor(node: VisualizationNode): string {
		switch (node.type) {
			case 'factor':
				return colors.molecular.primary;
			case 'outcome':
				return colors.outcome.primary;
			case 'confounding':
				return colors.confounding.primary;
			default:
				return colors.biological.primary;
		}
	}

	function getConnectionColor(connection: CausalConnection): string {
		switch (connection.type) {
			case 'causal':
				return colors.biological.primary;
			case 'confounding':
				return colors.confounding.primary;
			case 'correlation':
				return colors.misleading.primary;
			default:
				return colors.molecular.primary;
		}
	}

	function buildConnectionPath(
		from: VisualizationNode,
		to: VisualizationNode,
		bendStrength = 6
	): string {
		const startX = from.x;
		const startY = from.y;
		const endX = to.x;
		const endY = to.y;
		const dx = endX - startX;
		const dy = endY - startY;
		const length = Math.hypot(dx, dy) || 1;
		const unitX = dx / length;
		const unitY = dy / length;
		const perpX = -unitY;
		const perpY = unitX;
		const curve = Math.min(Math.max(length * 0.12, 3.5), bendStrength);
		const controlX = startX + dx * 0.5 + perpX * curve;
		const controlY = startY + dy * 0.5 + perpY * curve;
		return `M${startX},${startY} Q${controlX},${controlY} ${endX},${endY}`;
	}

	function switchView(newView: typeof currentView) {
		currentView = newView;
		animateView();
	}

	function animateView() {
		const nodes = currentView === 'correlation' ? correlationNodes : causalNodes;
		const connections = currentView === 'correlation' ? correlationConnections : causalConnections;

		// Reset all states
		nodes.forEach((node) => {
			node.active = false;
			node.pulse = 0;
		});
		connections.forEach((conn) => (conn.active = false));

		if (currentView === 'overview') return;

		if (currentView === 'correlation') {
			// Show correlation failure: intervention breaks the spurious relationship
			animateCorrelationFailure();
		} else {
			// Show causal success: intervention works through mechanism
			animateCausalSuccess();
		}
	}

	function animateCorrelationFailure() {
		// Step 1: Show observational correlation
		setTimeout(() => {
			correlationNodes[0].active = true; // supplements
			correlationNodes[0].pulse = 1.5;
		}, 200);

		setTimeout(() => {
			correlationNodes[1].active = true; // health
			correlationNodes[1].pulse = 1.5;
			// Show spurious correlation line
			correlationConnections[2].active = true;
		}, 500);

		// Step 2: Reveal the hidden confounder
		setTimeout(() => {
			correlationNodes[2].active = true; // lifestyle
			correlationNodes[2].pulse = 2.0; // Bigger pulse for confounder
		}, 1200);

		// Step 3: Show the real causal structure
		setTimeout(() => {
			correlationConnections[0].active = true; // lifestyle → supplements
			correlationConnections[1].active = true; // lifestyle → health
		}, 1800);

		// Step 4: Highlight intervention failure (pulse the broken correlation)
		setTimeout(() => {
			correlationNodes[0].pulse = 3.0; // Intervention emphasis
			// Fade the spurious correlation to show it breaks
			correlationConnections[2].active = false;
		}, 2500);
	}

	function animateCausalSuccess() {
		// Step 1: Start with intervention
		setTimeout(() => {
			causalNodes[0].active = true; // statin
			causalNodes[0].pulse = 2.0; // Strong intervention pulse
		}, 200);

		// Step 2: Show first causal effect
		setTimeout(() => {
			causalConnections[0].active = true; // statin → ldl
			causalNodes[1].active = true; // ldl reduction
			causalNodes[1].pulse = 1.5;
		}, 600);

		// Step 3: Show downstream causal effect
		setTimeout(() => {
			causalConnections[1].active = true; // ldl → plaque
			causalNodes[2].active = true; // plaque formation
			causalNodes[2].pulse = 1.5;
		}, 1200);

		// Step 4: Show final outcome
		setTimeout(() => {
			causalConnections[2].active = true; // plaque → events
			causalNodes[3].active = true; // heart attacks
			causalNodes[3].pulse = 1.8;
		}, 1800);

		// Step 5: Highlight the complete causal chain
		setTimeout(() => {
			// Pulse the entire pathway to show intervention success
			causalNodes.forEach((node) => (node.pulse = 2.5));
		}, 2500);
	}

	let svgElement: SVGSVGElement;

	function updatePopoverPosition(clientX: number, clientY: number) {
		const panelMargin = 16;
		const maxPanelWidth = Math.min(280, window.innerWidth - panelMargin * 2);
		const estimatedPanelHeight = 260;

		let x = clientX + 20;
		let rawY = clientY - 60;
		let y = Math.max(panelMargin, rawY);

		if (x + maxPanelWidth > window.innerWidth - panelMargin) {
			x = Math.max(panelMargin, window.innerWidth - maxPanelWidth - panelMargin);
		}

		const wouldOverflowBottom = y + estimatedPanelHeight > window.innerHeight - panelMargin;

		if (wouldOverflowBottom) {
			y = Math.max(panelMargin, window.innerHeight - estimatedPanelHeight - panelMargin);
		}

		const bottomSheet =
			isTouchDevice &&
			(window.innerHeight < 640 || rawY + estimatedPanelHeight > window.innerHeight - panelMargin);

		shouldUseBottomSheet = bottomSheet;
		popoverPosition = { x, y };
	}

	function handleDataPointHover(dataPoint: ComparisonDataPoint, event: MouseEvent) {
		if (!interactive || isTouchDevice) return;

		// Mark as interacted for hint dismissal
		hasInteracted = true;

		if (hoverTimeout) {
			clearTimeout(hoverTimeout);
		}

		updatePopoverPosition(event.clientX, event.clientY);

		hoverTimeout = setTimeout(() => {
			hoveredDataPoint = dataPoint;
		}, 50);
	}

	function handleDataPointLeave() {
		if (!interactive || isTouchDevice) return;

		if (hoverTimeout) {
			clearTimeout(hoverTimeout);
		}

		hoverTimeout = setTimeout(() => {
			hoveredDataPoint = null;
			shouldUseBottomSheet = false;
		}, 100);
	}

	function handleDataPointClick(dataPoint: ComparisonDataPoint, event: MouseEvent | TouchEvent) {
		if (!interactive) return;

		// Prevent event bubbling to window click handler
		event.stopPropagation();

		// Prevent triggering on desktop hover
		if (!isTouchDevice && event instanceof MouseEvent && event.detail === 0) return;

		// Mark as interacted for hint dismissal
		hasInteracted = true;

		// Keep the popover open on touch devices, allow toggle on desktop
		if (hoveredDataPoint === dataPoint && !isTouchDevice) {
			hoveredDataPoint = null;
			shouldUseBottomSheet = false;
		} else {
			const clientX =
				event instanceof TouchEvent
					? (event.touches[0]?.clientX ?? event.changedTouches[0].clientX)
					: event.clientX;
			const clientY =
				event instanceof TouchEvent
					? (event.touches[0]?.clientY ?? event.changedTouches[0].clientY)
					: event.clientY;

			updatePopoverPosition(clientX, clientY);
			hoveredDataPoint = dataPoint;
		}
	}

	function handleOutsideClick(event: MouseEvent | TouchEvent) {
		if (!isTouchDevice || !hoveredDataPoint) return;

		const target = event.target as HTMLElement;
		if (!target.closest('.info-panel') && !target.closest('.data-point')) {
			hoveredDataPoint = null;
			shouldUseBottomSheet = false;
		}
	}

	function animate() {
		const allNodes = [...correlationNodes, ...causalNodes];
		allNodes.forEach((node) => {
			if (node.pulse > 0) {
				node.pulse -= 0.03;
			}
		});

		animationId = requestAnimationFrame(animate);
	}

	function setupIntersectionObserver() {
		const observer = new IntersectionObserver(
			(entries) => {
				entries.forEach((entry) => {
					if (entry.isIntersecting) {
						isVisible = true;
					}
				});
			},
			{ threshold: 0.3 }
		);

		if (container) {
			observer.observe(container);
		}

		return () => observer.disconnect();
	}

	// Portal action to render element at document.body level
	function portal(node: HTMLElement) {
		if (!portalTarget) return;

		portalTarget.appendChild(node);

		return {
			destroy() {
				if (node.parentNode === portalTarget) {
					portalTarget.removeChild(node);
				}
			}
		};
	}

	onMount(() => {
		// Detect touch device
		isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;

		// Create portal target for popovers to escape stacking context
		portalTarget = document.createElement('div');
		portalTarget.id = 'comparison-chart-portal';
		portalTarget.style.position = 'fixed';
		portalTarget.style.top = '0';
		portalTarget.style.left = '0';
		portalTarget.style.width = '0';
		portalTarget.style.height = '0';
		portalTarget.style.zIndex = '9999';
		document.body.appendChild(portalTarget);

		const cleanup = setupIntersectionObserver();
		animate();

		// Add outside click listener for mobile
		if (isTouchDevice) {
			window.addEventListener('click', handleOutsideClick);
			window.addEventListener('touchend', handleOutsideClick);
		}

		return () => {
			cleanup();
			if (animationId) {
				cancelAnimationFrame(animationId);
			}
			if (isTouchDevice) {
				window.removeEventListener('click', handleOutsideClick);
				window.removeEventListener('touchend', handleOutsideClick);
			}
			if (portalTarget && portalTarget.parentNode) {
				document.body.removeChild(portalTarget);
			}
		};
	});
</script>

<div
	bind:this={container}
	class="comparison-chart-container"
	style="--chart-base-height: {height}px"
>
	{#if isVisible}
		<!-- Navigation tabs -->
		<div class="view-selector" transition:fade={{ delay: 200, duration: 400 }}>
			<button
				class="view-tab"
				class:active={currentView === 'overview'}
				on:click={() => switchView('overview')}
			>
				Overview
			</button>
			<button
				class="view-tab"
				class:active={currentView === 'correlation'}
				on:click={() => switchView('correlation')}
			>
				Correlation Fallacy
			</button>
			<button
				class="view-tab"
				class:active={currentView === 'causation'}
				on:click={() => switchView('causation')}
			>
				Causal Pathway
			</button>
		</div>

		<div class="visualization-content">
			{#key currentView}
				{#if currentView === 'overview'}
					<!-- Scatter plot comparison -->
					<div class="tab-panel" in:fade={{ duration: 250 }}>
						<div class="scatter-plot-container">
							<svg
								bind:this={svgElement}
								class="scatter-plot"
								width="100%"
								viewBox="0 0 100 80"
								preserveAspectRatio="xMidYMid meet"
							>
								<!-- Grid lines -->
								<defs>
									<pattern id="grid" width="10" height="10" patternUnits="userSpaceOnUse">
										<path
											d="M 10 0 L 0 0 0 10"
											fill="none"
											stroke="rgba(255,255,255,0.1)"
											stroke-width="0.5"
										/>
									</pattern>
								</defs>
								<rect width="100" height="80" fill="url(#grid)" />

								<!-- Axes -->
								<line
									x1="10"
									y1="70"
									x2="90"
									y2="70"
									stroke="rgba(255,255,255,0.4)"
									stroke-width="0.5"
								/>
								<line
									x1="10"
									y1="10"
									x2="10"
									y2="70"
									stroke="rgba(255,255,255,0.4)"
									stroke-width="0.5"
								/>

								<!-- Axis labels -->
								<text x="50" y="74" text-anchor="middle" fill="rgba(255,255,255,0.8)" font-size="4"
									>Correlation Strength</text
								>
								<text
									x="6.5"
									y="40"
									text-anchor="middle"
									fill="rgba(255,255,255,0.8)"
									font-size="4"
									transform="rotate(-90, 6.5, 40)">Causal Evidence</text
								>

								<!-- Connection lines between related data points -->
								{#if hoveredDataPoint}
									{@const hoveredCx = 10 + hoveredDataPoint.correlation * 70}
									{@const hoveredCy = 70 - hoveredDataPoint.causation * 50}

									<!-- Connect to related points based on category -->
									{#each comparisonData as point (point.label)}
										{#if point !== hoveredDataPoint && point.category === hoveredDataPoint.category}
											{@const pointCx = 10 + point.correlation * 70}
											{@const pointCy = 70 - point.causation * 50}
											<line
												x1={hoveredCx}
												y1={hoveredCy}
												x2={pointCx}
												y2={pointCy}
												stroke={getPointColor(hoveredDataPoint)}
												stroke-width="0.5"
												opacity="0.4"
												stroke-dasharray="2,2"
											>
												<animate
													attributeName="opacity"
													values="0;0.4;0.2"
													dur="1.5s"
													repeatCount="indefinite"
												/>
											</line>
										{/if}
									{/each}
								{/if}

								<!-- Data points -->
								{#each comparisonData as point (point.label)}
									{@const pointX = 10 + point.correlation * 70}
									{@const pointY = 70 - point.causation * 50}
									{@const isHovered = hoveredDataPoint === point}
									{@const pointColor = getPointColor(point)}

									<g class="data-point-group" class:hovered={isHovered}>
										<!-- Vibrating string effect -->
										{#if isHovered}
											<line
												x1={pointX - 3}
												y1={pointY}
												x2={pointX + 3}
												y2={pointY}
												stroke={pointColor}
												stroke-width="0.8"
												opacity="0.7"
												class="vibrating-string horizontal"
											/>
											<line
												x1={pointX}
												y1={pointY - 3}
												x2={pointX}
												y2={pointY + 3}
												stroke={pointColor}
												stroke-width="0.8"
												opacity="0.7"
												class="vibrating-string vertical"
											/>
										{/if}

										<!-- Main data point -->
										<circle
											cx={pointX}
											cy={pointY}
											r="2.5"
											fill={pointColor}
											stroke="rgba(255,255,255,0.3)"
											stroke-width="0.5"
											class="data-point"
											class:touch-active={isTouchDevice}
											on:mouseenter={(event) => handleDataPointHover(point, event)}
											on:mouseleave={handleDataPointLeave}
											on:click={(event) => handleDataPointClick(point, event)}
											on:touchend={(event) => handleDataPointClick(point, event)}
											in:scale={{ delay: (675 * 100) % 60000, duration: 300 }}
										/>
									</g>
								{/each}

								<!-- Diagonal reference line -->
								<line
									x1="10"
									y1="70"
									x2="80"
									y2="20"
									stroke="rgba(128, 255, 219, 0.3)"
									stroke-width="0.5"
									stroke-dasharray="2,2"
								/>
								<text x="85" y="18" fill="rgba(128, 255, 219, 0.8)" font-size="3.5"
									>Ideal: High correlation = High causation</text
								>
							</svg>

							<!-- Interaction hint -->
							{#if !hasInteracted && !hoveredDataPoint}
								<div class="interaction-hint" transition:fade={{ duration: 300 }}>
									{#if isTouchDevice}
										<Pointer class="hint-icon" aria-hidden="true" />
									{:else}
										<WandSparkles class="hint-icon" aria-hidden="true" />
									{/if}
									<span
										>{isTouchDevice
											? 'Tap points to reveal insights'
											: 'Hover points to reveal insights'}</span
									>
								</div>
							{/if}

							<!-- Legend -->
							<div class="scatter-legend">
								<div class="legend-item">
									<div class="legend-dot" style="background: {colors.misleading.primary}"></div>
									<span>Misleading correlations</span>
								</div>
								<div class="legend-item">
									<div class="legend-dot" style="background: {colors.biological.primary}"></div>
									<span>Validated associations</span>
								</div>
								<div class="legend-item">
									<div class="legend-dot" style="background: {colors.outcome.primary}"></div>
									<span>Causal relationships</span>
								</div>
							</div>
						</div>
					</div>
				{:else}
					<!-- Pathway visualization -->
					<div class="tab-panel" in:fade={{ duration: 250 }}>
						<div class="pathway-container">
							<svg
								class="pathway-svg"
								width="100%"
								height="80%"
								viewBox="0 0 100 80"
								preserveAspectRatio="xMidYMid meet"
							>
								{#if currentView === 'correlation'}
									<!-- Correlation pathway with confounding variables -->
									<g class="connections">
										{#each correlationConnections as connection (`${connection.from}-${connection.to}`)}
											{@const fromNode = correlationNodes.find((n) => n.id === connection.from)}
											{@const toNode = correlationNodes.find((n) => n.id === connection.to)}
											{@const pathD = buildConnectionPath(
												fromNode,
												toNode,
												connection.type === 'confounding' ? 5 : 8
											)}
											{#if fromNode && toNode && connection.active}
												<path
													d={pathD}
													fill="none"
													stroke={getConnectionColor(connection)}
													stroke-width={connection.strength * 1.4}
													stroke-dasharray={connection.type === 'confounding' ? '4 3' : '0 120'}
													stroke-linecap="round"
													stroke-linejoin="round"
													class="connection-line"
													in:fade={{ duration: 240 }}
												>
													<animate
														attributeName="opacity"
														values="0;0.85"
														dur="0.45s"
														fill="freeze"
													/>
													{#if connection.type === 'confounding'}
														<animate
															attributeName="stroke-dashoffset"
															values="0;6"
															dur="1.8s"
															repeatCount="indefinite"
														/>
													{:else}
														<animate
															attributeName="stroke-dasharray"
															values="0,120;120,0"
															dur="0.6s"
															fill="freeze"
														/>
													{/if}
												</path>

												<!-- Flow animation only for solid lines -->
												{#if connection.type !== 'confounding'}
													<circle r="0.8" fill={getConnectionColor(connection)} opacity="0.9">
														<animateMotion
															dur="3s"
															repeatCount="indefinite"
															path={pathD}
															begin="0.6s"
														/>
													</circle>
												{/if}
											{/if}
										{/each}
									</g>

									<g class="nodes">
										{#each correlationNodes as node (node.id)}
											{#if node.active}
												<g transform="translate({node.x}, {node.y})" in:scale={{ duration: 300 }}>
													<circle r={6 + node.pulse * 2} fill={getNodeColor(node)} opacity="0.2" />
													<circle
														r={3.2 + node.pulse * 1.2}
														fill={getNodeColor(node)}
														stroke="rgba(255,255,255,0.4)"
														stroke-width="0.5"
													/>
													<text
														x="0"
														y="10"
														text-anchor="middle"
														fill="rgba(255,255,255,0.9)"
														font-size="4"
														font-weight="500"
													>
														{node.label}
													</text>
												</g>
											{/if}
										{/each}
									</g>
								{:else}
									<!-- Causal pathway -->
									<g class="connections">
										{#each causalConnections as connection (`${connection.from}-${connection.to}`)}
											{@const fromNode = causalNodes.find((n) => n.id === connection.from)}
											{@const toNode = causalNodes.find((n) => n.id === connection.to)}
											{@const pathD = buildConnectionPath(fromNode, toNode, 8)}
											{#if fromNode && toNode && connection.active}
												<path
													d={pathD}
													fill="none"
													stroke={getConnectionColor(connection)}
													stroke-width={connection.strength * 1.5}
													stroke-linecap="round"
													stroke-linejoin="round"
													class="connection-line"
													in:fade={{ duration: 240 }}
												>
													<animate
														attributeName="opacity"
														values="0;0.88"
														dur="0.45s"
														fill="freeze"
													/>
													<animate
														attributeName="stroke-dasharray"
														values="0,140;140,0"
														dur="0.6s"
														fill="freeze"
													/>
												</path>

												<!-- Flow animation for causal connections -->
												<circle r="0.8" fill={getConnectionColor(connection)} opacity="0.9">
													<animateMotion
														dur="3s"
														repeatCount="indefinite"
														path={pathD}
														begin="0.6s"
													/>
												</circle>
											{/if}
										{/each}
									</g>

									<g class="nodes">
										{#each causalNodes as node (node.id)}
											{#if node.active}
												<g transform="translate({node.x}, {node.y})" in:scale={{ duration: 300 }}>
													<circle r={6 + node.pulse * 2} fill={getNodeColor(node)} opacity="0.2" />
													<circle
														r={3.2 + node.pulse * 1.2}
														fill={getNodeColor(node)}
														stroke="rgba(255,255,255,0.4)"
														stroke-width="0.5"
													/>
													<text
														x="0"
														y="10"
														text-anchor="middle"
														fill="rgba(255,255,255,0.9)"
														font-size="3.2"
														font-weight="500"
													>
														{node.label}
													</text>
												</g>
											{/if}
										{/each}
									</g>
								{/if}
							</svg>
						</div>

						<!-- Explanation panel -->
						<div class="explanation-panel" in:fade={{ duration: 200 }}>
							{#if currentView === 'correlation'}
								<h4>When Intervention Fails</h4>
								<p>
									Vitamin E and health outcomes show strong observational correlation (r=0.65). But
									randomized trials failed: <strong>no reduction in cardiovascular events</strong> (RR=1.02,
									95% CI: 0.94-1.11). Healthy lifestyle was the confounding factor driving both supplement
									use and good health.
								</p>
								<div class="evidence-cite">HOPE & HOPE-TOO Trial Investigators. NEJM 2005</div>
							{:else if currentView === 'causation'}
								<h4>Proven by Intervention</h4>
								<p>
									Statins prove cholesterol causes heart disease. The intervention directly reduces
									LDL by 38mg/dL → blocks plaque formation → prevents heart attacks. <strong
										>24% reduction in major cardiovascular events</strong
									> (RR=0.76, 95% CI: 0.73-0.79) across 170,000 patients.
								</p>
								<div class="evidence-cite">
									Cholesterol Treatment Trialists' Collaboration. Lancet 2010
								</div>
							{/if}
						</div>
					</div>
				{/if}
			{/key}
		</div>

		<!-- Data point info panel -->
		{#if hoveredDataPoint}
			<div
				use:portal
				class="info-panel"
				style={`left: ${popoverPosition.x}px; top: ${popoverPosition.y}px;`}
				class:mobile-bottom-sheet={shouldUseBottomSheet}
				transition:fade={{ duration: 200 }}
			>
				{#if isTouchDevice}
					<button
						class="close-button"
						on:click={(e) => {
							e.stopPropagation();
							hoveredDataPoint = null;
							shouldUseBottomSheet = false;
						}}
						aria-label="Close information panel"
					>
						✕
					</button>
				{/if}
				<h4>{hoveredDataPoint.label}</h4>
				<div class="correlation-info">
					<span class="metric">Correlation: {Math.round(hoveredDataPoint.correlation * 100)}%</span>
					<span class="metric"
						>Causal Evidence: {Math.round(hoveredDataPoint.causation * 100)}%</span
					>
				</div>
				{#if hoveredDataPoint.correlationReason}
					<p class="reason">
						<strong>Why correlated:</strong>
						{hoveredDataPoint.correlationReason}
					</p>
				{/if}
				{#if hoveredDataPoint.causalMechanism}
					<p class="mechanism">
						<strong>Causal mechanism:</strong>
						{hoveredDataPoint.causalMechanism}
					</p>
				{/if}
				{#if hoveredDataPoint.biomolecularPath}
					<div class="pathway">
						<strong>Pathway:</strong>
						<div class="pathway-flow">
							{#each hoveredDataPoint.biomolecularPath as step, i (`${hoveredDataPoint.label}-${i}`)}
								<span class="pathway-step">{step}</span>
								{#if i < hoveredDataPoint.biomolecularPath.length - 1}
									<span class="arrow">→</span>
								{/if}
							{/each}
						</div>
					</div>
				{/if}
			</div>
		{/if}
	{/if}
</div>

<style>
	.comparison-chart-container {
		position: relative;
		border: 2px dashed rgba(128, 255, 219, 0.3);
		border-radius: 0.75rem;
		background: rgba(128, 255, 219, 0.02);
		overflow: visible;
		padding: 1rem;
		z-index: 100;
		display: flex;
		flex-direction: column;
		min-height: clamp(240px, 38vh, var(--chart-base-height, 380px));
		max-width: min(100%, 760px);
		margin: 0 auto;
	}

	.view-selector {
		display: flex;
		gap: 0.5rem;
		margin-bottom: 1rem;
		justify-content: center;
	}

	.view-tab {
		padding: 0.5rem 1rem;
		border: 1px solid rgba(128, 255, 219, 0.3);
		border-radius: 0.375rem;
		background: rgba(255, 255, 255, 0.05);
		color: rgba(255, 255, 255, 0.8);
		font-size: 0.875rem;
		cursor: pointer;
		transition: all 0.3s ease;
		-webkit-tap-highlight-color: transparent;
	}

	.view-tab:hover {
		background: rgba(128, 255, 219, 0.1);
		border-color: var(--aeon-biolum);
	}

	.view-tab:active {
		transform: scale(0.96);
		background: rgba(128, 255, 219, 0.15);
	}

	.view-tab.active {
		background: var(--aeon-biolum);
		color: var(--aeon-deep-space);
		border-color: var(--aeon-biolum);
		font-weight: 600;
	}

	.visualization-content {
		position: relative;
		flex: 1;
		display: flex;
		flex-direction: column;
		width: 100%;
		max-width: min(100%, 620px);
		margin: 0 auto;
		min-height: clamp(280px, 36vh, 360px);
	}

	.tab-panel {
		flex: 1;
		display: flex;
		flex-direction: column;
		gap: 1.1rem;
		min-height: inherit;
	}

	.scatter-plot-container {
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
		flex: 1;
		min-height: 0;
		margin: 0 auto;
		width: 100%;
		max-width: min(100%, 560px);
	}

	.scatter-plot {
		flex: 1;
		min-height: 0; /* Critical for flex overflow prevention */
	}

	.data-point-group {
		cursor: pointer;
	}

	.data-point {
		filter: drop-shadow(0 0 3px rgba(255, 255, 255, 0.3));
		transition: filter 0.2s ease-out;
	}

	.data-point.touch-active {
		cursor: pointer;
		r: 3; /* Larger touch target */
	}

	.data-point-group.hovered .data-point {
		filter: drop-shadow(0 0 6px currentColor) brightness(1.2);
	}

	.vibrating-string {
		animation: vibrate 0.15s ease-in-out infinite alternate;
	}

	.vibrating-string.horizontal {
		animation-delay: 0s;
	}

	.vibrating-string.vertical {
		animation-delay: 0.05s;
	}

	@keyframes vibrate {
		0% {
			opacity: 0.4;
			stroke-width: 0.6;
		}
		100% {
			opacity: 0.9;
			stroke-width: 1;
		}
	}

	.scatter-legend {
		display: flex;
		gap: 1rem;
		justify-content: center;
		flex-wrap: wrap;
		flex-shrink: 0; /* Prevent legend from shrinking */
	}

	.legend-item {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		font-size: clamp(0.65rem, 2.2vw, 0.8rem);
		color: rgba(255, 255, 255, 0.7);
	}

	.legend-dot {
		width: 8px;
		height: 8px;
		border-radius: 50%;
	}

	.pathway-container {
		height: 100%;
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		width: 100%;
		max-width: min(100%, 540px);
		margin: 0 auto;
		flex: 1;
	}

	.pathway-svg {
		flex: 1;
		width: 100%;
		height: auto;
		max-width: 520px;
	}

	.explanation-panel {
		background: rgba(26, 27, 47, 0.9);
		border: 1px solid rgba(128, 255, 219, 0.3);
		border-radius: 0.375rem;
		padding: 0.75rem;
		margin-top: 0.5rem;
		backdrop-filter: blur(10px);
	}

	.explanation-panel h4 {
		margin: 0 0 0.5rem;
		color: var(--aeon-biolum);
		font-size: 0.9rem;
	}

	.explanation-panel p {
		margin: 0 0 0.5rem;
		font-size: 0.8rem;
		color: rgba(255, 255, 255, 0.8);
		line-height: 1.4;
	}

	.evidence-cite {
		font-size: 0.7rem;
		color: rgba(128, 255, 219, 0.8);
		font-style: italic;
		margin-top: 0.5rem;
		border-left: 2px solid rgba(128, 255, 219, 0.3);
		padding-left: 0.5rem;
	}

	.info-panel {
		position: fixed;
		background: linear-gradient(145deg, rgba(15, 22, 38, 0.96), rgba(8, 14, 30, 0.94));
		border: 1px solid rgba(128, 255, 219, 0.4);
		border-radius: 0.85rem;
		padding: 1.15rem 1.1rem 1.1rem;
		max-width: min(340px, calc(100vw - 2rem));
		width: max-content;
		max-height: min(360px, 80vh);
		overflow-y: auto;
		backdrop-filter: blur(16px);
		box-shadow:
			0 22px 55px rgba(4, 10, 26, 0.55),
			0 0 25px rgba(76, 201, 240, 0.18);
		border-image: linear-gradient(135deg, rgba(128, 255, 219, 0.6), rgba(76, 201, 240, 0.35)) 1;
		z-index: 9999;
		pointer-events: auto;
		transition: all 0.4s cubic-bezier(0.16, 1, 0.3, 1);
		color: rgba(228, 240, 255, 0.96);
		line-height: 1.5;
	}

	.close-button {
		position: absolute;
		top: 0.75rem;
		right: 0.75rem;
		background: rgba(128, 255, 219, 0.1);
		border: 1px solid rgba(128, 255, 219, 0.3);
		border-radius: 0.25rem;
		color: rgba(255, 255, 255, 0.8);
		width: 32px;
		height: 32px;
		display: flex;
		align-items: center;
		justify-content: center;
		cursor: pointer;
		font-size: 1.2rem;
		transition: all 0.2s ease;
	}

	.close-button:hover {
		background: rgba(128, 255, 219, 0.2);
		color: white;
		border-color: var(--aeon-biolum);
	}

	.close-button:active {
		transform: scale(0.9);
		background: rgba(128, 255, 219, 0.25);
	}

	.info-panel h4 {
		margin: 0 0 0.65rem;
		color: rgba(128, 255, 219, 0.92);
		font-size: clamp(1rem, 2.2vw, 1.15rem);
		font-weight: 620;
		letter-spacing: 0.012em;
	}

	.correlation-info {
		display: flex;
		gap: 1rem;
		margin-bottom: 0.8rem;
	}

	.metric {
		font-size: clamp(0.74rem, 1.8vw, 0.9rem);
		color: rgba(234, 248, 255, 0.95);
		font-weight: 580;
		letter-spacing: 0.01em;
	}

	.reason,
	.mechanism {
		margin: 0 0 0.65rem;
		font-size: clamp(0.74rem, 1.8vw, 0.9rem);
		color: rgba(218, 235, 250, 0.92);
		line-height: 1.55;
	}

	.pathway {
		margin: 0.7rem 0 0;
		font-size: clamp(0.74rem, 1.8vw, 0.9rem);
		color: rgba(218, 235, 250, 0.9);
	}

	.pathway-flow {
		display: flex;
		flex-direction: column;
		gap: 0.4rem;
		margin-top: 0.5rem;
	}

	.pathway-step {
		position: relative;
		font-size: clamp(0.68rem, 1.6vw, 0.82rem);
		color: rgba(234, 248, 255, 0.92);
		padding-left: 1rem;
		line-height: 1.35;
	}

	.pathway-step::before {
		content: '';
		position: absolute;
		left: 0;
		top: 0.4rem;
		width: 4px;
		height: 4px;
		border-radius: 50%;
		background: var(--aeon-biolum);
		box-shadow: 0 0 4px var(--aeon-biolum);
	}

	.pathway-step:not(:last-child)::after {
		content: '';
		position: absolute;
		left: 1.5px;
		top: 0.8rem;
		width: 1px;
		height: 0.8rem;
		background: linear-gradient(to bottom, var(--aeon-biolum), transparent);
		opacity: 0.6;
	}

	.arrow {
		display: none;
	}

	.interaction-hint {
		position: absolute;
		top: 50%;
		left: 50%;
		transform: translate(-50%, -50%);
		display: inline-flex;
		align-items: center;
		gap: 0.4rem;
		background: rgba(14, 28, 44, 0.92);
		border: 1px solid rgba(128, 255, 219, 0.35);
		border-radius: 999px;
		padding: 0.55rem 1.1rem;
		color: rgba(228, 245, 255, 0.94);
		font-size: clamp(0.68rem, 1.8vw, 0.82rem);
		font-weight: 520;
		letter-spacing: 0.02em;
		pointer-events: none;
		animation: pulse-hint 2s ease-in-out infinite;
		z-index: 5;
		white-space: nowrap;
		box-shadow: 0 10px 30px rgba(0, 0, 0, 0.35);
	}

	.hint-icon {
		width: 1rem;
		height: 1rem;
		color: var(--aeon-biolum);
		opacity: 0.85;
	}

	@keyframes pulse-hint {
		0%,
		100% {
			opacity: 0.76;
			transform: translate(-50%, -50%) scale(1);
		}
		50% {
			opacity: 1;
			transform: translate(-50%, -50%) scale(1.04);
		}
	}

	/* Tablet and smaller screens */
	@media (max-width: 900px) {
		.info-panel {
			max-width: min(250px, calc(100vw - 2rem));
			font-size: 0.9rem;
		}
	}

	@media (max-width: 768px) {
		.comparison-chart-container {
			padding: clamp(0.5rem, 2vw, 1rem);
		}

		.view-selector {
			flex-direction: row;
			flex-wrap: wrap;
			justify-content: center;
			gap: 0.5rem;
		}

		.view-tab {
			min-width: 100px;
			min-height: 44px;
			text-align: center;
			font-size: 0.9rem;
		}

		.info-panel.mobile-bottom-sheet {
			bottom: 0 !important;
			left: 0 !important;
			right: 0 !important;
			top: auto !important;
			margin: 0;
			max-width: none;
			border-radius: 1rem 1rem 0 0;
			padding: 1.25rem;
			box-shadow: 0 -4px 20px rgba(0, 0, 0, 0.3);
			max-height: min(70vh, calc(100vh - 2rem));
			overflow-y: auto;
			padding-bottom: calc(1.25rem + env(safe-area-inset-bottom, 0));
		}

		.correlation-info {
			flex-direction: column;
			gap: 0.25rem;
		}

		.scatter-legend {
			flex-direction: row;
			flex-wrap: wrap;
			justify-content: center;
			gap: clamp(0.35rem, 2vw, 0.75rem);
		}

		.legend-item {
			gap: clamp(0.35rem, 1.5vw, 0.5rem);
		}

		.data-point {
			r: 3.5; /* Larger touch targets on mobile */
		}

		/* Make pathway visualizations responsive on mobile */
		.pathway-container {
			height: 320px; /* Fixed height for better mobile UX */
		}

		.pathway-svg {
			width: 100%;
			height: 100%;
		}

		/* Improve explanation panel on mobile */
		.explanation-panel {
			padding: 1rem;
			margin-top: 0.75rem;
		}

		.explanation-panel h4 {
			font-size: 1rem;
		}

		.explanation-panel p {
			font-size: 0.9rem;
			line-height: 1.5;
		}

		.evidence-cite {
			font-size: 0.75rem;
		}

		/* Larger node labels on mobile */
		.pathway-svg text {
			font-size: 3px;
		}

		/* Ensure view tabs work well on mobile */
		.view-tab:active {
			transform: scale(0.98);
		}
	}
</style>
