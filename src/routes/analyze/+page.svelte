<script lang="ts">
    import { fade } from 'svelte/transition';
    import { FileText } from 'lucide-svelte';
    import InsightCard from '$lib/components/insights/InsightCard.svelte';
    import { mockFindings } from './mockFindings';
    
    let file: File | null = null;
    let findings: any[] = mockFindings; // Initialize with mock findings
    let isProcessing = false;

    async function handleSubmit() {
        if (!file) return;
        
        isProcessing = true;
        
        try {
            // Read the JSON file
            const text = await file.text();
            findings = JSON.parse(text);
            isProcessing = false;
        } catch (error) {
            console.error('Failed to parse JSON:', error);
            isProcessing = false;
        }
    }

    function handleFileSelect(event: Event) {
        const input = event.target as HTMLInputElement;
        if (input.files) {
            file = input.files[0];
        }
    }
</script>

<main class="analyze-container">
    <div class="insight-card p-6 w-[300px]">
        <h2 class="text-lg font-medium text-white mb-6">Load Analysis</h2>
        
        <div class="space-y-4">
            <div>
                <div class="text-sm text-gray-400 mb-2">Upload Results (JSON)</div>
                <label class="flex items-center gap-2 px-3 py-2 rounded-lg border border-gray-700 bg-aeon-surface-1 cursor-pointer hover:border-aeon-primary transition-colors">
                    <FileText class="h-4 w-4 text-aeon-primary" />
                    <input 
                        type="file" 
                        accept=".json"
                        class="hidden"
                        on:change={handleFileSelect}
                    />
                    <span class="text-sm text-aeon-biolum">
                        {file ? file.name : 'Choose File'}
                    </span>
                </label>
            </div>

            <button 
                class="w-full px-4 py-2 rounded-lg bg-aeon-primary text-white font-medium hover:bg-aeon-biolum transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={!file}
                on:click={handleSubmit}
            >
                Load Results
            </button>
        </div>
    </div>

    {#if isProcessing || findings.length > 0}
        <div class="findings-container">
            <h2>Findings</h2>
            <div class="findings-list">
                {#each findings as finding, index (index)}
                    <div class="finding-item" transition:fade={{duration: 300}}>
                        <InsightCard {finding} />
                    </div>
                {/each}
            </div>
        </div>
    {/if}
</main>


<style>
    .analyze-container {
        max-width: 100vw;
        margin: 0 auto;
        padding: 2rem;
        display: grid;
        gap: 2rem;
        grid-template-columns: minmax(300px, 400px) 1fr;
    }

    .insight-card {
        position: relative;
        border-radius: 0.75rem;
        background: rgba(17, 24, 39, 0.95);
        backdrop-filter: blur(20px);
        overflow: hidden;
        box-shadow: 
            0 4px 6px -1px rgba(0, 0, 0, 0.2),
            0 2px 4px -2px rgba(0, 0, 0, 0.1),
            0 0 0 1px rgba(76, 201, 240, 0.05);
    }

    .insight-card::before {
        content: '';
        position: absolute;
        inset: -1px;
        border-radius: inherit;
        padding: 1px;
        background: linear-gradient(
            45deg,
            rgba(76, 201, 240, 0.15),
            rgba(128, 255, 219, 0.15)
        );
        mask: linear-gradient(#fff 0 0) content-box,
              linear-gradient(#fff 0 0);
        -webkit-mask-composite: xor;
        mask-composite: exclude;
        pointer-events: none;
    }

    .findings-container {
        padding: 0;
    }

    .findings-list {
        list-style: none;
        padding: 0;
        display: flex;
        flex-direction: column;
        gap: 1rem;
    }

    .finding-item {
        background: rgba(0, 0, 0, 0.2);
        border-radius: 1rem;
        backdrop-filter: blur(10px);
    }

    .finding-item h3 {
        color: var(--aeon-biolum);
        margin: 0 0 0.5rem 0;
    }

    .recommendations {
        margin-top: 1rem;
        display: flex;
        flex-direction: column;
        gap: 0.5rem;
    }

    .recommendation {
        display: flex;
        gap: 1rem;
        align-items: flex-start;
        padding: 0.5rem;
        background: rgba(255, 255, 255, 0.05);
        border-radius: 0.5rem;
    }

    .icon {
        color: var(--aeon-primary);
    }
</style> 