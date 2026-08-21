import type { Item } from '../types';

const raw: Item[] = [
  // ---------------------------------------------------------------- stations
  { id: 'chopping_board', name: 'Chopping Station', kind: 'station', icon: '🔪', blurb: 'Dices, slices, minces. The start of almost everything.' },
  { id: 'pan', name: 'Frying Pan', kind: 'station', icon: '🍳', blurb: 'High heat, fast results.' },
  { id: 'pot', name: 'Stock Pot', kind: 'station', icon: '🍲', blurb: 'Boiling, simmering, softening.' },
  { id: 'oven', name: 'Oven', kind: 'station', icon: '🔥', blurb: 'Slow, dry, even heat.' },
  { id: 'air_fryer', name: 'Air Fryer', kind: 'station', icon: '🌀', blurb: 'Crisp without the oil bath.' },
  { id: 'grill', name: 'Grill', kind: 'station', icon: '♨️', blurb: 'Char marks and smoke.' },
  { id: 'deep_fryer', name: 'Deep Fryer', kind: 'station', icon: '🛢️', blurb: 'Golden, indulgent, unrepentant.' },
  { id: 'blender', name: 'Blender', kind: 'station', icon: '🌪️', blurb: 'Blitz, whisk, crumb.' },
  { id: 'fridge', name: 'Fridge', kind: 'station', icon: '🧊', blurb: 'Chills, sets, firms up.' },

  // ------------------------------------------------------- base ingredients
  { id: 'chicken_breast', name: 'Chicken Breast', kind: 'ingredient', icon: '🍗' },
  { id: 'beef', name: 'Beef', kind: 'ingredient', icon: '🥩' },
  { id: 'fish', name: 'Fish', kind: 'ingredient', icon: '🐟' },
  { id: 'bacon', name: 'Bacon', kind: 'ingredient', icon: '🥓' },
  { id: 'egg', name: 'Egg', kind: 'ingredient', icon: '🥚' },
  { id: 'flour', name: 'Flour', kind: 'ingredient', icon: '🌾' },
  { id: 'water', name: 'Water', kind: 'ingredient', icon: '💧' },
  { id: 'salt', name: 'Salt', kind: 'ingredient', icon: '🧂' },
  { id: 'black_pepper', name: 'Black Pepper', kind: 'ingredient' },
  { id: 'sugar', name: 'Sugar', kind: 'ingredient' },
  { id: 'butter', name: 'Butter', kind: 'ingredient', icon: '🧈' },
  { id: 'milk', name: 'Milk', kind: 'ingredient', icon: '🥛' },
  { id: 'oil', name: 'Oil', kind: 'ingredient', icon: '🫒' },
  { id: 'potato', name: 'Potato', kind: 'ingredient', icon: '🥔' },
  { id: 'tomato', name: 'Tomato', kind: 'ingredient', icon: '🍅' },
  { id: 'onion', name: 'Onion', kind: 'ingredient', icon: '🧅' },
  { id: 'garlic', name: 'Garlic', kind: 'ingredient', icon: '🧄' },
  { id: 'carrot', name: 'Carrot', kind: 'ingredient', icon: '🥕' },
  { id: 'mushroom', name: 'Mushroom', kind: 'ingredient', icon: '🍄' },
  { id: 'chilli', name: 'Chilli', kind: 'ingredient', icon: '🌶️' },
  { id: 'lemon', name: 'Lemon', kind: 'ingredient', icon: '🍋' },
  { id: 'herbs', name: 'Herbs', kind: 'ingredient', icon: '🌿' },
  { id: 'cheese', name: 'Cheese', kind: 'ingredient', icon: '🧀' },
  { id: 'rice', name: 'Rice', kind: 'ingredient', icon: '🍚' },
  { id: 'cocoa', name: 'Cocoa', kind: 'ingredient' },

  // --------------------------------------------------------------- seasoning
  { id: 'salt_and_pepper', name: 'Salt & Pepper', kind: 'ingredient', blurb: 'The two-ingredient shortcut every cook memorises.' },
  { id: 'herb_rub', name: 'Herb Rub', kind: 'ingredient' },
  { id: 'spicy_rub', name: 'Spicy Rub', kind: 'ingredient' },
  { id: 'minced_garlic', name: 'Minced Garlic', kind: 'ingredient' },
  { id: 'chopped_herbs', name: 'Chopped Herbs', kind: 'ingredient' },
  { id: 'garlic_butter', name: 'Garlic Butter', kind: 'ingredient' },
  { id: 'herb_butter', name: 'Herb Butter', kind: 'ingredient' },

  // ----------------------------------------------------------------- chicken
  { id: 'diced_chicken', name: 'Diced Chicken', kind: 'ingredient' },
  { id: 'seasoned_chicken', name: 'Lightly Seasoned Chicken', kind: 'ingredient' },
  { id: 'coated_chicken', name: 'Breadcrumbed Chicken', kind: 'ingredient' },
  { id: 'chicken_bites', name: 'Chicken Bites', kind: 'dish', icon: '🍗', blurb: 'Crisp outside, juicy inside. The house special.' },
  { id: 'crispy_bites', name: 'Extra Crispy Bites', kind: 'dish', icon: '🍗' },
  { id: 'fried_chicken', name: 'Fried Chicken', kind: 'dish', icon: '🍗' },
  { id: 'grilled_chicken', name: 'Grilled Chicken Breast', kind: 'dish', icon: '🍗' },
  { id: 'bland_chicken', name: 'Bland Chicken', kind: 'mishap', blurb: 'You skipped the seasoning. It shows.' },
  { id: 'burnt_chicken', name: 'Burnt Chicken', kind: 'mishap', blurb: 'Twice through the air fryer. Bold choice.' },

  // -------------------------------------------------------------- dough line
  { id: 'dough', name: 'Dough', kind: 'ingredient' },
  { id: 'bread', name: 'Bread', kind: 'ingredient', icon: '🍞' },
  { id: 'breadcrumbs', name: 'Breadcrumbs', kind: 'ingredient' },
  { id: 'pasta_dough', name: 'Pasta Dough', kind: 'ingredient' },
  { id: 'fresh_pasta', name: 'Fresh Pasta', kind: 'ingredient', icon: '🍝' },
  { id: 'cooked_pasta', name: 'Cooked Pasta', kind: 'ingredient', icon: '🍝' },
  { id: 'pizza_base', name: 'Pizza Base', kind: 'ingredient' },
  { id: 'raw_pizza', name: 'Assembled Pizza', kind: 'ingredient' },
  { id: 'pizza', name: 'Pizza', kind: 'dish', icon: '🍕' },

  // --------------------------------------------------------------- veg & bases
  { id: 'chopped_tomato', name: 'Chopped Tomato', kind: 'ingredient' },
  { id: 'tomato_sauce', name: 'Tomato Sauce', kind: 'ingredient' },
  { id: 'marinara', name: 'Marinara', kind: 'ingredient', blurb: 'Garlic, herbs, patience.' },
  { id: 'diced_onion', name: 'Diced Onion', kind: 'ingredient' },
  { id: 'caramelised_onion', name: 'Caramelised Onion', kind: 'ingredient' },
  { id: 'diced_carrot', name: 'Diced Carrot', kind: 'ingredient' },
  { id: 'aromatics', name: 'Aromatics', kind: 'ingredient', blurb: 'Onion and garlic. Where flavour starts.' },
  { id: 'mirepoix', name: 'Mirepoix', kind: 'ingredient' },
  { id: 'salsa', name: 'Salsa', kind: 'dish', icon: '🥣' },
  { id: 'sliced_mushroom', name: 'Sliced Mushroom', kind: 'ingredient' },
  { id: 'garlic_mushrooms', name: 'Garlic Mushroom Prep', kind: 'ingredient' },
  { id: 'sauteed_mushrooms', name: 'Sautéed Mushrooms', kind: 'dish', icon: '🍄' },

  // -------------------------------------------------------------------- spud
  { id: 'cut_potato', name: 'Cut Potato', kind: 'ingredient' },
  { id: 'seasoned_fries', name: 'Seasoned Cut Potato', kind: 'ingredient' },
  { id: 'fries', name: 'Air Fryer Fries', kind: 'dish', icon: '🍟' },
  { id: 'chips', name: 'Chip Shop Chips', kind: 'dish', icon: '🍟' },
  { id: 'boiled_potato', name: 'Boiled Potato', kind: 'ingredient' },
  { id: 'mashed_potato', name: 'Mashed Potato', kind: 'dish', icon: '🥔' },
  { id: 'soggy_mess', name: 'Soggy Mess', kind: 'mishap', blurb: 'Boiled, then deep fried. Physics said no.' },

  // --------------------------------------------------------------------- egg
  { id: 'beaten_egg', name: 'Beaten Egg', kind: 'ingredient' },
  { id: 'fried_egg', name: 'Fried Egg', kind: 'dish', icon: '🍳' },
  { id: 'scrambled_eggs', name: 'Scrambled Eggs', kind: 'dish', icon: '🍳' },
  { id: 'omelette_mix', name: 'Omelette Mix', kind: 'ingredient' },
  { id: 'omelette', name: 'Omelette', kind: 'dish', icon: '🍳' },
  { id: 'boiled_egg', name: 'Boiled Egg', kind: 'dish', icon: '🥚' },

  // -------------------------------------------------------------------- beef
  { id: 'diced_beef', name: 'Diced Beef', kind: 'ingredient' },
  { id: 'mince', name: 'Mince', kind: 'ingredient' },
  { id: 'seasoned_mince', name: 'Seasoned Mince', kind: 'ingredient' },
  { id: 'cooked_mince', name: 'Browned Mince', kind: 'ingredient' },
  { id: 'bolognese', name: 'Bolognese Sauce', kind: 'ingredient' },
  { id: 'spag_bol', name: 'Spaghetti Bolognese', kind: 'dish', icon: '🍝' },
  { id: 'burger_patty', name: 'Burger Patty', kind: 'ingredient' },
  { id: 'grilled_patty', name: 'Grilled Patty', kind: 'ingredient' },
  { id: 'cheeseburger', name: 'Cheeseburger', kind: 'dish', icon: '🍔' },
  { id: 'seasoned_beef', name: 'Seasoned Beef', kind: 'ingredient' },
  { id: 'steak', name: 'Pan Seared Steak', kind: 'dish', icon: '🥩' },

  // -------------------------------------------------------------------- fish
  { id: 'fish_fillet', name: 'Fish Fillet', kind: 'ingredient' },
  { id: 'seasoned_fish', name: 'Seasoned Fish', kind: 'ingredient' },
  { id: 'floured_fish', name: 'Floured Fish', kind: 'ingredient' },
  { id: 'battered_fish', name: 'Battered Fish', kind: 'ingredient', icon: '🐟' },
  { id: 'fish_and_chips', name: 'Fish & Chips', kind: 'dish', icon: '🐟' },
  { id: 'baked_fish', name: 'Baked Fish', kind: 'dish', icon: '🐟' },
  { id: 'ceviche', name: 'Ceviche', kind: 'dish', icon: '🐟' },

  // -------------------------------------------------------------------- rice
  { id: 'boiled_rice', name: 'Boiled Rice', kind: 'ingredient', icon: '🍚' },
  { id: 'chicken_rice_bowl', name: 'Chicken Rice Bowl', kind: 'dish', icon: '🍚' },
  { id: 'fried_rice_mix', name: 'Fried Rice Mix', kind: 'ingredient' },
  { id: 'fried_rice', name: 'Egg Fried Rice', kind: 'dish', icon: '🍚' },

  // ------------------------------------------------------------------ sweets
  { id: 'cookie_dough', name: 'Cookie Dough', kind: 'ingredient' },
  { id: 'choc_cookie_dough', name: 'Chocolate Cookie Dough', kind: 'ingredient' },
  { id: 'cookies', name: 'Cookies', kind: 'dish', icon: '🍪' },
  { id: 'choc_cookies', name: 'Chocolate Cookies', kind: 'dish', icon: '🍪' },
  { id: 'hot_choc_mix', name: 'Hot Chocolate Mix', kind: 'ingredient' },
  { id: 'hot_chocolate', name: 'Hot Chocolate', kind: 'dish', icon: '☕' },
  { id: 'custard_base', name: 'Custard Base', kind: 'ingredient' },
  { id: 'custard', name: 'Custard', kind: 'ingredient' },
  { id: 'ice_cream', name: 'Ice Cream', kind: 'dish', icon: '🍨' },
  { id: 'batter', name: 'Pancake Batter', kind: 'ingredient' },
  { id: 'pancakes', name: 'Pancakes', kind: 'dish', icon: '🥞' },
  { id: 'lemonade', name: 'Lemonade', kind: 'dish', icon: '🍋' },

  // ------------------------------------------------------------- odds & ends
  { id: 'grated_cheese', name: 'Grated Cheese', kind: 'ingredient' },
  { id: 'buttered_bread', name: 'Buttered Bread', kind: 'ingredient' },
  { id: 'toastie_raw', name: 'Assembled Toastie', kind: 'ingredient' },
  { id: 'grilled_cheese', name: 'Grilled Cheese', kind: 'dish', icon: '🥪' },
  { id: 'crispy_bacon', name: 'Crispy Bacon', kind: 'ingredient', icon: '🥓' },
  { id: 'breakfast_sandwich', name: 'Breakfast Sandwich', kind: 'dish', icon: '🥪' },
  { id: 'carbonara_mix', name: 'Carbonara Mix', kind: 'ingredient' },
  { id: 'carbonara', name: 'Carbonara', kind: 'dish', icon: '🍝' },
  { id: 'garlic_bread', name: 'Garlic Bread', kind: 'dish', icon: '🍞' },
];

export const ITEMS: ReadonlyMap<string, Item> = new Map(raw.map((i) => [i.id, i]));

export const STARTING_ITEMS: readonly string[] = raw
  .filter((i) => i.kind === 'station')
  .map((i) => i.id)
  .concat([
    'chicken_breast', 'beef', 'fish', 'bacon', 'egg', 'flour', 'water',
    'salt', 'black_pepper', 'sugar', 'butter', 'milk', 'oil', 'potato',
    'tomato', 'onion', 'garlic', 'carrot', 'mushroom', 'chilli', 'lemon',
    'herbs', 'cheese', 'rice', 'cocoa',
  ]);

export function getItem(id: string): Item {
  const item = ITEMS.get(id);
  if (!item) throw new Error(`Unknown item id: ${id}`);
  return item;
}
