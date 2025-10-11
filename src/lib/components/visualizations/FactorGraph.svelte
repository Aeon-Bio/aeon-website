<script lang="ts">
	import { onMount } from 'svelte';
	import { fade } from 'svelte/transition';
	import { Sparkles, Pointer } from 'lucide-svelte';

	export let interactive = true;
	export let height = 300;

	let container: HTMLDivElement;
	let hoveredNode: string | null = null;
	let focusedNode: string | null = null;
	let animationId: number;
	let isVisible = false;
	let currentNodeIndex = 0;
	let isTouchDevice = false;
	let hasInteracted = false;

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
		{
			id: 'genes',
			label: 'Genes',
			x: 8,
			y: 40,
			category: 'molecular',
			connections: ['methylation', 'proteins'],
			baseSize: 30,
			currentSize: 30,
			pulse: 0
		},
		{
			id: 'metabolites',
			label: 'Metabolites',
			x: 8,
			y: 60,
			category: 'molecular',
			connections: ['pathways', 'inflammation'],
			baseSize: 30,
			currentSize: 30,
			pulse: 0
		},
		{
			id: 'proteins',
			label: 'Proteins',
			x: 8,
			y: 80,
			category: 'molecular',
			connections: ['pathways', 'cellular'],
			baseSize: 30,
			currentSize: 30,
			pulse: 0
		},

		// Biological Functions Layer
		{
			id: 'methylation',
			label: 'Methylation Patterns',
			x: 50,
			y: 30,
			category: 'biological',
			connections: ['cellular', 'aging'],
			baseSize: 33,
			currentSize: 33,
			pulse: 0
		},
		{
			id: 'pathways',
			label: 'Metabolic Pathways',
			x: 50,
			y: 50,
			category: 'biological',
			connections: ['inflammation', 'aging'],
			baseSize: 33,
			currentSize: 33,
			pulse: 0
		},
		{
			id: 'inflammation',
			label: 'Inflammatory Response',
			x: 50,
			y: 70,
			category: 'biological',
			connections: ['cardiovascular', 'aging'],
			baseSize: 33,
			currentSize: 33,
			pulse: 0
		},
		{
			id: 'cellular',
			label: 'Cellular Function',
			x: 50,
			y: 90,
			category: 'biological',
			connections: ['aging', 'disease-risk'],
			baseSize: 33,
			currentSize: 33,
			pulse: 0
		},

		// Health Outcomes Layer
		{
			id: 'aging',
			label: 'Biological Age',
			x: 92,
			y: 40,
			category: 'outcome',
			connections: [],
			baseSize: 37,
			currentSize: 37,
			pulse: 0
		},
		{
			id: 'cardiovascular',
			label: 'Cardiovascular Risk',
			x: 92,
			y: 60,
			category: 'outcome',
			connections: [],
			baseSize: 37,
			currentSize: 37,
			pulse: 0
		},
		{
			id: 'disease-risk',
			label: 'Disease Susceptibility',
			x: 92,
			y: 80,
			category: 'outcome',
			connections: [],
			baseSize: 37,
			currentSize: 37,
			pulse: 0
		}
	];

	const colors = {
		molecular: { primary: '#4cc9f0', secondary: '#7dd3fc' },
		biological: { primary: '#80ffdb', secondary: '#a7f3d0' },
		outcome: { primary: '#fbbf24', secondary: '#fcd34d' }
	};

	function lightenHex(hex: string, amount: number) {
		const normalized = hex.replace('#', '');
		if (normalized.length !== 6) return hex;
		const num = parseInt(normalized, 16);
		const r = Math.min(
			255,
			Math.round(((num >> 16) & 0xff) + (255 - ((num >> 16) & 0xff)) * amount)
		);
		const g = Math.min(255, Math.round(((num >> 8) & 0xff) + (255 - ((num >> 8) & 0xff)) * amount));
		const b = Math.min(255, Math.round((num & 0xff) + (255 - (num & 0xff)) * amount));
		return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
	}

	let connections: Connection[] = [];

	function initializeConnections() {
		connections = [];
		nodes.forEach((node) => {
			node.connections.forEach((targetId) => {
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

	interface ClusterHighlight {
		path: string;
		gradientId: string;
		color: string;
		centroid: { x: number; y: number };
		radius: number;
	}

	let activeCluster: ClusterHighlight | null = null;

	$: activeCluster = buildClusterHighlight(hoveredNode ?? focusedNode ?? null);

	function buildClusterHighlight(primaryId: string | null): ClusterHighlight | null {
		if (!primaryId) return null;

		const primaryNode = nodes.find((node) => node.id === primaryId);
		if (!primaryNode) return null;

		const clusterNodes = nodes.filter((node) => node.id === primaryId || node.pulse > 0);
		if (clusterNodes.length === 0) return null;

		const centroid = clusterNodes.reduce(
			(acc, node) => {
				acc.x += node.x;
				acc.y += node.y;
				return acc;
			},
			{ x: 0, y: 0 }
		);

		centroid.x /= clusterNodes.length;
		centroid.y /= clusterNodes.length;

		let outlinePoints: { x: number; y: number }[] = [];

		if (clusterNodes.length === 1) {
			const node = clusterNodes[0];
			const radius = node.baseSize * 0.35 + 3;
			const segments = 8;
			outlinePoints = Array.from({ length: segments }, (_, i) => {
				const angle = (Math.PI * 2 * i) / segments;
				return {
					x: node.x + Math.cos(angle) * radius,
					y: node.y + Math.sin(angle) * radius
				};
			});
		} else if (clusterNodes.length === 2) {
			const [a, b] = clusterNodes;
			const pad = 3.5;
			const dx = b.x - a.x;
			const dy = b.y - a.y;
			const length = Math.hypot(dx, dy) || 1;
			const ux = dx / length;
			const uy = dy / length;
			const perpX = -uy;
			const perpY = ux;

			outlinePoints = [
				{ x: a.x + perpX * pad, y: a.y + perpY * pad },
				{ x: b.x + perpX * pad, y: b.y + perpY * pad },
				{ x: b.x - perpX * pad, y: b.y - perpY * pad },
				{ x: a.x - perpX * pad, y: a.y - perpY * pad }
			];
		} else {
			const padBase = 2.5;
			const expanded = clusterNodes
				.map((node) => {
					const angle = Math.atan2(node.y - centroid.y, node.x - centroid.x);
					const pad = padBase + node.baseSize * 0.06;
					return {
						angle,
						x: node.x + Math.cos(angle) * pad,
						y: node.y + Math.sin(angle) * pad
					};
				})
				.sort((a, b) => a.angle - b.angle);

			outlinePoints = expanded.map((point) => ({ x: point.x, y: point.y }));
		}

		if (outlinePoints.length === 0) return null;

		const path =
			outlinePoints
				.map((point, index) => `${index === 0 ? 'M' : 'L'} ${point.x} ${point.y}`)
				.join(' ') + ' Z';

		const radius =
			outlinePoints.reduce((max, point) => {
				const dist = Math.hypot(point.x - centroid.x, point.y - centroid.y);
				return Math.max(max, dist);
			}, 0) + 5;

		const gradientId = `clusterGlow-${primaryId}`;
		const color = getNodeColor(primaryNode.category, true);

		return {
			path,
			gradientId,
			color,
			centroid,
			radius
		};
	}

	function handleNodeHover(nodeId: string) {
		if (!interactive || isTouchDevice) return;

		// Mark as interacted for hint dismissal
		hasInteracted = true;

		hoveredNode = nodeId;
		activateNodeConnections(nodeId);
	}

	function handleNodeFocus(nodeId: string) {
		if (!interactive) return;

		// Mark as interacted for hint dismissal
		hasInteracted = true;

		focusedNode = nodeId;
		activateNodeConnections(nodeId);
	}

	function handleNodeClick(nodeId: string, event: MouseEvent | TouchEvent) {
		if (!interactive) return;

		// Prevent event bubbling to window click handler
		event.stopPropagation();

		// Prevent double-trigger on desktop
		if (!isTouchDevice && event instanceof MouseEvent && event.detail === 0) return;

		// Mark as interacted for hint dismissal
		hasInteracted = true;

		// Keep the info panel open on touch devices, allow toggle on desktop
		if (hoveredNode === nodeId && !isTouchDevice) {
			hoveredNode = null;
			deactivateConnections();
		} else {
			hoveredNode = nodeId;
			activateNodeConnections(nodeId);
		}
	}

	function handleOutsideClick(event: MouseEvent | TouchEvent) {
		if (!isTouchDevice || !hoveredNode) return;

		const target = event.target as HTMLElement;
		if (!target.closest('.info-panel') && !target.closest('.node-circle')) {
			hoveredNode = null;
			deactivateConnections();
		}
	}

	function activateNodeConnections(nodeId: string) {
		// Activate connections
		connections.forEach((conn) => {
			conn.active = conn.from === nodeId || conn.to === nodeId;
		});

		// Pulse connected nodes
		const targetNode = nodes.find((n) => n.id === nodeId);
		if (targetNode) {
			targetNode.connections.forEach((connId) => {
				const connectedNode = nodes.find((n) => n.id === connId);
				if (connectedNode) {
					connectedNode.pulse = 1;
				}
			});
		}
	}

	function handleNodeLeave() {
		if (!interactive || isTouchDevice) return;

		hoveredNode = null;
		deactivateConnections();
	}

	function deactivateConnections() {
		if (!hoveredNode && !focusedNode) {
			connections.forEach((conn) => (conn.active = false));
			nodes.forEach((node) => (node.pulse = 0));
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
		nodes.forEach((node) => {
			// Animate pulse
			if (node.pulse > 0) {
				node.pulse -= 0.05;
				node.currentSize = node.baseSize + node.pulse * 4;
			} else {
				node.currentSize = node.baseSize;
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
		setTimeout(
			() => {
				connections.forEach((conn) => {
					conn.active = true;
					setTimeout(() => {
						conn.active = false;
					}, 1000);
				});
			},
			nodes.length * 100 + 500
		);
	}

	onMount(() => {
		// Detect touch device
		isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;

		initializeConnections();
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
		};
	});
</script>

<div
	bind:this={container}
	class="factor-graph-container"
	style="--factor-graph-base-height: {height}px"
	role="application"
	aria-label="Factor graph visualization showing relationships between molecular data, biological functions, and health outcomes"
	aria-describedby="graph-description"
	on:keydown={handleKeydown}
	tabindex={interactive ? '0' : '-1'}
>
	{#if isVisible}
		<!-- Screen reader description -->
		<div id="graph-description" class="visually-hidden">
			This factor graph shows causal relationships in biomolecular data analysis. Molecular data
			(genes, metabolites, proteins) connects to biological functions (methylation patterns,
			metabolic pathways, inflammation, cellular function) which influence health outcomes
			(biological age, cardiovascular risk, disease susceptibility). Use arrow keys to navigate
			between nodes, Enter or Space to explore connections.
		</div>

		<div
			class="graph-legend"
			transition:fade={{ delay: 500, duration: 400 }}
			role="list"
			aria-label="Graph legend"
		>
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
			{#if activeCluster}
				<defs>
					<radialGradient
						id={activeCluster.gradientId}
						cx={activeCluster.centroid.x}
						cy={activeCluster.centroid.y}
						r={activeCluster.radius}
						gradientUnits="userSpaceOnUse"
					>
						<stop
							offset="0%"
							stop-color={lightenHex(activeCluster.color, 0.55)}
							stop-opacity="0.3"
						/>
						<stop
							offset="65%"
							stop-color={lightenHex(activeCluster.color, 0.2)}
							stop-opacity="0.12"
						/>
						<stop offset="100%" stop-color={activeCluster.color} stop-opacity="0" />
					</radialGradient>
				</defs>
				<path
					d={activeCluster.path}
					fill={`url(#${activeCluster.gradientId})`}
					class="cluster-glow"
				/>
				<path
					d={activeCluster.path}
					fill="none"
					stroke={lightenHex(activeCluster.color, 0.6)}
					stroke-width="0.6"
					stroke-linejoin="round"
					stroke-linecap="round"
					stroke-dasharray="4 6"
					opacity="0.28"
					class="cluster-outline"
				/>
			{/if}

			<!-- Connections -->
			<g class="connections">
				{#each connections as connection (`${connection.from}-${connection.to}`)}
					{@const fromNode = nodes.find((n) => n.id === connection.from)}
					{@const toNode = nodes.find((n) => n.id === connection.to)}
					{#if fromNode && toNode}
						<line
							x1={fromNode.x}
							y1={fromNode.y}
							x2={toNode.x}
							y2={toNode.y}
							stroke="rgba(128, 255, 219, 0.32)"
							stroke-width="0.35"
							opacity={connection.active ? 0.9 : 0.4}
							stroke-linecap="round"
							class="connection-line"
							class:active={connection.active}
						/>

						<!-- Data flow animation -->
						{#if connection.active}
							<circle r="0.8" fill="var(--aeon-biolum)" opacity="0.95">
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
				{#each nodes as node (node.id)}
					{@const isPrimaryNode = hoveredNode === node.id || focusedNode === node.id}
					{@const isConnectedNode = !isPrimaryNode && node.pulse > 0}
					{@const isActiveNode = isPrimaryNode || isConnectedNode}
					{@const baseColor = getNodeColor(node.category, isPrimaryNode)}
					{@const nodeColor = isPrimaryNode
						? baseColor
						: isConnectedNode
							? lightenHex(baseColor, 0.28)
							: baseColor}
					{@const ringColor = isPrimaryNode
						? baseColor
						: isConnectedNode
							? lightenHex(baseColor, 0.4)
							: baseColor}
					{@const glowColor = isPrimaryNode
						? baseColor
						: isConnectedNode
							? lightenHex(baseColor, 0.32)
							: baseColor}
					{@const glowRadius = isPrimaryNode
						? node.currentSize * 0.18
						: isConnectedNode
							? node.currentSize * 0.14
							: node.currentSize * 0.1}
					{@const coreRadius = isPrimaryNode
						? node.currentSize * 0.1
						: isConnectedNode
							? node.currentSize * 0.088
							: node.currentSize * 0.085}
					{@const ringRadius = isPrimaryNode
						? node.currentSize * 0.13
						: isConnectedNode
							? node.currentSize * 0.11
							: null}
					<g
						class="node-group"
						class:active-node={isActiveNode}
						class:primary-node={isPrimaryNode}
						class:connected-node={isConnectedNode}
						transform="translate({node.x}, {node.y})"
					>
						<!-- Glow effect -->
						<circle
							r={glowRadius}
							fill={glowColor}
							opacity={isPrimaryNode ? '0.14' : isConnectedNode ? '0.09' : '0.045'}
							class="node-glow"
						/>

						{#if ringRadius}
							<circle
								r={ringRadius}
								fill="transparent"
								stroke={ringColor}
								stroke-width={isPrimaryNode ? '0.32' : '0.22'}
								opacity={isPrimaryNode ? '0.55' : '0.32'}
								class="node-ring"
							/>
							{#if isPrimaryNode}
								<circle
									r={ringRadius + 0.6}
									fill="transparent"
									stroke={lightenHex(baseColor, 0.55)}
									stroke-width="0.18"
									stroke-dasharray="1.5 1.5"
									opacity="0.45"
									class="node-ring primary-outline"
								/>
							{/if}
						{/if}

						<!-- Main node -->
						<circle
							r={coreRadius}
							fill={nodeColor}
							stroke={isPrimaryNode
								? 'rgba(255, 255, 255, 0.9)'
								: isConnectedNode
									? 'rgba(255, 255, 255, 0.42)'
									: 'rgba(255, 255, 255, 0.28)'}
							stroke-width={isPrimaryNode ? '0.34' : isConnectedNode ? '0.2' : '0.14'}
							class="node-circle"
							data-node-id={node.id}
							class:touch-active={isTouchDevice}
							on:mouseenter={() => handleNodeHover(node.id)}
							on:mouseleave={handleNodeLeave}
							on:click={(event) => handleNodeClick(node.id, event)}
							on:touchend={(event) => handleNodeClick(node.id, event)}
							aria-label="{node.label} - {node.category} layer node"
						/>

						<!-- Label -->
						<text
							x="0"
							y={glowRadius + 3}
							text-anchor="middle"
							class="node-label"
							class:highlighted={isPrimaryNode}
							fill={isPrimaryNode
								? 'rgba(255, 255, 255, 0.98)'
								: isConnectedNode
									? 'rgba(238, 250, 255, 0.88)'
									: 'rgba(210, 226, 250, 0.78)'}
							font-size={isPrimaryNode ? '3.7' : '3.1'}
							font-weight={isPrimaryNode ? '700' : isConnectedNode ? '600' : '500'}
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

		<!-- Interaction hint -->
		{#if !hasInteracted && !hoveredNode && !focusedNode}
			<div class="interaction-hint" transition:fade={{ duration: 300 }}>
				{#if isTouchDevice}
					<Pointer class="hint-icon" aria-hidden="true" />
				{:else}
					<Sparkles class="hint-icon" aria-hidden="true" />
				{/if}
				<span
					>{isTouchDevice
						? 'Tap nodes to explore connections'
						: 'Hover nodes to explore connections'}</span
				>
			</div>
		{/if}

		<!-- Hidden node descriptions for screen readers -->
		{#each nodes as node (node.id)}
			<div id="node-{node.id}-desc" class="visually-hidden">
				{node.label} is a {node.category} layer component
				{#if node.connections.length > 0}
					that influences: {node.connections
						.map((id) => nodes.find((n) => n.id === id)?.label)
						.join(', ')}
				{/if}
			</div>
		{/each}

		<!-- Info panel -->
		{#if hoveredNode || focusedNode}
			{@const activeNode = hoveredNode || focusedNode}
			{@const activeNodeData = nodes.find((n) => n.id === activeNode)}
			{#if activeNodeData}
				<div
					class="info-panel"
					transition:fade={{ duration: 200 }}
					aria-live="polite"
					role="status"
					aria-label="Node information"
				>
					{#if isTouchDevice}
						<button
							class="close-button"
							on:click={(e) => {
								e.stopPropagation();
								hoveredNode = null;
								deactivateConnections();
							}}
							aria-label="Close information panel"
						>
							✕
						</button>
					{/if}
					<h4>{activeNodeData.label}</h4>
					<p class="category-label">
						{activeNodeData.category.charAt(0).toUpperCase() + activeNodeData.category.slice(1)} Layer
					</p>
					{#if activeNodeData.connections.length > 0}
						<p class="connections-info">
							Influences: {activeNodeData.connections
								.map((id) => nodes.find((n) => n.id === id)?.label)
								.join(', ')}
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
		overflow: visible;
		z-index: 100;
		height: clamp(340px, 58vh, var(--factor-graph-base-height, 600px));
		max-width: min(100%, 960px);
		margin: 0 auto;
		padding: clamp(1.5rem, 4vw, 2.5rem);
		display: flex;
		align-items: center;
		justify-content: center;
	}

	.graph-legend {
		position: absolute;
		top: clamp(1rem, 2vw, 1.5rem);
		left: clamp(1rem, 2.5vw, 1.8rem);
		display: flex;
		gap: 1.25rem;
		z-index: 2;
	}

	.legend-item {
		display: flex;
		align-items: center;
		gap: 0.6rem;
		font-size: clamp(0.85rem, 1.6vw, 1rem);
		color: rgba(255, 255, 255, 0.75);
		font-weight: 500;
		letter-spacing: 0.01em;
	}

	.legend-dot {
		width: 8px;
		height: 8px;
		border-radius: 50%;
	}

	.legend-dot.molecular {
		background: #4cc9f0;
	}
	.legend-dot.biological {
		background: #80ffdb;
	}
	.legend-dot.outcome {
		background: #fbbf24;
	}

	.factor-graph-svg {
		display: block;
		width: 100%;
		height: 100%;
	}

	.node-circle {
		cursor: crosshair;
		transition: all 0.3s ease;
	}

	.node-circle.touch-active {
		cursor: pointer;
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
		filter: drop-shadow(0 0 2px rgba(26, 27, 47, 0.85));
		fill: rgba(222, 234, 255, 0.85);
	}

	.node-label.highlighted {
		fill: white;
		font-weight: 700;
		filter: drop-shadow(0 4px 14px rgba(128, 255, 219, 0.45));
	}

	.node-group.primary-node .node-circle {
		filter: drop-shadow(0 0 10px rgba(128, 255, 219, 0.42));
	}

	.node-group.connected-node .node-circle {
		filter: drop-shadow(0 0 6px rgba(128, 255, 219, 0.26));
	}

	.node-group.active-node .node-glow {
		filter: blur(8px);
	}

	.node-ring {
		filter: drop-shadow(0 0 8px rgba(128, 255, 219, 0.4));
		transition: all 0.3s ease;
	}

	.node-group.primary-node .node-ring {
		filter: drop-shadow(0 0 8px rgba(128, 255, 219, 0.48));
	}

	.node-group.connected-node .node-ring {
		filter: drop-shadow(0 0 4px rgba(128, 255, 219, 0.28));
	}

	.node-ring.primary-outline {
		filter: drop-shadow(0 0 10px rgba(180, 255, 255, 0.35));
	}

	.cluster-glow {
		mix-blend-mode: screen;
		opacity: 0.85;
		pointer-events: none;
	}

	.cluster-outline {
		mix-blend-mode: screen;
		pointer-events: none;
	}

	.connection-line {
		transition: all 0.3s ease;
	}

	.connection-line.active {
		stroke: var(--aeon-biolum);
		stroke-width: 1.1;
		filter: drop-shadow(0 0 6px rgba(128, 255, 219, 0.45));
		opacity: 1;
	}

	.info-panel {
		position: absolute;
		bottom: clamp(1.3rem, 3vw, 2rem);
		right: clamp(1.3rem, 3vw, 2.2rem);
		background: linear-gradient(155deg, rgba(14, 20, 36, 0.95), rgba(9, 17, 32, 0.92));
		border: 1px solid rgba(128, 255, 219, 0.4);
		border-radius: 0.85rem;
		padding: 1.1rem 1.15rem 1.05rem;
		max-width: min(320px, calc(100vw - 2rem));
		backdrop-filter: blur(16px);
		box-shadow:
			0 18px 45px rgba(4, 10, 26, 0.5),
			0 0 22px rgba(76, 201, 240, 0.16);
		border-image: linear-gradient(140deg, rgba(128, 255, 219, 0.55), rgba(76, 201, 240, 0.32)) 1;
		color: rgba(228, 240, 255, 0.96);
		line-height: 1.5;
		z-index: 9999;
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
		margin: 0 0 0.55rem;
		color: rgba(128, 255, 219, 0.9);
		font-size: clamp(1.05rem, 2.4vw, 1.25rem);
		font-weight: 620;
		letter-spacing: 0.012em;
	}

	.category-label {
		margin: 0 0 0.85rem;
		font-size: clamp(0.82rem, 2vw, 1rem);
		color: rgba(208, 224, 240, 0.82);
		text-transform: uppercase;
		letter-spacing: 0.65px;
	}

	.connections-info {
		margin: 0;
		font-size: clamp(0.86rem, 2vw, 1rem);
		color: rgba(222, 236, 250, 0.92);
		line-height: 1.55;
	}

	.interaction-hint {
		position: absolute;
		top: 50%;
		left: 50%;
		transform: translate(-50%, -50%);
		display: inline-flex;
		align-items: center;
		gap: 0.4rem;
		background: rgba(14, 28, 44, 0.9);
		border: 1px solid rgba(128, 255, 219, 0.35);
		border-radius: 999px;
		padding: 0.55rem 1.1rem;
		color: rgba(228, 245, 255, 0.92);
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
			opacity: 0.7;
			transform: translate(-50%, -50%) scale(1);
		}
		50% {
			opacity: 1;
			transform: translate(-50%, -50%) scale(1.05);
		}
	}

	/* Tablet and smaller screens */
	@media (max-width: 900px) {
		.factor-graph-container {
			height: clamp(320px, 60vh, var(--factor-graph-base-height, 560px));
			padding: clamp(1.25rem, 4vw, 1.75rem);
		}

		.info-panel {
			max-width: min(220px, calc(100vw - 2rem));
			font-size: 0.9rem;
		}
	}

	@media (max-width: 768px) {
		.graph-legend {
			flex-direction: row;
			flex-wrap: wrap;
			justify-content: center;
			gap: 0.75rem;
		}

		.info-panel {
			position: fixed !important;
			bottom: 0;
			left: 0;
			right: 0;
			margin: 0;
			max-width: none;
			border-radius: 1rem 1rem 0 0;
			padding: 1.25rem;
			z-index: 9999;
			box-shadow: 0 -4px 20px rgba(0, 0, 0, 0.3);
		}

		.info-panel h4 {
			margin-right: 2rem; /* Make room for close button */
		}

		/* Larger touch targets on mobile */
		.node-circle {
			r: 5;
		}

		/* Adjust node labels for mobile */
		.node-label {
			font-size: 2.9;
		}
	}
</style>
