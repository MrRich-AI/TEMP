# TEMP repo — Cover Lessons

Ready-to-teach decks for **cover teachers**, made by combining specific slides from existing builds in the **LESSONS** and **INCLASS** repos (owner mrrich-ai). Teacher: Richard (Grade 9 & 10 ESL, Royal International School, Vietnam). Public title on the landing page: **Cover Lessons**.

**The only new thing in this repo is the transition between slides from different builds.** Everything else is copied, not rebuilt.

## Not on the homepage
- TEMP is hidden from the main homepage (repo `mrrich-ai.github.io`, `HIDE` list in its `index.html`). Never remove it from `HIDE` and never add it to `FIXED`.
- The landing page is reached by direct link only (`https://mrrich-ai.github.io/TEMP/`) and has `noindex`.

## Repo layout
- `index.html` — landing page. Every new deck gets an entry in its `DECKS` array (grade, title, classes, minutes, url, sources).
- `G9/<deck-slug>/index.html`, `G10/<deck-slug>/index.html` — one folder per combined deck (lowercase, hyphenated, e.g. `G9/food-review/`).
- `_shared/paint-wipe/paint-wipe.js` — the transition (shared by every deck). `demo.html` shows it stand-alone.
- Classes: G9 = 9A1, 9A2, 9A3; G10 = 10A1.

## Core files (already in the repo — reuse, don't rebuild)

### `index.html` — Cover Lessons landing page
- Navy + gold (LESSONS) blended with night purple + pink (INCLASS); Source Serif 4 headings, Source Sans 3 body; `noindex`.
- Header (crest, "Mr. Rich · IGCSE ESL · Cover teachers", "Cover Lessons"), short lead, gold/pink stripe, 3-step "how to use" strip for cover teachers, then Grade 9 and Grade 10 sections, footer link to the transition demo.
- **Only edit the `DECKS` array** to add or change decks. Entry format:
  `{ grade:"G9", title:"Food: review lesson", classes:"9A1, 9A2", minutes:45, url:"G9/food-review/", sources:[{repo:"LESSONS", name:"G9 Unit 3 Food"}, {repo:"INCLASS", name:"Speaking Circle"}] }`
- Cards render automatically per grade (count pill, gold-accented LESSONS chips, pink INCLASS chips); an empty grade shows "No cover lessons for Grade X yet."

### `_shared/paint-wipe/paint-wipe.js` — the transition module
- Load once per deck: `<script src="../../_shared/paint-wipe/paint-wipe.js"></script>`.
- API: `PaintWipe.run({ from, to, label, sub, font, onCover })` → Promise. `from`/`to` = build colours (hex), `label`/`sub` = text painted mid-transition, `onCover` = swap to the incoming slide (may return a Promise, e.g. wait for a build to load). `PaintWipe.busy` is true while running.
- Built-in: 6 strokes per pass, each pre-rendered with lit top / shaded bottom, bristle streaks, dry-brush edges, ragged bristle tip and splatter; slight tilt per stroke; RTL pass mirrored; eraser pass uses `destination-out`; canvas fades out at the end. Timing constants at the top (`T_COVER`, `T_PAINT`, `T_ERASE`, `STAGGER`, `LABEL_HOLD`).
- Blocks keydown/keyup/keypress (capture phase) and clicks while busy; reduced motion → colour fade; canvas resolution capped at 1.25× for classroom PCs.
- Any change here applies to every deck — re-run `demo.html` after editing.

### `_shared/paint-wipe/demo.html` — stand-alone demo / reference deck player
- 1920×1080 stage scaled and centred to any screen (`translate(-50%,-50%) scale(s)`), bottom bar (source label, Back, counter, Next), → / Space / PageDown next, ← / PageUp back.
- 5 sample slides from 3 mock builds (LESSONS navy, INCLASS purple, light cream unit) to show: same build → normal 0.45 s fade; different build → paint wipe; light colour → dark label ink.
- Shows the deck pattern to copy: a `BUILDS` map (`color`, `label`, `sub` per build), `data-build` on each slide, and a `go(i)` that compares `data-build` of the current and next slide and only calls `PaintWipe.run` when they differ (swapping slides instantly inside `onCover`).
- A single-file copy (JS inlined) is fine for sharing previews; the repo copy keeps loading `paint-wipe.js`.

## Rule sync with the source repos
- Copied slides follow the rules of the repo they came from: **LESSONS → `LESSONS/CLAUDE.md`**, **INCLASS → `INCLASS/CLAUDE.md`**. This file does not repeat those rules.
- Before every new deck or deck edit, re-read the current `CLAUDE.md` of each source repo used and take slides from that repo's latest `main`. Source rules change; the source repo always wins over an older copy.
- If a source rule clashes with a TEMP rule or with the request, ask Richard before building.
- When Richard sets or changes a TEMP rule in chat, update this file in the same commit.

## Copied slides — keep them exactly as they are
- Same content, layout, styles, page badges, answers, reveals, REV/CLICK steps, timers, teacher tools and keys as in the source build.
- Don't redesign, re-theme, "fix" or improve copied slides. If a source slide has a problem, tell Richard; fixes go in the source repo first, then get re-copied here.
- Only slides Richard names are included, in the order he gives.

## Transition — Paint Wipe (the one new addition)
- Use `_shared/paint-wipe/paint-wipe.js` (`PaintWipe.run({from, to, label, sub, onCover})`). Don't copy or fork it into a deck; changes go in `_shared` and apply to every deck.
- **Fires only when the next slide comes from a different build** — forward and back. Slides from the same build change with that build's own normal slide change.
- Sequence (~1.3 s): strokes in the outgoing build's colour sweep left → right and cover the slide → swap → strokes in the incoming build's colour sweep right → left → the incoming build's label is painted in the middle (repo name + build name, e.g. "In-Class Activities · Speaking Circle") → an eraser brush sweeps left → right and reveals the new slide.
- Build colour = the source build's main slide background colour. The label switches to dark ink on light colours automatically.
- Keys and clicks are blocked while it runs (`PaintWipe.busy`). `prefers-reduced-motion` gets a short colour fade instead.
- Code-drawn on one canvas, no images, no libraries; smooth on a classroom PC.

## Before building a deck — ask for
1. Grade, class(es), deck title and lesson length.
2. Each source build (repo + unit/activity) and the exact slides from it (slide number + title), in teaching order.
3. Anything unclear about which slide is meant — never guess.

## Open decision (settle on the first deck)
- How each source build's engine is carried into the combined deck (e.g. one player page that loads each source build and jumps to the chosen slides, vs. copying slides and their engine into one file). Ask Richard, then record the decision here.

## Checking (before delivering)
- Render at 1920×1080. Step through every slide forward and back: each build-to-build change runs the paint wipe, same-build changes don't, nothing can be clicked mid-wipe.
- Reveals, REV/CLICK, timers and teacher tools still work on every copied slide.
- The deck appears on the landing page under the right grade.

## Commits
- New deck: ask before the first commit. Edits to an existing deck: commit without asking.
- Message format: `Add Cover Deck: G9 Food review (LESSONS G9 U3 slides 4–9 + INCLASS Speaking Circle 1–3)` / `Update Cover Deck: …` — always name the sources and slides.
- Never commit API keys or other secrets.
