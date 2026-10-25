import './styles.css';
import { getItem } from './data/index.ts';
import {
  buildKitchen,
  combine,
  findHint,
  bowlMatesOf,
  partnersOf,
  recipesFor,
  type Config,
  type Kitchen,
} from './engine.ts';
import { beginDrag, initDrag, type DragPayload } from './drag.ts';
import { GameState } from './state.ts';
import {
  CUISINES,
  PANTRY_SIZES,
  type CuisineId,
  type Item,
  type ItemKind,
  type PantrySize,
} from './types.ts';

const state = new GameState();
state.load();
const firstRun = !state.configured;

let kitchen: Kitchen = buildKitchen(state.config);

// ---------------------------------------------------------------- shell

const app = document.querySelector<HTMLDivElement>('#app')!;
app.innerHTML = `
  <header class="topbar">
    <div class="brand">
      <span class="brand-mark" id="brand-mark">🍳</span>
      <h1>Kitchen Alchemy</h1>
    </div>
    <div class="progress">
      <div class="progress-bar"><span id="progress-fill"></span></div>
      <span id="progress-label"></span>
    </div>
    <div class="topbar-actions">
      <button id="kitchen-btn" class="btn btn-kitchen"></button>
      <button id="hint-btn" class="btn">Hint</button>
      <details class="menu" id="menu">
        <summary class="btn" title="More actions">⋯</summary>
        <div class="menu-pop">
          <button id="book-btn">Recipe Book</button>
          <button id="highlight-btn">Highlight matches</button>
          <button id="clear-btn">Clear Bench</button>
          <button id="reset-btn">Reset This Kitchen</button>
        </div>
      </details>
    </div>
  </header>

  <main class="layout">
    <section class="bench" id="board" data-drop="board">
      <p class="bench-hint">
        <span class="hint-pointer">Drag an ingredient from the pantry onto the bench.<br/>
        Drop one item onto another to combine, or onto a station to cook it.</span>
        <span class="hint-touch">Tap an ingredient to put it on the bench.<br/>
        Tap a chip to select it, then tap another chip, a station, or the bowl.</span>
      </p>
    </section>

    <aside class="pantry" data-drop="pantry">
      <div class="pantry-head">
        <input id="search" type="search" placeholder="Search pantry…" autocomplete="off" />
        <div class="filters" id="filters"></div>
      </div>
      <div class="pantry-grid" id="pantry-grid"></div>
    </aside>
  </main>

  <footer class="rail">
    <div class="bowl-wrap">
      <div class="bowl" id="bowl" data-drop="bowl">
        <span class="bowl-label">Prep Bowl</span>
        <div class="bowl-items" id="bowl-items"></div>
      </div>
      <button id="mix-btn" class="btn btn-primary">Mix</button>
    </div>
    <div class="stations" id="stations"></div>
  </footer>

  <div class="toasts" id="toasts"></div>

  <div class="modal" id="book" hidden>
    <div class="modal-card">
      <div class="modal-head"><h2>Recipe Book</h2><button id="book-close" class="btn btn-quiet">Close</button></div>
      <div class="modal-body" id="book-body"></div>
    </div>
  </div>

  <div class="modal" id="setup" hidden>
    <div class="modal-card">
      <div class="modal-head">
        <h2>Choose your kitchen</h2>
        <button id="setup-close" class="btn btn-quiet" hidden>Close</button>
      </div>
      <div class="modal-body">
        <h3>Cuisine</h3>
        <div class="choices" id="cuisine-choices"></div>
        <h3>Pantry size</h3>
        <div class="choices" id="size-choices"></div>
        <p class="setup-summary" id="setup-summary"></p>
        <button class="btn btn-primary setup-go" id="setup-go">Start cooking</button>
      </div>
    </div>
  </div>
`;

const board = document.querySelector<HTMLElement>('#board')!;
const benchHint = document.querySelector<HTMLElement>('.bench-hint')!;
const pantryGrid = document.querySelector<HTMLElement>('#pantry-grid')!;
const bowlEl = document.querySelector<HTMLElement>('#bowl')!;
const bowlItems = document.querySelector<HTMLElement>('#bowl-items')!;
const stationsEl = document.querySelector<HTMLElement>('#stations')!;
const toasts = document.querySelector<HTMLElement>('#toasts')!;
const searchInput = document.querySelector<HTMLInputElement>('#search')!;
const filtersEl = document.querySelector<HTMLElement>('#filters')!;
const bookEl = document.querySelector<HTMLElement>('#book')!;
const bookBody = document.querySelector<HTMLElement>('#book-body')!;
const setupEl = document.querySelector<HTMLElement>('#setup')!;
const menu = document.querySelector<HTMLDetailsElement>('#menu')!;

/**
 * Tap-to-combine: on touch there is no room to drag from the pantry without
 * fighting the scroll, so a bench chip can be selected and then a second target
 * tapped. Pointer users can ignore this entirely and keep dragging.
 */
let selectedUid: number | null = null;

const NO_MATCHES: ReadonlySet<string> = new Set();
/** Ids that pair with the current selection; drives the match highlighting. */
let matches: ReadonlySet<string> = NO_MATCHES;
/** Ids that only work with the selection via a three-input bowl recipe. */
let mates: ReadonlySet<string> = NO_MATCHES;
let bowlMatches = false;

// ---------------------------------------------------------------- chip DOM

function iconMarkup(item: Item): string {
  if (item.icon) return `<span class="icon">${item.icon}</span>`;
  const initials = item.name
    .replace(/[^A-Za-z ]/g, '')
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0].toUpperCase())
    .join('');
  let hash = 0;
  for (const ch of item.id) hash = (hash * 31 + ch.charCodeAt(0)) % 360;
  return `<span class="icon monogram" style="--hue:${hash}">${initials}</span>`;
}

function chipEl(item: Item, extraClass = ''): HTMLElement {
  const el = document.createElement('div');
  el.className = `chip chip-${item.kind} ${extraClass}`.trim();
  el.dataset.item = item.id;
  el.innerHTML = `${iconMarkup(item)}<span class="label">${item.name}</span>`;
  el.title = item.blurb ?? item.name;
  return el;
}

/**
 * `dim` marks sources that physically occupy a slot (bench chips, bowl chips) so
 * they fade and stop intercepting hit-tests while being dragged. Pantry tiles are
 * an infinite supply and stay solid.
 */
function dragSource(el: HTMLElement, payload: () => DragPayload, item: Item, dim = false): void {
  el.addEventListener('pointerdown', (e) =>
    beginDrag(e, payload(), () => chipEl(item), dim ? el : null),
  );
}

// ---------------------------------------------------------------- rendering

type Filter = ItemKind | 'all';
let filter: Filter = 'all';
let query = '';

const FILTERS: { id: Filter; label: string }[] = [
  { id: 'all', label: 'All' },
  { id: 'ingredient', label: 'Ingredients' },
  { id: 'dish', label: 'Dishes' },
  { id: 'mishap', label: 'Mishaps' },
];

function renderFilters(): void {
  filtersEl.replaceChildren(
    ...FILTERS.map(({ id, label }) => {
      const b = document.createElement('button');
      b.className = `filter${filter === id ? ' is-active' : ''}`;
      b.textContent = label;
      b.addEventListener('click', () => {
        filter = id;
        renderFilters();
        renderPantry();
      });
      return b;
    }),
  );
}

function renderPantry(): void {
  const items = [...kitchen.items.values()]
    .filter((i) => i.kind !== 'station' && state.discovered.has(i.id))
    .filter((i) => filter === 'all' || i.kind === filter)
    .filter((i) => i.name.toLowerCase().includes(query))
    .sort((a, b) => a.name.localeCompare(b.name));

  if (items.length === 0) {
    pantryGrid.innerHTML = `<p class="empty">Nothing here yet.</p>`;
    return;
  }

  pantryGrid.replaceChildren(
    ...items.map((item) => {
      const el = chipEl(item, 'chip-tile');
      dragSource(el, () => ({ itemId: item.id, fromUid: null, fromBowl: null }), item);
      return el;
    }),
  );
  paintHints();
}

function renderStations(): void {
  stationsEl.replaceChildren(
    ...kitchen.stations.map((item) => {
      const el = chipEl(item, 'chip-tile station-tile');
      el.dataset.drop = 'station';
      el.dataset.id = item.id;
      el.addEventListener('click', () => useStation(item.id));
      return el;
    }),
  );
  paintHints();
}

function renderBoard(): void {
  if (selectedUid !== null && !state.chip(selectedUid)) selectedUid = null;
  document.body.classList.toggle('has-selection', selectedUid !== null);
  benchHint.hidden = state.board.length > 0;

  for (const el of board.querySelectorAll('.chip')) el.remove();
  for (const chip of state.board) {
    const item = getItem(chip.itemId);
    const el = chipEl(item, 'chip-board');
    el.dataset.drop = 'chip';
    el.dataset.uid = String(chip.uid);
    el.classList.toggle('is-selected', chip.uid === selectedUid);
    el.style.left = `${chip.x}px`;
    el.style.top = `${chip.y}px`;
    dragSource(el, () => ({ itemId: chip.itemId, fromUid: chip.uid, fromBowl: null }), item, true);
    board.appendChild(el);
  }
  settleChips();
  updateMatches();
}

/**
 * Chips are positioned by their centre, so a point-clamp still lets a wide one
 * hang off the edge. Measure the rendered width and pull it fully inside — this
 * is what keeps the bench tidy after a rotate.
 */
function settleChips(): void {
  const rect = board.getBoundingClientRect();
  if (rect.width === 0) return;
  for (const el of board.querySelectorAll<HTMLElement>('.chip-board')) {
    const chip = state.chip(Number(el.dataset.uid));
    if (!chip) continue;
    const halfW = el.offsetWidth / 2 + 4;
    const halfH = el.offsetHeight / 2 + 4;
    const x = clamp(chip.x, halfW, rect.width - halfW);
    const y = clamp(chip.y, halfH, rect.height - halfH);
    if (x !== chip.x || y !== chip.y) {
      chip.x = x;
      chip.y = y;
      el.style.left = `${x}px`;
      el.style.top = `${y}px`;
    }
  }
}

function renderBowl(): void {
  if (state.bowl.length === 0) {
    bowlItems.innerHTML =
      `<p class="empty">` +
      `<span class="hint-pointer">Drop 2 or more things here, then Mix — or tap a station.</span>` +
      `<span class="hint-touch">Add 2 or more, then Mix.</span>` +
      `</p>`;
  } else {
    bowlItems.replaceChildren(
      ...state.bowl.map((id, index) => {
        const item = getItem(id);
        const el = chipEl(item, 'chip-tile');
        dragSource(el, () => ({ itemId: id, fromUid: null, fromBowl: index }), item, true);
        return el;
      }),
    );
  }
  paintHints();
}

function renderProgress(): void {
  const found = [...state.discovered].filter((id) => getItem(id).kind !== 'station').length;
  const pct = Math.round((found / kitchen.discoverable) * 100);
  document.querySelector<HTMLElement>('#progress-fill')!.style.width = `${pct}%`;
  document.querySelector<HTMLElement>('#progress-label')!.innerHTML =
    `${found}<span class="sep"> / </span>${kitchen.discoverable}<span class="progress-word"> discovered</span>`;
}

function renderKitchenBadge(): void {
  const cuisine = CUISINES.find((c) => c.id === state.config.cuisine)!;
  const size = PANTRY_SIZES.find((s) => s.id === state.config.size)!;
  document.querySelector<HTMLElement>('#brand-mark')!.textContent = cuisine.icon;
  document.querySelector<HTMLElement>('#kitchen-btn')!.innerHTML =
    `<span class="kitchen-name">${cuisine.name}</span>` +
    `<span class="kitchen-size">${size.name}</span>`;
  document.querySelector<HTMLElement>('#highlight-btn')!.textContent =
    `Highlight matches: ${state.highlight ? 'On' : 'Off'}`;
}

function renderAll(): void {
  renderBoard();
  renderBowl();
  renderPantry();
  renderProgress();
  renderKitchenBadge();
}

function setSelected(uid: number | null): void {
  selectedUid = uid;
  renderBoard();
}

// -------------------------------------------------------- match highlighting

function updateMatches(): void {
  const chip = selectedUid !== null ? state.chip(selectedUid) : null;
  matches = chip ? partnersOf(kitchen, chip.itemId) : NO_MATCHES;
  mates = chip ? bowlMatesOf(kitchen, chip.itemId) : NO_MATCHES;
  bowlMatches = chip ? kitchen.multi.has(chip.itemId) : false;
  paintHints();
}

/**
 * Marks every target that forms a recipe with the selection and lets CSS fade
 * the rest. A direct two-input partner is a full match; something that only
 * shares a three-input recipe is marked softer, because it needs the bowl.
 * Classes are painted over the live DOM rather than re-rendering, so selecting
 * something never rebuilds a 200-chip pantry.
 */
function paintHints(): void {
  const on = state.highlight && selectedUid !== null;
  document.body.classList.toggle('hinting', on);
  const chips = document.querySelectorAll<HTMLElement>(
    '#pantry-grid .chip, #stations .chip, #board .chip, #bowl-items .chip',
  );
  for (const el of chips) {
    const id = el.dataset.item ?? '';
    const direct = on && matches.has(id);
    el.classList.toggle('is-match', direct);
    el.classList.toggle('is-mate', on && !direct && mates.has(id));
  }
  bowlEl.classList.toggle('is-match', on && bowlMatches);
}

// ---------------------------------------------------------------- feedback

function toast(message: string, variant: 'info' | 'discovery' | 'fail' = 'info'): void {
  const el = document.createElement('div');
  el.className = `toast toast-${variant}`;
  el.textContent = message;
  toasts.appendChild(el);
  // A tall stack would swallow the bench on a phone, so keep only the newest.
  while (toasts.childElementCount > 3) toasts.firstElementChild!.remove();
  setTimeout(() => {
    el.classList.add('is-leaving');
    setTimeout(() => el.remove(), 300);
  }, 2600);
}

function nudge(uid: number): void {
  board.querySelector(`.chip[data-uid="${uid}"]`)?.classList.add('shake');
  setTimeout(() => board.querySelector(`.chip[data-uid="${uid}"]`)?.classList.remove('shake'), 400);
}

// ---------------------------------------------------------------- placement

const clamp = (n: number, lo: number, hi: number) => Math.min(Math.max(n, lo), Math.max(lo, hi));

function boardPoint(clientX: number, clientY: number): { x: number; y: number } {
  const rect = board.getBoundingClientRect();
  return {
    x: clamp(clientX - rect.left, 8, rect.width - 8),
    y: clamp(clientY - rect.top, 8, rect.height - 8),
  };
}

function freeSpot(): { x: number; y: number } {
  const rect = board.getBoundingClientRect();
  for (let tries = 0; tries < 30; tries++) {
    const x = rect.width * (0.15 + Math.random() * 0.6);
    const y = rect.height * (0.15 + Math.random() * 0.6);
    if (state.board.every((c) => Math.hypot(c.x - x, c.y - y) > 70)) return { x, y };
  }
  return { x: rect.width / 2, y: rect.height / 2 };
}

// ---------------------------------------------------------------- combining

function attempt(inputs: string[], consumeUids: number[], at: { x: number; y: number }): void {
  const result = combine(kitchen, inputs);
  if (!result) {
    const names = inputs.map((id) => getItem(id).name).join(' + ');
    toast(`${names} — nothing comes of that.`, 'fail');
    for (const uid of consumeUids) nudge(uid);
    return;
  }

  for (const uid of consumeUids) state.removeChip(uid);
  state.addChip(result, at.x, at.y);

  const item = getItem(result);
  const isNew = state.discover(result);
  renderAll();

  board.querySelector(`.chip[data-uid="${state.board.at(-1)!.uid}"]`)?.classList.add('pop');

  if (isNew) {
    toast(`New: ${item.name}${item.blurb ? ` — ${item.blurb}` : ''}`, 'discovery');
  } else {
    toast(item.name);
  }
}

/** A station applies to the selected bench chip if there is one, else to the bowl. */
function useStation(stationId: string): void {
  if (selectedUid !== null) {
    const chip = state.chip(selectedUid);
    selectedUid = null;
    if (chip) {
      attempt([chip.itemId, stationId], [chip.uid], { x: chip.x, y: chip.y });
      return;
    }
    renderBoard();
  }

  if (state.bowl.length === 0) {
    toast('Select something on the bench, or fill the prep bowl first.', 'fail');
    return;
  }
  const inputs = [...state.bowl, stationId];
  const spot = freeSpot();
  if (combine(kitchen, inputs)) state.bowl = [];
  attempt(inputs, [], spot);
  renderBowl();
}

function mixBowl(): void {
  if (state.bowl.length < 2) {
    toast('The bowl needs at least two things.', 'fail');
    return;
  }
  const inputs = [...state.bowl];
  const spot = freeSpot();
  if (combine(kitchen, inputs)) state.bowl = [];
  attempt(inputs, [], spot);
  renderBowl();
}

// ---------------------------------------------------------------- drag wiring

/** Moves the selected bench chip into the prep bowl. Returns false if nothing was selected. */
function bowlTakeSelection(): boolean {
  if (selectedUid === null) return false;
  const chip = state.chip(selectedUid);
  selectedUid = null;
  if (chip) {
    state.bowl.push(chip.itemId);
    state.removeChip(chip.uid);
    renderBowl();
  }
  renderBoard();
  return true;
}

initDrag({
  onClick(payload) {
    if (payload.fromBowl !== null) {
      // A selection outranks remove-on-tap: the bowl strip is mostly chips on a
      // phone, so tapping one is far more likely to mean "put it here".
      if (bowlTakeSelection()) return;
      state.bowl.splice(payload.fromBowl, 1);
      renderBowl();
      return;
    }

    // Pantry tap: put a copy on the bench.
    if (payload.fromUid === null) {
      const spot = freeSpot();
      state.addChip(payload.itemId, spot.x, spot.y);
      renderBoard();
      return;
    }

    // Bench tap: select, deselect, or combine with whatever is already selected.
    const tapped = payload.fromUid;
    if (selectedUid === null || selectedUid === tapped) {
      setSelected(selectedUid === tapped ? null : tapped);
      return;
    }
    const first = state.chip(selectedUid);
    const second = state.chip(tapped);
    selectedUid = null;
    if (!first || !second) {
      renderBoard();
      return;
    }
    attempt([first.itemId, second.itemId], [first.uid, second.uid], { x: second.x, y: second.y });
  },

  onDrop(payload, target, x, y) {
    if (selectedUid !== null) setSelected(null);
    const drop = target instanceof HTMLElement ? target.dataset.drop : undefined;

    if (drop === 'chip') {
      const uid = Number(target instanceof HTMLElement ? target.dataset.uid : NaN);
      const other = state.chip(uid);
      if (!other || uid === payload.fromUid) return;
      const consume = payload.fromUid !== null ? [payload.fromUid, uid] : [uid];
      if (payload.fromBowl !== null) state.bowl.splice(payload.fromBowl, 1);
      attempt([payload.itemId, other.itemId], consume, { x: other.x, y: other.y });
      renderBowl();
      return;
    }

    if (drop === 'station') {
      const stationId = target instanceof HTMLElement ? (target.dataset.id ?? '') : '';
      const origin = payload.fromUid !== null ? state.chip(payload.fromUid) : null;
      const spot = origin ? { x: origin.x, y: origin.y } : freeSpot();
      if (payload.fromBowl !== null) state.bowl.splice(payload.fromBowl, 1);
      attempt([payload.itemId, stationId], payload.fromUid !== null ? [payload.fromUid] : [], spot);
      renderBowl();
      return;
    }

    if (drop === 'bowl') {
      if (getItem(payload.itemId).kind === 'station') {
        toast('Stations stay on the rail — tap one to use it on the bowl.', 'fail');
        return;
      }
      if (payload.fromBowl !== null) return;
      state.bowl.push(payload.itemId);
      if (payload.fromUid !== null) state.removeChip(payload.fromUid);
      renderBoard();
      renderBowl();
      return;
    }

    if (drop === 'pantry') {
      if (payload.fromUid !== null) {
        state.removeChip(payload.fromUid);
        renderBoard();
      }
      if (payload.fromBowl !== null) {
        state.bowl.splice(payload.fromBowl, 1);
        renderBowl();
      }
      return;
    }

    if (drop === 'board') {
      const spot = boardPoint(x, y);
      if (payload.fromUid !== null) {
        const chip = state.chip(payload.fromUid);
        if (chip) Object.assign(chip, spot);
      } else {
        if (payload.fromBowl !== null) state.bowl.splice(payload.fromBowl, 1);
        state.addChip(payload.itemId, spot.x, spot.y);
        renderBowl();
      }
      renderBoard();
    }
  },
});

// ---------------------------------------------------------------- book

function renderBook(): void {
  const known = [...kitchen.items.values()].filter(
    (i) => i.kind !== 'station' && state.discovered.has(i.id),
  );
  const groups: { kind: ItemKind; title: string }[] = [
    { kind: 'ingredient', title: 'Ingredients & Prep' },
    { kind: 'dish', title: 'Dishes' },
    { kind: 'mishap', title: 'Mishaps' },
  ];

  bookBody.innerHTML = groups
    .map(({ kind, title }) => {
      const rows = known
        .filter((i) => i.kind === kind)
        .sort((a, b) => a.name.localeCompare(b.name))
        .map((item) => {
          const ways = recipesFor(kitchen, item.id)
            .map((r) => r.inputs.map((id) => getItem(id).name).join(' + '))
            .join('<br/>');
          return `<tr><th>${item.name}</th><td>${ways || '<em>a pantry staple</em>'}</td></tr>`;
        })
        .join('');
      return rows ? `<h3>${title}</h3><table class="book-table">${rows}</table>` : '';
    })
    .join('');
}

// ---------------------------------------------------------------- setup

let draft: Config = { ...state.config };

function renderSetup(): void {
  const cuisineBox = document.querySelector<HTMLElement>('#cuisine-choices')!;
  cuisineBox.replaceChildren(
    ...CUISINES.map((c) => {
      const b = document.createElement('button');
      b.className = `choice${draft.cuisine === c.id ? ' is-active' : ''}`;
      b.innerHTML =
        `<span class="choice-icon">${c.icon}</span>` +
        `<span class="choice-name">${c.name}</span>` +
        `<span class="choice-blurb">${c.blurb}</span>`;
      b.addEventListener('click', () => {
        draft = { ...draft, cuisine: c.id as CuisineId };
        renderSetup();
      });
      return b;
    }),
  );

  const sizeBox = document.querySelector<HTMLElement>('#size-choices')!;
  sizeBox.replaceChildren(
    ...PANTRY_SIZES.map((s) => {
      const b = document.createElement('button');
      b.className = `choice${draft.size === s.id ? ' is-active' : ''}`;
      b.innerHTML =
        `<span class="choice-name">${s.name}</span>` +
        `<span class="choice-blurb">${s.blurb}</span>`;
      b.addEventListener('click', () => {
        draft = { ...draft, size: s.id as PantrySize };
        renderSetup();
      });
      return b;
    }),
  );

  const preview = buildKitchen(draft);
  const stocked = preview.starting.filter((id) => getItem(id).kind !== 'station').length;
  document.querySelector<HTMLElement>('#setup-summary')!.textContent =
    `${stocked} ingredients and ${preview.stations.length} stations stocked, ` +
    `${preview.discoverable} things to discover across ${preview.recipes.length} recipes.`;
}

function openSetup(mustChoose: boolean): void {
  draft = { ...state.config };
  document.querySelector<HTMLElement>('#setup-close')!.hidden = mustChoose;
  renderSetup();
  setupEl.hidden = false;
}

function enterKitchen(config: Config): void {
  kitchen = buildKitchen(config);
  state.enter(kitchen);
  selectedUid = null;
  filter = 'all';
  query = '';
  searchInput.value = '';
  renderFilters();
  renderStations();
  renderAll();
}

// ---------------------------------------------------------------- events

document.querySelector('#hint-btn')!.addEventListener('click', () => {
  const hint = findHint(kitchen, state.discovered);
  if (!hint) {
    toast('Nothing new within reach — try combining what you have.', 'fail');
    return;
  }
  toast(`Try: ${hint.inputs.map((id) => getItem(id).name).join(' + ')}`);
});

document.querySelector('#mix-btn')!.addEventListener('click', mixBowl);
document.querySelector('#kitchen-btn')!.addEventListener('click', () => openSetup(false));

// Tapping the bowl sends the selected bench chip into it.
bowlEl.addEventListener('click', (e) => {
  if ((e.target as HTMLElement).closest('.chip')) return;
  bowlTakeSelection();
});

// Tapping empty bench clears the selection.
board.addEventListener('click', (e) => {
  if (e.target === board && selectedUid !== null) setSelected(null);
});

document.querySelector('#highlight-btn')!.addEventListener('click', () => {
  menu.open = false;
  state.setHighlight(!state.highlight);
  renderKitchenBadge();
  paintHints();
});

document.querySelector('#clear-btn')!.addEventListener('click', () => {
  menu.open = false;
  state.board = [];
  state.bowl = [];
  selectedUid = null;
  renderAll();
});

document.querySelector('#reset-btn')!.addEventListener('click', () => {
  menu.open = false;
  if (!confirm('Reset this kitchen? Its discoveries will be forgotten.')) return;
  state.resetRun();
  selectedUid = null;
  renderAll();
});

document.querySelector('#book-btn')!.addEventListener('click', () => {
  menu.open = false;
  renderBook();
  bookEl.hidden = false;
});
document.querySelector('#book-close')!.addEventListener('click', () => {
  bookEl.hidden = true;
});
bookEl.addEventListener('click', (e) => {
  if (e.target === bookEl) bookEl.hidden = true;
});

document.querySelector('#setup-go')!.addEventListener('click', () => {
  setupEl.hidden = true;
  enterKitchen(draft);
});
document.querySelector('#setup-close')!.addEventListener('click', () => {
  setupEl.hidden = true;
});

document.addEventListener('click', (e) => {
  if (menu.open && !menu.contains(e.target as Node)) menu.open = false;
});

searchInput.addEventListener('input', () => {
  query = searchInput.value.trim().toLowerCase();
  renderPantry();
});

// Keep bench chips inside the bench when it resizes or the phone rotates.
let resizeTimer = 0;
window.addEventListener('resize', () => {
  clearTimeout(resizeTimer);
  resizeTimer = window.setTimeout(renderBoard, 120);
});

enterKitchen(state.config);
if (firstRun) openSetup(true);
