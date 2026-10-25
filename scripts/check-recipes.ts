import { ITEMS, STARTING_ITEMS } from '../src/data/items.ts';
import { RECIPES } from '../src/data/recipes.ts';

const problems: string[] = [];

// Every id referenced by a recipe must exist.
for (const r of RECIPES) {
  for (const id of [...r.inputs, r.output]) {
    if (!ITEMS.has(id)) problems.push(`recipe references unknown item "${id}"`);
  }
  if (new Set(r.inputs).size !== r.inputs.length) {
    problems.push(`recipe for "${r.output}" repeats an input`);
  }
}

// No two recipes may share an input set.
const seen = new Map<string, string>();
for (const r of RECIPES) {
  const k = [...r.inputs].sort().join('+');
  const prev = seen.get(k);
  if (prev) problems.push(`"${k}" makes both "${prev}" and "${r.output}"`);
  seen.set(k, r.output);
}

// Every item must be reachable by forward chaining from the starting pantry.
const reachable = new Set(STARTING_ITEMS);
for (let changed = true; changed; ) {
  changed = false;
  for (const r of RECIPES) {
    if (!reachable.has(r.output) && r.inputs.every((id) => reachable.has(id))) {
      reachable.add(r.output);
      changed = true;
    }
  }
}
for (const item of ITEMS.values()) {
  if (!reachable.has(item.id)) problems.push(`"${item.id}" is unreachable`);
}

if (problems.length > 0) {
  console.error(problems.map((p) => `  ✗ ${p}`).join('\n'));
  process.exit(1);
}
console.log(`✓ ${RECIPES.length} recipes, ${ITEMS.size} items, all reachable`);
