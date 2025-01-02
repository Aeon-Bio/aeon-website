<!-- Methylation visualization -->
<script lang="ts">
  import ValueMarker from './ValueMarker.svelte';
  import MedianMarker from './MedianMarker.svelte';
  import VisualizationBar from './VisualizationBar.svelte';
  
  export let value: number;
  export let median: number;
</script>

<div class="relative h-40 flex items-center">
  <ValueMarker {value} label="You" />
  <MedianMarker {median} />
  <VisualizationBar {value} {median} />
</div> 