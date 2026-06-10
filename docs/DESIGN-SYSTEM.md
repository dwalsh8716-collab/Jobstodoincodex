# Design System

The design system is intentionally centralised.

## Where To Change Visual Style

Edit:

```txt
src/styles/theme.css
```

This file controls:

- Colours
- Typography families
- Spacing
- Border radius
- Shadows
- Surfaces
- Button contrast
- Accent rules

## Palette Switching

Default palette is a premium graphite/cobalt/copper direction.

Alternative palettes already exist:

- `editorial-green`

Set:

```txt
NEXT_PUBLIC_THEME_PALETTE=editorial-green
```

or change the variables directly.

Keep the graphite/cobalt/copper palette as the production default unless David asks for a change. Do not switch the site to a Manchester red/yellow palette.

Tailwind is configured in:

```txt
tailwind.config.ts
```

It maps utility colours and radii back to the same CSS variables, so Tailwind usage and the existing class-based design system do not drift apart.

## Reusable UI Primitives

Shared primitives live in:

```txt
src/components/ui/Primitives.tsx
```

Use these for new buttons, cards, badges, sections, form labels, errors and loading states before inventing another one-off pattern.

## Rich Media

Reusable rich media component:

```txt
src/components/RichMedia.tsx
```

Supports:

- YouTube
- Vimeo
- Images
- Galleries

Sanity fields live in:

```txt
sanity/schemas/index.ts
```

Look for:

- `videoBlock`
- `mediaFeature`
- `gallery`

## Visual QA Page

Open:

```txt
/design-system
```

This page shows:

- Colour tokens
- Buttons
- Cards
- Rich media
- Salary table
- Form pattern

It is noindexed.

## Final Polish Record

The latest visual audit, page-level summary, asset gaps and future design roadmap are tracked in:

```txt
docs/VISUAL-DESIGN-POLISH.md
```

## Codex Continuity

Future Codex sessions should read `AGENTS.md` first. It records the project commands, draft-publishing rules, design-token rules and done criteria so new work does not drift.
