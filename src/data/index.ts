import type { CuisineId, Item, Recipe } from '../types.ts';
import { CORE_ITEMS, CORE_RECIPES } from './core.ts';
import { WESTERN_ITEMS, WESTERN_RECIPES } from './western.ts';
import { INDIAN_ITEMS, INDIAN_RECIPES } from './indian.ts';

const tag = (cuisine: CuisineId, items: Item[]): Item[] =>
  items.map((item) => ({ ...item, cuisines: [cuisine] }));

export const ALL_ITEMS: readonly Item[] = [
  ...CORE_ITEMS,
  ...tag('western', WESTERN_ITEMS),
  ...tag('indian', INDIAN_ITEMS),
];

export const ALL_RECIPES: readonly Recipe[] = [
  ...CORE_RECIPES,
  ...WESTERN_RECIPES,
  ...INDIAN_RECIPES,
];

export const ITEMS: ReadonlyMap<string, Item> = new Map(ALL_ITEMS.map((i) => [i.id, i]));

export function getItem(id: string): Item {
  const item = ITEMS.get(id);
  if (!item) throw new Error(`Unknown item id: ${id}`);
  return item;
}

export function stocksItem(item: Item, cuisine: CuisineId): boolean {
  return item.cuisines === undefined || item.cuisines.includes(cuisine);
}
