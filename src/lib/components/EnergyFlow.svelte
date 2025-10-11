<script lang="ts">
	import { onMount } from 'svelte';

	interface FlowPoint {
		x: number;
		y: number;
		progress: number;
		speed: number;
		opacity: number;
	}

	interface FlowPath {
		points: FlowPoint[];
		start: { x: number; y: number };
		end: { x: number; y: number };
		active: boolean;
	}

	let canvas: HTMLCanvasElement;
	let ctx: CanvasRenderingContext2D;
	let flowPaths: FlowPath[] = [];

	const FLOW_SPEED = 0.5;
	const PARTICLE_COUNT = 3;
	const PATH_OPACITY = 0.3;

	function createFlowPath(
		start: { x: number; y: number },
		end: { x: number; y: number }
	): FlowPath {
		return {
			points: Array(PARTICLE_COUNT)
				.fill(null)
				.map(() => ({
					x: start.x,
					y: start.y,
					progress: Math.random(),
					speed: FLOW_SPEED * (0.8 + Math.random() * 0.4),
					opacity: 0.4 + Math.random() * 0.6
				})),
			start,
			end,
			active: true
		};
	}

	function draw() {
		ctx.clearRect(0, 0, canvas.width, canvas.height);

		flowPaths.forEach((path) => {
			if (!path.active) return;

			// Draw subtle path
			const gradient = ctx.createLinearGradient(path.start.x, path.start.y, path.end.x, path.end.y);
			gradient.addColorStop(0, `rgba(76, 201, 240, 0)`);
			gradient.addColorStop(0.5, `rgba(76, 201, 240, ${PATH_OPACITY})`);
			gradient.addColorStop(1, `rgba(128, 255, 219, 0)`);

			ctx.beginPath();
			ctx.strokeStyle = gradient;
			ctx.lineWidth = 1;
			ctx.moveTo(path.start.x, path.start.y);
			ctx.lineTo(path.end.x, path.end.y);
			ctx.stroke();

			// Draw flowing particles
			path.points.forEach((point) => {
				const t = point.progress;
				point.x = path.start.x + (path.end.x - path.start.x) * t;
				point.y = path.start.y + (path.end.y - path.start.y) * t;

				const particleGradient = ctx.createRadialGradient(point.x, point.y, 0, point.x, point.y, 3);
				particleGradient.addColorStop(0, `rgba(128, 255, 219, ${point.opacity})`);
				particleGradient.addColorStop(1, `rgba(76, 201, 240, 0)`);

				ctx.beginPath();
				ctx.fillStyle = particleGradient;
				ctx.arc(point.x, point.y, 3, 0, Math.PI * 2);
				ctx.fill();

				// Update progress
				point.progress += point.speed / 100;
				if (point.progress > 1) point.progress = 0;
			});
		});

		requestAnimationFrame(draw);
	}

	// Example of creating flows between elements
	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	function connectElements(element1: HTMLElement, element2: HTMLElement) {
		const rect1 = element1.getBoundingClientRect();
		const rect2 = element2.getBoundingClientRect();

		const start = {
			x: rect1.left + rect1.width / 2,
			y: rect1.top + rect1.height / 2
		};

		const end = {
			x: rect2.left + rect2.width / 2,
			y: rect2.top + rect2.height / 2
		};

		flowPaths.push(createFlowPath(start, end));
	}

	onMount(() => {
		ctx = canvas.getContext('2d')!;
		canvas.width = window.innerWidth;
		canvas.height = window.innerHeight;

		requestAnimationFrame(draw);
	});
</script>

<canvas bind:this={canvas} class="energy-flow" />

<style>
	.energy-flow {
		position: fixed;
		inset: 0;
		z-index: -1;
		pointer-events: none;
	}
</style>
