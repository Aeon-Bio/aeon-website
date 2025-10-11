<script lang="ts">
	import { createEventDispatcher } from 'svelte';
	import { fade, slide } from 'svelte/transition';

	const dispatch = createEventDispatcher();

	interface FormData {
		name: string;
		email: string;
		organization: string;
		partnershipType: string;
		useCase: string;
	}

	let formData: FormData = {
		name: '',
		email: '',
		organization: '',
		partnershipType: '',
		useCase: ''
	};

	let currentStep = 1;
	let isSubmitting = false;
	let isSubmitted = false;
	let errors: Partial<FormData> = {};

	const partnershipTypes = [
		{ value: 'co-development', label: 'Co-Development Partnership' },
		{ value: 'data-partnership', label: 'Data Partnership' },
		{ value: 'research-collaboration', label: 'Research Collaboration' },
		{ value: 'general-inquiry', label: 'General Inquiry' },
		{ value: 'other', label: 'Other' }
	];

	function validateStep(step: number): boolean {
		errors = {};

		if (step === 1) {
			if (!formData.name.trim()) errors.name = 'Name is required';
			if (!formData.email.trim()) errors.email = 'Email is required';
			else if (!/\S+@\S+\.\S+/.test(formData.email)) errors.email = 'Valid email is required';
			if (!formData.organization.trim()) errors.organization = 'Organization is required';
		}

		if (step === 2) {
			if (!formData.partnershipType) errors.partnershipType = 'Please select a partnership type';
		}

		return Object.keys(errors).length === 0;
	}

	function nextStep() {
		if (validateStep(currentStep)) {
			currentStep++;
		}
	}

	function prevStep() {
		if (currentStep > 1) {
			currentStep--;
		}
	}

	async function submitForm() {
		if (!validateStep(2)) return;

		isSubmitting = true;

		try {
			const formPayload = new FormData();
			formPayload.append('access_key', '6f93f110-9665-4258-a8e8-eeea6a55f440');
			formPayload.append('name', formData.name);
			formPayload.append('email', formData.email);
			formPayload.append('organization', formData.organization);
			formPayload.append('partnership_type', formData.partnershipType);
			formPayload.append('use_case', formData.useCase);
			formPayload.append('form_type', 'partnership_inquiry');
			formPayload.append('subject', 'New Partnership Inquiry - Aeon Bio');

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
		} catch (error) {
			console.error('Error submitting form:', error);
			errors.partnershipType = 'Something went wrong. Please try again.';
		} finally {
			isSubmitting = false;
		}
	}

	function resetForm() {
		formData = {
			name: '',
			email: '',
			organization: '',
			partnershipType: '',
			useCase: ''
		};
		currentStep = 1;
		isSubmitted = false;
		errors = {};
	}
</script>

<div class="partnership-form">
	{#if !isSubmitted}
		<div
			class="form-progress"
			role="progressbar"
			aria-valuemin="1"
			aria-valuemax="2"
			aria-valuenow={currentStep}
			aria-label="Form progress"
		>
			<div class="progress-bar">
				<div class="progress-fill" style="width: {(currentStep / 2) * 100}%"></div>
			</div>
			<span id="step-progress" class="progress-text">Step {currentStep} of 2</span>
		</div>

		<form on:submit|preventDefault={currentStep === 2 ? submitForm : nextStep}>
			{#if currentStep === 1}
				<div class="form-step" transition:fade={{ duration: 200 }}>
					<h3>Let's get acquainted</h3>
					<p>Tell us a bit about yourself and your organization.</p>

					<div class="form-group">
						<label for="name">Full Name *</label>
						<input
							id="name"
							type="text"
							bind:value={formData.name}
							class:error={errors.name}
							placeholder="Your full name"
							aria-describedby={errors.name ? 'name-error' : undefined}
							aria-invalid={!!errors.name}
							required
						/>
						{#if errors.name}
							<span
								id="name-error"
								class="error-message"
								transition:slide={{ duration: 200 }}
								aria-live="polite">{errors.name}</span
							>
						{/if}
					</div>

					<div class="form-group">
						<label for="email">Email Address *</label>
						<input
							id="email"
							type="email"
							bind:value={formData.email}
							class:error={errors.email}
							placeholder="your.email@organization.com"
							aria-describedby={errors.email ? 'email-error' : undefined}
							aria-invalid={!!errors.email}
							required
						/>
						{#if errors.email}
							<span
								id="email-error"
								class="error-message"
								transition:slide={{ duration: 200 }}
								aria-live="polite">{errors.email}</span
							>
						{/if}
					</div>

					<div class="form-group">
						<label for="organization">Organization *</label>
						<input
							id="organization"
							type="text"
							bind:value={formData.organization}
							class:error={errors.organization}
							placeholder="Your company or institution"
							aria-describedby={errors.organization ? 'organization-error' : undefined}
							aria-invalid={!!errors.organization}
							required
						/>
						{#if errors.organization}
							<span
								id="organization-error"
								class="error-message"
								transition:slide={{ duration: 200 }}
								aria-live="polite">{errors.organization}</span
							>
						{/if}
					</div>

					<div class="form-actions">
						<button type="submit" class="btn-primary" aria-describedby="step-progress">
							Continue to Step 2
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
						</button>
					</div>
				</div>
			{/if}

			{#if currentStep === 2}
				<div class="form-step" transition:fade={{ duration: 200 }}>
					<h3>How can we collaborate?</h3>
					<p>Help us understand your interests and how we might work together.</p>

					<div class="form-group">
						<label for="partnership-type">Partnership Type *</label>
						<select
							id="partnership-type"
							bind:value={formData.partnershipType}
							class:error={errors.partnershipType}
							aria-describedby={errors.partnershipType ? 'partnership-type-error' : undefined}
							aria-invalid={!!errors.partnershipType}
							required
						>
							<option value="">Select partnership type</option>
							{#each partnershipTypes as type (type.value)}
								<option value={type.value}>{type.label}</option>
							{/each}
						</select>
						{#if errors.partnershipType}
							<span
								id="partnership-type-error"
								class="error-message"
								transition:slide={{ duration: 200 }}
								aria-live="polite">{errors.partnershipType}</span
							>
						{/if}
					</div>

					<div class="form-group">
						<label for="use-case">Tell us more about your use case</label>
						<textarea
							id="use-case"
							bind:value={formData.useCase}
							placeholder="Describe your project, research goals, data types, or how you envision working with Aeon Bio..."
							rows="4"
							aria-label="Describe your use case, project details, research goals, data types, or collaboration vision"
						></textarea>
					</div>

					<div class="form-actions">
						<button
							type="button"
							class="btn-secondary"
							on:click={prevStep}
							aria-label="Go back to previous step"
						>
							<svg
								width="16"
								height="16"
								viewBox="0 0 24 24"
								fill="none"
								stroke="currentColor"
								stroke-width="2"
								aria-hidden="true"
							>
								<path d="m15 18-6-6 6-6" />
							</svg>
							Back
						</button>
						<button
							type="submit"
							class="btn-primary"
							disabled={isSubmitting}
							aria-describedby="submit-status"
						>
							{#if isSubmitting}
								<div class="spinner" aria-hidden="true"></div>
								<span id="submit-status">Submitting partnership inquiry...</span>
							{:else}
								<span id="submit-status">Submit Partnership Inquiry</span>
							{/if}
						</button>
					</div>
				</div>
			{/if}
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
					<path d="m9 12 2 2 4-4" />
					<circle cx="12" cy="12" r="10" />
				</svg>
			</div>
			<h3>Thank you for your interest!</h3>
			<p>
				We've received your partnership inquiry and will be in touch within 48 hours to discuss how
				we can collaborate.
			</p>
			<p class="next-steps">
				In the meantime, feel free to explore our research publications or schedule a demo call.
			</p>
			<div class="success-actions">
				<button class="btn-primary" on:click={() => dispatch('close')}>Close</button>
				<button class="btn-secondary" on:click={resetForm}>Submit Another Inquiry</button>
			</div>
		</div>
	{/if}
</div>

<style>
	.partnership-form {
		min-height: 400px;
	}

	.form-progress {
		margin-bottom: 2rem;
		text-align: center;
	}

	.progress-bar {
		height: 4px;
		background: rgba(255, 255, 255, 0.1);
		border-radius: 2px;
		margin-bottom: 0.5rem;
		overflow: hidden;
	}

	.progress-fill {
		height: 100%;
		background: linear-gradient(45deg, var(--aeon-primary), var(--aeon-biolum));
		transition: width 0.3s ease;
	}

	.progress-text {
		font-size: 0.9rem;
		color: rgba(255, 255, 255, 0.7);
	}

	.form-step h3 {
		font-size: 1.4rem;
		color: var(--aeon-biolum);
		margin: 0 0 0.5rem;
	}

	.form-step p {
		color: rgba(255, 255, 255, 0.8);
		margin: 0 0 2rem;
	}

	.form-group {
		margin-bottom: 1.5rem;
	}

	.form-group label {
		display: block;
		margin-bottom: 0.5rem;
		font-weight: 500;
		color: rgba(255, 255, 255, 0.9);
	}

	.form-group input,
	.form-group select,
	.form-group textarea {
		width: 100%;
		padding: 0.75rem 1rem;
		border: 1px solid rgba(128, 255, 219, 0.2);
		border-radius: 0.5rem;
		background: rgba(255, 255, 255, 0.05);
		color: white;
		font-size: 1rem;
		transition:
			border-color 0.3s ease,
			background 0.3s ease;
	}

	.form-group input:focus,
	.form-group select:focus,
	.form-group textarea:focus {
		outline: none;
		border-color: var(--aeon-biolum);
		background: rgba(255, 255, 255, 0.08);
	}

	.form-group input.error,
	.form-group select.error {
		border-color: #ff6b6b;
	}

	.form-group input::placeholder,
	.form-group textarea::placeholder {
		color: rgba(255, 255, 255, 0.5);
	}

	.error-message {
		display: block;
		color: #ff6b6b;
		font-size: 0.85rem;
		margin-top: 0.25rem;
	}

	.form-actions {
		display: flex;
		gap: 1rem;
		justify-content: flex-end;
		margin-top: 2rem;
	}

	.btn-primary,
	.btn-secondary {
		min-height: 44px;
		padding: 0.75rem 1.5rem;
		border-radius: 0.5rem;
		font-size: 1rem;
		font-weight: 500;
		cursor: pointer;
		transition: all 0.3s ease;
		display: flex;
		align-items: center;
		gap: 0.5rem;
		border: none;
	}

	.btn-primary {
		background: linear-gradient(45deg, var(--aeon-primary), var(--aeon-biolum));
		color: var(--aeon-deep-space);
	}

	.btn-primary:hover:not(:disabled),
	.btn-primary:focus:not(:disabled) {
		transform: translateY(-2px);
		box-shadow: 0 8px 25px rgba(76, 201, 240, 0.3);
	}

	.btn-primary:focus {
		outline: 2px solid var(--aeon-biolum);
		outline-offset: 2px;
	}

	.btn-primary:disabled {
		opacity: 0.7;
		cursor: not-allowed;
		transform: none;
	}

	.btn-secondary {
		background: rgba(255, 255, 255, 0.1);
		color: rgba(255, 255, 255, 0.9);
		border: 1px solid rgba(128, 255, 219, 0.3);
	}

	.btn-secondary:hover,
	.btn-secondary:focus {
		background: rgba(128, 255, 219, 0.1);
		border-color: var(--aeon-biolum);
		color: white;
	}

	.btn-secondary:focus {
		outline: 2px solid var(--aeon-biolum);
		outline-offset: 2px;
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
		padding: 2rem 0;
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
	}

	.success-actions {
		display: flex;
		gap: 1rem;
		justify-content: center;
		margin-top: 2rem;
	}

	@media (max-width: 768px) {
		.form-actions,
		.success-actions {
			flex-direction: column;
		}

		.btn-primary,
		.btn-secondary {
			justify-content: center;
		}
	}
</style>
