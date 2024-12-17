import { writable, derived } from 'svelte/store';

interface InteractionPoint {
  x: number;
  y: number;
  intensity: number;
}

interface SystemState {
  activePoints: InteractionPoint[];
  flowPaths: {
    start: { x: number; y: number };
    end: { x: number; y: number };
    intensity: number;
  }[];
  systemActivity: number; // 0-1 overall system energy
  hoveredElement: HTMLElement | null;
}

const initialState: SystemState = {
  activePoints: [],
  flowPaths: [],
  systemActivity: 0,
  hoveredElement: null
};

export const interactionState = writable<SystemState>(initialState);

// Derived store for particle behavior
export const particleInfluence = derived(
  interactionState,
  ($state) => {
    return {
      points: $state.activePoints,
      activity: $state.systemActivity
    };
  }
);

// Derived store for energy flows
export const flowConnections = derived(
  interactionState,
  ($state) => $state.flowPaths
);