import type { Recipe } from '../types';

/**
 * Order of `inputs` is irrelevant — the engine matches on a sorted key.
 * Two- and three-input recipes are both first class; three-input ones are
 * only reachable through the prep bowl.
 */
export const RECIPES: readonly Recipe[] = [
  // seasoning
  { inputs: ['salt', 'black_pepper'], output: 'salt_and_pepper' },
  { inputs: ['salt_and_pepper', 'herbs'], output: 'herb_rub' },
  { inputs: ['salt_and_pepper', 'chilli'], output: 'spicy_rub' },
  { inputs: ['garlic', 'chopping_board'], output: 'minced_garlic' },
  { inputs: ['herbs', 'chopping_board'], output: 'chopped_herbs' },
  { inputs: ['minced_garlic', 'butter'], output: 'garlic_butter' },
  { inputs: ['garlic_butter', 'chopped_herbs'], output: 'herb_butter' },

  // chicken
  { inputs: ['chicken_breast', 'chopping_board'], output: 'diced_chicken' },
  { inputs: ['diced_chicken', 'salt', 'black_pepper'], output: 'seasoned_chicken' },
  { inputs: ['diced_chicken', 'salt_and_pepper'], output: 'seasoned_chicken' },
  { inputs: ['seasoned_chicken', 'air_fryer'], output: 'chicken_bites' },
  { inputs: ['seasoned_chicken', 'breadcrumbs'], output: 'coated_chicken' },
  { inputs: ['coated_chicken', 'air_fryer'], output: 'crispy_bites' },
  { inputs: ['coated_chicken', 'deep_fryer'], output: 'fried_chicken' },
  { inputs: ['chicken_breast', 'salt_and_pepper'], output: 'seasoned_chicken' },
  { inputs: ['seasoned_chicken', 'grill'], output: 'grilled_chicken' },
  { inputs: ['chicken_breast', 'air_fryer'], output: 'bland_chicken' },
  { inputs: ['bland_chicken', 'air_fryer'], output: 'burnt_chicken' },

  // dough
  { inputs: ['flour', 'water'], output: 'dough' },
  { inputs: ['dough', 'oven'], output: 'bread' },
  { inputs: ['bread', 'blender'], output: 'breadcrumbs' },
  { inputs: ['dough', 'egg'], output: 'pasta_dough' },
  { inputs: ['pasta_dough', 'chopping_board'], output: 'fresh_pasta' },
  { inputs: ['fresh_pasta', 'pot'], output: 'cooked_pasta' },
  { inputs: ['dough', 'oil'], output: 'pizza_base' },
  { inputs: ['pizza_base', 'tomato_sauce', 'cheese'], output: 'raw_pizza' },
  { inputs: ['raw_pizza', 'oven'], output: 'pizza' },
  { inputs: ['bread', 'garlic_butter'], output: 'garlic_bread' },

  // veg
  { inputs: ['tomato', 'chopping_board'], output: 'chopped_tomato' },
  { inputs: ['chopped_tomato', 'pot'], output: 'tomato_sauce' },
  { inputs: ['tomato_sauce', 'minced_garlic', 'herbs'], output: 'marinara' },
  { inputs: ['onion', 'chopping_board'], output: 'diced_onion' },
  { inputs: ['diced_onion', 'pan'], output: 'caramelised_onion' },
  { inputs: ['carrot', 'chopping_board'], output: 'diced_carrot' },
  { inputs: ['diced_onion', 'minced_garlic'], output: 'aromatics' },
  { inputs: ['aromatics', 'diced_carrot'], output: 'mirepoix' },
  { inputs: ['chopped_tomato', 'diced_onion', 'chilli'], output: 'salsa' },
  { inputs: ['mushroom', 'chopping_board'], output: 'sliced_mushroom' },
  { inputs: ['sliced_mushroom', 'butter', 'minced_garlic'], output: 'garlic_mushrooms' },
  { inputs: ['garlic_mushrooms', 'pan'], output: 'sauteed_mushrooms' },

  // potato
  { inputs: ['potato', 'chopping_board'], output: 'cut_potato' },
  { inputs: ['cut_potato', 'oil', 'salt'], output: 'seasoned_fries' },
  { inputs: ['seasoned_fries', 'air_fryer'], output: 'fries' },
  { inputs: ['seasoned_fries', 'deep_fryer'], output: 'chips' },
  { inputs: ['potato', 'pot'], output: 'boiled_potato' },
  { inputs: ['boiled_potato', 'butter', 'milk'], output: 'mashed_potato' },
  { inputs: ['boiled_potato', 'deep_fryer'], output: 'soggy_mess' },

  // egg
  { inputs: ['egg', 'pan'], output: 'fried_egg' },
  { inputs: ['egg', 'blender'], output: 'beaten_egg' },
  { inputs: ['beaten_egg', 'pan'], output: 'scrambled_eggs' },
  { inputs: ['beaten_egg', 'cheese', 'herbs'], output: 'omelette_mix' },
  { inputs: ['omelette_mix', 'pan'], output: 'omelette' },
  { inputs: ['egg', 'pot'], output: 'boiled_egg' },

  // beef
  { inputs: ['beef', 'chopping_board'], output: 'diced_beef' },
  { inputs: ['diced_beef', 'blender'], output: 'mince' },
  { inputs: ['mince', 'salt_and_pepper'], output: 'seasoned_mince' },
  { inputs: ['seasoned_mince', 'pan'], output: 'cooked_mince' },
  { inputs: ['cooked_mince', 'marinara'], output: 'bolognese' },
  { inputs: ['bolognese', 'cooked_pasta'], output: 'spag_bol' },
  { inputs: ['seasoned_mince', 'egg'], output: 'burger_patty' },
  { inputs: ['burger_patty', 'grill'], output: 'grilled_patty' },
  { inputs: ['grilled_patty', 'bread', 'cheese'], output: 'cheeseburger' },
  { inputs: ['beef', 'salt_and_pepper'], output: 'seasoned_beef' },
  { inputs: ['seasoned_beef', 'pan'], output: 'steak' },

  // fish
  { inputs: ['fish', 'chopping_board'], output: 'fish_fillet' },
  { inputs: ['fish_fillet', 'salt_and_pepper'], output: 'seasoned_fish' },
  { inputs: ['seasoned_fish', 'flour'], output: 'floured_fish' },
  { inputs: ['floured_fish', 'deep_fryer'], output: 'battered_fish' },
  { inputs: ['battered_fish', 'chips'], output: 'fish_and_chips' },
  { inputs: ['seasoned_fish', 'oven'], output: 'baked_fish' },
  { inputs: ['fish_fillet', 'lemon', 'salt'], output: 'ceviche' },

  // rice
  { inputs: ['rice', 'pot'], output: 'boiled_rice' },
  { inputs: ['boiled_rice', 'chicken_bites'], output: 'chicken_rice_bowl' },
  { inputs: ['boiled_rice', 'aromatics', 'beaten_egg'], output: 'fried_rice_mix' },
  { inputs: ['fried_rice_mix', 'pan'], output: 'fried_rice' },

  // sweets
  { inputs: ['flour', 'sugar', 'butter'], output: 'cookie_dough' },
  { inputs: ['cookie_dough', 'oven'], output: 'cookies' },
  { inputs: ['cookie_dough', 'cocoa'], output: 'choc_cookie_dough' },
  { inputs: ['choc_cookie_dough', 'oven'], output: 'choc_cookies' },
  { inputs: ['milk', 'cocoa', 'sugar'], output: 'hot_choc_mix' },
  { inputs: ['hot_choc_mix', 'pot'], output: 'hot_chocolate' },
  { inputs: ['milk', 'sugar', 'egg'], output: 'custard_base' },
  { inputs: ['custard_base', 'pot'], output: 'custard' },
  { inputs: ['custard', 'fridge'], output: 'ice_cream' },
  { inputs: ['flour', 'egg', 'milk'], output: 'batter' },
  { inputs: ['batter', 'pan'], output: 'pancakes' },
  { inputs: ['lemon', 'sugar', 'water'], output: 'lemonade' },

  // odds & ends
  { inputs: ['cheese', 'chopping_board'], output: 'grated_cheese' },
  { inputs: ['bread', 'butter'], output: 'buttered_bread' },
  { inputs: ['buttered_bread', 'grated_cheese'], output: 'toastie_raw' },
  { inputs: ['toastie_raw', 'pan'], output: 'grilled_cheese' },
  { inputs: ['bacon', 'pan'], output: 'crispy_bacon' },
  { inputs: ['crispy_bacon', 'fried_egg', 'bread'], output: 'breakfast_sandwich' },
  { inputs: ['cooked_pasta', 'beaten_egg', 'crispy_bacon'], output: 'carbonara_mix' },
  { inputs: ['carbonara_mix', 'pan'], output: 'carbonara' },
];
