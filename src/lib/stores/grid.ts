import { writable, derived } from 'svelte/store';
import { interactionState } from './interaction';

interface GridState {
  intensity: number;
  focusPoint: { x: number; y: number; } | null;
}

const initialState: GridState = {
  intensity: 0.15,
  focusPoint: null
};

export const gridStore = writable<GridState>(initialState);

// Derive grid properties based on interaction
export const gridActivity = derived(
  [gridStore, interactionState],
  ([$grid, $interaction]) => ({
    baseIntensity: $grid.intensity,
    focusPoint: $interaction.hoveredElement 
      ? getElementCenter($interaction.hoveredElement)
      : null,
    activity: $interaction.systemActivity
  })
);

function getElementCenter(element: HTMLElement) {
  const rect = element.getBoundingClientRect();
  return {
    x: rect.left + rect.width / 2,
    y: rect.top + rect.height / 2
  };
}