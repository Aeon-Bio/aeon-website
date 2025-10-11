<script lang="ts">
	export let strength: string;

	$: badgeColor =
		{
			strong: 'bg-aeon-surface-1 text-aeon-primary border border-aeon-primary',
			moderate: 'bg-aeon-surface-1 text-aeon-biolum border border-aeon-biolum',
			preliminary: 'bg-aeon-surface-1 text-gray-400 border border-gray-400'
		}[strength.toLowerCase()] || 'bg-aeon-surface-1 text-gray-400';
</script>

<span class="px-2 py-1 rounded-full text-xs {badgeColor}">
	{strength}
</span>
