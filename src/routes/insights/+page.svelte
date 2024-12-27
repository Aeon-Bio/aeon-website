<script lang="ts">
    import { Microscope, AlertCircle } from 'lucide-svelte';
    import Card from '$lib/components/ui/Card.svelte';
    import Alert from '$lib/components/ui/Alert.svelte';
    import InsightCard from '$lib/components/insights/InsightCard.svelte';
    import type { InsightData } from '$lib/types/insights';

    // TODO: Replace with actual data fetching
    const insights: InsightData[] = [/* your mock data */];
</script>

<div class="w-full max-w-4xl mx-auto p-4 space-y-6">
    <Card>
        <div class="p-4">
            <div class="flex items-center gap-2 mb-4">
                <Microscope class="h-6 w-6 text-indigo-600" />
                <h1 class="text-xl font-medium">Your Personalized Health Insights</h1>
            </div>

            <Alert title="Precision Health Insights">
                These insights are derived from your unique molecular patterns and current scientific evidence.
                Each finding includes personalized recommendations and detailed scientific context.
            </Alert>

            <div class="mt-6 space-y-4">
                {#each insights as insight}
                    <InsightCard {insight} />
                {/each}
            </div>

            <Alert variant="warning" title="Important Note">
                Remember to discuss these insights with your healthcare provider to ensure they align with your overall health plan.
            </Alert>
        </div>
    </Card>
</div> 