import { writable } from 'svelte/store';

export const motionIntensity = writable(1);
export const systemActivity = writable(0);

export function propagateEffect(x: number, y: number) {
  // Handle propagation of effects through the system
} 