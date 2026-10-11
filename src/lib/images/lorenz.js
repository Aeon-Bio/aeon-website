// Lorenz system: dx = σ(y − x), dy = x(ρ − z) − y, dz = xy − βz
//
// Plain ESM with JSDoc types so it can be imported by the Svelte component,
// the favicon generator and node directly (no bundler, no TypeScript syntax).
// Nothing in here touches the DOM.

/** @typedef {[number, number, number]} Vec3 */

export const SIGMA = 10;
export const RHO = 28;
export const BETA = 8 / 3;
/** integration step */
export const DT = 0.01;
/** initial point (x, y, z) */
export const START = /** @type {Vec3} */ ([0.1, 0, 0]);
/** steps discarded before the trajectory settles onto the attractor */
export const TRANSIENT = 3000;
/** steps kept for the drawn path */
export const KEEP = 5000;

/**
 * @param {Vec3} p
 * @param {number} sigma
 * @param {number} rho
 * @param {number} beta
 * @returns {Vec3}
 */
export function lorenz([x, y, z], sigma = SIGMA, rho = RHO, beta = BETA) {
	return [sigma * (y - x), x * (rho - z) - y, x * y - beta * z];
}

/**
 * one RK4 step
 * @param {Vec3} p
 * @param {number} dt
 * @param {number} sigma
 * @param {number} rho
 * @param {number} beta
 * @returns {Vec3}
 */
export function rk4(p, dt, sigma = SIGMA, rho = RHO, beta = BETA) {
	const k1 = lorenz(p, sigma, rho, beta);
	const k2 = lorenz(
		[p[0] + (dt / 2) * k1[0], p[1] + (dt / 2) * k1[1], p[2] + (dt / 2) * k1[2]],
		sigma,
		rho,
		beta
	);
	const k3 = lorenz(
		[p[0] + (dt / 2) * k2[0], p[1] + (dt / 2) * k2[1], p[2] + (dt / 2) * k2[2]],
		sigma,
		rho,
		beta
	);
	const k4 = lorenz([p[0] + dt * k3[0], p[1] + dt * k3[1], p[2] + dt * k3[2]], sigma, rho, beta);
	return [
		p[0] + (dt / 6) * (k1[0] + 2 * k2[0] + 2 * k3[0] + k4[0]),
		p[1] + (dt / 6) * (k1[1] + 2 * k2[1] + 2 * k3[1] + k4[1]),
		p[2] + (dt / 6) * (k1[2] + 2 * k2[2] + 2 * k3[2] + k4[2])
	];
}

/**
 * Integrate the Lorenz system with RK4 and return the trajectory projected
 * onto the x–z plane: `transient` steps are discarded, then `keep` points are
 * returned as `[x, z]` pairs. Pure and deterministic for fixed arguments.
 *
 * @param {{
 *   sigma?: number,
 *   rho?: number,
 *   beta?: number,
 *   dt?: number,
 *   start?: Vec3,
 *   transient?: number,
 *   keep?: number
 * }} [options]
 * @returns {[number, number][]}
 */
export function lorenzPoints({
	sigma = SIGMA,
	rho = RHO,
	beta = BETA,
	dt = DT,
	start = START,
	transient = TRANSIENT,
	keep = KEEP
} = {}) {
	/** @type {Vec3} */
	let p = [start[0], start[1], start[2]];
	for (let i = 0; i < transient; i++) p = rk4(p, dt, sigma, rho, beta);

	/** @type {[number, number][]} */
	const pts = [];
	for (let i = 0; i < keep; i++) {
		pts.push([p[0], p[2]]);
		p = rk4(p, dt, sigma, rho, beta);
	}
	return pts;
}

/**
 * Fit `[x, z]` points into a `width × height` box with a uniform scale,
 * centred, `margin` on every side, z upward (y = height − …).
 *
 * @param {[number, number][]} points
 * @param {number} width
 * @param {number} height
 * @param {number} margin
 * @returns {[number, number][]} `[x, y]` pairs in box coordinates
 */
export function fitToBox(points, width, height, margin) {
	let minX = Infinity,
		maxX = -Infinity,
		minZ = Infinity,
		maxZ = -Infinity;
	for (const [x, z] of points) {
		if (x < minX) minX = x;
		if (x > maxX) maxX = x;
		if (z < minZ) minZ = z;
		if (z > maxZ) maxZ = z;
	}
	const scale = Math.min(
		(width - 2 * margin) / (maxX - minX),
		(height - 2 * margin) / (maxZ - minZ)
	);
	const offX = (width - (maxX - minX) * scale) / 2;
	const offZ = (height - (maxZ - minZ) * scale) / 2;

	return points.map(([x, z]) => [offX + (x - minX) * scale, height - offZ - (z - minZ) * scale]);
}
