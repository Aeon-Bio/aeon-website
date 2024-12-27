<script lang="ts">
    export let variant: 'info' | 'warning' = 'info';
    export let title: string;
</script>

<div class="p-4 rounded-lg {variant === 'info' ? 'bg-indigo-50 text-indigo-800' : 'bg-yellow-50 text-yellow-800'}">
    {#if title}
        <h3 class="font-medium mb-1">{title}</h3>
    {/if}
    <div class="text-sm">
        <slot />
    </div>
</div> 