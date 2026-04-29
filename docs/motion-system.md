# PlayChale Motion System

PlayChale uses Tailwind, shadcn-style components, Radix primitives, and a lightweight CSS motion layer.

## Principles

- Sports feel: quick, tactile, confident.
- Animate `transform`, `opacity`, `background-color`, `border-color`, and `box-shadow` first.
- Avoid layout-heavy animation such as width, height, top, left, or large blur changes unless there is no good alternative.
- Touch devices get press feedback instead of hover choreography.
- Respect `prefers-reduced-motion`.

## Core Classes

- `pc-btn-press`: buttons, links, compact commands.
- `pc-card-lift`: match cards, profile cards, dashboard cards.
- `pc-choice-card`: selectable sport/level/filter choices.
- `pc-icon-kick`: small icon motion inside a hovered/pressed group.
- `pc-motion-enter`: lightweight replacement for modal/step entrance motion.
- `pc-stagger`: small staggered reveal groups.
- `touch-target`: tap delay removal and touch ergonomics.

## Usage Guidance

- Use shadcn components for accessible form/control primitives.
- Use Tailwind utilities for layout and styling.
- Add one PlayChale motion class to the interactive surface rather than stacking multiple ad hoc hover transforms.
- Keep success moments and onboarding transitions richer than basic feed surfaces.
