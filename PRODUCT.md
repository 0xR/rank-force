# Rank Force

A small collaborative tool for **forced ranking**. A team opens a session, lists the items they're choosing between, agrees on the criteria that matter, and each participant ranks every item along every criterion (no ties allowed). The app aggregates everyone's rankings, weighted by how important each criterion is, into a single score per item. Highest score wins.

register: product

## Users

Small groups (2–8) making structured decisions where ranking captures the disagreement better than a vote does:

- Hiring panels comparing candidates across skills, fit, and growth
- Product teams ordering a backlog by value, effort, risk
- Research teams scoring options on a rubric

They open the app once per decision, finish in 20 minutes, then leave. Half the time they're side by side in a room — laptop on a table, lights down, screen partially projected. The other half they're remote with a shared link. They don't read documentation. They don't customize.

## Product purpose

Replace the half-baked Slack thread + spreadsheet that this kind of decision usually becomes. The app's job is to:

1. Make agreeing on _what to rank by_ feel light, not bureaucratic.
2. Make ranking itself feel kinetic — drag-to-order, not click-to-vote.
3. Show one clear final outcome, with enough breakdown that a dissenter feels heard, not steamrolled.

Activation is "a group finished a real ranking and trusts the result." Anything that doesn't move that needle is decoration.

## Brand

The product name is **Rank Force**, anchored in the technique it implements: **forced ranking**. Forced ranking pulls signal out of group decisions by refusing ties — every participant has to commit to a strict order. The brand voice should feel like that: confident, plain, willing to ask for a real answer.

The visual atmosphere — twilight palette, sparse starfield on the welcome screen, plasma accent — is aesthetic, not vocabulary. It's the room the app lives in. It does **not** mean we call items "stars" or scores "magnitudes" in copy.

User-facing vocabulary stays plain:

- **Item** — a thing being ranked
- **Criterion** (or _dimension_ internally) — an axis, with a low end and a high end
- **Weight** — how much a criterion matters to the final score
- **Ranking** — one participant's order across one criterion
- **Score** — the weighted aggregate, 0–100%
- **Session** — one ranking exercise; shareable by a 26-character ID
- **Participant** — someone in the session

Where heroic register is appropriate (welcome hero, end of ranking), lean on the _forced ranking_ concept directly: "Force a ranking. Get the signal." Not metaphor.

## Tone

Direct. The welcome screen can carry one or two confident lines; everything inside the app is calm and competent. The tool is for adults making real decisions; it should not perform whimsy at them.

- Welcome / onboarding: a little theatrical, anchored in the technique. _"Force a ranking. Get the signal."_
- Inside the app: brisk. _"Add a criterion."_ _"Drag to rank."_ _"Final score."_
- Empty states: teach by showing the next move, not by being cute.
- Errors: name what went wrong in one sentence and what to try.

No exclamation points. No emoji in chrome. **No em dashes.**

## Anti-references

- **Heroic-LARP vocabulary** ("missions," "navigators," "trajectories," "magnitudes," "stars" for items). Cute on first read, opaque on second. The user is mid-decision; respect that.
- **Neon-on-black sci-fi crypto dashboards** (the reflex answer to "space theme").
- **Glassmorphic blurred cards** — the 2021 cliché of every space-themed splash page.
- **Gradient text headings, gradient buttons.** Banned outright.
- **Decorative HUD elements** — fake telemetry strings, frame chrome, grid overlays that mean nothing. If a star icon appears, it's a brand mark, not "your data."
- **Animated star fields running constantly.** A static, sparse star pattern in the welcome hero is fine. Nothing twinkles in the working app.
- **Whimsical microcopy** ("Houston, we have a problem!"). Plain wins.

## Strategic principles

1. **The working app stays restrained.** Onboarding can be drenched and atmospheric — a single moment of brand. Configure, Ranking, Score must feel like a competent product UI, with the brand carried by _palette and tone, not vocabulary_.
2. **One bold accent, used sparingly.** Plasma orange marks primary action and rank 1. Electric cyan marks selection and current state. Everything else is tinted twilight neutrals. If three colors are competing, two are wrong.
3. **Numerals are semantic.** Mono for rank positions, scores, session codes — these are coordinates, treat them like coordinates. Body and labels are Inter.
4. **Empty states do the teaching.** No tutorial overlay, no first-run tour with sparkles. The Configure empty state shows what an item and a criterion look like; that's the lesson.
5. **Drag is the headline interaction.** It needs to feel weighted and confident — not bouncy, not floaty. Ease-out, short duration, real cursor feedback.
