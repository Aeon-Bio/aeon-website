<script lang="ts">
	import { onMount } from 'svelte';
	import { fade } from 'svelte/transition';
	
	export let interactive = true;
	export let height = 300;
	
	let container: HTMLDivElement;
	let hoveredNode: string | null = null;
	let focusedNode: string | null = null;
	let animationId: number;
	let isVisible = false;
	let currentNodeIndex = 0;
	
	interface Node {
		id: string;
		label: string;
		x: number;
		y: number;
		category: 'molecular' | 'biological' | 'outcome';
		connections: string[];
		baseSize: number;
		currentSize: number;
		pulse: number;
	}
	
	interface Connection {
		from: string;
		to: string;
		strength: number;
		active: boolean;
	}
	
	const nodes: Node[] = [
		// Molecular Data Layer
		{ id: 'genes', label: 'Genes', x: 15, y: 40, category: 'molecular', connections: ['methylation', 'proteins'], baseSize: 30, currentSize: 30, pulse: 0 },
		{ id: 'metabolites', label: 'Metabolites', x: 15, y: 60, category: 'molecular', connections: ['pathways', 'inflammation'], baseSize: 30, currentSize: 30, pulse: 0 },
		{ id: 'proteins', label: 'Proteins', x: 15, y: 80, category: 'molecular', connections: ['pathways', 'cellular'], baseSize: 30, currentSize: 30, pulse: 0 },
		
		// Biological Functions Layer  
		{ id: 'methylation', label: 'Methylation Patterns', x: 50, y: 30, category: 'biological', connections: ['cellular', 'aging'], baseSize: 33, currentSize: 33, pulse: 0 },
		{ id: 'pathways', label: 'Metabolic Pathways', x: 50, y: 50, category: 'biological', connections: ['inflammation', 'aging'], baseSize: 33, currentSize: 33, pulse: 0 },
		{ id: 'inflammation', label: 'Inflammatory Response', x: 50, y: 70, category: 'biological', connections: ['cardiovascular', 'aging'], baseSize: 33, currentSize: 33, pulse: 0 },
		{ id: 'cellular', label: 'Cellular Function', x: 50, y: 90, category: 'biological', connections: ['aging', 'disease-risk'], baseSize: 33, currentSize: 33, pulse: 0 },
		
		// Health Outcomes Layer
		{ id: 'aging', label: 'Biological Age', x: 85, y: 40, category: 'outcome', connections: [], baseSize: 37, currentSize: 37, pulse: 0 },
		{ id: 'cardiovascular', label: 'Cardiovascular Risk', x: 85, y: 60, category: 'outcome', connections: [], baseSize: 37, currentSize: 37, pulse: 0 },
		{ id: 'disease-risk', label: 'Disease Susceptibility', x: 85, y: 80, category: 'outcome', connections: [], baseSize: 37, currentSize: 37, pulse: 0 }
	];
	
	const colors = {
		molecular: { primary: '#4cc9f0', secondary: '#7dd3fc' },
		biological: { primary: '#80ffdb', secondary: '#a7f3d0' },
		outcome: { primary: '#fbbf24', secondary: '#fcd34d' }
	};
	
	let connections: Connection[] = [];
	
	function initializeConnections() {
		connections = [];
		nodes.forEach(node => {
			node.connections.forEach(targetId => {
				connections.push({
					from: node.id,
					to: targetId,
					strength: 0.3 + Math.random() * 0.4,
					active: false
				});
			});
		});
	}
	
	function getNodeColor(category: string, isHovered: boolean = false): string {
		const colorSet = colors[category as keyof typeof colors];
		return isHovered ? colorSet.secondary : colorSet.primary;
	}
	
	function handleNodeHover(nodeId: string) {
		if (!interactive) return;
		
		hoveredNode = nodeId;
		activateNodeConnections(nodeId);
	}
	
	function handleNodeFocus(nodeId: string) {
		if (!interactive) return;
		
		focusedNode = nodeId;
		activateNodeConnections(nodeId);
	}
	
	function activateNodeConnections(nodeId: string) {
		// Activate connections
		connections.forEach(conn => {
			conn.active = conn.from === nodeId || conn.to === nodeId;
		});
		
		// Pulse connected nodes
		const targetNode = nodes.find(n => n.id === nodeId);
		if (targetNode) {
			targetNode.connections.forEach(connId => {
				const connectedNode = nodes.find(n => n.id === connId);
				if (connectedNode) {
					connectedNode.pulse = 1;
				}
			});
		}
	}
	
	function handleNodeLeave() {
		if (!interactive) return;
		
		hoveredNode = null;
		deactivateConnections();
	}
	
	function handleNodeBlur() {
		if (!interactive) return;
		
		focusedNode = null;
		deactivateConnections();
	}
	
	function deactivateConnections() {
		if (!hoveredNode && !focusedNode) {
			connections.forEach(conn => conn.active = false);
			nodes.forEach(node => node.pulse = 0);
		}
	}
	
	function handleKeydown(event: KeyboardEvent) {
		if (!interactive) return;
		
		switch (event.key) {
			case 'ArrowRight':
			case 'ArrowDown':
				event.preventDefault();
				currentNodeIndex = (currentNodeIndex + 1) % nodes.length;
				focusNode(nodes[currentNodeIndex].id);
				break;
			case 'ArrowLeft':
			case 'ArrowUp':
				event.preventDefault();
				currentNodeIndex = currentNodeIndex === 0 ? nodes.length - 1 : currentNodeIndex - 1;
				focusNode(nodes[currentNodeIndex].id);
				break;
			case 'Enter':
			case ' ':
				event.preventDefault();
				if (focusedNode) {
					handleNodeFocus(focusedNode);
				}
				break;
		}
	}
	
	function focusNode(nodeId: string) {
		const nodeElement = container.querySelector(`[data-node-id="${nodeId}"]`) as HTMLElement;
		if (nodeElement) {
			nodeElement.focus();
		}
	}
	
	function animate() {
		nodes.forEach(node => {
			// Animate pulse
			if (node.pulse > 0) {
				node.pulse -= 0.05;
				node.currentSize = node.baseSize + (node.pulse * 4);
			} else {
				node.currentSize = node.baseSize;
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
						startAnimation();
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
	
	function startAnimation() {
		// Stagger node appearances
		nodes.forEach((node, index) => {
			setTimeout(() => {
				node.pulse = 1.5;
			}, index * 100);
		});
		
		// Show connections after nodes
		setTimeout(() => {
			connections.forEach(conn => {
				conn.active = true;
				setTimeout(() => {
					conn.active = false;
				}, 1000);
			});
		}, nodes.length * 100 + 500);
	}
	
	onMount(() => {
		initializeConnections();
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
	class="factor-graph-container" 
	style="height: {height}px"
	role="application"
	aria-label="Factor graph visualization showing relationships between molecular data, biological functions, and health outcomes"
	aria-describedby="graph-description"
	on:keydown={handleKeydown}
	tabindex={interactive ? "0" : "-1"}
>
	{#if isVisible}
		<!-- Screen reader description -->
		<div id="graph-description" class="visually-hidden">
			This factor graph shows causal relationships in biomolecular data analysis. 
			Molecular data (genes, metabolites, proteins) connects to biological functions 
			(methylation patterns, metabolic pathways, inflammation, cellular function) 
			which influence health outcomes (biological age, cardiovascular risk, disease susceptibility). 
			Use arrow keys to navigate between nodes, Enter or Space to explore connections.
		</div>
		
		<div class="graph-legend" transition:fade={{ delay: 500, duration: 400 }} role="list" aria-label="Graph legend">
			<div class="legend-item" role="listitem">
				<div class="legend-dot molecular" aria-hidden="true"></div>
				<span>Molecular Data</span>
			</div>
			<div class="legend-item" role="listitem">
				<div class="legend-dot biological" aria-hidden="true"></div>
				<span>Biological Functions</span>
			</div>
			<div class="legend-item" role="listitem">
				<div class="legend-dot outcome" aria-hidden="true"></div>
				<span>Health Outcomes</span>
			</div>
		</div>
		
		<svg 
			class="factor-graph-svg" 
			width="100%" 
			height="100%" 
			viewBox="0 0 100 100"
			transition:fade={{ duration: 600 }}
			aria-hidden="true"
			focusable="false"
		>
			<!-- Connections -->
			<g class="connections">
				{#each connections as connection}
					{@const fromNode = nodes.find(n => n.id === connection.from)}
					{@const toNode = nodes.find(n => n.id === connection.to)}
					{#if fromNode && toNode}
						<line
							x1={fromNode.x}
							y1={fromNode.y}
							x2={toNode.x}
							y2={toNode.y}
							stroke={connection.active ? '#80ffdb' : 'rgba(128, 255, 219, 0.3)'}
							stroke-width={connection.active ? '0.5' : '0.2'}
							opacity={connection.active ? 0.8 : 0.4}
							class="connection-line"
							style="transition: all 0.3s ease"
						/>
						
						<!-- Data flow animation -->
						{#if connection.active}
							<circle
								r="0.5"
								fill="#80ffdb"
								opacity="0.8"
							>
								<animateMotion
									dur="2s"
									repeatCount="indefinite"
									path="M{fromNode.x},{fromNode.y} L{toNode.x},{toNode.y}"
								/>
							</circle>
						{/if}
					{/if}
				{/each}
			</g>
			
			<!-- Nodes -->
			<g class="nodes">
				{#each nodes as node, index}
					<g 
						class="node-group"
						transform="translate({node.x}, {node.y})"
					>
						<!-- Glow effect -->
						<circle
							r={node.currentSize * 0.25}
							fill={getNodeColor(node.category, hoveredNode === node.id)}
							opacity={hoveredNode === node.id ? "0.6" : "0.2"}
							class="node-glow"
						/>
						
						<!-- Main node -->
						<circle
							r={node.currentSize * 0.15}
							fill={getNodeColor(node.category, hoveredNode === node.id)}
							stroke={hoveredNode === node.id ? var(--aeon-biolum) : "rgba(255, 255, 255, 0.3)"}
							stroke-width={hoveredNode === node.id ? "0.5" : "0.1"}
							class="node-circle"
							on:mouseenter={() => handleNodeHover(node.id)}
							on:mouseleave={handleNodeLeave}
							aria-label="{node.label} - {node.category} layer node"
						/>
						
						<!-- Label -->
						<text
							x="0"
							y={node.currentSize * 0.25}
							text-anchor="middle"
							class="node-label"
							class:highlighted={hoveredNode === node.id || focusedNode === node.id || node.pulse > 0}
							fill="rgba(255, 255, 255, 0.95)"
							font-size="2.2"
							font-weight="600"
							stroke="rgba(26, 27, 47, 0.8)"
							stroke-width="0.1"
							aria-hidden="true"
						>
							{node.label}
						</text>
						
					</g>
				{/each}
			</g>
		</svg>
		
		<!-- Hidden node descriptions for screen readers -->
		{#each nodes as node, index}
			<div id="node-{index}-desc" class="visually-hidden">
				{node.label} is a {node.category} layer component
				{#if node.connections.length > 0}
					that influences: {node.connections.map(id => nodes.find(n => n.id === id)?.label).join(', ')}
				{/if}
			</div>
		{/each}
		
		<!-- Info panel -->
		{#if hoveredNode || focusedNode}
			{@const activeNode = hoveredNode || focusedNode}
			{@const activeNodeData = nodes.find(n => n.id === activeNode)}
			{#if activeNodeData}
				<div 
					class="info-panel" 
					transition:fade={{ duration: 200 }}
					aria-live="polite"
					role="status"
					aria-label="Node information"
				>
					<h4>{activeNodeData.label}</h4>
					<p class="category-label">{activeNodeData.category.charAt(0).toUpperCase() + activeNodeData.category.slice(1)} Layer</p>
					{#if activeNodeData.connections.length > 0}
						<p class="connections-info">
							Influences: {activeNodeData.connections.map(id => nodes.find(n => n.id === id)?.label).join(', ')}
						</p>
					{/if}
				</div>
			{/if}
		{/if}
	{/if}
</div>

<style>
	.factor-graph-container {
		position: relative;
		border: 2px dashed rgba(128, 255, 219, 0.3);
		border-radius: 0.75rem;
		background: rgba(26, 27, 47, 0.95);
		backdrop-filter: blur(10px);
		overflow: hidden;
		z-index: 1;
	}
	
	.graph-legend {
		position: absolute;
		top: 1rem;
		left: 1rem;
		display: flex;
		gap: 1rem;
		z-index: 2;
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
	
	.legend-dot.molecular { background: #4cc9f0; }
	.legend-dot.biological { background: #80ffdb; }
	.legend-dot.outcome { background: #fbbf24; }
	
	.factor-graph-svg {
		display: block;
	}
	
	.node-circle {
		cursor: crosshair;
		transition: all 0.3s ease;
	}
	
	.node-glow {
		transition: all 0.3s ease;
	}
	
	.visually-hidden {
		position: absolute;
		width: 1px;
		height: 1px;
		padding: 0;
		margin: -1px;
		overflow: hidden;
		clip: rect(0, 0, 0, 0);
		white-space: nowrap;
		border: 0;
	}
	
	.node-label-bg {
		font-family: var(--font-primary);
		pointer-events: none;
	}
	
	.node-label {
		font-family: var(--font-primary);
		pointer-events: none;
		transition: all 0.3s ease;
		filter: drop-shadow(0 0 2px rgba(26, 27, 47, 0.8));
	}
	
	.node-label.highlighted {
		fill: white;
		font-weight: 700;
		filter: drop-shadow(0 0 4px rgba(26, 27, 47, 1)) drop-shadow(0 0 8px currentColor);
	}
	
	.info-panel {
		position: absolute;
		bottom: 1rem;
		right: 1rem;
		background: rgba(26, 27, 47, 0.9);
		border: 1px solid rgba(128, 255, 219, 0.3);
		border-radius: 0.5rem;
		padding: 1rem;
		max-width: 250px;
		backdrop-filter: blur(10px);
	}
	
	.info-panel h4 {
		margin: 0 0 0.25rem;
		color: var(--aeon-biolum);
		font-size: 0.95rem;
	}
	
	.category-label {
		margin: 0 0 0.5rem;
		font-size: 0.8rem;
		color: rgba(255, 255, 255, 0.6);
		text-transform: uppercase;
		letter-spacing: 0.5px;
	}
	
	.connections-info {
		margin: 0;
		font-size: 0.85rem;
		color: rgba(255, 255, 255, 0.8);
		line-height: 1.4;
	}
	
	@media (max-width: 768px) {
		.graph-legend {
			flex-direction: column;
			gap: 0.5rem;
		}
		
		.info-panel {
			position: static;
			margin: 1rem;
			max-width: none;
		}
	}
</style>