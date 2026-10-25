import { ALL_ITEMS, ALL_RECIPES, getItem, stocksItem } from './data/index.ts';
import { SIZE_TIER, type CuisineId, type Item, type PantrySize, type Recipe } from './types.ts';

export interface Config {
  cuisine: CuisineId;
  size: PantrySize;
}

export const configKey = (c: Config) => `${c.cuisine}:${c.size}`;

/**
 * One playable kitchen: the slice of the item and recipe tables that a given
 * cuisine and pantry size can actually reach. Everything the UI asks about —
 * what is stocked, what is discoverable, what pairs with what — is answered
 * from here rather than from the global tables.
 */
export interface Kitchen {
  config: Config;
  /** Items that exist in this kitchen, i.e. reachable from its starting stock. */
  items: Map<string, Item>;
  recipes: Recipe[];
  /** Stocked from the start: stations plus the pantry at this size. */
  starting: string[];
  /** Non-station items that can be discovered here; the denominator for progress. */
  discoverable: number;
  stations: Item[];
  byKey: Map<string, string>;
  /** id → ids that form a two-input recipe with it. Drives match highlighting. */
  partners: Map<string, Set<string>>;
  /** id → ids it shares a three-or-more-input recipe with, i.e. bowl mates. */
  coBowl: Map<string, Set<string>>;
  /** Items that appear in a recipe of three or more inputs, so the bowl matters. */
  multi: Set<string>;
}

const key = (ids: readonly string[]) => [...ids].sort().join('+');

export function buildKitchen(config: Config): Kitchen {
  const maxTier = SIZE_TIER[config.size];
  const stocked = ALL_ITEMS.filter((i) => stocksItem(i, config.cuisine));
  const stockedIds = new Set(stocked.map((i) => i.id));
  const usable = ALL_RECIPES.filter(
    (r) => stockedIds.has(r.output) && r.inputs.every((id) => stockedIds.has(id)),
  );

  const starting = stocked
    .filter((i) => i.tier !== undefined && i.tier <= maxTier)
    .map((i) => i.id);

  // Forward-chain from the starting stock: anything you cannot build does not
  // exist in this kitchen, which is what makes a small pantry a smaller game
  // rather than a broken one.
  const reachable = new Set(starting);
  for (let changed = true; changed; ) {
    changed = false;
    for (const r of usable) {
      if (!reachable.has(r.output) && r.inputs.every((id) => reachable.has(id))) {
        reachable.add(r.output);
        changed = true;
      }
    }
  }

  const recipes = usable.filter((r) => r.inputs.every((id) => reachable.has(id)));
  const items = new Map<string, Item>();
  for (const id of reachable) items.set(id, getItem(id));

  const byKey = new Map<string, string>();
  const partners = new Map<string, Set<string>>();
  const coBowl = new Map<string, Set<string>>();
  const multi = new Set<string>();
  const link = (map: Map<string, Set<string>>, a: string, b: string) => {
    if (!map.has(a)) map.set(a, new Set());
    map.get(a)!.add(b);
  };
  for (const r of recipes) {
    byKey.set(key(r.inputs), r.output);
    if (r.inputs.length === 2) {
      link(partners, r.inputs[0], r.inputs[1]);
      link(partners, r.inputs[1], r.inputs[0]);
    } else {
      for (const a of r.inputs) {
        multi.add(a);
        for (const b of r.inputs) if (a !== b) link(coBowl, a, b);
      }
    }
  }

  const stations = [...items.values()].filter((i) => i.kind === 'station');

  return {
    config,
    items,
    recipes,
    starting,
    discoverable: [...items.values()].filter((i) => i.kind !== 'station').length,
    stations,
    byKey,
    partners,
    coBowl,
    multi,
  };
}

/** Returns the output item id for a set of inputs, or null if it isn't a recipe. */
export function combine(kitchen: Kitchen, inputs: readonly string[]): string | null {
  if (inputs.length < 2) return null;
  return kitchen.byKey.get(key(inputs)) ?? null;
}

const NO_PARTNERS: ReadonlySet<string> = new Set();

export function partnersOf(kitchen: Kitchen, id: string): ReadonlySet<string> {
  return kitchen.partners.get(id) ?? NO_PARTNERS;
}

/** Ids that would sit in the prep bowl alongside this one. */
export function bowlMatesOf(kitchen: Kitchen, id: string): ReadonlySet<string> {
  return kitchen.coBowl.get(id) ?? NO_PARTNERS;
}

/** A recipe the player can make right now but hasn't discovered yet. */
export function findHint(kitchen: Kitchen, discovered: ReadonlySet<string>): Recipe | null {
  const candidates = kitchen.recipes.filter(
    (r) => !discovered.has(r.output) && r.inputs.every((id) => discovered.has(id)),
  );
  if (candidates.length === 0) return null;
  candidates.sort((a, b) => a.inputs.length - b.inputs.length);
  return candidates[0];
}

/** Every known way to make an item, for the recipe book. */
export function recipesFor(kitchen: Kitchen, outputId: string): Recipe[] {
  return kitchen.recipes.filter((r) => r.output === outputId);
}
