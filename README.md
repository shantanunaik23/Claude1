# Kitchen Alchemy

A Little Alchemy–style cooking game. Drag ingredients together, push them through
stations, and discover your way from a raw chicken breast to a plate of chicken
bites — or from whole spices to a butter chicken.

348 recipes over 461 items, across two cuisines and three pantry sizes.

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

## Kitchens

Before you start you pick a **cuisine** and a **pantry size**, and the two
together decide which game you are playing.

| | Small | Medium | Large |
| --- | --- | --- | --- |
| **Western** | 16 stocked · 49 to find | 39 stocked · 132 to find | 68 stocked · 238 to find |
| **Indian** | 27 stocked · 50 to find | 57 stocked · 167 to find | 84 stocked · 264 to find |

A smaller pantry is a smaller game, not a broken one: the engine forward-chains
from whatever is stocked and anything it cannot reach simply does not exist in
that kitchen, including in the progress count. Discoveries are saved per
kitchen, so switching cuisine and switching back loses nothing.

The Indian kitchen stocks its own spice rack (turmeric, cumin and coriander
seed, garam masala, hing, curry leaves, amchur, kasuri methi, saffron) and its
own stations — tawa, kadai, pressure cooker, mortar and pestle, steamer,
tandoor. Its tree runs through the real pipeline rather than around it:

```
ghee + cumin seeds                        →  jeera tadka
diced onion + ginger garlic paste + oil   →  onion base
onion base + kadai                        →  bhuna onion
bhuna onion + chopped tomato              →  masala base
masala base + turmeric + chilli powder    →  red masala
red masala + coriander powder             →  curry masala
curry masala + garam masala               →  finished masala
```

From there: butter chicken, rogan josh, chana masala, malai kofta, biryani,
dosa, idli, samosa, pav bhaji, gulab jamun, rasmalai.

## Combining

- **Two things** — drag one chip onto another on the bench, or onto a station.
- **Three or more** — drop them in the prep bowl, then hit **Mix**, or tap a
  station to apply it to the bowl's contents.

Input order never matters; the engine matches on a sorted key.

### Match highlighting

Select something and every target that forms a recipe with it lights up, while
the rest of the pantry fades back. There are two strengths:

- **Solid ring** — a direct two-input partner. Tap or drop it and you get a result.
- **Dashed border** — it only shares a three-input recipe, so it has to go
  through the prep bowl. The bowl itself lights up when the selection appears in
  one.

Turn it off under **⋯ → Highlight matches** if you would rather work it out.

### On a phone

Dragging out of a scrolling pantry fights the scroll, so touch gets a tap
language instead and the whole game is playable without a single drag:

- **Tap a pantry item** to put it on the bench.
- **Tap a bench chip** to select it (it gets a ring), then tap another chip, a
  station, or the prep bowl to combine or move it. Tap empty bench to deselect.
- **Tap a bowl chip** to take it back out — unless something is selected, in
  which case the tap drops the selection in instead.

Dragging still works on the bench, where there is nothing to scroll past.

## Adding content

Recipes are data, not code. `src/data/` holds one module per kitchen —
`core.ts` for what every cuisine stocks, then `western.ts` and `indian.ts` —
each exporting plain items and recipes:

```ts
{ id: 'ghee', name: 'Ghee', kind: 'ingredient', tier: 1 },
{ inputs: ['ghee', 'cumin_seeds'], output: 'jeera_tadka' },
```

`tier` is the smallest pantry that stocks an item (1 = even the small one);
items without a tier are discovered rather than stocked. Cuisine tagging happens
in `src/data/index.ts`, so a cuisine module never repeats itself.

`npm run check` verifies that every referenced id exists, that no two recipes
share an input set or mix two cuisines, that every stocked item is reachable in
the large pantry, and that no smaller pantry collapses to a trivial game. It
prints the table above, and a typo or an orphaned branch fails the build.

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
