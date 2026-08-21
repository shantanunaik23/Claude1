# Kitchen Alchemy

A Little Alchemy–style cooking game. Drag ingredients together, push them through
stations, and discover your way from a raw chicken breast to a plate of chicken bites.

```
chicken breast + chopping station  →  diced chicken
diced chicken + salt + pepper      →  lightly seasoned chicken
lightly seasoned chicken + air fryer →  chicken bites
```

## The model

Three kinds of thing, which is where this diverges from Little Alchemy:

| Kind | Examples | Consumed? |
| --- | --- | --- |
| **Ingredient** | chicken breast, salt, marinara | yes |
| **Station** | chopping board, air fryer, blender | no — they live on the rail and transform what you give them |
| **Dish** | chicken bites, carbonara, pizza | yes (dishes can still be ingredients in bigger dishes) |

There are also **mishaps** — `chicken breast + air fryer` gets you bland chicken,
because you skipped the prep. Failing informatively is more interesting than
nothing happening.

## Combining

- **Two things** — drag one chip onto another on the bench, or onto a station.
- **Three or more** — drop them in the prep bowl, then hit **Mix**, or tap a
  station to apply it to the bowl's contents.

Input order never matters; the engine matches on a sorted key.

## Adding content

Recipes are data, not code. Add an item to `src/data/items.ts` and a line to
`src/data/recipes.ts`:

```ts
{ inputs: ['seasoned_chicken', 'air_fryer'], output: 'chicken_bites' },
```

`npm run check` verifies that every referenced id exists, that no two recipes
share an input set, and that every item is reachable by forward chaining from
the starting pantry — so a typo or an orphaned branch fails the build.

## Running it

```bash
npm install
npm run dev      # http://localhost:5173/Claude1/
npm run build    # data check + typecheck + production build into dist/
```

## Deployment

Pushes to `main` build and publish to GitHub Pages via
`.github/workflows/deploy.yml`. Enable it once under **Settings → Pages →
Build and deployment → Source: GitHub Actions**.

The workflow passes the repository name as `BASE_PATH`, so Vite's `base` follows
a repo rename automatically.
