// Every visible string on the home page, its figure, its forms and its <svelte:head>.
// Link texts are separate keys; paragraphs whose link order differs between languages
// (the founders' bios) are segment lists: { t } is plain text, { t, href } is a link.
// Placeholders in braces ({n}, {total}) are filled by the component.

export const en = {
	meta: {
		title: 'aeon.science',
		description:
			'An instrument that sits on a liquid-handling robot, keeps cells alive in standard plates, and images them while the robot changes their conditions, so you can see which conditions make the cells work well.',
		ogTitle: 'aeon.science',
		ogDescription:
			'An instrument that sits on a liquid-handling robot, keeps cells alive in standard plates, and images them while the robot changes their conditions.',
		ogLocale: 'en_US'
	},
	hero: {
		line: 'Open hardware for live-cell experiments.',
		h1: 'Change something. Watch.',
		cue: 'See how it works'
	},
	dish: {
		h2a: 'The cells never leave the plate.',
		h2b: 'The robot changes their conditions. We watch.'
	},
	beats: {
		above: 'Changes come from above.',
		below: 'We watch from below.',
		again: 'The same change, again.',
		strengths: 'Three strengths.',
		untouched: 'These were never touched.',
		later: 'A day later. The same cells.',
		still:
			'Changes come from above; we watch from below. Three strengths, three repeats, three never touched; a day later the same cells answer again.'
	},
	readout: {
		h2a: 'What comes back is a model.',
		h2b: 'Which conditions make these cells work, with the evidence attached.',
		pBefore:
			'Every condition the robot sets is a perturbation; every frame is a measurement. From that time series we fit a causal model of how the cells respond, the approach Karen Sachs introduced for single-cell perturbation data in ',
		pLink: 'Science (2005)',
		pAfter: '.'
	},
	founders: {
		h2: 'Founders'
	},
	eric: {
		name: 'Eric Jing Mockler',
		role: 'Co-founder & Engineer',
		alt: 'Eric Jing Mockler, smiling in glasses and a burgundy shirt',
		linkedin: 'Eric Jing Mockler on LinkedIn',
		github: 'Eric Jing Mockler on GitHub',
		scholar: 'Eric Jing Mockler on Google Scholar',
		bio: [
			{ t: 'Bioengineering, cognitive science, neuroscience at UC Santa Cruz. ' },
			{ t: 'Variant discovery', href: 'https://github.com/ejmockler/case-control-genomics' },
			{ t: ' across 10,000+ genomes at ' },
			{ t: 'Gladstone', href: 'https://gladstone.org' },
			{ t: ' and ' },
			{ t: 'Answer ALS', href: 'https://www.answerals.org' },
			{ t: '. With the Gyori lab, ' },
			{ t: 'the belief model', href: 'https://github.com/gyorilab/indra-belief-model' },
			{ t: ': does the paper actually say this causes that.' }
		]
	},
	karen: {
		name: 'Karen Sachs, PhD',
		role: 'Co-founder · CSO/CTO',
		alt: 'Karen Sachs, smiling, with sunglasses pushed up into her curly hair',
		linkedin: 'Karen Sachs on LinkedIn',
		scholar: 'Karen Sachs on Google Scholar',
		bio: [
			{ t: 'MIT PhD, biological engineering. Stanford Medicine postdoc. ' },
			{
				t: 'Causal networks from single-cell perturbation data',
				href: 'https://doi.org/10.1126/science.1105809'
			},
			{ t: '; Science Breakthrough of the Year runner-up. ' },
			{ t: '60+ papers', href: 'https://scholar.google.com/citations?user=lS0tvhoAAAAJ&hl=en' },
			{ t: '.' }
		]
	},
	cta: {
		line: 'If you run a wet lab, or hold perturbation data, write.',
		write: 'Write to us',
		follow: 'Follow'
	},
	colophon: {
		text: 'Open hardware under CERN-OHL-S-2.0 · ',
		link: 'Aeon-Bio on GitHub'
	},
	switch: {
		// the link to the other language, written in that language
		label: '日本語'
	},
	modal: {
		write: 'Write to us',
		follow: 'Follow',
		close: 'Close modal'
	},
	form: {
		progress: 'Form progress',
		step: 'Step {n} of {total}',
		who: 'Who you are',
		name: 'Full Name',
		namePlaceholder: 'Your full name',
		email: 'Email Address',
		emailPlaceholder: 'your.email@organization.com',
		org: 'Organization',
		orgPlaceholder: 'Your company or institution',
		nameRequired: 'Name is required',
		emailRequired: 'Email is required',
		emailInvalid: 'Valid email is required',
		orgRequired: 'Organization is required',
		pickOneError: 'Please pick one',
		failed: 'Something went wrong. Please try again.',
		next: 'Continue',
		topic: 'What would you like to talk about?',
		fewLines: 'A few lines is enough.',
		why: 'What brings you here',
		pickOne: 'Pick one',
		optWetLab: 'I run a wet lab',
		optData: 'I hold perturbation data',
		optOther: 'Something else',
		more: 'Tell us more about your use case',
		morePlaceholder: 'Tell us about your cells, what you measure today, and what is slow about it.',
		moreAria:
			'Describe your use case, project details, research goals, data types, or collaboration vision',
		backAria: 'Go back to previous step',
		back: 'Back',
		sending: 'Sending…',
		submit: 'Send',
		thanks: 'Thanks, we have it.',
		reply: 'Eric reads every message and replies himself.',
		nextSteps:
			'There is no product to demo yet. What we can offer is a conversation about how you measure whether your cells work, and what is slow about it.',
		close: 'Close',
		another: 'Write another'
	},
	follow: {
		title: 'Follow the build',
		body: 'Occasional notes as the instrument comes together: what we measured, what we changed, and when there is something to see. No more than one email a month.',
		email: 'Email Address',
		emailPlaceholder: 'Enter your email address',
		emailAria: 'Email address for updates',
		emailRequired: 'Email address is required',
		emailInvalid: 'Please enter a valid email address',
		failed: 'Something went wrong. Please try again.',
		interest: "I'm interested in:",
		optional: '(optional)',
		optBuild: 'Build progress',
		optHardware: 'Hardware files, when they publish',
		optAnalysis: 'Analysis and models',
		optVisit: 'A visit or a call',
		sending: 'Sending…',
		submit: 'Follow',
		thanks: "Thanks, you're on the list.",
		reply: "We'll write when there is something real to show.",
		nextSteps: 'No confirmation email. We only write when there is news.',
		close: 'Close',
		another: 'Add another address'
	},
	a11y: {
		mark: 'aeon mark, a Lorenz attractor photographed as a long exposure',
		figure:
			"Part of a standard plate as a long exposure, pinned while the page scrolls. The view descends through the instrument on its own as the robot works; scrolling can only hurry it, and a mouse over it turns the view in the hand. From above, where changes come from, a change falls into one well. From the side, cultures of individual cells sit on the floor of every well and a watcher walks underneath, its light showing only through the well it is under. The view passes through the floor to the watcher's own: close on that well as the change spreads and the cells answer with their own timing, or not. It pulls back to the plate from below as the robot runs its protocol: the same change in the next wells of the row, a row at three strengths where more cells answer the stronger it is, a row never touched that only flickers on its own, and a day later the same cells answering again. Pressing a well puts a change into it from above; holding longer makes it stronger. What answered because of a change settles slowly into a map of cause."
	}
} as const;
