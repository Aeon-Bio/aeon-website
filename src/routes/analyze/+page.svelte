<script lang="ts">
    import { fade } from 'svelte/transition';
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
    <form on:submit|preventDefault={handleSubmit} class="upload-form">
        <h1>Load Analysis Results</h1>
        
        <div class="form-group">
            <label for="file">Upload Results (JSON)</label>
            <input 
                type="file" 
                id="file" 
                accept=".json"
                on:change={handleFileSelect}
                required
            />
        </div>

        <button type="submit" disabled={isProcessing}>
            {isProcessing ? 'Loading...' : 'Load Results'}
        </button>
    </form>

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

    .upload-form {
        position: sticky;
        top: 2rem;
        background: rgba(0, 0, 0, 0.2);
        padding: 2rem;
        border-radius: 1rem;
        backdrop-filter: blur(10px);
        height: fit-content;
    }

    .form-group {
        margin-bottom: 1.5rem;
    }

    label {
        display: block;
        margin-bottom: 0.5rem;
        color: var(--aeon-biolum);
    }

    input {
        width: 100%;
        padding: 0.5rem;
        border: 1px solid rgba(255, 255, 255, 0.1);
        border-radius: 0.5rem;
        background: rgba(0, 0, 0, 0.2);
        color: white;
    }

    button {
        width: 100%;
        padding: 0.75rem;
        background: var(--aeon-primary);
        border: none;
        border-radius: 0.5rem;
        color: white;
        cursor: pointer;
        transition: opacity 0.2s;
    }

    button:disabled {
        opacity: 0.5;
        cursor: not-allowed;
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