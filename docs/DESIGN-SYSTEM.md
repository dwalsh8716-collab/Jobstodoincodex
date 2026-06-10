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

- `manchester`
- `editorial-green`

Set:

```txt
NEXT_PUBLIC_THEME_PALETTE=editorial-green
```

or change the variables directly.

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

## Codex Continuity

Future Codex sessions should read `AGENTS.md` first. It records the project commands, draft-publishing rules, design-token rules and done criteria so new work does not drift.
