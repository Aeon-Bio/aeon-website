<script lang="ts">
	import type { StudyMetric } from '$lib/types/insights';
	import BaseSelector from './BaseSelector.svelte';

	export let studies: StudyMetric[];
	export let selectedIndex: number = 0;

	function getDisplayText(study: StudyMetric): string {
		return study.studyId || '';
	}
</script>

<BaseSelector items={studies} bind:selectedIndex {getDisplayText} label="Study" />
