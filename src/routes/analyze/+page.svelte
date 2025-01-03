<script lang="ts">
    import { fade } from 'svelte/transition';
    import { FileText, FileJson } from 'lucide-svelte';
    import InsightCard from '$lib/components/insights/InsightCard.svelte';
    import { mockFindings } from './mockFindings';
    
    let file: File | null = null;
    let findings: any[] = mockFindings;
    let isProcessing = false;
    let isDragging = { csv: false, json: false };
    let sampleId: string | null = null;
    let progress = 0;
    let error: string | null = null;
    
    // Add column configuration
    let csvConfig = {
        cpgColumn: '',
        sampleColumn: ''
    };

    async function processCSV(newFile: File) {
        if (!csvConfig.cpgColumn || !csvConfig.sampleColumn) {
            error = 'Please specify both CpG probe ID and sample columns';
            return;
        }

        isProcessing = true;
        findings = [];
        error = null;
        
        try {
            const formData = new FormData();
            formData.append('file', newFile);
            formData.append('cpgColumn', csvConfig.cpgColumn);
            formData.append('sampleColumn', csvConfig.sampleColumn);

            const response = await fetch('/analyze', {
                method: 'POST',
                body: formData
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Upload failed');
            }

            // Handle server-sent events
            const reader = response.body!.getReader();
            const decoder = new TextDecoder();

            while (true) {
                const { value, done } = await reader.read();
                if (done) break;
                
                const text = decoder.decode(value);
                const events = text.split('\n\n').filter(Boolean);

                for (const event of events) {
                    if (!event.startsWith('data: ')) continue;
                    
                    const jsonStr = event.slice(6);
                    const data = JSON.parse(jsonStr);

                    if (data.type === 'finding') {
                        findings = [...findings, data.data];
                        progress = data.progress;
                    } else if (data.type === 'status') {
                        console.log('Status:', data.status);
                    }
                }
            }

        } catch (err) {
            console.error('Processing error:', err);
            error = err instanceof Error ? err.message : 'Failed to process file';
        } finally {
            isProcessing = false;
        }
    }

    async function processJSON(newFile: File) {
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

    async function handleFileSelect(event: Event, type: 'csv' | 'json') {
        const input = event.target as HTMLInputElement;
        if (input.files) {
            file = input.files[0];
            if (type === 'csv') {
                await processCSV(file);
            } else {
                await processJSON(file);
            }
        }
    }

    async function handleClick(type: 'csv' | 'json') {
        if ('showOpenFilePicker' in window) {
            try {
                const [fileHandle] = await window.showOpenFilePicker({
                    types: [{
                        description: type === 'csv' ? 'CSV Files' : 'JSON Files',
                        accept: {
                            [type === 'csv' ? 'text/csv' : 'application/json']: 
                            [type === 'csv' ? '.csv' : '.json']
                        }
                    }],
                    multiple: false
                });
                file = await fileHandle.getFile();
                if (type === 'csv') {
                    await processCSV(file);
                } else {
                    await processJSON(file);
                }
            } catch (err) {
                return;
            }
        } else {
            const selector = `input[type="file"][accept=".${type}"]`;
            const fileInput = document.querySelector(selector) as HTMLInputElement;
            if (fileInput) fileInput.click();
        }
    }

    function handleDragEnter(event: DragEvent, type: 'csv' | 'json') {
        event.preventDefault();
        isDragging[type] = true;
    }

    function handleDragLeave(event: DragEvent, type: 'csv' | 'json') {
        event.preventDefault();
        isDragging[type] = false;
    }

    function handleDragOver(event: DragEvent) {
        event.preventDefault();
    }

    async function handleDrop(event: DragEvent, type: 'csv' | 'json') {
        event.preventDefault();
        isDragging[type] = false;
        
        const droppedFile = event.dataTransfer?.files[0];
        if (droppedFile?.type === (type === 'csv' ? 'text/csv' : 'application/json')) {
            file = droppedFile;
            if (type === 'csv') {
                await processCSV(file);
            } else {
                await processJSON(file);
            }
        }
    }
</script>

<main class="analyze-container">
    <div class="insight-card p-6 w-[300px] h-fit" style="position: sticky; top: 2rem">
        <div class="flex flex-col gap-6">
            <!-- Option 1: CSV Upload -->
            <div class="p-4 rounded-lg border border-gray-700 bg-aeon-surface-1/50">
                <h3 class="text-md font-medium text-white mb-4">Option 1: Analyze New Data</h3>
                <div class="text-sm text-gray-400 mb-4">
                    Upload a CSV file containing methylation data for analysis
                </div>

                <!-- Column Configuration -->
                <div class="mb-4 space-y-3">
                    <div>
                        <label class="text-sm text-gray-400 block mb-1" for="cpgColumn">
                            CpG Probe ID Column
                        </label>
                        <input 
                            type="text"
                            id="cpgColumn"
                            bind:value={csvConfig.cpgColumn}
                            placeholder="e.g., CpG_ID"
                            class="w-full px-3 py-2 bg-aeon-surface-2 border border-gray-700 rounded-md text-sm text-white placeholder-gray-500 focus:border-aeon-primary focus:ring-1 focus:ring-aeon-primary"
                        />
                    </div>
                    <div>
                        <label class="text-sm text-gray-400 block mb-1" for="sampleColumn">
                            Sample Column
                        </label>
                        <input 
                            type="text"
                            id="sampleColumn"
                            bind:value={csvConfig.sampleColumn}
                            placeholder="e.g., Sample_ID"
                            class="w-full px-3 py-2 bg-aeon-surface-2 border border-gray-700 rounded-md text-sm text-white placeholder-gray-500 focus:border-aeon-primary focus:ring-1 focus:ring-aeon-primary"
                        />
                    </div>
                </div>

                <!-- CSV Upload Zone -->
                <label 
                    class="file-drop-zone flex flex-col items-center gap-3 px-6 py-8 rounded-lg border-2 border-dashed transition-all duration-200 {isDragging.csv ? 'border-aeon-primary bg-aeon-primary/10' : 'border-gray-700 bg-aeon-surface-1'} {!isDragging.csv ? 'hover:border-aeon-primary hover:transform hover:translate-y-[-1px] hover:shadow-lg' : ''} cursor-pointer"
                    on:click|preventDefault={() => handleClick('csv')}
                    on:dragenter={(e) => handleDragEnter(e, 'csv')}
                    on:dragleave={(e) => handleDragLeave(e, 'csv')}
                    on:dragover={handleDragOver}
                    on:drop={(e) => handleDrop(e, 'csv')}
                >
                    <FileText class="h-8 w-8 text-aeon-primary" />
                    <input 
                        type="file" 
                        accept=".csv"
                        class="hidden"
                        on:change={(e) => handleFileSelect(e, 'csv')}
                    />
                    <div class="text-center">
                        <span class="text-sm text-aeon-biolum block">
                            Drop CSV file here
                        </span>
                        <span class="text-xs text-gray-400 mt-1 block">
                            or click to browse
                        </span>
                    </div>
                </label>
            </div>

            <!-- Option 2: JSON Upload -->
            <div class="p-4 rounded-lg border border-gray-700 bg-aeon-surface-1/50">
                <h3 class="text-md font-medium text-white mb-4">Option 2: Load Existing Results</h3>
                <div class="text-sm text-gray-400 mb-4">
                    Upload a JSON file containing previously generated analysis results
                </div>

                <!-- JSON Upload Zone -->
                <label 
                    class="file-drop-zone flex flex-col items-center gap-3 px-6 py-8 rounded-lg border-2 border-dashed transition-all duration-200 {isDragging.json ? 'border-aeon-primary bg-aeon-primary/10' : 'border-gray-700 bg-aeon-surface-1'} {!isDragging.json ? 'hover:border-aeon-primary hover:transform hover:translate-y-[-1px] hover:shadow-lg' : ''} cursor-pointer"
                    on:click|preventDefault={() => handleClick('json')}
                    on:dragenter={(e) => handleDragEnter(e, 'json')}
                    on:dragleave={(e) => handleDragLeave(e, 'json')}
                    on:dragover={handleDragOver}
                    on:drop={(e) => handleDrop(e, 'json')}
                >
                    <FileJson class="h-8 w-8 text-aeon-primary" />
                    <input 
                        type="file" 
                        accept=".json"
                        class="hidden"
                        on:change={(e) => handleFileSelect(e, 'json')}
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

            {#if isProcessing}
                <div class="text-sm text-aeon-biolum mt-2">
                    Processing... {#if progress}({progress} findings){/if}
                </div>
            {/if}
            {#if error}
                <div class="text-sm text-red-500 mt-2">
                    {error}
                </div>
            {/if}
        </div>
    </div>

    {#if findings.length > 0}
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