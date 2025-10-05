<script lang="ts">
	import { onMount } from 'svelte';
	import { fade, scale } from 'svelte/transition';
	
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
	
	// Sample data showing correlation vs causation examples
	const comparisonData: ComparisonDataPoint[] = [
		{
			correlation: 0.85,
			causation: 0.20,
			label: "Ice cream sales & drowning",
			category: 'misleading',
			correlationReason: "Both increase in summer",
			causalMechanism: "Temperature is the confounding variable"
		},
		{
			correlation: 0.75,
			causation: 0.15,
			label: "Shoe size & reading ability",
			category: 'misleading',
			correlationReason: "Both correlate with age in children",
			causalMechanism: "Age drives both variables independently"
		},
		{
			correlation: 0.65,
			causation: 0.80,
			label: "BRCA1 mutations & breast cancer",
			category: 'causal',
			biomolecularPath: ['BRCA1 gene', 'DNA repair dysfunction', 'Cancer risk'],
			causalMechanism: "Direct molecular pathway from mutation to disease"
		},
		{
			correlation: 0.70,
			causation: 0.75,
			label: "Inflammation markers & cardiovascular risk",
			category: 'causal',
			biomolecularPath: ['Inflammatory cytokines', 'Endothelial dysfunction', 'Atherosclerosis'],
			causalMechanism: "Inflammatory cascade directly damages arteries"
		},
		{
			correlation: 0.60,
			causation: 0.70,
			label: "Methylation patterns & aging",
			category: 'validated',
			biomolecularPath: ['DNA methylation', 'Gene expression changes', 'Cellular aging'],
			causalMechanism: "Epigenetic changes drive biological aging process"
		}
	];
	
	// Nodes for causal pathway visualization
	const correlationNodes: VisualizationNode[] = [
		{ id: 'supplements', label: 'Vitamin E Intake', x: 15, y: 25, type: 'factor', active: false, pulse: 0 },
		{ id: 'health', label: 'Health Outcomes', x: 85, y: 25, type: 'factor', active: false, pulse: 0 },
		{ id: 'lifestyle', label: 'Healthy Lifestyle', x: 50, y: 65, type: 'confounding', active: false, pulse: 0 }
	];
	
	const causalNodes: VisualizationNode[] = [
		{ id: 'statin', label: 'Statin Treatment', x: 12, y: 30, type: 'factor', active: false, pulse: 0 },
		{ id: 'ldl', label: 'LDL Reduction', x: 35, y: 50, type: 'factor', active: false, pulse: 0 },
		{ id: 'plaque', label: 'Plaque Formation', x: 65, y: 50, type: 'factor', active: false, pulse: 0 },
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
		{ from: 'plaque', to: 'events', type: 'causal', strength: 0.90, active: false }
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
			case 'misleading': return colors.misleading.primary;
			case 'validated': return colors.biological.primary;
			case 'causal': return colors.outcome.primary;
			default: return colors.molecular.primary;
		}
	}
	
	function getNodeColor(node: VisualizationNode): string {
		switch (node.type) {
			case 'factor': return colors.molecular.primary;
			case 'outcome': return colors.outcome.primary;
			case 'confounding': return colors.confounding.primary;
			default: return colors.biological.primary;
		}
	}
	
	function getConnectionColor(connection: CausalConnection): string {
		switch (connection.type) {
			case 'causal': return colors.biological.primary;
			case 'confounding': return colors.confounding.primary;
			case 'correlation': return colors.misleading.primary;
			default: return colors.molecular.primary;
		}
	}
	
	function switchView(newView: typeof currentView) {
		currentView = newView;
		animateView();
	}
	
	function animateView() {
		const nodes = currentView === 'correlation' ? correlationNodes : causalNodes;
		const connections = currentView === 'correlation' ? correlationConnections : causalConnections;
		
		// Reset all states
		nodes.forEach(node => {
			node.active = false;
			node.pulse = 0;
		});
		connections.forEach(conn => conn.active = false);
		
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
			causalNodes.forEach(node => node.pulse = 2.5);
		}, 2500);
	}
	
	let svgElement: SVGSVGElement;
	

	
	function handleDataPointHover(dataPoint: ComparisonDataPoint, event: MouseEvent) {
		if (!interactive) return;
		
		if (hoverTimeout) {
			clearTimeout(hoverTimeout);
		}
		
		const containerRect = container.getBoundingClientRect();
		popoverPosition = {
			x: Math.min(event.clientX - containerRect.left + 20, containerRect.width - 300),
			y: Math.max(20, event.clientY - containerRect.top - 60)
		};
		
		hoverTimeout = setTimeout(() => {
			hoveredDataPoint = dataPoint;
		}, 50);
	}
	
	function handleDataPointLeave() {
		if (!interactive) return;
		
		if (hoverTimeout) {
			clearTimeout(hoverTimeout);
		}
		
		hoverTimeout = setTimeout(() => {
			hoveredDataPoint = null;
		}, 100);
	}
	
	function animate() {
		const allNodes = [...correlationNodes, ...causalNodes];
		allNodes.forEach(node => {
			if (node.pulse > 0) {
				node.pulse -= 0.03;
			}
		});
		
		animationId = requestAnimationFrame(animate);
	}
	
	function setupIntersectionObserver() {
		const observer = new IntersectionObserver(
			(entries) => {
				entries.forEach(entry => {
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
	
	onMount(() => {
		const cleanup = setupIntersectionObserver();
		animate();
		
		return () => {
			cleanup();
			if (animationId) {
				cancelAnimationFrame(animationId);
			}
		};
	});
</script>

<div 
	bind:this={container}
	class="comparison-chart-container" 
	style="height: {height}px"
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
			{#if currentView === 'overview'}
				<!-- Scatter plot comparison -->
				<div class="scatter-plot-container" transition:fade={{ duration: 400 }}>
					<svg 
						bind:this={svgElement} 
						class="scatter-plot" 
						width="100%" 
						height="80%" 
						viewBox="0 0 100 80"
					>
						<!-- Grid lines -->
						<defs>
							<pattern id="grid" width="10" height="10" patternUnits="userSpaceOnUse">
								<path d="M 10 0 L 0 0 0 10" fill="none" stroke="rgba(255,255,255,0.1)" stroke-width="0.5"/>
							</pattern>
						</defs>
						<rect width="100" height="80" fill="url(#grid)" />
						
						<!-- Axes -->
						<line x1="10" y1="70" x2="90" y2="70" stroke="rgba(255,255,255,0.4)" stroke-width="0.5"/>
						<line x1="10" y1="10" x2="10" y2="70" stroke="rgba(255,255,255,0.4)" stroke-width="0.5"/>
						
						<!-- Axis labels -->
						<text x="50" y="73.5" text-anchor="middle" fill="rgba(255,255,255,0.8)" font-size="4">Correlation Strength</text>
						<text x="6.5" y="40" text-anchor="middle" fill="rgba(255,255,255,0.8)" font-size="4" transform="rotate(-90, 6.5, 40)">Causal Evidence</text>
						
						<!-- Connection lines between related data points -->
						{#if hoveredDataPoint}
							{@const hoveredIndex = comparisonData.indexOf(hoveredDataPoint)}
							{@const hoveredCx = 10 + (hoveredDataPoint.correlation * 70)}
							{@const hoveredCy = 70 - (hoveredDataPoint.causation * 50)}
							
							<!-- Connect to related points based on category -->
							{#each comparisonData as point, i}
								{#if point !== hoveredDataPoint && point.category === hoveredDataPoint.category}
									{@const pointCx = 10 + (point.correlation * 70)}
									{@const pointCy = 70 - (point.causation * 50)}
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
										<animate attributeName="opacity" values="0;0.4;0.2" dur="1.5s" repeatCount="indefinite" />
									</line>
								{/if}
							{/each}
							
						{/if}
						
						<!-- Data points -->
						{#each comparisonData as point, i}
							{@const pointX = 10 + (point.correlation * 70)}
							{@const pointY = 70 - (point.causation * 50)}
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
									on:mouseenter={(event) => handleDataPointHover(point, event)}
									on:mouseleave={handleDataPointLeave}
									in:scale={{ delay: i * 100, duration: 300 }}
								/>
							</g>
						{/each}
						
						<!-- Diagonal reference line -->
						<line x1="10" y1="70" x2="80" y2="20" stroke="rgba(128, 255, 219, 0.3)" stroke-width="0.5" stroke-dasharray="2,2"/>
						<text x="85" y="18" fill="rgba(128, 255, 219, 0.8)" font-size="3.5">Ideal: High correlation = High causation</text>
						
						
					</svg>
					
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
				
			{:else}
				<!-- Pathway visualization -->
				<div class="pathway-container" transition:fade={{ duration: 400 }}>
					<svg class="pathway-svg" width="100%" height="80%" viewBox="0 0 100 80">
						{#if currentView === 'correlation'}
							<!-- Correlation pathway with confounding variables -->
							<g class="connections">
								{#each correlationConnections as connection}
									{@const fromNode = correlationNodes.find(n => n.id === connection.from)}
									{@const toNode = correlationNodes.find(n => n.id === connection.to)}
									{#if fromNode && toNode && connection.active}
										{@const nodeRadius = 6}
										{@const dx = toNode.x - fromNode.x}
										{@const dy = toNode.y - fromNode.y}
										{@const length = Math.sqrt(dx * dx + dy * dy)}
										{@const unitX = dx / length}
										{@const unitY = dy / length}
										{@const startX = fromNode.x + unitX * nodeRadius}
										{@const startY = fromNode.y + unitY * nodeRadius}
										{@const endX = toNode.x - unitX * nodeRadius}
										{@const endY = toNode.y - unitY * nodeRadius}
										<line
											x1={startX}
											y1={startY}
											x2={endX}
											y2={endY}
											stroke={getConnectionColor(connection)}
											stroke-width={connection.strength * 1.5}
											stroke-dasharray={connection.type === 'confounding' ? '2,2' : '0,1000'}
											class="connection-line"
											in:fade={{ duration: 300 }}
											out:fade={{ duration: 300 }}
										>
											<animate 
												attributeName="opacity"
												values="0;0.8"
												dur="0.6s"
												fill="freeze"
											/>
											{#if connection.type === 'confounding'}
												<animate 
													attributeName="stroke-dashoffset"
													values="0;4"
													dur="1.5s"
													repeatCount="indefinite"
												/>
											{:else}
												<animate 
													attributeName="stroke-dasharray"
													values="0,1000;1000,0"
													dur="0.6s"
													fill="freeze"
												/>
											{/if}
										</line>
										
										<!-- Flow animation only for solid lines -->
										{#if connection.type !== 'confounding'}
											<circle r="0.8" fill={getConnectionColor(connection)} opacity="0.9">
												<animateMotion
													dur="3s"
													repeatCount="indefinite"
													path="M{startX},{startY} L{endX},{endY}"
													begin="0.6s"
												/>
											</circle>
										{/if}
									{/if}
								{/each}
							</g>
							
							<g class="nodes">
								{#each correlationNodes as node}
									{#if node.active}
										<g transform="translate({node.x}, {node.y})" in:scale={{ duration: 300 }}>
											<circle
												r={8 + (node.pulse * 3)}
												fill={getNodeColor(node)}
												opacity="0.2"
											/>
											<circle
												r={4 + (node.pulse * 1.5)}
												fill={getNodeColor(node)}
												stroke="rgba(255,255,255,0.4)"
												stroke-width="0.5"
											/>
											<text
												x="0"
												y="12"
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
								{#each causalConnections as connection}
									{@const fromNode = causalNodes.find(n => n.id === connection.from)}
									{@const toNode = causalNodes.find(n => n.id === connection.to)}
									{#if fromNode && toNode && connection.active}
										{@const nodeRadius = 6}
										{@const dx = toNode.x - fromNode.x}
										{@const dy = toNode.y - fromNode.y}
										{@const length = Math.sqrt(dx * dx + dy * dy)}
										{@const unitX = dx / length}
										{@const unitY = dy / length}
										{@const startX = fromNode.x + unitX * nodeRadius}
										{@const startY = fromNode.y + unitY * nodeRadius}
										{@const endX = toNode.x - unitX * nodeRadius}
										{@const endY = toNode.y - unitY * nodeRadius}
										<line
											x1={startX}
											y1={startY}
											x2={endX}
											y2={endY}
											stroke={getConnectionColor(connection)}
											stroke-width={connection.strength * 1.5}
											class="connection-line"
											in:fade={{ duration: 300 }}
											out:fade={{ duration: 300 }}
										>
											<animate 
												attributeName="opacity"
												values="0;0.8"
												dur="0.6s"
												fill="freeze"
											/>
											<animate 
												attributeName="stroke-dasharray"
												values="0,1000;1000,0"
												dur="0.6s"
												fill="freeze"
											/>
										</line>
										
										<!-- Flow animation for causal connections -->
										{#if connection.type === 'causal'}
											<circle r="0.8" fill={getConnectionColor(connection)} opacity="0.9">
												<animateMotion
													dur="3s"
													repeatCount="indefinite"
													path="M{startX},{startY} L{endX},{endY}"
													begin="0.6s"
												/>
											</circle>
										{/if}
									{/if}
								{/each}
							</g>
							
							<g class="nodes">
								{#each causalNodes as node}
									{#if node.active}
										<g transform="translate({node.x}, {node.y})" in:scale={{ duration: 300 }}>
											<circle
												r={8 + (node.pulse * 3)}
												fill={getNodeColor(node)}
												opacity="0.2"
											/>
											<circle
												r={4 + (node.pulse * 1.5)}
												fill={getNodeColor(node)}
												stroke="rgba(255,255,255,0.4)"
												stroke-width="0.5"
											/>
											<text
												x="0"
												y="12"
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
						{/if}
					</svg>
					
					<!-- Explanation panel -->
					<div class="explanation-panel">
						{#if currentView === 'correlation'}
							<h4>When Intervention Fails</h4>
							<p>Vitamin E and health outcomes show strong observational correlation (r=0.65). But randomized trials failed: <strong>no reduction in cardiovascular events</strong> (RR=1.02, 95% CI: 0.94-1.11). Healthy lifestyle was the confounding factor driving both supplement use and good health.</p>
							<div class="evidence-cite">HOPE & HOPE-TOO Trial Investigators. NEJM 2005</div>
						{:else if currentView === 'causation'}
							<h4>Proven by Intervention</h4>
							<p>Statins prove cholesterol causes heart disease. The intervention directly reduces LDL by 38mg/dL → blocks plaque formation → prevents heart attacks. <strong>24% reduction in major cardiovascular events</strong> (RR=0.76, 95% CI: 0.73-0.79) across 170,000 patients.</p>
							<div class="evidence-cite">Cholesterol Treatment Trialists' Collaboration. Lancet 2010</div>
						{/if}
					</div>
				</div>
			{/if}
		</div>
		
		<!-- Data point info panel -->
		{#if hoveredDataPoint}
			<div 
				class="info-panel" 
				style="left: {popoverPosition.x}px; top: {popoverPosition.y}px;"
				transition:fade={{ duration: 200 }}
			>
				<h4>{hoveredDataPoint.label}</h4>
				<div class="correlation-info">
					<span class="metric">Correlation: {Math.round(hoveredDataPoint.correlation * 100)}%</span>
					<span class="metric">Causal Evidence: {Math.round(hoveredDataPoint.causation * 100)}%</span>
				</div>
				{#if hoveredDataPoint.correlationReason}
					<p class="reason"><strong>Why correlated:</strong> {hoveredDataPoint.correlationReason}</p>
				{/if}
				{#if hoveredDataPoint.causalMechanism}
					<p class="mechanism"><strong>Causal mechanism:</strong> {hoveredDataPoint.causalMechanism}</p>
				{/if}
				{#if hoveredDataPoint.biomolecularPath}
					<div class="pathway">
						<strong>Pathway:</strong>
						<div class="pathway-flow">
							{#each hoveredDataPoint.biomolecularPath as step, i}
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
		overflow: hidden;
		padding: 1rem;
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
	}
	
	.view-tab:hover {
		background: rgba(128, 255, 219, 0.1);
		border-color: var(--aeon-biolum);
	}
	
	.view-tab.active {
		background: var(--aeon-biolum);
		color: var(--aeon-deep-space);
		border-color: var(--aeon-biolum);
		font-weight: 600;
	}
	
	.visualization-content {
		height: calc(100% - 3rem);
		position: relative;
	}
	
	.scatter-plot-container {
		height: 100%;
		display: flex;
		flex-direction: column;
	}
	
	.scatter-plot {
		flex: 1;
	}
	
	.data-point-group {
		cursor: pointer;
	}
	
	.data-point {
		filter: drop-shadow(0 0 3px rgba(255,255,255,0.3));
		transition: filter 0.2s ease-out;
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
			stroke-width: 1.0;
		}
	}
	
	
	
	.scatter-legend {
		display: flex;
		gap: 1rem;
		justify-content: center;
		margin-top: 0.5rem;
		flex-wrap: wrap;
	}
	
	.legend-item {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		font-size: 0.8rem;
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
	}
	
	.pathway-svg {
		flex: 1;
	}
	
	.explanation-panel {
		background: rgba(26, 27, 47, 0.8);
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
		position: absolute;
		background: rgba(26, 27, 47, 0.95);
		border: 1px solid rgba(128, 255, 219, 0.3);
		border-radius: 0.5rem;
		padding: 1rem;
		max-width: 280px;
		width: max-content;
		backdrop-filter: blur(10px);
		z-index: 10;
		pointer-events: none;
		transition: all 0.4s cubic-bezier(0.16, 1, 0.3, 1);
	}
	
	.info-panel h4 {
		margin: 0 0 0.5rem;
		color: var(--aeon-biolum);
		font-size: 0.95rem;
	}
	
	.correlation-info {
		display: flex;
		gap: 1rem;
		margin-bottom: 0.75rem;
	}
	
	.metric {
		font-size: 0.8rem;
		color: rgba(255, 255, 255, 0.9);
		font-weight: 500;
	}
	
	.reason,
	.mechanism {
		margin: 0 0 0.5rem;
		font-size: 0.8rem;
		color: rgba(255, 255, 255, 0.8);
		line-height: 1.4;
	}
	
	.pathway {
		margin: 0.5rem 0 0;
		font-size: 0.8rem;
		color: rgba(255, 255, 255, 0.8);
	}
	
	.pathway-flow {
		display: flex;
		flex-direction: column;
		gap: 0.4rem;
		margin-top: 0.5rem;
	}
	
	.pathway-step {
		position: relative;
		font-size: 0.75rem;
		color: rgba(255, 255, 255, 0.9);
		padding-left: 1rem;
		line-height: 1.3;
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
	
	@media (max-width: 768px) {
		.view-selector {
			flex-direction: column;
			align-items: center;
		}
		
		.view-tab {
			min-width: 120px;
			text-align: center;
		}
		
		.info-panel {
			position: static;
			margin: 1rem 0 0;
			max-width: none;
		}
		
		.correlation-info {
			flex-direction: column;
			gap: 0.25rem;
		}
		
		.scatter-legend {
			flex-direction: column;
			align-items: center;
			gap: 0.5rem;
		}
	}
</style>