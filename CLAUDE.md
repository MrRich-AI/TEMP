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
