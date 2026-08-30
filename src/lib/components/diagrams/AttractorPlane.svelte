<script lang="ts">
	import { onMount } from 'svelte';

	/** The pass already selected by the scroll narrative: words → wearable → blood → genome. */
	export let phase = 0;

	type Point = { x: number; y: number };
	type Mote = Point & { vx: number; vy: number; offset: number; weight: number };
	type Regime = {
		a: number;
		b: number;
		c: number;
		d: number;
		count: number;
		gravity: number;
		drift: number;
	};

	const regimes: Regime[] = [
		{ a: -1.4, b: 1.6, c: 1, d: 0.7, count: 108, gravity: 6.2, drift: 0.007 },
		{ a: -1.7, b: 1.3, c: -0.1, d: -1.21, count: 120, gravity: 6.8, drift: 0.008 },
		{ a: 1.7, b: 1.7, c: 0.6, d: 1.2, count: 132, gravity: 7.4, drift: 0.009 },
		{ a: -1.8, b: -2, c: -0.5, d: -0.9, count: 144, gravity: 8, drift: 0.01 }
	];

	let canvas: HTMLCanvasElement;
	let context: CanvasRenderingContext2D | null = null;
	let width = 0;
	let height = 0;
	let trace: Point[] = [];
	let verticalOrder: number[] = [];
	let lattice: Point[] = [];
	let motes: Mote[] = [];
	let frame = 0;
	let last = 0;
	let visible = false;
	let mounted = false;
	let reduced = false;
	let builtPhase = -1;
	const pointer = { x: 0, y: 0, active: false };

	$: clampedPhase = Math.max(0, Math.min(regimes.length - 1, phase));

	function random(seed: number) {
		let state = seed >>> 0;
		return () => {
			state = (state * 1664525 + 1013904223) >>> 0;
			return state / 4294967296;
		};
	}

	/** A sampled Clifford attractor, normalized once so animation only moves the inhabiting motes. */
	function buildAttractor() {
		const p = clampedPhase;
		const regime = regimes[p];
		const raw: Point[] = [];
		let x = 0.1;
		let y = 0.1;
		let minX = Infinity;
		let maxX = -Infinity;
		let minY = Infinity;
		let maxY = -Infinity;

		for (let i = 0; i < 1900; i++) {
			const nx = Math.sin(regime.a * y) + regime.c * Math.cos(regime.a * x);
			const ny = Math.sin(regime.b * x) + regime.d * Math.cos(regime.b * y);
			x = nx;
			y = ny;
			if (i < 120) continue;
			raw.push({ x, y });
			minX = Math.min(minX, x);
			maxX = Math.max(maxX, x);
			minY = Math.min(minY, y);
			maxY = Math.max(maxY, y);
		}

		const normalized = raw.map((point) => ({
			x: ((point.x - minX) / Math.max(0.001, maxX - minX) - 0.5) * 2,
			y: ((point.y - minY) / Math.max(0.001, maxY - minY) - 0.5) * 2
		}));
		const byHeight = normalized.map((_, i) => i).sort((i, j) => normalized[i].y - normalized[j].y);
		const evenY = new Array<number>(normalized.length);
		byHeight.forEach((index, rank) => {
			evenY[index] = (rank / Math.max(1, normalized.length - 1) - 0.5) * 2;
		});
		trace = normalized.map((point, i) => ({ x: point.x, y: evenY[i] }));
		verticalOrder = byHeight;
		const latticeStride = Math.max(1, Math.floor(trace.length / 168));
		lattice = verticalOrder.filter((_, i) => i % latticeStride === 0).map((index) => trace[index]);

		const rand = random(0xae0 + p * 97);
		motes = Array.from({ length: regime.count }, (_, i) => {
			const offset = Math.floor((i / regime.count) * verticalOrder.length);
			const target = place(trace[verticalOrder[offset]]);
			return {
				x: target.x + (rand() - 0.5) * 24,
				y: target.y + (rand() - 0.5) * 18,
				vx: 0,
				vy: 0,
				offset,
				weight: 0.55 + rand() * 0.9
			};
		});
		builtPhase = p;
		last = 0;
		draw(0, true);
	}

	function place(point: Point): Point {
		const narrow = width <= 720;
		const across = (point.x + 1) * 0.5;
		const down = (point.y + 1) * 0.5;
		return {
			x: width * ((narrow ? 0.025 : 0.008) + across * (narrow ? 0.92 : 0.5)),
			y: height * (-0.035 + down * 1.07)
		};
	}

	function resize() {
		if (!canvas || !context) return;
		const rect = canvas.getBoundingClientRect();
		if (rect.width < 2 || rect.height < 2) return;
		const oldWidth = width || rect.width;
		const oldHeight = height || rect.height;
		width = rect.width;
		height = rect.height;
		const dpr = Math.min(window.devicePixelRatio || 1, 2);
		canvas.width = Math.round(width * dpr);
		canvas.height = Math.round(height * dpr);
		context.setTransform(dpr, 0, 0, dpr, 0, 0);
		for (const mote of motes) {
			mote.x *= width / oldWidth;
			mote.y *= height / oldHeight;
		}
		draw(0, true);
	}

	function draw(time: number, still = false) {
		if (!context || !width || !height || !trace.length) return;
		const p = clampedPhase;
		const regime = regimes[p];
		const ctx = context;
		ctx.clearRect(0, 0, width, height);

		if (!still) {
			const dt = Math.min(1.7, Math.max(0.35, (time - last) / 16.67 || 1));
			last = time;
			const travel = Math.floor(time * regime.drift) % verticalOrder.length;
			for (const mote of motes) {
				const index = verticalOrder[(mote.offset + travel) % verticalOrder.length];
				const target = place(trace[index]);
				mote.vx += (target.x - mote.x) * 0.0038 * dt;
				mote.vy += (target.y - mote.y) * 0.0038 * dt;

				if (pointer.active) {
					const dx = pointer.x - mote.x;
					const dy = pointer.y - mote.y;
					const dist2 = dx * dx + dy * dy + 1100;
					const gravity = (regime.gravity * mote.weight * dt) / dist2;
					mote.vx += dx * gravity;
					mote.vy += dy * gravity;
				}

				mote.vx *= Math.pow(0.91, dt);
				mote.vy *= Math.pow(0.91, dt);
				mote.x += mote.vx * dt;
				mote.y += mote.vy * dt;
			}
		}

		const mix = p / (regimes.length - 1);
		const red = Math.round(76 + (128 - 76) * mix);
		const green = Math.round(201 + (255 - 201) * mix);
		const blue = Math.round(240 + (219 - 240) * mix);
		const reach = Math.min(178, Math.max(104, height / 7.2)) + p * 4;
		ctx.globalCompositeOperation = 'lighter';
		const field = lattice.map(place);

		for (let i = 0; i < field.length; i++) {
			const a = field[i];
			for (let j = i + 1; j < field.length; j++) {
				const b = field[j];
				const distance = Math.hypot(a.x - b.x, a.y - b.y);
				if (distance >= reach) continue;
				const alpha = Math.pow(1 - distance / reach, 2) * 0.024;
				ctx.strokeStyle = `rgba(${red}, ${green}, ${blue}, ${alpha})`;
				ctx.lineWidth = 0.45;
				ctx.beginPath();
				ctx.moveTo(a.x, a.y);
				ctx.lineTo(b.x, b.y);
				ctx.stroke();
			}
		}

		for (const point of field) {
			ctx.fillStyle = `rgba(${red}, ${green}, ${blue}, 0.075)`;
			ctx.beginPath();
			ctx.arc(point.x, point.y, 0.72, 0, Math.PI * 2);
			ctx.fill();
		}

		for (let i = 0; i < motes.length; i++) {
			const a = motes[i];
			for (let j = i + 1; j < motes.length; j++) {
				const b = motes[j];
				const distance = Math.hypot(a.x - b.x, a.y - b.y);
				if (distance >= reach) continue;
				const alpha = Math.pow(1 - distance / reach, 2) * 0.075;
				ctx.strokeStyle = `rgba(${red}, ${green}, ${blue}, ${alpha})`;
				ctx.lineWidth = 0.55;
				ctx.beginPath();
				ctx.moveTo(a.x, a.y);
				ctx.lineTo(b.x, b.y);
				ctx.stroke();
			}
		}

		for (const mote of motes) {
			ctx.fillStyle = `rgba(${red}, ${green}, ${blue}, ${0.12 + mote.weight * 0.055})`;
			ctx.beginPath();
			ctx.arc(mote.x, mote.y, 0.55 + mote.weight * 0.42, 0, Math.PI * 2);
			ctx.fill();
		}

		ctx.globalCompositeOperation = 'source-over';
	}

	function tick(time: number) {
		frame = 0;
		if (!visible || reduced) return;
		draw(time);
		frame = requestAnimationFrame(tick);
	}

	function run() {
		if (visible && !reduced && !frame) frame = requestAnimationFrame(tick);
	}

	$: if (mounted && builtPhase !== clampedPhase) {
		buildAttractor();
		run();
	}

	onMount(() => {
		context = canvas.getContext('2d');
		const host = canvas.parentElement;
		if (!context || !host) return;
		reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

		const move = (event: PointerEvent) => {
			const rect = canvas.getBoundingClientRect();
			pointer.x = event.clientX - rect.left;
			pointer.y = event.clientY - rect.top;
			pointer.active = event.pointerType !== 'touch';
			run();
		};
		const leave = () => (pointer.active = false);
		host.addEventListener('pointermove', move, { passive: true });
		host.addEventListener('pointerleave', leave, { passive: true });

		const sizes = new ResizeObserver(resize);
		sizes.observe(host);
		const viewport = new IntersectionObserver(
			([entry]) => {
				visible = entry.isIntersecting;
				if (visible) run();
				else if (frame) {
					cancelAnimationFrame(frame);
					frame = 0;
				}
			},
			{ rootMargin: '160px 0px' }
		);
		viewport.observe(host);

		resize();
		mounted = true;
		buildAttractor();
		if (reduced) draw(0, true);

		return () => {
			mounted = false;
			host.removeEventListener('pointermove', move);
			host.removeEventListener('pointerleave', leave);
			sizes.disconnect();
			viewport.disconnect();
			if (frame) cancelAnimationFrame(frame);
		};
	});
</script>

<canvas bind:this={canvas} class="attractor" data-phase={clampedPhase} aria-hidden="true"></canvas>

<style>
	.attractor {
		position: absolute;
		inset: 0;
		width: 100%;
		height: 100%;
		pointer-events: none;
		z-index: 0;
		opacity: 0.82;
		mask-image: linear-gradient(90deg, black 0%, black 42%, transparent 62%);
	}

	@media (max-width: 600px) {
		.attractor {
			mask-image: linear-gradient(90deg, black 0%, black 76%, transparent 100%);
		}
	}

	@media (prefers-reduced-motion: reduce) {
		.attractor {
			opacity: 0.55;
		}
	}
</style>
