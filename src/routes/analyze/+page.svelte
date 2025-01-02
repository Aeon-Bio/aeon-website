<script lang="ts">
    import { fade } from 'svelte/transition';
    import { FileText } from 'lucide-svelte';
    import InsightCard from '$lib/components/insights/InsightCard.svelte';
    import { mockFindings } from './mockFindings';
    
    let file: File | null = null;
    let findings: any[] = mockFindings;
    let isProcessing = false;
    let isDragging = false;
    let sampleId: string | null = null;

    async function processFile(newFile: File) {
        isProcessing = true;
        try {
            const gsmMatch = newFile.name.match(/GSM\d+/);
            sampleId = gsmMatch ? gsmMatch[0] : null;
            
            const text = await newFile.text();
            findings = JSON.parse(text);
        } catch (error) {
            console.error('Failed to parse JSON:', error);
        } finally {
            isProcessing = false;
        }
    }

    async function handleFileSelect(event: Event) {
        const input = event.target as HTMLInputElement;
        if (input.files) {
            file = input.files[0];
            await processFile(file);
        }
    }

    async function handleClick() {
        if ('showOpenFilePicker' in window) {
            try {
                const [fileHandle] = await window.showOpenFilePicker({
                    types: [{
                        description: 'JSON Files',
                        accept: {
                            'application/json': ['.json']
                        }
                    }],
                    multiple: false
                });
                file = await fileHandle.getFile();
                await processFile(file);
            } catch (err) {
                return;
            }
        } else {
            document.querySelector('input[type="file"]')?.click();
        }
    }

    function handleDragEnter(event: DragEvent) {
        event.preventDefault();
        isDragging = true;
    }

    function handleDragLeave(event: DragEvent) {
        event.preventDefault();
        isDragging = false;
    }

    function handleDragOver(event: DragEvent) {
        event.preventDefault();
    }

    async function handleDrop(event: DragEvent) {
        event.preventDefault();
        isDragging = false;
        
        const droppedFile = event.dataTransfer?.files[0];
        if (droppedFile?.type === 'application/json') {
            file = droppedFile;
            await processFile(file);
        }
    }
</script>

<main class="analyze-container">
    <div class="insight-card p-6 w-[300px] h-fit" style="position: sticky; top: 2rem">
        <h2 class="text-lg font-medium text-white mb-6">Load Analysis</h2>
        
        <div>
            <div class="text-sm text-gray-400 mb-2">Upload Results (JSON)</div>
            <label 
                class="file-drop-zone flex flex-col items-center gap-3 px-6 py-8 rounded-lg border-2 border-dashed transition-all duration-200 {isDragging ? 'border-aeon-primary bg-aeon-primary/10' : 'border-gray-700 bg-aeon-surface-1'} {!isDragging ? 'hover:border-aeon-primary hover:transform hover:translate-y-[-1px] hover:shadow-lg' : ''} cursor-pointer"
                on:click|preventDefault={handleClick}
                on:dragenter={handleDragEnter}
                on:dragleave={handleDragLeave}
                on:dragover={handleDragOver}
                on:drop={handleDrop}
            >
                <FileText class="h-8 w-8 text-aeon-primary" />
                <input 
                    type="file" 
                    accept=".json"
                    class="hidden"
                    on:change={handleFileSelect}
                />
                <div class="text-center">
                    <span class="text-sm text-aeon-biolum block">
                        {file ? file.name : 'Drop JSON file here'}
                    </span>
                    <span class="text-xs text-gray-400 mt-1 block">
                        or click to browse
                    </span>
                </div>
                {#if sampleId}
                    <div class="text-sm text-gray-400 mt-2">
                        Sample ID: <span class="text-aeon-biolum">{sampleId}</span>
                    </div>
                {/if}
            </label>
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

    .file-drop-zone {
        position: relative;
        overflow: hidden;
    }

    .file-drop-zone:active {
        transform: translateY(0);
    }

    /* Optional: Add animation for the icon */
    @keyframes bounce {
        0%, 100% { transform: translateY(0); }
        50% { transform: translateY(-4px); }
    }

    .file-drop-zone:not(.border-aeon-primary):hover :global(.lucide-file-text) {
        animation: bounce 1s ease infinite;
    }
</style> 