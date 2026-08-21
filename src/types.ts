export type ItemKind = 'ingredient' | 'station' | 'dish' | 'mishap';

export interface Item {
  id: string;
  name: string;
  kind: ItemKind;
  /** Emoji glyph. When absent the UI renders a monogram chip instead. */
  icon?: string;
  /** Flavour text shown in the pantry tooltip and the discovery toast. */
  blurb?: string;
}

export interface Recipe {
  inputs: string[];
  output: string;
}
