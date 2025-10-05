<script lang="ts">
	import { createEventDispatcher, onMount } from 'svelte';
	import { fade, scale } from 'svelte/transition';
	
	export let isOpen: boolean = false;
	export let title: string = '';
	export let maxWidth: string = '500px';
	export let showCloseButton: boolean = true;
	
	const dispatch = createEventDispatcher();
	
	let modalContent: HTMLElement;
	let previousActiveElement: HTMLElement | null = null;
	
	function closeModal() {
		isOpen = false;
		dispatch('close');
		
		// Restore focus to previously active element
		if (previousActiveElement) {
			previousActiveElement.focus();
			previousActiveElement = null;
		}
	}
	
	function handleKeydown(event: KeyboardEvent) {
		if (event.key === 'Escape' && isOpen) {
			closeModal();
		}
		
		// Tab trapping
		if (event.key === 'Tab' && isOpen && modalContent) {
			const focusableElements = modalContent.querySelectorAll(
				'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
			);
			const firstElement = focusableElements[0] as HTMLElement;
			const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement;
			
			if (event.shiftKey) {
				if (document.activeElement === firstElement) {
					event.preventDefault();
					lastElement.focus();
				}
			} else {
				if (document.activeElement === lastElement) {
					event.preventDefault();
					firstElement.focus();
				}
			}
		}
	}
	
	function handleBackdropClick(event: MouseEvent) {
		if (event.target === event.currentTarget) {
			closeModal();
		}
	}
	
	function handleBackdropKeydown(event: KeyboardEvent) {
		if (event.key === 'Enter' || event.key === ' ') {
			if (event.target === event.currentTarget) {
				closeModal();
			}
		}
	}
	
	onMount(() => {
		const handleKeydownGlobal = (event: KeyboardEvent) => handleKeydown(event);
		document.addEventListener('keydown', handleKeydownGlobal);
		
		return () => {
			document.removeEventListener('keydown', handleKeydownGlobal);
		};
	});
	
	// Prevent body scroll when modal is open and manage focus
	$: if (typeof document !== 'undefined') {
		if (isOpen) {
			document.body.style.overflow = 'hidden';
			// Store currently focused element
			previousActiveElement = document.activeElement as HTMLElement;
			// Focus the modal content after a short delay to ensure it's rendered
			setTimeout(() => {
				if (modalContent) {
					const firstFocusable = modalContent.querySelector(
						'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
					) as HTMLElement;
					if (firstFocusable) {
						firstFocusable.focus();
					} else {
						modalContent.focus();
					}
				}
			}, 100);
		} else {
			document.body.style.overflow = '';
		}
	}
</script>

{#if isOpen}
	<div 
		class="modal-backdrop" 
		transition:fade={{ duration: 200 }}
		on:click={handleBackdropClick}
		on:keydown={handleBackdropKeydown}
		role="dialog"
		aria-modal="true"
		aria-labelledby={title ? "modal-title" : undefined}
		aria-describedby="modal-content"
		tabindex="0"
	>
		<div 
			bind:this={modalContent}
			class="modal-content" 
			transition:scale={{ duration: 200, start: 0.95 }}
			style="max-width: {maxWidth}"
			id="modal-content"
			tabindex="-1"
		>
			{#if title || showCloseButton}
				<div class="modal-header">
					{#if title}
						<h2 id="modal-title" class="modal-title">{title}</h2>
					{/if}
					{#if showCloseButton}
						<button class="close-button" on:click={closeModal} aria-label="Close modal">
							<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
								<line x1="18" y1="6" x2="6" y2="18"></line>
								<line x1="6" y1="6" x2="18" y2="18"></line>
							</svg>
						</button>
					{/if}
				</div>
			{/if}
			
			<div class="modal-body" role="document">
				<slot />
			</div>
		</div>
	</div>
{/if}

<style>
	.modal-backdrop {
		position: fixed;
		top: 0;
		left: 0;
		right: 0;
		bottom: 0;
		background: rgba(0, 0, 0, 0.7);
		backdrop-filter: blur(4px);
		display: flex;
		align-items: center;
		justify-content: center;
		z-index: 1000;
		padding: 1rem;
	}
	
	.modal-content {
		background: var(--aeon-surface-0);
		border: 1px solid rgba(128, 255, 219, 0.2);
		border-radius: 1rem;
		box-shadow: 
			0 0 0 1px rgba(76, 201, 240, 0.1),
			0 8px 32px rgba(0, 0, 0, 0.6),
			0 0 80px rgba(76, 201, 240, 0.15);
		width: 100%;
		max-height: 90vh;
		overflow: hidden;
		display: flex;
		flex-direction: column;
	}
	
	.modal-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding: 1.5rem 2rem 0;
		flex-shrink: 0;
	}
	
	.modal-title {
		font-size: 1.5rem;
		font-weight: 600;
		color: var(--aeon-biolum);
		margin: 0;
	}
	
	.close-button {
		background: none;
		border: none;
		color: rgba(255, 255, 255, 0.7);
		cursor: pointer;
		padding: 0.5rem;
		border-radius: 0.5rem;
		transition: color 0.3s ease, background-color 0.3s ease;
		display: flex;
		align-items: center;
		justify-content: center;
	}
	
	.close-button:hover,
	.close-button:focus {
		color: white;
		background: rgba(255, 255, 255, 0.1);
		outline: 2px solid var(--aeon-biolum);
		outline-offset: 2px;
	}
	
	.close-button:focus {
		outline: 2px solid var(--aeon-biolum);
		outline-offset: 2px;
	}
	
	.modal-body {
		padding: 1.5rem 2rem 2rem;
		overflow-y: auto;
		flex: 1;
	}
	
	.close-button {
		min-width: 44px;
		min-height: 44px;
		display: flex;
		align-items: center;
		justify-content: center;
	}
	
	@media (max-width: 768px) {
		.modal-content {
			margin: 1rem;
			max-height: calc(100vh - 2rem);
		}
		
		.modal-header {
			padding: 1rem 1.5rem 0;
		}
		
		.modal-body {
			padding: 1rem 1.5rem 1.5rem;
		}
		
		.close-button {
			min-width: 48px;
			min-height: 48px;
		}
	}
</style>