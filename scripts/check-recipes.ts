import { ALL_ITEMS, ALL_RECIPES, ITEMS, stocksItem } from '../src/data/index.ts';
import { buildKitchen } from '../src/engine.ts';
import { CUISINES, PANTRY_SIZES } from '../src/types.ts';

const problems: string[] = [];

// Every id a recipe mentions must exist, and no recipe repeats an input.
for (const r of ALL_RECIPES) {
  for (const id of [...r.inputs, r.output]) {
    if (!ITEMS.has(id)) problems.push(`recipe references unknown item "${id}"`);
  }
  if (new Set(r.inputs).size !== r.inputs.length) {
    problems.push(`recipe for "${r.output}" repeats an input`);
  }
  if (r.inputs.length < 2) problems.push(`recipe for "${r.output}" needs at least two inputs`);
}

// No two recipes may share an input set, or the lookup would be ambiguous.
const seen = new Map<string, string>();
for (const r of ALL_RECIPES) {
  const k = [...r.inputs].sort().join('+');
  const prev = seen.get(k);
  if (prev && prev !== r.output) problems.push(`"${k}" makes both "${prev}" and "${r.output}"`);
  else if (prev) problems.push(`"${k}" is listed twice`);
  seen.set(k, r.output);
}

// Duplicate ids.
const ids = new Set<string>();
for (const item of ALL_ITEMS) {
  if (ids.has(item.id)) problems.push(`duplicate item id "${item.id}"`);
  ids.add(item.id);
}

// A recipe may not mix two cuisines: nothing would ever be able to make it.
for (const r of ALL_RECIPES) {
  const cuisines = new Set<string>();
  for (const id of [...r.inputs, r.output]) {
    for (const c of ITEMS.get(id)?.cuisines ?? []) cuisines.add(c);
  }
  if (cuisines.size > 1) {
    problems.push(`recipe for "${r.output}" mixes cuisines: ${[...cuisines].join(', ')}`);
  }
}

// At the large pantry every stocked item must be reachable; a smaller pantry is
// allowed to reach less, but must still be worth playing.
const report: string[] = [];
for (const cuisine of CUISINES) {
  for (const size of PANTRY_SIZES) {
    const kitchen = buildKitchen({ cuisine: cuisine.id, size: size.id });
    report.push(
      `  ${cuisine.name.padEnd(8)} ${size.name.padEnd(7)} ` +
        `${String(kitchen.starting.length).padStart(3)} stocked  ` +
        `${String(kitchen.discoverable).padStart(3)} discoverable  ` +
        `${String(kitchen.recipes.length).padStart(3)} recipes`,
    );

    if (size.id === 'large') {
      const stocked = ALL_ITEMS.filter((i) => stocksItem(i, cuisine.id));
      for (const item of stocked) {
        if (!kitchen.items.has(item.id)) {
          problems.push(`"${item.id}" is unreachable in the large ${cuisine.id} kitchen`);
        }
      }
    }
    if (kitchen.discoverable < 20) {
      problems.push(
        `the ${size.id} ${cuisine.id} kitchen only reaches ${kitchen.discoverable} items`,
      );
    }
  }
}

if (problems.length > 0) {
  console.error(problems.map((p) => `  ✗ ${p}`).join('\n'));
  console.error(`\n${problems.length} problem(s)`);
  process.exit(1);
}

console.log(report.join('\n'));
console.log(`\n✓ ${ALL_RECIPES.length} recipes, ${ALL_ITEMS.length} items, all reachable`);
