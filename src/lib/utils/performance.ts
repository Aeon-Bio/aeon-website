/**
 * Performance monitoring and optimization utilities
 */

export interface DeviceCapabilities {
	devicePixelRatio: number;
	hardwareConcurrency: number;
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	memoryInfo?: any;
	gpu?: string;
	isMobile: boolean;
	isLowEnd: boolean;
	preferredQuality: 'low' | 'medium' | 'high';
}

export interface PerformanceMetrics {
	fps: number;
	frameTimes: number[];
	memoryUsage: number;
	particleCount: number;
	averageFrameTime: number;
}

export class PerformanceMonitor {
	private frameCount = 0;
	private lastTime = performance.now();
	private frameTimes: number[] = [];
	private readonly maxFrameHistory = 60;

	private fpsCallback?: (fps: number) => void;

	constructor() {
		this.tick = this.tick.bind(this);
	}

	start(callback?: (fps: number) => void) {
		this.fpsCallback = callback;
		this.tick();
	}

	private tick() {
		const now = performance.now();
		const deltaTime = now - this.lastTime;

		this.frameTimes.push(deltaTime);
		if (this.frameTimes.length > this.maxFrameHistory) {
			this.frameTimes.shift();
		}

		this.frameCount++;

		// Calculate FPS every second
		if (deltaTime >= 1000) {
			const fps = Math.round((this.frameCount * 1000) / deltaTime);
			if (this.fpsCallback) {
				this.fpsCallback(fps);
			}
			this.frameCount = 0;
			this.lastTime = now;
		}

		requestAnimationFrame(this.tick);
	}

	getMetrics(): PerformanceMetrics {
		const averageFrameTime = this.frameTimes.reduce((a, b) => a + b, 0) / this.frameTimes.length;
		const fps = this.frameTimes.length > 0 ? 1000 / averageFrameTime : 0;

		return {
			fps: Math.round(fps),
			frameTimes: [...this.frameTimes],
			memoryUsage: this.getMemoryUsage(),
			particleCount: 0, // Will be set by particle system
			averageFrameTime
		};
	}

	private getMemoryUsage(): number {
		// @ts-expect-error - performance.memory is non-standard
		if (performance.memory) {
			// @ts-expect-error - performance.memory is non-standard
			return performance.memory.usedJSHeapSize / (1024 * 1024); // MB
		}
		return 0;
	}
}

export function detectDeviceCapabilities(): DeviceCapabilities {
	// Return default capabilities during SSR
	if (typeof window === 'undefined' || typeof document === 'undefined') {
		return {
			isMobile: false,
			hardwareConcurrency: 4,
			devicePixelRatio: 1,
			isLowEnd: false,
			preferredQuality: 'medium'
		};
	}

	const canvas = document.createElement('canvas');
	const gl = (canvas.getContext('webgl') || canvas.getContext('experimental-webgl')) as WebGLRenderingContext | null;

	const isMobile = /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
		navigator.userAgent
	);
	const devicePixelRatio = window.devicePixelRatio || 1;
	const hardwareConcurrency = navigator.hardwareConcurrency || 2;

	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	const memoryInfo = (performance as any).memory;
	const totalMemory = memoryInfo ? memoryInfo.jsHeapSizeLimit / (1024 * 1024 * 1024) : 2; // GB

	// Get GPU info if available
	let gpu = 'unknown';
	if (gl) {
		const debugInfo = gl.getExtension('WEBGL_debug_renderer_info');
		if (debugInfo) {
			gpu = gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL);
		}
	}

	// Determine if device is low-end
	const isLowEnd =
		isMobile || hardwareConcurrency <= 2 || totalMemory < 2 || devicePixelRatio < 1.5;

	// Determine preferred quality level
	let preferredQuality: 'low' | 'medium' | 'high' = 'medium';

	if (isLowEnd) {
		preferredQuality = 'low';
	} else if (hardwareConcurrency >= 8 && totalMemory >= 8 && !isMobile) {
		preferredQuality = 'high';
	}

	return {
		devicePixelRatio,
		hardwareConcurrency,
		memoryInfo,
		gpu,
		isMobile,
		isLowEnd,
		preferredQuality
	};
}

export function getQualitySettings(quality: 'low' | 'medium' | 'high') {
	const settings = {
		low: {
			particleCount: 100,
			connectionDistance: 150,
			maxConnections: 3,
			updateFrequency: 30, // fps
			enableClustering: false,
			enableAdvancedEffects: false
		},
		medium: {
			particleCount: 250,
			connectionDistance: 180,
			maxConnections: 5,
			updateFrequency: 60,
			enableClustering: true,
			enableAdvancedEffects: true
		},
		high: {
			particleCount: 500,
			connectionDistance: 200,
			maxConnections: 8,
			updateFrequency: 60,
			enableClustering: true,
			enableAdvancedEffects: true
		}
	};

	return settings[quality];
}

// Utility to check if user prefers reduced motion
export function prefersReducedMotion(): boolean {
	if (typeof window === 'undefined') {
		return false; // Default to false during SSR
	}
	return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

// Utility to throttle function calls
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function throttle<T extends (...args: any[]) => any>(
	func: T,
	limit: number
): (...args: Parameters<T>) => void {
	let inThrottle: boolean;
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	return function (this: any, ...args: Parameters<T>) {
		if (!inThrottle) {
			func.apply(this, args);
			inThrottle = true;
			setTimeout(() => (inThrottle = false), limit);
		}
	};
}

// Utility to debounce function calls
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function debounce<T extends (...args: any[]) => any>(
	func: T,
	delay: number
): (...args: Parameters<T>) => void {
	let timeoutId: ReturnType<typeof setTimeout>;
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	return function (this: any, ...args: Parameters<T>) {
		clearTimeout(timeoutId);
		timeoutId = setTimeout(() => func.apply(this, args), delay);
	};
}
