export type ItemKind = 'ingredient' | 'station' | 'dish' | 'mishap';

export type CuisineId = 'western' | 'indian';

export type PantrySize = 'small' | 'medium' | 'large';

/** Lowest pantry size that stocks an item. 1 = even the small pantry has it. */
export type Tier = 1 | 2 | 3;

export const SIZE_TIER: Record<PantrySize, Tier> = { small: 1, medium: 2, large: 3 };

export interface Item {
  id: string;
  name: string;
  kind: ItemKind;
  /** Emoji glyph. When absent the UI renders a monogram chip instead. */
  icon?: string;
  /** Flavour text shown in the pantry tooltip and the discovery toast. */
  blurb?: string;
  /** Kitchens that stock this. Absent means every kitchen. */
  cuisines?: CuisineId[];
  /** Present on starting stock only; derived items are discovered, not stocked. */
  tier?: Tier;
}

export interface Recipe {
  inputs: string[];
  output: string;
}

export interface Cuisine {
  id: CuisineId;
  name: string;
  icon: string;
  blurb: string;
}

export const CUISINES: readonly Cuisine[] = [
  {
    id: 'western',
    name: 'Western',
    icon: '🍳',
    blurb: 'Roasts, pasta, pies and puddings. Butter, herbs and dry heat.',
  },
  {
    id: 'indian',
    name: 'Indian',
    icon: '🍛',
    blurb: 'Tadka, masala and dal. Whole spices bloomed in ghee.',
  },
];

export const PANTRY_SIZES: readonly { id: PantrySize; name: string; blurb: string }[] = [
  { id: 'small', name: 'Small', blurb: 'Bare essentials. A tight tree and a real puzzle.' },
  { id: 'medium', name: 'Medium', blurb: 'A well-stocked home kitchen.' },
  { id: 'large', name: 'Large', blurb: 'Everything on the shelf. The full tree.' },
];
