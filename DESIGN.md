# Rank Force — Design

## Theme

Dark twilight. The physical scene: small group around a laptop in a dimmed meeting room, screen sometimes projected, deciding which feature ships next. The interface is a quiet ship's HUD — deep enough to disappear into, vivid enough to anchor the conversation.

No light theme. The app is short-session and high-focus; consistency wins over preference.

## Color (OKLCH)

Tinted neutrals — every "neutral" carries a faint hue toward indigo. Never `#000` or `#fff`.

```
--space-0:    oklch(0.14 0.025 270)   /* deep void — bg */
--space-1:    oklch(0.18 0.030 268)   /* surface */
--space-2:    oklch(0.22 0.035 266)   /* elevated surface */
--space-3:    oklch(0.28 0.040 264)   /* hover surface */
--space-4:    oklch(0.36 0.045 262)   /* border */
--space-5:    oklch(0.50 0.040 260)   /* muted text */
--space-6:    oklch(0.74 0.025 258)   /* secondary text */
--cream:      oklch(0.96 0.015 90)    /* primary text — warm */

--plasma:     oklch(0.74 0.180 50)    /* committed accent — primary action, rank 1 */
--plasma-dim: oklch(0.62 0.155 50)    /* hover/pressed */
--plasma-bg:  oklch(0.30 0.080 50)    /* tinted backdrop for plasma badges */

--cyan:       oklch(0.78 0.130 220)   /* state — selection, focus, "current" */
--cyan-bg:    oklch(0.30 0.060 220)

--success:    oklch(0.72 0.140 150)
--danger:     oklch(0.65 0.180 25)
```

### Strategy by surface

- **Onboarding (welcome / briefing):** Drenched. `--space-0` background with a single static, sparse star field; `--plasma` carries the wordmark and primary CTA. One drenched moment — not repeated.
- **App chrome (top bar, page surfaces):** Restrained. `--space-1` body, `--space-2` cards, `--space-4` borders, `--cream` text. `--plasma` only on primary action and rank-1 indicators. `--cyan` only on selected tab, focused input, current dimension.
- **Score readout:** Earned Committed. The page where the score is shown can lean harder on `--plasma` for rank 1, fading toward `--space-6` for lower-ranked items — the color IS the data viz.

### Bans (project-specific, on top of the shared bans)

- No additional accent colors. If something needs emphasis and isn't primary or selection, use weight or scale.
- No `--plasma` on more than ~10% of the surface inside the working app.
- No gradient backgrounds in app chrome. Onboarding may use a single radial twilight gradient.
- No glow / box-shadow with chroma > 0.05. Shadows are dark, not luminous.

## Typography

```
font-sans: 'Inter', -apple-system, BlinkMacSystemFont, system-ui, sans-serif
font-mono: 'JetBrains Mono', ui-monospace, SFMono-Regular, monospace
```

- **Inter** for everything: headings, body, labels, buttons.
- **JetBrains Mono, semantic only**: rank position numerals, scores, session codes, weight values. These are coordinates — they read as fixed-width because they _are_ fixed.
- Scale (rem, fixed): `0.75 / 0.875 / 1 / 1.125 / 1.25 / 1.5 / 2 / 2.75 / 4`. Tight ratio (~1.2) inside the app. Onboarding hero may go to 4rem+.
- Weights: 400 body, 500 labels, 600 headings, 700 hero only.
- Body line length capped at 65–75ch where prose appears (briefing, empty-state coaching). Tables / chrome unconstrained.
- Letter-spacing: `-0.01em` on headings ≥1.25rem; `0.04em` uppercase on small mono labels.

## Layout

- App-wide: single max-width content column at `max-w-5xl` (narrower than the old `max-w-7xl` — less echo, more focus).
- Top bar full-bleed, content padded.
- Spacing scale: `0.25 / 0.5 / 0.75 / 1 / 1.5 / 2 / 3 / 4 / 6 / 8 rem`. Vary it — section gaps wider than card gaps wider than item gaps.
- Cards used only when they group genuinely independent items (a criterion, an item being ranked). No nested cards. Most lists are not cards.
- Border-radius: `--radius: 0.625rem` baseline. Buttons `0.5rem`. Inputs match. Hero CTA on welcome may use `0.75rem`.

## Elevation

Shadows are dark, not luminous. One token, used rarely:

```
--shadow-1: 0 1px 0 0 oklch(0.10 0.02 270 / 0.6), 0 8px 24px -12px oklch(0.05 0.02 270 / 0.8)
```

Most elevation comes from background lightness + 1px border in `--space-4`, not shadow.

## Components

Inherit from shadcn/ui surface — but retune tokens, don't fight the structure.

- **Button (primary):** plasma background, deep cream foreground, no shadow. Hover = `--plasma-dim`. Focus ring = `--cyan` 2px offset.
- **Button (secondary):** `--space-2` bg, cream fg, `--space-4` border. Hover lightens bg by one step.
- **Button (ghost):** transparent, cream fg, hover = `--space-2`.
- **Input:** `--space-1` bg, `--space-4` border, cream fg, mono font when content is numeric. Focus ring `--cyan`.
- **Tabs:** underline style with cyan indicator, not pill style. Active tab = cream + cyan underline. Inactive = `--space-6`.
- **Slider:** `--space-3` track, `--plasma` filled portion, cream knob with subtle border. Used for criterion weight.
- **Badge / chip:** small mono, uppercase 0.75rem, `--space-3` bg, `--space-6` text. Plasma variant for "rank 1" / "highest score."
- **Sortable item (dnd-kit):** `--space-2` bg in default; `--space-3` while dragging with a single 1px `--cyan` left edge (full top-to-bottom border, not a side stripe — the rank index sits in mono on the left).

## Motion

- Most transitions: 180 ms, ease-out (use cubic-bezier(0.22, 1, 0.36, 1), an exponential ease-out).
- Drag pickup: 120 ms scale to 1.02, opacity 0.96. No bounce.
- Drop: 200 ms, ease-out, no overshoot.
- Onboarding hero: a single fade-up of the wordmark + CTA on first paint (400 ms, staggered 60 ms). Nothing else animates ambiently. No twinkling stars.
- Inside the app: motion conveys state (focus, drag, tab change). Decorative motion is banned.

## Iconography

Lucide, single weight (1.5px stroke), `--space-6` default, `--cream` active, `--plasma` for primary action only. No filled icons. No two icon weights mixed.

## Star field (onboarding only)

A static SVG of ~80 dots, varying opacity 0.15–0.6, varying size 1–2.5px, distributed by hand or by a deterministic seed (not randomized per render). No animation, no parallax. Lives only on the welcome screen and the optional briefing screen — not behind the app.

## Naming in code

User-facing vocabulary stays plain — *item, criterion, weight, ranking, score, session, participant*. Internal identifiers match the existing data model (`sessionId`, `userId`, `dimensions`, `items`). The `StarField` / `StarMark` / `MagnitudeIndex` components are visual atoms; their names refer to what they look like, not what users call them.
