<script lang="ts">
	import { createEventDispatcher } from 'svelte';
	import { fade, slide } from 'svelte/transition';

	const dispatch = createEventDispatcher();

	interface FormData {
		email: string;
		interests: string[];
	}

	let formData: FormData = {
		email: '',
		interests: []
	};

	let isSubmitting = false;
	let isSubmitted = false;
	let error = '';

	const interestOptions = [
		{ value: 'research', label: 'Research collaborations' },
		{ value: 'partnerships', label: 'Partnership opportunities' },
		{ value: 'product-updates', label: 'Product updates' },
		{ value: 'events', label: 'Events and webinars' }
	];

	function validateEmail(email: string): boolean {
		return /\S+@\S+\.\S+/.test(email);
	}

	function toggleInterest(interest: string) {
		if (formData.interests.includes(interest)) {
			formData.interests = formData.interests.filter((i) => i !== interest);
		} else {
			formData.interests = [...formData.interests, interest];
		}
	}

	async function submitForm() {
		error = '';

		if (!formData.email.trim()) {
			error = 'Email address is required';
			return;
		}

		if (!validateEmail(formData.email)) {
			error = 'Please enter a valid email address';
			return;
		}

		isSubmitting = true;

		try {
			const formPayload = new FormData();
			formPayload.append('access_key', '6f93f110-9665-4258-a8e8-eeea6a55f440');
			formPayload.append('email', formData.email);
			formPayload.append('interests', formData.interests.join(', '));
			formPayload.append('form_type', 'email_capture');
			formPayload.append('subject', 'New Email Signup - Aeon Bio');

			const response = await fetch('https://api.web3forms.com/submit', {
				method: 'POST',
				body: formPayload
			});

			const result = await response.json();

			if (result.success) {
				isSubmitted = true;
				dispatch('submit', formData);
			} else {
				throw new Error(result.message || 'Submission failed');
			}
		} catch (err) {
			console.error('Error submitting email:', err);
			error = 'Something went wrong. Please try again.';
		} finally {
			isSubmitting = false;
		}
	}

	function resetForm() {
		formData = {
			email: '',
			interests: []
		};
		isSubmitted = false;
		error = '';
	}
</script>

<div class="email-capture">
	{#if !isSubmitted}
		<form on:submit|preventDefault={submitForm}>
			<h3>Stay updated with Aeon Bio</h3>
			<p>
				Get insights on biomolecular causality, partnership opportunities, and breakthrough
				research.
			</p>

			<div class="form-group">
				<label for="email" class="visually-hidden">Email Address</label>
				<input
					id="email"
					type="email"
					bind:value={formData.email}
					placeholder="Enter your email address"
					class:error={error && error.includes('email')}
					aria-label="Email address for updates"
					aria-describedby={error ? 'email-error' : undefined}
					aria-invalid={!!(error && error.includes('email'))}
					required
				/>
				{#if error}
					<span
						id="email-error"
						class="error-message"
						transition:slide={{ duration: 200 }}
						aria-live="polite">{error}</span
					>
				{/if}
			</div>

			<div class="interests-group">
				<fieldset>
					<legend class="interests-label"
						>I'm interested in: <span class="optional">(optional)</span></legend
					>
					<div class="interests-grid">
						{#each interestOptions as option, index (option.value)}
							<label class="interest-checkbox">
								<input
									id="interest-{index}"
									type="checkbox"
									value={option.value}
									checked={formData.interests.includes(option.value)}
									on:change={() => toggleInterest(option.value)}
									aria-describedby="interest-{index}-desc"
								/>
								<span class="checkmark" aria-hidden="true"></span>
								<span class="label-text" id="interest-{index}-desc">{option.label}</span>
							</label>
						{/each}
					</div>
				</fieldset>
			</div>

			<button
				type="submit"
				class="submit-button"
				disabled={isSubmitting}
				aria-describedby="submit-status"
			>
				{#if isSubmitting}
					<div class="spinner" aria-hidden="true"></div>
					<span id="submit-status">Subscribing...</span>
				{:else}
					<span id="submit-status">Stay Updated</span>
					<svg
						width="16"
						height="16"
						viewBox="0 0 24 24"
						fill="none"
						stroke="currentColor"
						stroke-width="2"
						aria-hidden="true"
					>
						<path d="m9 18 6-6-6-6" />
					</svg>
				{/if}
			</button>
		</form>
	{:else}
		<div class="success-state" transition:fade={{ duration: 300 }}>
			<div class="success-icon">
				<svg
					width="48"
					height="48"
					viewBox="0 0 24 24"
					fill="none"
					stroke="currentColor"
					stroke-width="2"
				>
					<path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
					<polyline points="22,4 12,14.01 9,11.01" />
				</svg>
			</div>
			<h3>Welcome to the Aeon Bio community!</h3>
			<p>
				You're all set. We'll keep you updated on our latest research, partnership opportunities,
				and breakthroughs in biomolecular causality.
			</p>
			<p class="next-steps">Check your email for a confirmation message.</p>
			<div class="success-actions">
				<button class="btn-primary" on:click={() => dispatch('close')}> Close </button>
				<button class="btn-secondary" on:click={resetForm}> Add Another Email </button>
			</div>
		</div>
	{/if}
</div>

<style>
	.email-capture {
		min-height: 300px;
	}

	form h3 {
		font-size: 1.4rem;
		color: var(--aeon-biolum);
		margin: 0 0 0.5rem;
		text-align: center;
	}

	form p {
		color: rgba(255, 255, 255, 0.8);
		margin: 0 0 2rem;
		text-align: center;
		line-height: 1.5;
	}

	.form-group {
		margin-bottom: 1.5rem;
	}

	.form-group input {
		width: 100%;
		padding: 0.875rem 1rem;
		border: 1px solid rgba(128, 255, 219, 0.2);
		border-radius: 0.5rem;
		background: rgba(255, 255, 255, 0.05);
		color: white;
		font-size: 1rem;
		transition:
			border-color 0.3s ease,
			background 0.3s ease;
	}

	.form-group input:focus {
		outline: none;
		border-color: var(--aeon-biolum);
		background: rgba(255, 255, 255, 0.08);
	}

	.form-group input.error {
		border-color: #ff6b6b;
	}

	.form-group input::placeholder {
		color: rgba(255, 255, 255, 0.5);
	}

	.error-message {
		display: block;
		color: #ff6b6b;
		font-size: 0.85rem;
		margin-top: 0.5rem;
	}

	.interests-group {
		margin-bottom: 2rem;
	}

	fieldset {
		border: none;
		padding: 0;
		margin: 0;
	}

	.interests-label {
		display: block;
		margin-bottom: 1rem;
		font-weight: 500;
		color: rgba(255, 255, 255, 0.9);
		font-size: 0.95rem;
	}

	.optional {
		font-weight: normal;
		color: rgba(255, 255, 255, 0.6);
		font-size: 0.85rem;
	}

	.interests-grid {
		display: grid;
		gap: 0.75rem;
	}

	.interest-checkbox {
		display: flex;
		align-items: center;
		cursor: pointer;
		padding: 0.5rem;
		border-radius: 0.375rem;
		transition: background-color 0.2s ease;
	}

	.interest-checkbox:hover {
		background: rgba(255, 255, 255, 0.05);
	}

	.interest-checkbox input {
		display: none;
	}

	.checkmark {
		width: 18px;
		height: 18px;
		border: 2px solid rgba(128, 255, 219, 0.3);
		border-radius: 3px;
		margin-right: 0.75rem;
		display: flex;
		align-items: center;
		justify-content: center;
		transition: all 0.2s ease;
		flex-shrink: 0;
	}

	.interest-checkbox input:checked + .checkmark {
		background: linear-gradient(45deg, var(--aeon-primary), var(--aeon-biolum));
		border-color: var(--aeon-biolum);
	}

	.interest-checkbox input:checked + .checkmark::after {
		content: '✓';
		color: var(--aeon-deep-space);
		font-size: 12px;
		font-weight: bold;
	}

	.label-text {
		color: rgba(255, 255, 255, 0.8);
		font-size: 0.9rem;
		line-height: 1.3;
	}

	.submit-button {
		width: 100%;
		min-height: 44px;
		padding: 0.875rem 1.5rem;
		border: none;
		border-radius: 0.5rem;
		background: linear-gradient(45deg, var(--aeon-primary), var(--aeon-biolum));
		color: var(--aeon-deep-space);
		font-size: 1rem;
		font-weight: 500;
		cursor: pointer;
		transition: all 0.3s ease;
		display: flex;
		align-items: center;
		justify-content: center;
		gap: 0.5rem;
	}

	.submit-button:hover:not(:disabled),
	.submit-button:focus:not(:disabled) {
		transform: translateY(-2px);
		box-shadow: 0 8px 25px rgba(76, 201, 240, 0.3);
	}

	.submit-button:focus {
		outline: 2px solid var(--aeon-biolum);
		outline-offset: 2px;
	}

	.submit-button:disabled {
		opacity: 0.7;
		cursor: not-allowed;
		transform: none;
	}

	.spinner {
		width: 16px;
		height: 16px;
		border: 2px solid transparent;
		border-top: 2px solid currentColor;
		border-radius: 50%;
		animation: spin 1s linear infinite;
	}

	@keyframes spin {
		to {
			transform: rotate(360deg);
		}
	}

	.success-state {
		text-align: center;
		padding: 1rem 0;
	}

	.success-icon {
		color: var(--aeon-biolum);
		margin-bottom: 1rem;
	}

	.success-state h3 {
		font-size: 1.4rem;
		color: var(--aeon-biolum);
		margin: 0 0 1rem;
	}

	.success-state p {
		color: rgba(255, 255, 255, 0.8);
		margin-bottom: 1rem;
		line-height: 1.6;
	}

	.next-steps {
		font-style: italic;
		color: rgba(255, 255, 255, 0.6);
		font-size: 0.9rem;
	}

	.success-actions {
		display: flex;
		gap: 1rem;
		justify-content: center;
		margin-top: 2rem;
	}

	.btn-primary,
	.btn-secondary {
		padding: 0.75rem 1.5rem;
		border-radius: 0.5rem;
		font-size: 0.95rem;
		font-weight: 500;
		cursor: pointer;
		transition: all 0.3s ease;
		border: none;
	}

	.btn-primary {
		background: linear-gradient(45deg, var(--aeon-primary), var(--aeon-biolum));
		color: var(--aeon-deep-space);
	}

	.btn-secondary {
		background: rgba(255, 255, 255, 0.1);
		color: rgba(255, 255, 255, 0.9);
		border: 1px solid rgba(128, 255, 219, 0.3);
	}

	.btn-secondary:hover {
		background: rgba(128, 255, 219, 0.1);
		border-color: var(--aeon-biolum);
		color: white;
	}

	.visually-hidden {
		position: absolute;
		width: 1px;
		height: 1px;
		padding: 0;
		margin: -1px;
		overflow: hidden;
		clip: rect(0, 0, 0, 0);
		white-space: nowrap;
		border: 0;
	}

	@media (max-width: 768px) {
		.success-actions {
			flex-direction: column;
		}

		.btn-primary,
		.btn-secondary {
			width: 100%;
			justify-content: center;
		}
	}
</style>
