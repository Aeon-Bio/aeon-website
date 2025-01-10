<script lang="ts">
    import { fade } from 'svelte/transition';
    import { FileText, FileJson, Download } from 'lucide-svelte';
    import InsightCard from '$lib/components/insights/InsightCard.svelte';
    import { mockFindings } from './mockFindings';
	import Papa from 'papaparse';
    import { slide } from 'svelte/transition';
    import { cubicOut } from 'svelte/easing';
    
    let csvFile: File | null = null;
    let jsonFile: File | null = null;
    let findings: any[] = mockFindings;
    let isProcessing = false;
    let isComplete = false;
    let isDragging = { csv: false, json: false };
    let sampleId: string | null = null;
    let error: string | null = null;
    let statusMessage: string | null = null;
    let uploadProgress = 0;
    let analysisProgress = 0;
    let currentPhase: 'preprocessing' | 'uploading' | 'analyzing' | null = null;
    let processedCount = 0;
    let totalExpectedFindings = 0;
    let requestId: string | null = null;
    
    // Add column configuration
    let csvConfig = {
        cpgColumn: '',
        sampleColumn: '',
        selected_llm: '',
        file: null as File | null
    };

    // Add LLM options
    const llmOptions = [
        'claude-3-5-sonnet-latest',
        'gemini-exp-1206',
        'gemini-2.0-flash-exp',
        'gemini-1.5-pro'
    ];

    // Add a Set to track processed finding IDs
    let processedFindingIds = new Set<string>();

    // Add a store to track if any card is expanded
    let isAnyCardExpanded = false;

    // Add new state variables
    let availableColumns: string[] = [];
    let showColumnConfig = false;

    async function processCSV(newFile: File, autoProcess = false) {
        csvFile = newFile;
        csvConfig.file = newFile;
        isProcessing = false;
        error = null;
        
        // Reset and analyze headers first
        availableColumns = [];
        showColumnConfig = true;
        
        await new Promise((resolve) => {
            Papa.parse(newFile, {
                preview: 1, // Only parse first row for headers
                header: true,
                skipEmptyLines: true,
                complete: function(results) {
                    availableColumns = Object.keys(results.data[0] || {});
                    
                    // Auto-detect columns if possible
                    if (autoProcess) {
                        const cpgGuesses = availableColumns.filter(col => 
                            /cpg|probe|cg\d+/i.test(col));
                        const sampleGuesses = availableColumns.filter(col => 
                            /sample|gsm|patient|subject/i.test(col));
                        
                        if (cpgGuesses.length > 0) csvConfig.cpgColumn = cpgGuesses[0];
                        if (sampleGuesses.length > 0) csvConfig.sampleColumn = sampleGuesses[0];
                    }
                    resolve(null);
                }
            });
        });

        // If both columns are selected and autoProcess is true, continue processing
        if (autoProcess && csvConfig.cpgColumn && csvConfig.sampleColumn) {
            await startProcessing();
        }
    }

    // Extract the actual processing logic to a separate function
    async function startProcessing() {
        if (!csvConfig.cpgColumn || !csvConfig.sampleColumn || !csvConfig.file || !csvConfig.selected_llm) {
            error = 'Please specify both columns and select an LLM';
            return;
        }

        // If already processing, cancel the current analysis
        if (isProcessing && requestId) {
            try {
                const response = await fetch(`/analyze?requestId=${requestId}`, {
                    method: 'DELETE'
                });
                
                if (!response.ok) {
                    throw new Error('Failed to cancel analysis');
                }

                // Reset all processing states
                isProcessing = false;
                isComplete = false;
                currentPhase = null;
                statusMessage = null;
                uploadProgress = 0;
                analysisProgress = 0;
                processedCount = 0;
                totalExpectedFindings = 0;
                findings = [];
                processedFindingIds.clear();
                error = null;
                requestId = null;
                return;
            } catch (err) {
                console.error('Failed to cancel analysis:', err);
                error = 'Failed to cancel analysis';
                return;
            }
        }

        // Generate new requestId for new analysis
        requestId = crypto.randomUUID();
        isProcessing = true;
        findings = [];
        error = null;
        currentPhase = 'preprocessing';
        statusMessage = 'Preprocessing file...';
        
        try {
            const formData = new FormData();
            formData.append('requestId', requestId);
            formData.append('cpgColumn', csvConfig.cpgColumn);
            formData.append('sampleColumn', csvConfig.sampleColumn);
            formData.append('selected_llm', csvConfig.selected_llm);

            let filteredData = [];
            
            await new Promise((resolve, reject) => {
                Papa.parse(csvConfig.file!, {
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
                        if (results.meta.cursor && csvConfig.file!.size) {
                            uploadProgress = results.meta.cursor / csvConfig.file!.size;
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
                statusMessage = 'Server verifying file...';
                currentPhase = 'analyzing';
            });

            // Handle the streaming response
            let buffer = '';
            xhr.addEventListener('readystatechange', () => {
                // Check if we have received partial data (readyState 3) or completed (readyState 4)
                if (xhr.readyState >= 3) {
                    // Add HTTP error handling
                    if (xhr.status >= 400) {
                        error = `Server error (${xhr.status}): ${xhr.statusText}`;
                        isProcessing = false;
                        currentPhase = null;
                        return;
                    }

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
                                    // Handle different status types
                                    if (data.status === 'error') {
                                        error = data.message;
                                        isProcessing = false;
                                        currentPhase = null;
                                    } else if (data.status === 'complete') {
                                        // Reset processing state for next file
                                        isProcessing = false;
                                        isComplete = true;
                                        currentPhase = null;
                                        statusMessage = 'Analysis complete!';
                                    }
                                    break;
                                case 'finding':
                                    if (!processedFindingIds.has(data.id)) {
                                        console.log(`updated! ${data.id}`);
                                        processedFindingIds.add(data.id);
                                        findings = insertSorted(data.data, findings);
                                        processedCount = findings.length;
                                    }
                                    break;
                                case 'error':
                                    error = data.message;
                                    isProcessing = false;
                                    currentPhase = null;
                                    break;
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

            // Add error event handler
            xhr.addEventListener('error', () => {
                error = 'Network error occurred. Please try again.';
                isProcessing = false;
                currentPhase = null;
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

    function downloadFindings() {
        if (findings.length === 0) return;
        
        const dataStr = JSON.stringify(findings, null, 2);
        const blob = new Blob([dataStr], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        
        // Determine filename based on source
        let filename = 'findings_sample.json';
        if (csvFile) {
            filename = `findings_${csvFile.name.replace(/\.(csv|tsv|txt)$/, '')}.json`;
        } else if (jsonFile) {
            filename = jsonFile.name;
        }
        
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }

    function getAverageMatchStrength(finding: any): number {
        const regions = finding.provenance?.associated_regions || [];
        if (regions.length === 0) return 0;
        
        return regions.reduce((sum: number, region: any) => 
            sum + (region.matchStrength || 0), 0) / regions.length;
    }

    function insertSorted(newFinding: any, currentFindings: any[]): any[] {
        const newStrength = getAverageMatchStrength(newFinding);
        
        // Find insertion index
        const insertIndex = currentFindings.findIndex(finding => 
            getAverageMatchStrength(finding) < newStrength
        );
        
        // If no lower strength found, append to end
        if (insertIndex === -1) {
            return [...currentFindings, newFinding];
        }
        
        // Insert at proper position
        return [
            ...currentFindings.slice(0, insertIndex),
            newFinding,
            ...currentFindings.slice(insertIndex)
        ];
    }

    function slideAndFade(node: Element, {
        delay = 0,
        duration = 300
    }) {
        return {
            delay,
            duration,
            css: (t: number) => {
                const eased = cubicOut(t);
                return `
                    opacity: ${eased};
                    transform: translateY(${(1 - eased) * 20}px);
                `;
            }
        };
    }
</script>

<main class="analyze-container {isAnyCardExpanded ? 'sm:expanded' : ''}">
    <div class="insight-card p-6 mt-8 w-[300px] h-fit transition-all duration-300 ease-in-out" 
         style="position: sticky; top: 2rem; {isAnyCardExpanded ? 'sm:transform: translateX(-120%);' : ''}"
    >
        <div class="flex flex-col gap-6">
            <!-- Option 1: CSV Upload -->
            <div class="p-4 rounded-lg border border-gray-700 bg-aeon-surface-1/50">
                <h3 class="text-md font-medium text-white mb-4">Option 1: Analyze New Data</h3>

                <!-- Column Configuration - Show if file is selected (removed showColumnConfig check) -->
                {#if csvFile}
                    <div class="mb-4 space-y-3" transition:slide>
                        <div class="relative">
                            <label class="text-sm text-gray-400 block mb-1" for="cpgColumn">
                                CpG Probe ID Column
                            </label>
                            <div class="relative">
                                <input 
                                    type="text"
                                    id="cpgColumn"
                                    bind:value={csvConfig.cpgColumn}
                                    placeholder="Select or type column name"
                                    class="w-full px-3 py-2 bg-aeon-surface-2 border border-gray-700 rounded-md text-sm text-white placeholder-gray-500 focus:border-aeon-primary focus:ring-1 focus:ring-aeon-primary"
                                    list="cpgColumns"
                                    autocomplete="off"
                                    on:focus={() => csvConfig.cpgColumn = ''}
                                />
                                <datalist id="cpgColumns">
                                    {#each availableColumns as column}
                                        <option value={column}>{column}</option>
                                    {/each}
                                </datalist>
                            </div>
                        </div>
                        <div class="relative">
                            <label class="text-sm text-gray-400 block mb-1" for="sampleColumn">
                                Sample Column
                            </label>
                            <div class="relative">
                                <input 
                                    type="text"
                                    id="sampleColumn"
                                    bind:value={csvConfig.sampleColumn}
                                    placeholder="Select or type column name"
                                    class="w-full px-3 py-2 bg-aeon-surface-2 border border-gray-700 rounded-md text-sm text-white placeholder-gray-500 focus:border-aeon-primary focus:ring-1 focus:ring-aeon-primary"
                                    list="sampleColumns"
                                    autocomplete="off"
                                    on:focus={() => csvConfig.sampleColumn = ''}
                                />
                                <datalist id="sampleColumns">
                                    {#each availableColumns as column}
                                        <option value={column}>{column}</option>
                                    {/each}
                                </datalist>
                            </div>
                        </div>
                        <div class="relative">
                            <label class="text-sm text-gray-400 block mb-1" for="llmSelect">
                                Language Model
                            </label>
                            <div class="relative">
                                <input 
                                    type="text"
                                    id="llmSelect"
                                    bind:value={csvConfig.selected_llm}
                                    placeholder="Select LLM"
                                    class="w-full px-3 py-2 bg-aeon-surface-2 border border-gray-700 rounded-md text-sm text-white placeholder-gray-500 focus:border-aeon-primary focus:ring-1 focus:ring-aeon-primary"
                                    list="llmOptions"
                                    autocomplete="off"
                                />
                                <datalist id="llmOptions">
                                    {#each llmOptions as llm}
                                        <option value={llm}>{llm}</option>
                                    {/each}
                                </datalist>
                            </div>
                        </div>
                        
                        <!-- Show analyze button always when columns are selected -->
                        <button
                            on:click={() => startProcessing()}
                            class="w-full py-2 mt-2 px-4 bg-aeon-biolum hover:bg-aeon-biolum/90 text-black font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            disabled={!csvConfig.cpgColumn || !csvConfig.sampleColumn || !csvConfig.selected_llm}
                        >
                            {isProcessing ? 'Cancel Analysis' : 'Analyze Data'}
                        </button>
                    </div>
                {/if}

                <!-- CSV Upload Zone -->
                <label 
                    class="file-drop-zone flex flex-col items-center gap-2 px-4 py-6 rounded-lg border-2 border-dashed transition-all duration-200 {isDragging.csv ? 'border-aeon-primary bg-aeon-primary/10' : 'border-gray-700 bg-aeon-surface-1'} {!isDragging.csv ? 'hover:border-aeon-primary hover:transform hover:translate-y-[-1px] hover:shadow-lg' : ''} cursor-pointer"
                    on:click|preventDefault={() => handleClick('csv')}
                    on:dragenter={(e) => handleDragEnter(e, 'csv')}
                    on:dragleave={(e) => handleDragLeave(e, 'csv')}
                    on:dragover={handleDragOver}
                    on:drop={(e) => handleDrop(e, 'csv')}
                >
                    <FileText class="h-6 w-6 text-aeon-primary" />
                    <input 
                        type="file" 
                        accept=".csv,.tsv,.txt"
                        class="hidden"
                        on:change={(e) => handleFileSelect(e, 'csv')}
                    />
                    <div class="text-center">
                        <span class="text-sm text-aeon-biolum block truncate max-w-[200px]">
                            {csvFile ? csvFile.name : 'Drop CSV/TSV file here'}
                        </span>
                        <span class="text-xs text-gray-400 mt-0.5 block">
                            or click to browse
                        </span>
                    </div>
                </label>
            </div>

            {#if isProcessing || isComplete}
                <div class="text-xs space-y-1.5">
                    <div class="flex justify-between items-center">
                        <span class="text-aeon-biolum truncate pr-2">{statusMessage}</span>
                        {#if currentPhase === 'preprocessing'}
                            <span class="text-gray-400 whitespace-nowrap">
                                {Math.round(uploadProgress * 100)}%
                            </span>
                        {:else if currentPhase === 'uploading'}
                            <span class="text-gray-400 whitespace-nowrap">
                                {Math.round(uploadProgress * 100)}%
                            </span>
                        {:else if currentPhase === 'analyzing'}
                            <span class="text-gray-400 whitespace-nowrap">
                                {Math.round(analysisProgress * 100)}%
                                {#if totalExpectedFindings > 0}
                                    ({processedCount}/{totalExpectedFindings})
                                {/if}
                            </span>
                        {/if}
                    </div>
                    <div class="w-full bg-gray-700 rounded-full h-1.5">
                        {#if currentPhase === 'preprocessing' || currentPhase === 'uploading'}
                            <div 
                                class="bg-aeon-primary h-1.5 rounded-full transition-all duration-300" 
                                style="width: {uploadProgress * 100}%"
                            />
                        {:else if currentPhase === 'analyzing'}
                            <div 
                                class="bg-aeon-biolum h-1.5 rounded-full transition-all duration-300" 
                                style="width: {analysisProgress * 100}%"
                            />
                        {/if}
                    </div>
                </div>
            {/if}
            {#if error}
                <div class="text-sm text-red-500 mt-2">
                    {error}
                </div>
            {/if}

            <!-- Option 2: JSON Upload -->
            <div class="p-4 rounded-lg border border-gray-700 bg-aeon-surface-1/50">
                <h3 class="text-sm font-medium text-white mb-4">Option 2: Load Existing Results</h3>

                <!-- JSON Upload Zone -->
                <label 
                    class="file-drop-zone flex flex-col items-center gap-2 px-4 py-6 rounded-lg border-2 border-dashed transition-all duration-200 {isDragging.json ? 'border-aeon-primary bg-aeon-primary/10' : 'border-gray-700 bg-aeon-surface-1'} {!isDragging.json ? 'hover:border-aeon-primary hover:transform hover:translate-y-[-1px] hover:shadow-lg' : ''} cursor-pointer"
                    on:click|preventDefault={() => handleClick('json')}
                    on:dragenter={(e) => handleDragEnter(e, 'json')}
                    on:dragleave={(e) => handleDragLeave(e, 'json')}
                    on:dragover={handleDragOver}
                    on:drop={(e) => handleDrop(e, 'json')}
                >
                    <FileJson class="h-6 w-6 text-aeon-primary" />
                    <input 
                        type="file" 
                        accept=".json"
                        class="hidden"
                        on:change={(e) => handleFileSelect(e, 'json')}
                    />
                    <div class="text-center">
                        <span class="text-sm text-aeon-biolum block truncate max-w-[200px]">
                            {jsonFile ? jsonFile.name : 'Drop JSON file here'}
                        </span>
                        <span class="text-xs text-gray-400 mt-0.5 block">
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
    </div>

    {#if findings.length > 0}
        <div class="findings-container">
            <div class="findings-header">
                <div class="findings-header-content">
                    <div class="flex items-center gap-3">
                        <h2 class="text-xl font-medium text-white">Findings</h2>
                        <span class="text-sm text-gray-400">({findings.length})</span>
                    </div>
                    {#if findings.length > 0}
                        <button
                            on:click={downloadFindings}
                            class="download-btn"
                            title="Download findings as JSON"
                        >
                            <Download class="h-4 w-4" />
                            <span>Download</span>
                        </button>
                    {/if}
                </div>
            </div>
            <div class="findings-list">
                {#each findings as finding, index (finding.provenance?.associated_regions?.[0]?.matched_gene || index)}
                    <div class="finding-item" 
                         transition:slideAndFade={{duration: 300}}
                    >
                        <InsightCard 
                            {finding} 
                            on:expand={() => isAnyCardExpanded = true}
                            on:collapse={() => isAnyCardExpanded = false}
                        />
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
        padding-top: 0;
        display: grid;
        grid-template-columns: minmax(300px, 333px) 1fr;
        transition: grid-template-columns 0.3s ease-in-out;
    }

    @media (min-width: 640px) {
        .analyze-container.expanded {
            grid-template-columns: 0 1fr;
        }
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

    .file-drop-zone:not(.border-aeon-primary):hover :global(.lucide-file-text),
    .file-drop-zone:not(.border-aeon-primary):hover :global(.lucide-file-json) {
        animation: bounce 1s ease infinite;
    }

    .findings-header {
        margin-bottom: 1rem;
    }

    .findings-header::after {
        content: '';
        position: absolute;
        bottom: 0;
        left: 0;
        right: 0;
        height: 1px;
        background: linear-gradient(
            90deg,
            transparent,
            rgba(76, 201, 240, 0.2) 50%,
            transparent
        );
    }

    .findings-header-content {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 1rem 0;
    }

    .download-btn {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        padding: 0.5rem 1rem;
        background: rgba(76, 201, 240, 0.1);
        border: 1px solid rgba(76, 201, 240, 0.2);
        border-radius: 0.5rem;
        color: var(--aeon-biolum);
        font-size: 0.875rem;
        transition: all 0.2s ease;
    }

    .download-btn:hover {
        background: rgba(76, 201, 240, 0.15);
        border-color: rgba(76, 201, 240, 0.3);
        transform: translateY(-1px);
        box-shadow: 0 4px 12px rgba(76, 201, 240, 0.1);
    }

    .download-btn:active {
        transform: translateY(0);
    }
</style> 