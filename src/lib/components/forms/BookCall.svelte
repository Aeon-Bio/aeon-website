<!--
  BookCall — Eric's Google appointment schedule, framed as an instrument viewport.

  The person arrives to pick a time with someone eleven to seventeen hours away.
  Two things carry weight: what time it is for Eric, and whether the calendar is
  coming. So the slip says Kobe's clock (live, to the minute), and while Google's
  page loads the viewport draws the shape that is about to arrive (day columns of
  slots) under a slow stage scan, instead of a spinner. The real page fades in over
  its own silhouette. A plain link out is always present: third-party cookies or a
  blocker can stop the frame, and the person should never be stuck behind it.
-->
<script lang="ts">
	import { onMount } from 'svelte';
	import { useMessages } from '$lib/i18n';

	const c = useMessages().call;

	/** the booking page; ?gv=true is Google's embeddable form of the same schedule */
	const SCHEDULE =
		'https://calendar.google.com/calendar/appointments/schedules/AcZssZ2NF9t3pfKOKLsDlKut2XAbfUa36AHXTPTXx-Z-7hdeZFM7L7ximav1T9cjMv5Mp-5nABHRp4C3';
	const EMBED = `${SCHEDULE}?gv=true`;
	const OPEN = 'https://calendar.app.google/XkLxCT1SxDBoPtSW7';

	/** after this long without a load event, the slip says so and points at the link */
	const SLOW_MS = 7000;

	/* Google's page fires load on its shell and paints its slots a beat later; the
	   lamp comes on at load, the page is shown once it has had time to paint */
	const PAINT_MS = 900;

	/** loading → (slow) → lit: the field turns white under the silhouette → ready */
	type Frame = 'loading' | 'slow' | 'lit' | 'ready';
	let frame: Frame = 'loading';

	let kobe = '';
	let sameZone = false;

	const kobeClock = new Intl.DateTimeFormat(undefined, {
		timeZone: 'Asia/Tokyo',
		hour: 'numeric',
		minute: '2-digit'
	});

	function tick() {
		kobe = kobeClock.format(new Date());
	}

	let paint: ReturnType<typeof setTimeout>;
	function arrived() {
		frame = 'lit';
		paint = setTimeout(() => (frame = 'ready'), PAINT_MS);
	}

	onMount(() => {
		tick();
		sameZone =
			new Intl.DateTimeFormat('en', { timeZone: 'Asia/Tokyo', timeZoneName: 'shortOffset' }).format(
				0
			) === new Intl.DateTimeFormat('en', { timeZoneName: 'shortOffset' }).format(0);
		// align the clock to the minute boundary, then step once a minute
		let every: ReturnType<typeof setInterval>;
		const first = setTimeout(
			() => {
				tick();
				every = setInterval(tick, 60_000);
			},
			60_000 - (Date.now() % 60_000)
		);
		const slow = setTimeout(() => {
			if (frame === 'loading') frame = 'slow';
		}, SLOW_MS);
		return () => {
			clearTimeout(first);
			clearInterval(every);
			clearTimeout(slow);
			clearTimeout(paint);
		};
	});

	/* the silhouette: seven day columns, slot counts shaped like the real week
	   (weekdays a morning slot then an afternoon run, weekends a longer run) */
	const silhouette = [12, 15, 15, 12, 12, 12, 12];
</script>

<div class="book">
	<p class="slip">
		{#if kobe}
			<span class="here" aria-hidden="true"></span>
			<span>{c.kobe}<time class="clock">{kobe}</time></span>
			{#if !sameZone}<span class="sep" aria-hidden="true">·</span><span class="yours"
					>{c.yours}</span
				>{/if}
		{:else}
			<span>&nbsp;</span>
		{/if}
	</p>

	<div class="viewport" data-frame={frame}>
		<span class="tick tl" aria-hidden="true"></span>
		<span class="tick tr" aria-hidden="true"></span>
		<span class="tick bl" aria-hidden="true"></span>
		<span class="tick br" aria-hidden="true"></span>

		{#if frame !== 'ready'}
			<div class="ghost" aria-hidden="true">
				<div class="days">
					{#each silhouette as n, d}
						<div class="day" style="--d: {d}">
							<span class="head"></span>
							{#each Array(n) as _, i}
								<span class="slot" style="--i: {i}"></span>
							{/each}
						</div>
					{/each}
				</div>
				<span class="scan"></span>
			</div>
			<p class="status" role="status">
				{frame === 'slow' ? c.slow : c.reading}<span class="dots" aria-hidden="true"
					><span>.</span><span>.</span><span>.</span></span
				>
			</p>
		{/if}

		<iframe src={EMBED} title={c.frame} loading="eager" on:load={arrived}></iframe>
	</div>

	<a class="out" class:lit={frame === 'slow'} href={OPEN} target="_blank" rel="noopener noreferrer"
		>{c.open}<span class="arrow" aria-hidden="true">↗</span></a
	>
</div>

<style>
	.book {
		display: flex;
		flex-direction: column;
		gap: 0.9rem;
	}

	/* ---------- the slip: where Eric is, in the instrument's voice ---------- */

	.slip {
		display: flex;
		align-items: center;
		flex-wrap: wrap;
		gap: 0.35rem 0.6rem;
		margin: 0;
		min-height: 1.5em;
		font-family: var(--font-mono);
		font-size: 0.74rem;
		letter-spacing: 0.06em;
		line-height: 1.5;
		color: var(--ink-70);
	}

	.clock {
		color: var(--aeon-biolum);
		font-variant-numeric: tabular-nums;
	}

	.sep {
		color: var(--ink-30);
	}

	/* a live point: Kobe is a place where it is a time right now */
	.here {
		position: relative;
		width: 6px;
		height: 6px;
		border-radius: 50%;
		background: var(--aeon-biolum);
		flex-shrink: 0;
	}

	.here::after {
		content: '';
		position: absolute;
		inset: 0;
		border-radius: 50%;
		background: var(--aeon-biolum);
		animation: breathe 3.6s var(--ease-in-out) infinite;
	}

	@keyframes breathe {
		0% {
			transform: scale(1);
			opacity: 0.55;
		}
		70%,
		100% {
			transform: scale(3.2);
			opacity: 0;
		}
	}

	/* ---------- the viewport ---------- */

	.viewport {
		position: relative;
		height: min(640px, 68vh);
		border-radius: 2px;
		/* dark while the calendar is on its way; white once it lands, because Google's
		   page is white and the field should already be the colour of what arrives */
		background: rgba(245, 245, 245, 0.025);
		box-shadow:
			0 0 0 1px var(--ink-12),
			0 24px 60px -24px rgba(0, 0, 0, 0.7);
		isolation: isolate;
		transition:
			background-color var(--t-settle) var(--ease-out),
			box-shadow var(--t-settle) var(--ease-out);
	}

	/* the lamp: the field comes up to the page's white, with a faint biolum bloom */
	.viewport[data-frame='lit'],
	.viewport[data-frame='ready'] {
		background: #fff;
		box-shadow:
			0 0 0 1px rgba(128, 255, 219, 0.25),
			0 0 60px -10px rgba(128, 255, 219, 0.18),
			0 24px 60px -24px rgba(0, 0, 0, 0.7);
	}

	iframe {
		position: absolute;
		inset: 0;
		width: 100%;
		height: 100%;
		border: 0;
		border-radius: 2px;
		opacity: 0;
		transition: opacity var(--t-settle) var(--ease-out);
	}

	.viewport[data-frame='ready'] iframe {
		opacity: 1;
	}

	/* reticle corners: the frame is a field of view, not a box */
	.tick {
		position: absolute;
		width: 14px;
		height: 14px;
		border: 0 solid var(--aeon-biolum);
		opacity: 0.7;
		z-index: 2;
		pointer-events: none;
		transition:
			opacity var(--t-settle) var(--ease-out),
			transform var(--t-settle) var(--ease-out);
	}

	.tl {
		top: -7px;
		left: -7px;
		border-top-width: 1px;
		border-left-width: 1px;
	}
	.tr {
		top: -7px;
		right: -7px;
		border-top-width: 1px;
		border-right-width: 1px;
	}
	.bl {
		bottom: -7px;
		left: -7px;
		border-bottom-width: 1px;
		border-left-width: 1px;
	}
	.br {
		bottom: -7px;
		right: -7px;
		border-bottom-width: 1px;
		border-right-width: 1px;
	}

	/* while focusing, the reticle sits wide; on arrival it closes onto the image */
	.viewport:not([data-frame='ready']) .tl {
		transform: translate(-4px, -4px);
	}
	.viewport:not([data-frame='ready']) .tr {
		transform: translate(4px, -4px);
	}
	.viewport:not([data-frame='ready']) .bl {
		transform: translate(-4px, 4px);
	}
	.viewport:not([data-frame='ready']) .br {
		transform: translate(4px, 4px);
	}
	.viewport[data-frame='ready'] .tick {
		opacity: 0.35;
	}

	/* ---------- the ghost: the week that is about to arrive ---------- */

	.ghost {
		position: absolute;
		inset: 0;
		overflow: hidden;
		padding: clamp(1.25rem, 4vw, 2.5rem);
		pointer-events: none;
	}

	.days {
		display: grid;
		grid-template-columns: repeat(7, 1fr);
		gap: clamp(0.4rem, 1.4vw, 1rem);
		height: 100%;
		padding-top: 3.5rem;
		/* the week runs off into the status line instead of colliding with it */
		mask-image: linear-gradient(to bottom, #000 70%, transparent 92%);
	}

	.day {
		display: flex;
		flex-direction: column;
		gap: 0.45rem;
	}

	.head {
		height: 1.6rem;
		width: 60%;
		margin: 0 auto 0.6rem;
		border-radius: 2px;
		background: var(--ink-12);
	}

	/* under the lamp the silhouette turns to ink, so the week holds its place */
	.ghost .head,
	.ghost .slot,
	.status {
		transition:
			background-color var(--t-settle) var(--ease-out),
			border-color var(--t-settle) var(--ease-out),
			color var(--t-settle) var(--ease-out);
	}
	.viewport[data-frame='lit'] .head {
		background: rgba(26, 27, 47, 0.07);
	}
	.viewport[data-frame='lit'] .slot {
		border-color: rgba(26, 27, 47, 0.1);
	}
	.viewport[data-frame='lit'] .scan {
		opacity: 0;
	}
	.viewport[data-frame='lit'] .status {
		color: rgba(26, 27, 47, 0.45);
	}

	.slot {
		height: 1.55rem;
		border-radius: 2px;
		border: 1px solid rgba(128, 255, 219, 0.1);
		opacity: 0;
		animation: settle var(--t-move) var(--ease-out) forwards;
		/* the week fills left to right, each day top to bottom: the eye reads it once */
		animation-delay: calc(var(--d) * 70ms + var(--i) * 22ms);
	}

	@keyframes settle {
		to {
			opacity: 1;
		}
	}

	/* a slow stage scan, the instrument passing over the week */
	.scan {
		position: absolute;
		left: 0;
		right: 0;
		top: 0;
		height: 38%;
		background: linear-gradient(
			to bottom,
			transparent,
			rgba(128, 255, 219, 0.05) 70%,
			rgba(128, 255, 219, 0.14) 99%,
			transparent
		);
		animation: pass 2.8s var(--ease-in-out) infinite;
		transition: opacity var(--t-move) var(--ease-out);
	}

	@keyframes pass {
		from {
			transform: translateY(-100%);
		}
		to {
			transform: translateY(270%);
		}
	}

	.status {
		position: absolute;
		left: 0;
		right: 0;
		bottom: 1.1rem;
		margin: 0;
		text-align: center;
		font-family: var(--font-mono);
		font-size: 0.72rem;
		letter-spacing: 0.08em;
		text-transform: uppercase;
		color: var(--ink-50);
		z-index: 1;
	}

	.dots span {
		animation: blink 1.4s steps(1) infinite;
	}
	.dots span:nth-child(2) {
		animation-delay: 0.2s;
	}
	.dots span:nth-child(3) {
		animation-delay: 0.4s;
	}

	@keyframes blink {
		0%,
		100% {
			opacity: 0.2;
		}
		50% {
			opacity: 1;
		}
	}

	/* ---------- the way out ---------- */

	.out {
		align-self: flex-end;
		display: inline-flex;
		align-items: center;
		gap: 0.4rem;
		min-height: 44px;
		font-family: var(--font-mono);
		font-size: 0.72rem;
		letter-spacing: 0.08em;
		text-transform: uppercase;
		color: var(--ink-50);
		transition: color var(--t-snap) var(--ease-out);
	}

	.out .arrow {
		transition: transform var(--t-move) var(--ease-out);
	}

	.out:hover,
	.out:focus-visible,
	.out.lit {
		color: var(--aeon-biolum);
	}

	.out:hover .arrow,
	.out:focus-visible .arrow {
		transform: translate(2px, -2px);
	}

	.out:focus-visible {
		outline: 1px solid var(--aeon-biolum);
		outline-offset: 3px;
	}

	@media (max-width: 640px) {
		.viewport {
			height: 72vh;
		}
		.days {
			grid-template-columns: repeat(4, 1fr);
		}
		.day:nth-child(n + 5) {
			display: none;
		}
	}

	@media (prefers-reduced-motion: reduce) {
		.here::after,
		.scan,
		.dots span {
			animation: none;
		}
		.scan {
			display: none;
		}
		.slot {
			animation: none;
			opacity: 1;
		}
		.viewport,
		.tick,
		iframe {
			transition: none;
		}
	}
</style>
