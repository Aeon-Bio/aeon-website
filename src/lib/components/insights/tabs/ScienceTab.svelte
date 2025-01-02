<script lang="ts">
    import { Network, Dna, ChevronDown, ChevronRight, GitBranch } from 'lucide-svelte';
    import type { Finding } from '../types';
    
    export let finding: Finding;
</script>

<div class="space-y-6">
    <!-- Cellular Functions -->
    <div class="bg-aeon-surface-1 p-4 rounded-lg">
        <h4 class="font-medium text-white flex items-center gap-2 mb-4">
            <Network class="h-4 w-4 text-aeon-primary" />
            Cellular Functions
        </h4>
        <div class="space-y-4">
            <!-- Established Functions -->
            <div>
                <div class="text-sm text-gray-400 mb-2">Established Functions</div>
                <div class="space-y-2">
                    {#each finding.knowledgeContext.establishedFunctions as func}
                        <div class="flex items-start gap-2">
                            <ChevronRight class="h-4 w-4 mt-1 text-aeon-primary flex-shrink-0" />
                            <span class="text-sm text-aeon-biolum">{func}</span>
                        </div>
                    {/each}
                </div>
            </div>

            <!-- Common Cellular Roles -->
            <div>
                <div class="text-sm text-gray-400 mb-2">Common Cellular Roles</div>
                <div class="space-y-2">
                    {#each finding.knowledgeContext.commonCellularRoles as role}
                        <div class="flex items-start gap-2">
                            <ChevronRight class="h-4 w-4 mt-1 text-aeon-primary flex-shrink-0" />
                            <span class="text-sm text-aeon-biolum">{role}</span>
                        </div>
                    {/each}
                </div>
            </div>
        </div>
    </div>

    <!-- Biological Context -->
    <div class="bg-aeon-surface-1 p-4 rounded-lg">
        <h4 class="font-medium text-white flex items-center gap-2 mb-4">
            <Dna class="h-4 w-4 text-aeon-primary" />
            Biological Context
        </h4>
        <div class="space-y-4">
            <!-- Tissue Context -->
            <div>
                <div class="text-sm text-gray-400 mb-2">Tissue Expression</div>
                <p class="text-aeon-biolum">{finding.knowledgeContext.tissueContext}</p>
            </div>

            <!-- Evolutionary Context -->
            <div>
                <div class="text-sm text-gray-400 mb-2">Evolutionary Significance</div>
                <p class="text-aeon-biolum">{finding.knowledgeContext.evolutionaryContext}</p>
            </div>
        </div>
    </div>

    <!-- Regulatory Network -->
    {#if finding.knowledgeContext.regulatoryNetwork}
        <div class="bg-aeon-surface-1 p-4 rounded-lg">
            <h4 class="font-medium text-white flex items-center gap-2 mb-4">
                <Network class="h-4 w-4 text-aeon-primary" />
                Regulatory Network
            </h4>
            <div class="space-y-4">
                <!-- Upstream Factors -->
                {#if finding.knowledgeContext.regulatoryNetwork.upstream?.length}
                    <div>
                        <div class="text-sm text-gray-400 mb-2">Upstream Factors</div>
                        <div class="space-y-2">
                            {#each finding.knowledgeContext.regulatoryNetwork.upstream as factor}
                                <div class="flex items-start gap-2">
                                    <ChevronDown class="h-4 w-4 mt-1 text-aeon-primary flex-shrink-0" />
                                    <span class="text-sm text-aeon-biolum">{factor}</span>
                                </div>
                            {/each}
                        </div>
                    </div>
                {/if}

                <!-- Downstream Effects -->
                {#if finding.knowledgeContext.regulatoryNetwork.downstream?.length}
                    <div>
                        <div class="text-sm text-gray-400 mb-2">Downstream Effects</div>
                        <div class="space-y-2">
                            {#each finding.knowledgeContext.regulatoryNetwork.downstream as effect}
                                <div class="flex items-start gap-2">
                                    <ChevronRight class="h-4 w-4 mt-1 text-aeon-primary flex-shrink-0" />
                                    <span class="text-sm text-aeon-biolum">{effect}</span>
                                </div>
                            {/each}
                        </div>
                    </div>
                {/if}
            </div>
        </div>
    {/if}

    <!-- Conserved Pathways -->
    {#if finding.knowledgeContext.conservedPathways?.length}
        <div class="bg-aeon-surface-1 p-4 rounded-lg">
            <h4 class="font-medium text-white flex items-center gap-2 mb-4">
                <GitBranch class="h-4 w-4 text-aeon-primary" />
                Conserved Pathways
            </h4>
            <div class="space-y-2">
                {#each finding.knowledgeContext.conservedPathways as pathway}
                    <div class="flex items-start gap-2">
                        <ChevronRight class="h-4 w-4 mt-1 text-aeon-primary flex-shrink-0" />
                        <span class="text-sm text-aeon-biolum">{pathway}</span>
                    </div>
                {/each}
            </div>
        </div>
    {/if}
</div> 