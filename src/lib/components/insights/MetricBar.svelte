<script lang="ts">
    export let label: string;
    export let value: number;
    export let max = 100;
</script>

<div class="space-y-1">
    <div class="flex justify-between text-sm">
        <span class="text-gray-400">{label}</span>
        <span class="font-medium text-white">{value}%</span>
    </div>
    <div class="h-2 bg-aeon-surface-0 rounded-full overflow-hidden">
        <div 
            class="h-full bg-aeon-primary rounded-full transition-all"
            style:width={`${value}%`}
        />
    </div>
</div> 