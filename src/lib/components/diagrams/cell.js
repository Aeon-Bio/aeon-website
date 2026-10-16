// The cell's one number: how many times it has been asked. The figure writes it; the count
// line beside the figure says it. A store for reduced motion, where the figure is one still.
import { writable } from 'svelte/store';

/** how many questions the cell has been asked, by the instrument or the visitor */
export const asked = writable(0);
/** reduced motion: the figure is one still exposure, and the count line says so in one sentence */
export const stillMode = writable(false);

export function resetCell() {
	asked.set(0);
}
