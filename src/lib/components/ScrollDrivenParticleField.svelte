<script lang="ts">
	import { onMount } from 'svelte';
	import { gridActivity } from '../stores/grid';
	import { scrollTracker, scrollProgress } from '../stores/scroll';
	import {
		detectDeviceCapabilities,
		getQualitySettings,
		type DeviceCapabilities
	} from '../utils/performance';
	import type { Particle as PoolParticle } from '../utils/particlePool';
	import { SpatialHashGrid } from '../utils/spatialHash';
	import { applyParticlePhysics } from '../utils/particlePhysics';

	type QualitySettings = {
		particleCount: number;
		connectionDistance: number;
		maxConnections: number;
		updateFrequency: number;
		enableClustering: boolean;
		enableAdvancedEffects: boolean;
	};

	// Performance and quality settings - initialized in onMount
	let deviceCapabilities: DeviceCapabilities;
	let qualitySettings: QualitySettings = {
		particleCount: 250,
		connectionDistance: 100,
		maxConnections: 3,
		updateFrequency: 60,
		enableClustering: true,
		enableAdvancedEffects: true
	};

	export let particleCount = 250; // Default value, will be updated in onMount
	export let baseSpeed = 0.06;

	interface Particle extends PoolParticle {
		parallaxSpeed: number;
		depthLayer: number;
		scrollOffset: number;
		baseY: number;
		baseX: number;
	}

	// Reference width for scaling
	let REFERENCE_WIDTH = 1920;

	let canvas: HTMLCanvasElement;
	let ctx: CanvasRenderingContext2D;
	let width = REFERENCE_WIDTH;
	let height: number;
	let particles: Particle[] = [];

	// Performance optimizations
	let spatialGrid: SpatialHashGrid;

	// Track system state
	$: focusPoint = $gridActivity.focusPoint;
	$: systemActivity = $gridActivity.activity;
	$: scrollPosition = $scrollTracker;
	$: pageProgress = $scrollProgress;

	// Palette and motion along the page, keyed by scroll progress
	type StopConfig = {
		progress: number;
		particleColor: [number, number, number];
		connectionColor: [number, number, number];
		clusterStrength: number;
		energyMultiplier: number;
		parallaxIntensity: number;
	};

	const stops: StopConfig[] = [
		{
			progress: 0,
			particleColor: [76, 201, 240],
			connectionColor: [76, 201, 240],
			clusterStrength: 0.3,
			energyMultiplier: 1.0,
			parallaxIntensity: 0.5
		},
		{
			progress: 0.12,
			particleColor: [76, 201, 240],
			connectionColor: [76, 201, 240],
			clusterStrength: 0.25,
			energyMultiplier: 0.7,
			parallaxIntensity: 0.3
		},
		{
			progress: 0.3,
			particleColor: [128, 255, 219],
			connectionColor: [128, 255, 219],
			clusterStrength: 0.45,
			energyMultiplier: 0.8,
			parallaxIntensity: 0.3
		},
		{
			progress: 0.62,
			particleColor: [76, 201, 240],
			connectionColor: [76, 201, 240],
			clusterStrength: 0.5,
			energyMultiplier: 0.8,
			parallaxIntensity: 0.3
		},
		{
			progress: 1,
			particleColor: [128, 255, 219],
			connectionColor: [128, 255, 219],
			clusterStrength: 0.3,
			energyMultiplier: 0.7,
			parallaxIntensity: 0.4
		}
	];

	const CONNECTION_DISTANCE = 200;
	const CONNECTION_BASE_OPACITY = 0.3;
	const EDGE_BOOST = 0.8;
	const MIN_LINE_WIDTH = 0.8;
	const MAX_LINE_WIDTH = 2.5;
	const FADE_IN_SPEED = 8;
	const PERSPECTIVE = 1000;
	const ROTATION = 60;
	const CLUSTER_PROBABILITY = 0.2;
	const CLUSTER_RADIUS = 100;
	const CLUSTER_DENSITY = 0.2;
	const MIN_CLUSTER_SIZE = 3;
	const REPULSION_DISTANCE = 30;
	const REPULSION_STRENGTH = 1;
	const MIN_PARTICLE_DISTANCE = 25;
	const GRID_SCALE = 50;

	// Parallax constants
	const PARALLAX_MULTIPLIER = 0.3; // How much scroll affects particles
	const DEPTH_PARALLAX_RANGE = [0.1, 2.0]; // Speed range for different depth layers

	const COLOR_BLEND_RATE = 0.18;
	const COLOR_EASE_POWER = 0.55;
	const REDSHIFT_INTENSITY = 0.85; // How aggressively we shift toward red
	let blendedParticleColor = [...stops[0].particleColor];
	let blendedConnectionColor = [...stops[0].connectionColor];

	let dpr: number;
	let animationFrame: number;
	// Remove setInterval - unified RAF loop only
	let lastFrameTime = 0;

	// Base alignment strength
	const BASE_ALIGNMENT_STRENGTH = 0.05;
	const ENERGY_ALIGNMENT_BOOST = 0.01;

	// Base constants for 1920px width
	const BASE_PARTICLE_COUNT = 448;
	const MIN_PARTICLE_COUNT = 100;

	function getWorldSpaceBounds() {
		const angle = ROTATION * (Math.PI / 180);

		return {
			minX: 0,
			maxX: width,
			minY: 0,
			maxY: height / Math.cos(angle)
		};
	}

	function clamp(value: number, min: number, max: number) {
		return Math.max(min, Math.min(max, value));
	}

	function lerp(a: number, b: number, t: number) {
		return a + (b - a) * t;
	}

	function rgbaColor(rgb: number[], opacity: number) {
		const [r, g, b] = rgb.map((value) => Math.round(clamp(value, 0, 255)));
		const alpha = clamp(opacity, 0, 1);
		return `rgba(${r}, ${g}, ${b}, ${alpha})`;
	}

	function isOverlapping(x: number, y: number, radius: number) {
		return particles.some((p) => {
			const dx = p.x - x;
			const dy = p.y - y;
			const minDist = (p.radius + radius) * 2;
			return Math.hypot(dx, dy) < minDist;
		});
	}

	function createParticle(index: number): Particle {
		const bounds = getWorldSpaceBounds();
		const useCluster = Math.random() < CLUSTER_PROBABILITY;
		const fadeDelay = index * 1.5;
		const radius = Math.random() * 1.5 + 0.5;

		// Assign depth layer and parallax properties
		const depthLayer = Math.floor(Math.random() * 5) + 1;
		const parallaxSpeed =
			DEPTH_PARALLAX_RANGE[0] +
			(DEPTH_PARALLAX_RANGE[1] - DEPTH_PARALLAX_RANGE[0]) * (depthLayer / 5);

		let attempts = 0;
		let x, y;

		do {
			if (useCluster && particles.length >= MIN_CLUSTER_SIZE) {
				const potentialCenters = particles.filter(
					(p) =>
						particles.filter((other) => Math.hypot(other.x - p.x, other.y - p.y) < CLUSTER_RADIUS)
							.length >= MIN_CLUSTER_SIZE
				);

				if (potentialCenters.length > 0) {
					const center = potentialCenters[Math.floor(Math.random() * potentialCenters.length)];
					const angle = Math.random() * Math.PI * 2;
					const dist = Math.random() * CLUSTER_RADIUS * CLUSTER_DENSITY;
					x = center.x + Math.cos(angle) * dist;
					y = center.y + Math.sin(angle) * dist;
				}
			}

			if (!x || !y) {
				x = bounds.minX + Math.random() * (bounds.maxX - bounds.minX);
				const visibleHeight = height / Math.cos((ROTATION * Math.PI) / 180);
				y = bounds.minY + Math.random() * visibleHeight;
			}

			attempts++;
		} while (isOverlapping(x, y, radius) && attempts < 10);

		return {
			x,
			y,
			vx: (Math.random() - 0.5) * baseSpeed,
			vy: (Math.random() - 0.5) * baseSpeed,
			radius,
			opacity: Math.random() * 0.4 + 0.2,
			energy: 0,
			fadeIn: -fadeDelay,
			parallaxSpeed,
			depthLayer,
			scrollOffset: 0,
			baseY: y,
			baseX: x,
			active: true,
			id: index
		};
	}

	function projectToGrid(x: number, y: number) {
		const angle = ROTATION * (Math.PI / 180);

		return {
			x: x,
			y: y * Math.cos(angle)
		};
	}

	function updateParticles(dt: number): Particle[] {
		const bounds = getWorldSpaceBounds();
		const currentConfig = stopAt(pageProgress ?? 0).lower;
		const scrollY = scrollPosition.y || 0;
		const activeParticles: Particle[] = [];

		particles.forEach((p) => {
			p.fadeIn = Math.min(1, p.fadeIn + FADE_IN_SPEED);
			if (p.fadeIn <= 0) return;

			activeParticles.push(p);
		});

		spatialGrid.clear();
		activeParticles.forEach((p) => spatialGrid.insert(p));

		applyParticlePhysics(activeParticles, {
			dt,
			baseSpeed,
			rotation: ROTATION,
			gridScale: GRID_SCALE,
			minParticleDistance: MIN_PARTICLE_DISTANCE,
			repulsionDistance: REPULSION_DISTANCE,
			repulsionStrength: REPULSION_STRENGTH,
			connectionDistance: CONNECTION_DISTANCE,
			clusterRadius: CLUSTER_RADIUS,
			minClusterSize: MIN_CLUSTER_SIZE,
			baseAlignmentStrength: BASE_ALIGNMENT_STRENGTH,
			energyAlignmentBoost: ENERGY_ALIGNMENT_BOOST,
			randomMotionMagnitude: 0.05 * currentConfig.energyMultiplier,
			bounds,
			focusPoint,
			systemActivity,
			neighborLookup: (particle, radius) =>
				spatialGrid.getNearbyParticles(particle, radius) as Particle[],
			cohesionFactor: 0.0002,
			randomDampening: 0.7
		});

		spatialGrid.clear();
		activeParticles.forEach((p) => spatialGrid.insert(p));

		if (focusPoint) {
			const clusterStrength = currentConfig.clusterStrength;
			activeParticles.forEach((p) => {
				const dx = focusPoint.x - p.x;
				const dy = focusPoint.y - p.y;
				const dist = Math.hypot(dx, dy) || 1;
				const influence = Math.max(0, 1 - dist / 300) * clusterStrength;
				p.vx += (dx / dist) * influence * 0.0005 * dt;
				p.vy += (dy / dist) * influence * 0.0005 * dt;
			});
		}

		const parallaxBase = scrollY * PARALLAX_MULTIPLIER * currentConfig.parallaxIntensity;
		activeParticles.forEach((p) => {
			p.scrollOffset = parallaxBase * p.parallaxSpeed;
		});

		return activeParticles;
	}

	function stopAt(raw: number) {
		const progress = clamp(raw, 0, 1);
		let lower = stops[0];
		let upper = stops[stops.length - 1];
		for (let i = 0; i < stops.length - 1; i++) {
			if (progress >= stops[i].progress && progress <= stops[i + 1].progress) {
				lower = stops[i];
				upper = stops[i + 1];
				break;
			}
		}
		const range = Math.max(upper.progress - lower.progress, 0.0001);
		const t = clamp((progress - lower.progress) / range, 0, 1);
		return { lower, upper, t };
	}

	function getCurrentColor() {
		const { lower: lowerConfig, upper: upperConfig, t: tRaw } = stopAt(pageProgress ?? 0);
		const t = Math.pow(tRaw, COLOR_EASE_POWER);

		const targetParticleColor = lowerConfig.particleColor.map((value, idx) =>
			lerp(value, upperConfig.particleColor[idx], t)
		);

		const targetConnectionColor = lowerConfig.connectionColor.map((value, idx) =>
			lerp(value, upperConfig.connectionColor[idx], t)
		);

		for (let i = 0; i < 3; i++) {
			blendedParticleColor[i] +=
				(targetParticleColor[i] - blendedParticleColor[i]) * COLOR_BLEND_RATE;
			blendedConnectionColor[i] +=
				(targetConnectionColor[i] - blendedConnectionColor[i]) * COLOR_BLEND_RATE;
		}

		return {
			particle: blendedParticleColor,
			connection: blendedConnectionColor
		};
	}

	function applyRedshift(color: number[]): number[] {
		// Cosmological redshift: monotonically shift toward red as we scroll
		const progress = clamp(pageProgress ?? 0, 0, 1);

		// Target: warm red-orange [255, 100, 60]
		const targetRed = 255;
		const targetGreen = 100;
		const targetBlue = 60;

		// Apply redshift with easing for smooth transition
		const redshiftAmount = Math.pow(progress, 0.8) * REDSHIFT_INTENSITY;

		return [
			lerp(color[0], targetRed, redshiftAmount),
			lerp(color[1], targetGreen, redshiftAmount),
			lerp(color[2], targetBlue, redshiftAmount)
		];
	}

	function tick(currentTime: number) {
		if (lastFrameTime === 0) lastFrameTime = currentTime;
		let elapsed = currentTime - lastFrameTime;
		lastFrameTime = currentTime;

		// Cap delta time to prevent physics explosion on tab-out or lag
		// Capping at 33ms (~30fps) ensures simulation remains stable
		if (elapsed > 33) elapsed = 33;

		const deltaTime = elapsed / 16.67; // Normalize to 60fps

		const frameStartTime = performance.now();
		const FRAME_BUDGET = 16.67; // 60fps target

		// Update particles
		const activeParticles = updateParticles(deltaTime);

		// Check frame budget before rendering
		const updateTime = performance.now() - frameStartTime;
		if (updateTime > FRAME_BUDGET * 0.6) {
			// Skip this frame if update took too long
			requestAnimationFrame(tick);
			return;
		}

		// Draw frame
		ctx.clearRect(0, 0, width, height);
		const baseColors = getCurrentColor();

		// Apply cosmological redshift overlay
		const colors = {
			particle: applyRedshift(baseColors.particle),
			connection: applyRedshift(baseColors.connection)
		};

		// Draw connections using spatial optimization
		// eslint-disable-next-line svelte/prefer-svelte-reactivity
		const processedPairs = new Set<string>();

		activeParticles.forEach((particle) => {
			if (particle.fadeIn <= 0) return;

			const renderParticle = projectToGrid(particle.x, particle.y + (particle.scrollOffset ?? 0));
			const nearby = spatialGrid.getNearbyParticles(particle, CONNECTION_DISTANCE);

			nearby.forEach((other) => {
				if (other.fadeIn <= 0) return;

				// Avoid duplicate connections
				const pairKey =
					particle.x < other.x
						? `${particle.x},${particle.y}-${other.x},${other.y}`
						: `${other.x},${other.y}-${particle.x},${particle.y}`;

				if (processedPairs.has(pairKey)) return;
				processedPairs.add(pairKey);

				const renderOther = projectToGrid(other.x, other.y + (other.scrollOffset ?? 0));

				const dx = renderParticle.x - renderOther.x;
				const dy = renderParticle.y - renderOther.y;
				const dist = Math.sqrt(dx * dx + dy * dy);

				if (!Number.isFinite(dist) || dist <= MIN_PARTICLE_DISTANCE || dist > CONNECTION_DISTANCE) {
					return;
				}

				const combinedFade = particle.fadeIn * other.fadeIn;
				if (combinedFade <= 0) return;

				const normalized = Math.max(0, 1 - dist / CONNECTION_DISTANCE);
				const distanceFactor = Math.pow(normalized, 1.2);
				if (!Number.isFinite(distanceFactor) || distanceFactor <= 0) return;

				const edgeRatio = Math.min(1, dist / CONNECTION_DISTANCE);
				const edgeEmphasis = EDGE_BOOST * Math.pow(edgeRatio, 0.8);

				const baseOpacity = CONNECTION_BASE_OPACITY * distanceFactor * combinedFade;
				if (!Number.isFinite(baseOpacity) || baseOpacity <= 0) return;

				const edgeOpacity = baseOpacity * (1 + edgeEmphasis);

				const gradient = ctx.createLinearGradient(
					renderParticle.x,
					renderParticle.y,
					renderOther.x,
					renderOther.y
				);

				const connectionColor = rgbaColor(colors.connection, edgeOpacity);
				const connectionColorMid = rgbaColor(colors.connection, baseOpacity);

				gradient.addColorStop(0, connectionColor);
				gradient.addColorStop(0.15, connectionColorMid);
				gradient.addColorStop(0.5, connectionColorMid);
				gradient.addColorStop(0.85, connectionColorMid);
				gradient.addColorStop(1, connectionColor);

				const lineWidth = Math.min(
					MAX_LINE_WIDTH,
					MIN_LINE_WIDTH + distanceFactor * (2 + edgeEmphasis * 1.5)
				);

				ctx.beginPath();
				ctx.strokeStyle = gradient;
				ctx.lineWidth = lineWidth;
				ctx.moveTo(renderParticle.x, renderParticle.y);
				ctx.lineTo(renderOther.x, renderOther.y);
				ctx.stroke();
			});
		});

		// Draw particles
		activeParticles.forEach((p) => {
			if (p.fadeIn <= 0) return;

			const renderY = p.y + (p.scrollOffset ?? 0);
			const projected = projectToGrid(p.x, renderY);
			const opacity = p.opacity * p.fadeIn;

			const particleColor = rgbaColor(colors.particle, opacity);

			ctx.beginPath();
			ctx.arc(
				projected.x,
				projected.y,
				(p.radius * (1 + renderY / PERSPECTIVE)) / dpr,
				0,
				Math.PI * 2
			);
			ctx.fillStyle = particleColor;
			ctx.fill();
		});

		requestAnimationFrame(tick);
	}

	onMount(() => {
		// Initialize performance settings on client side
		deviceCapabilities = detectDeviceCapabilities();
		qualitySettings = getQualitySettings(deviceCapabilities.preferredQuality);
		particleCount = qualitySettings.particleCount;

		ctx = canvas.getContext('2d')!;
		dpr = 1;

		width = window.innerWidth;
		height = window.innerHeight;

		canvas.width = width;
		canvas.height = height;

		canvas.style.width = width + 'px';
		canvas.style.height = height + 'px';

		ctx.scale(1, 1);

		const scale = Math.min(width / REFERENCE_WIDTH, 1);
		particleCount = Math.max(MIN_PARTICLE_COUNT, Math.round(BASE_PARTICLE_COUNT * scale));

		// Initialize spatial grid with appropriate cell size
		spatialGrid = new SpatialHashGrid(CONNECTION_DISTANCE, width, height);

		particles = Array(particleCount)
			.fill(null)
			.map((_, i) => createParticle(i));

		animationFrame = requestAnimationFrame(tick);

		return () => {
			cancelAnimationFrame(animationFrame);
			if (ctx && canvas) {
				ctx.clearRect(0, 0, canvas.width, canvas.height);
			}
			particles = [];
		};
	});
</script>

<canvas
	bind:this={canvas}
	class="particle-field"
	style="transform-origin: top; transform: perspective({PERSPECTIVE}px) rotateX({ROTATION}deg)"
>
</canvas>

<style>
	.particle-field {
		position: fixed;
		inset: 0;
		z-index: -1;
		pointer-events: none;
		backface-visibility: hidden;
		will-change: transform;
	}
</style>
