<script lang="ts">
    import { fade } from 'svelte/transition';
    import { FileText, FileJson } from 'lucide-svelte';
    import InsightCard from '$lib/components/insights/InsightCard.svelte';
    import { mockFindings } from './mockFindings';
	import Papa from 'papaparse';
    
    let csvFile: File | null = null;
    let jsonFile: File | null = null;
    let findings: any[] = mockFindings;
    let isProcessing = false;
    let isDragging = { csv: false, json: false };
    let sampleId: string | null = null;
    let progress = 0;
    let error: string | null = null;
    let statusMessage: string | null = null;
    let uploadProgress = 0;
    let analysisProgress = 0;
    let currentPhase: 'preprocessing' | 'uploading' | 'analyzing' | null = null;
    let processedCount = 0;
    let totalExpectedFindings = 0;
    
    // Add column configuration
    let csvConfig = {
        cpgColumn: '',
        sampleColumn: ''
    };

    // Add a Set to track processed finding IDs
    let processedFindingIds = new Set<string>();

    async function processCSV(newFile: File) {
        processedFindingIds.clear();
        csvFile = newFile;
        if (!csvConfig.cpgColumn || !csvConfig.sampleColumn) {
            error = 'Please specify both CpG probe ID and sample columns';
            return;
        }

        isProcessing = true;
        findings = [];
        error = null;
        currentPhase = 'preprocessing';
        statusMessage = 'Preprocessing file...';
        const requestId = crypto.randomUUID();
        
        try {
            const formData = new FormData();
            formData.append('requestId', requestId);
            formData.append('cpgColumn', csvConfig.cpgColumn);
            formData.append('sampleColumn', csvConfig.sampleColumn);

            let filteredData = [];
            
            await new Promise((resolve, reject) => {
                Papa.parse(newFile, {
                    header: true,
                    skipEmptyLines: true,
                    comments: '#',
                    step: function(row) {
                        // Only keep the columns we need
                        const filteredRow = {
                            [csvConfig.cpgColumn]: row.data[csvConfig.cpgColumn],
                            [csvConfig.sampleColumn]: row.data[csvConfig.sampleColumn]
                        };
                        filteredData.push(filteredRow);
                    },
                    complete: function() {
                        const filteredCsv = Papa.unparse(filteredData, {
                            delimiter: ','
                        });
                        const filteredBlob = new Blob([filteredCsv], { type: 'text/csv' });
                        formData.append('file', filteredBlob, 'filtered.csv');
                        resolve(null);
                    },
                    error: function(error) {
                        reject(error);
                    },
                    progress: function(results) {
                        if (results.meta.cursor && newFile.size) {
                            uploadProgress = results.meta.cursor / newFile.size;
                            statusMessage = `Preprocessing file... ${Math.round(uploadProgress * 100)}%`;
                        }
                    }
                });
            });

            // Reset progress for the upload phase
            uploadProgress = 0;
            currentPhase = 'uploading';
            statusMessage = 'Uploading file...';

            const xhr = new XMLHttpRequest();
            
            // Set response type to text to handle SSE
            xhr.responseType = 'text';
            
            // Handle upload progress separately
            xhr.upload.addEventListener('progress', (e) => {
                if (e.lengthComputable) {
                    uploadProgress = e.loaded / e.total;
                    statusMessage = `Uploading file... ${Math.round(uploadProgress * 100)}%`;
                }
            });

            // Add upload complete handler
            xhr.upload.addEventListener('load', () => {
                uploadProgress = 1;
                statusMessage = 'Upload complete, waking AI...';
                currentPhase = 'analyzing';
            });

            // Handle the streaming response
            let buffer = '';
            xhr.addEventListener('readystatechange', () => {
                // Check if we have received partial data (readyState 3) or completed (readyState 4)
                if (xhr.readyState >= 3) {
                    // Get only the new data
                    const newData = xhr.responseText.slice(buffer.length);
                    buffer = xhr.responseText;
                    
                    // Process any complete SSE messages
                    const lines = newData.split('\n\n');
                    for (const line of lines) {
                        if (!line.trim() || !line.startsWith('data: ')) continue;
                        
                        try {
                            const data = JSON.parse(line.slice(6));
                            console.log(data);
                            
                            // Handle different message types
                            switch (data.type) {
                                case 'progress':
                                    currentPhase = 'analyzing';
                                    analysisProgress = data.progress || 0;
                                    statusMessage = data.message;
                                    break;
                                case 'finding':
                                    if (!processedFindingIds.has(data.id)) {
                                        console.log(`updated! ${data.id}`);
                                        processedFindingIds.add(data.id);
                                        findings = [...findings, data.data];
                                        processedCount = findings.length;
                                    }
                                    break;
                                case 'error':
                                    throw new Error(data.error);
                            }
                        } catch (err) {
                            if (err instanceof Error && 
                                !err.message.includes('JSON') && 
                                !err.message.includes('parse')) {
                                error = err.message;
                            }
                        }
                    }
                }
            });

            xhr.open('POST', '/analyze');
            xhr.send(formData);

            await new Promise((resolve, reject) => {
                xhr.addEventListener('load', () => resolve(null));
                xhr.addEventListener('error', reject);
                xhr.addEventListener('abort', reject);
            });

        } catch (err) {
            console.error('Processing error:', err);
            error = err instanceof Error ? err.message : 'Server error; try again';
        } finally {
            isProcessing = false;
            currentPhase = null;
        }
    }

    async function processJSON(newFile: File) {
        jsonFile = newFile;
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
            const selectedFile = input.files[0];
            if (type === 'csv') {
                await processCSV(selectedFile);
            } else {
                await processJSON(selectedFile);
            }
        }
    }

    async function handleClick(type: 'csv' | 'json') {
        if ('showOpenFilePicker' in window) {
            try {
                const [fileHandle] = await window.showOpenFilePicker({
                    types: [{
                        description: type === 'csv' ? 'Text Files' : 'JSON Files',
                        accept: {
                            [type === 'csv' ? 'text/*' : 'application/json']: 
                            [type === 'csv' ? '.csv,.tsv,.txt' : '.json']
                        }
                    }],
                    multiple: false
                });
                const selectedFile = await fileHandle.getFile();
                if (type === 'csv') {
                    await processCSV(selectedFile);
                } else {
                    await processJSON(selectedFile);
                }
            } catch (err) {
                return;
            }
        } else {
            const selector = `input[type="file"][accept="${type === 'csv' ? '.csv,.tsv,.txt' : '.json'}"]`;
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
        if (type === 'json' && droppedFile?.type !== 'application/json') {
            return;
        }
        
        // For CSV, accept any text file
        if (type === 'csv') {
            if (droppedFile && (
                droppedFile.type.startsWith('text/') || 
                /\.(csv|tsv|txt)$/i.test(droppedFile.name)
            )) {
                await processCSV(droppedFile);
            }
        } else if (droppedFile) {
            await processJSON(droppedFile);
        }
    }
</script>

<main class="analyze-container">
    <div class="insight-card p-6 w-[300px] h-fit" style="position: sticky; top: 2rem">
        <div class="flex flex-col gap-6">
            <!-- Option 1: CSV Upload -->
            <div class="p-4 rounded-lg border border-gray-700 bg-aeon-surface-1/50">
                <h3 class="text-md font-medium text-white mb-4">Option 1: Analyze New Data</h3>

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
                        accept=".csv,.tsv,.txt"
                        class="hidden"
                        on:change={(e) => handleFileSelect(e, 'csv')}
                    />
                    <div class="text-center">
                        <span class="text-sm text-aeon-biolum block">
                            {csvFile ? csvFile.name : 'Drop CSV/TSV file here'}
                        </span>
                        <span class="text-xs text-gray-400 mt-1 block">
                            or click to browse
                        </span>
                    </div>
                </label>

                {#if csvFile && !isProcessing}
                    <button
                        on:click={() => processCSV(csvFile!)}
                        class="w-full py-2 mt-2 px-4 bg-aeon-biolum hover:bg-aeon-biolum/90 text-black font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        disabled={!csvConfig.cpgColumn || !csvConfig.sampleColumn}
                    >
                        Upload and Analyze
                    </button>
                {/if}
            </div>

            <!-- Option 2: JSON Upload -->
            <div class="p-4 rounded-lg border border-gray-700 bg-aeon-surface-1/50">
                <h3 class="text-md font-medium text-white mb-4">Option 2: Load Existing Results</h3>

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
                            {jsonFile ? jsonFile.name : 'Drop JSON file here'}
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
                <div class="text-sm mt-2">
                    <span class="text-aeon-biolum">{statusMessage}</span>
                    <div class="w-full bg-gray-700 rounded-full h-2 mt-2">
                        {#if currentPhase === 'preprocessing'}
                            <div 
                                class="bg-aeon-primary h-2 rounded-full transition-all duration-300" 
                                style="width: {uploadProgress * 100}%"
                            />
                        {:else if currentPhase === 'uploading'}
                            <div 
                                class="bg-aeon-primary h-2 rounded-full transition-all duration-300" 
                                style="width: {uploadProgress * 100}%"
                            />
                        {:else if currentPhase === 'analyzing'}
                            <div 
                                class="bg-aeon-biolum h-2 rounded-full transition-all duration-300" 
                                style="width: {analysisProgress * 100}%"
                            />
                        {/if}
                    </div>
                    {#if currentPhase === 'preprocessing'}
                        <span class="text-xs text-gray-400 mt-1">
                            Preprocessing: {Math.round(uploadProgress * 100)}%
                        </span>
                    {:else if currentPhase === 'uploading'}
                        <span class="text-xs text-gray-400 mt-1">
                            Uploading: {Math.round(uploadProgress * 100)}%
                        </span>
                    {:else if currentPhase === 'analyzing'}
                        <span class="text-xs text-gray-400 mt-1">
                            Analyzing: {Math.round(analysisProgress * 100)}%
                            {#if totalExpectedFindings > 0}
                                <span class="ml-2">({processedCount}/{totalExpectedFindings} findings)</span>
                            {/if}
                        </span>
                    {/if}
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