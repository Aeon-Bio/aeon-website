# aeon.science — the visual world

Documented 2026-10-15 from the code and the business card. This world is established; the rebuild keeps it. Tokens in `src/app.css`.

## Material

One material does every job: light deposited per unit time. The mark is a long exposure of one Lorenz trajectory (halo on a quarter-resolution plate, body, white core on near passes, a head of light), alive on canvas (`src/lib/images/AeonMarkLive.svelte`, parameters verbatim from `scripts/gen-mark.py`). Everything else on the page is either that material at another distance or text living in its light. Additive compositing (`lighter`); soft plates at quarter resolution for halos; one colour ramp deep space → primary → biolum → white.

Nothing is drawn as an outline. A thing exists because of how it behaves or what it hides: a surface because a drop stops there, a plate because it hides the light under it, a floor because the cells sit on it. No strokes, no rules, no boxes, no glass, no chips, no gradient buttons, no grids, no node networks, no particle dust, no second attractor.

## Ground

`--aeon-deep-space #1a1b2f` under a fixed vertical gradient (transparent → deep space at 75%) and a 3.5% static grain that dithers the ramp. The ground is the room; sections are places in the same room, separated by darkness and spacing, never by a line. No edge on the page is straight except the viewport's: every exposure fades to nothing before any canvas edge.

## Colour

- primary `#4cc9f0` (the change, the medium, the trail)
- biolum `#80ffdb` (the living answer; the only thing that may be this colour is a cell answering, and the hover state of a link)
- white (the core of the nearest light; the watcher's plain light; a drop's one highlight)
- warn `#f06078` (errors only)
- ink scale on `rgba(245,245,245,α)`: 100 / 70 / 50 / 30 / 12. Body copy ink-70, secondary ink-50, never grey.

Light means something physical: time, nearness, response. Additive glow on a static shape means nothing and is banned.

## Type

- Display: Josefin Sans Variable (300 italic for the one line, 400 for headings, 600 for the wordmark). Tiny x-height: never for reading.
- Body: DM Sans Variable, opsz axis. Reading measure ≤ 58ch, 1.6 leading.
- Mono: DM Mono, only for the scroll cue and buttons, 0.72–0.8rem, 0.08–0.12em tracking, uppercase. Never as a costume.
- Japanese: Zen Kaku Gothic New via unicode-range; no italics; headings 500 with the `<em>` half at 400 / ink-70; body leading 1.8; phrase breaks explicit.
- Headings: two halves, the second in `<em>` at ink-50 (en) carrying the second thought. h1 ≤ 4 words. Section h2 `clamp(1.9rem, 3vw, 2.6rem)`.
- Kickers, eyebrows and section numbers are banned.

## Composition

The card at viewport scale: text column left (5/12), the figure's field right (7/12), the figure allowed to run off the right edge; one column on phones with the figure first. Every section has one strong centre and the words hang on it; a figure section is one viewport with its words on the same screen. Entrances fade only (`use:reveal`, 720ms); nothing translates on entrance.

## Motion and time

Three timing tokens only: `--t-snap 120ms`, `--t-move 320ms`, `--t-settle 720ms`; `--ease-out cubic-bezier(.22,1,.36,1)`. Processes on canvas run on physical time (seconds), never on CSS loops. The page moves only under the hand: no scroll-driven cameras, no pinning, no scroll snap, no parallax, no cursor glows, no magnetic buttons, no progress bars, no autoplaying film with hidden state. Reduced motion: still exposures, no canvas loops.

## Interaction grammar

One gesture, the one everyone already has: tap or click. Nothing is held, hovered or learned; a passing pointer changes nothing, and the cursor over the plate is the plain pointer. Touch, mouse and pen do the same thing with the same gesture; the keyboard reaches the same act through a button. The thing the page shows must be seen in full by a reader who never touches it: interaction adds a question, it never carries the meaning.

## Controls

Primary button: biolum fill, deep-space text, 2px radius, mono uppercase, 44px min height. Secondary: transparent, ink-70. Links in copy: biolum with a 35% underline. Focus: 1px biolum outline, 3px offset. Icons only as link affordances (lucide, 16px, 1.8 stroke).

## Copy register

Short declaratives; the thing named after the light has shown it; no sentences that conclude for the reader; no marketing adjectives; the stage said once ("in design"). Japanese copy in the card's register (体言止め, no imperatives, katakana names).
