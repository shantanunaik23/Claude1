import { ITEMS, getItem } from './data/items';
import { RECIPES } from './data/recipes';
import type { Recipe } from './types';

const key = (ids: readonly string[]) => [...ids].sort().join('+');

const BY_KEY = new Map<string, string>();
for (const r of RECIPES) {
  const k = key(r.inputs);
  if (BY_KEY.has(k)) throw new Error(`Duplicate recipe for ${k}`);
  for (const id of [...r.inputs, r.output]) getItem(id);
  BY_KEY.set(k, r.output);
}

export const TOTAL_DISCOVERABLE = [...ITEMS.values()].filter((i) => i.kind !== 'station').length;

export const MAX_INPUTS = RECIPES.reduce((n, r) => Math.max(n, r.inputs.length), 0);

/** Returns the output item id for a set of inputs, or null if it isn't a recipe. */
export function combine(inputs: readonly string[]): string | null {
  if (inputs.length < 2) return null;
  return BY_KEY.get(key(inputs)) ?? null;
}

/** True if these inputs are a prefix of some recipe — used to keep the bowl encouraging. */
export function isPartialMatch(inputs: readonly string[]): boolean {
  if (inputs.length === 0) return false;
  return RECIPES.some(
    (r) => r.inputs.length > inputs.length && inputs.every((id) => r.inputs.includes(id)),
  );
}

/** A recipe the player can make right now but hasn't discovered yet. */
export function findHint(discovered: ReadonlySet<string>): Recipe | null {
  const candidates = RECIPES.filter(
    (r) => !discovered.has(r.output) && r.inputs.every((id) => discovered.has(id)),
  );
  if (candidates.length === 0) return null;
  candidates.sort((a, b) => a.inputs.length - b.inputs.length);
  return candidates[0];
}

/** Every known way to make an item, for the recipe book. */
export function recipesFor(outputId: string): Recipe[] {
  return RECIPES.filter((r) => r.output === outputId);
}
