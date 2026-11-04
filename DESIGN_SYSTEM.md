# Design System — Nebula (dark premium / aurora)

Inspired by a Web3 hero reference. Dark only. Live docs: `/design-system`.

- **Tokens**: `src/app/globals.css` (`@theme`): colors (`bg`, `card`, `violet-*`, `neon-*`, `ink*`, `line*`), radii (`control`, `panel`, `card`, `pill`), type scale (`text-display`, `text-h1`…), shadows, motion. Utilities: `bg-aurora`, `bg-glass`, `text-gradient`.
- **Fonts**: Rubik (display, Hebrew + Latin) and Assistant (body).
- **Components** (`src/components/ui`): `Button` (primary/secondary/ghost), `IconButton`, `Badge`, `Card`/`HeroCard`/`GlassPanel`, `Heading`/`Text`, `Field`/`Input`/`Textarea`, `Modal`, `Section`, `Container`.
- **3D**: `components/visual/HeroVisual` — physics-driven (cannon-es) cluster of rounded cubes that react to the cursor (lazy, pauses offscreen); CSS fallback without WebGL / reduced motion.
- **Rules**: use tokens, not raw colors; use logical RTL classes (`ms-`, `pe-`, `text-start`); keep AA contrast on dark.
