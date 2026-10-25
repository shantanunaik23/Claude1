import './styles.css';
import { ITEMS, getItem } from './data/items';
import { combine, findHint, recipesFor, TOTAL_DISCOVERABLE } from './engine';
import { beginDrag, initDrag, type DragPayload } from './drag';
import { GameState } from './state';
import type { Item, ItemKind } from './types';

const state = new GameState();
state.load();

// ---------------------------------------------------------------- shell

const app = document.querySelector<HTMLDivElement>('#app')!;
app.innerHTML = `
  <header class="topbar">
    <div class="brand"><span class="brand-mark">🍳</span><h1>Kitchen Alchemy</h1></div>
    <div class="progress">
      <div class="progress-bar"><span id="progress-fill"></span></div>
      <span id="progress-label"></span>
    </div>
    <div class="topbar-actions">
      <button id="hint-btn" class="btn">Hint</button>
      <button id="book-btn" class="btn">Recipe Book</button>
      <button id="clear-btn" class="btn">Clear Bench</button>
      <button id="reset-btn" class="btn btn-quiet">Reset</button>
    </div>
  </header>

  <main class="layout">
    <section class="bench" id="board" data-drop="board">
      <p class="bench-hint">Drag an ingredient from the pantry onto the bench.<br/>
      Drop one item onto another to combine, or onto a station below to cook it.</p>
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
`;

const board = document.querySelector<HTMLElement>('#board')!;
const benchHint = document.querySelector<HTMLElement>('.bench-hint')!;
const pantryGrid = document.querySelector<HTMLElement>('#pantry-grid')!;
const bowlItems = document.querySelector<HTMLElement>('#bowl-items')!;
const stationsEl = document.querySelector<HTMLElement>('#stations')!;
const toasts = document.querySelector<HTMLElement>('#toasts')!;
const searchInput = document.querySelector<HTMLInputElement>('#search')!;
const filtersEl = document.querySelector<HTMLElement>('#filters')!;
const bookEl = document.querySelector<HTMLElement>('#book')!;
const bookBody = document.querySelector<HTMLElement>('#book-body')!;

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
  const items = [...ITEMS.values()]
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
}

function renderStations(): void {
  const stations = [...ITEMS.values()].filter((i) => i.kind === 'station');
  stationsEl.replaceChildren(
    ...stations.map((item) => {
      const el = chipEl(item, 'chip-tile station-tile');
      el.dataset.drop = 'station';
      el.dataset.id = item.id;
      el.addEventListener('click', () => useStationOnBowl(item.id));
      return el;
    }),
  );
}

function renderBoard(): void {
  benchHint.hidden = state.board.length > 0;
  for (const el of board.querySelectorAll('.chip')) el.remove();
  for (const chip of state.board) {
    const item = getItem(chip.itemId);
    const el = chipEl(item, 'chip-board');
    el.dataset.drop = 'chip';
    el.dataset.uid = String(chip.uid);
    el.style.left = `${chip.x}px`;
    el.style.top = `${chip.y}px`;
    dragSource(el, () => ({ itemId: chip.itemId, fromUid: chip.uid, fromBowl: null }), item, true);
    board.appendChild(el);
  }
}

function renderBowl(): void {
  if (state.bowl.length === 0) {
    bowlItems.innerHTML = `<p class="empty">Drop 2 or more things here, then Mix — or tap a station.</p>`;
    return;
  }
  bowlItems.replaceChildren(
    ...state.bowl.map((id, index) => {
      const item = getItem(id);
      const el = chipEl(item, 'chip-tile');
      dragSource(el, () => ({ itemId: id, fromUid: null, fromBowl: index }), item, true);
      return el;
    }),
  );
}

function renderProgress(): void {
  const found = [...state.discovered].filter((id) => getItem(id).kind !== 'station').length;
  const pct = Math.round((found / TOTAL_DISCOVERABLE) * 100);
  document.querySelector<HTMLElement>('#progress-fill')!.style.width = `${pct}%`;
  document.querySelector<HTMLElement>('#progress-label')!.textContent =
    `${found} / ${TOTAL_DISCOVERABLE} discovered`;
}

function renderAll(): void {
  renderBoard();
  renderBowl();
  renderPantry();
  renderProgress();
}

// ---------------------------------------------------------------- feedback

function toast(message: string, variant: 'info' | 'discovery' | 'fail' = 'info'): void {
  const el = document.createElement('div');
  el.className = `toast toast-${variant}`;
  el.textContent = message;
  toasts.appendChild(el);
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

function boardPoint(clientX: number, clientY: number): { x: number; y: number } {
  const rect = board.getBoundingClientRect();
  return {
    x: clamp(clientX - rect.left, 8, rect.width - 8),
    y: clamp(clientY - rect.top, 8, rect.height - 8),
  };
}

const clamp = (n: number, lo: number, hi: number) => Math.min(Math.max(n, lo), Math.max(lo, hi));

function freeSpot(): { x: number; y: number } {
  const rect = board.getBoundingClientRect();
  for (let attempt = 0; attempt < 30; attempt++) {
    const x = rect.width * (0.15 + Math.random() * 0.6);
    const y = rect.height * (0.15 + Math.random() * 0.6);
    if (state.board.every((c) => Math.hypot(c.x - x, c.y - y) > 70)) return { x, y };
  }
  return { x: rect.width / 2, y: rect.height / 2 };
}

// ---------------------------------------------------------------- combining

function attempt(inputs: string[], consumeUids: number[], at: { x: number; y: number }): void {
  const result = combine(inputs);
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

  const fresh = board.querySelector(`.chip[data-uid="${state.board.at(-1)!.uid}"]`);
  fresh?.classList.add('pop');

  if (isNew) {
    toast(`New: ${item.name}${item.blurb ? ` — ${item.blurb}` : ''}`, 'discovery');
  } else {
    toast(item.name);
  }
}

function useStationOnBowl(stationId: string): void {
  if (state.bowl.length === 0) {
    toast('Put something in the prep bowl first.', 'fail');
    return;
  }
  const inputs = [...state.bowl, stationId];
  const spot = freeSpot();
  if (combine(inputs)) state.bowl = [];
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
  if (combine(inputs)) state.bowl = [];
  attempt(inputs, [], spot);
  renderBowl();
}

// ---------------------------------------------------------------- drag wiring

initDrag({
  onClick(payload) {
    if (payload.fromBowl !== null) {
      state.bowl.splice(payload.fromBowl, 1);
      renderBowl();
      return;
    }
    if (payload.fromUid === null) {
      const spot = freeSpot();
      state.addChip(payload.itemId, spot.x, spot.y);
      renderBoard();
    }
  },

  onDrop(payload, target, x, y) {
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
  const known = [...ITEMS.values()].filter(
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
          const ways = recipesFor(item.id)
            .map((r) => r.inputs.map((id) => getItem(id).name).join(' + '))
            .join('<br/>');
          return `<tr><th>${item.name}</th><td>${ways || '<em>a pantry staple</em>'}</td></tr>`;
        })
        .join('');
      return rows ? `<h3>${title}</h3><table class="book-table">${rows}</table>` : '';
    })
    .join('');
}

// ---------------------------------------------------------------- events

document.querySelector('#hint-btn')!.addEventListener('click', () => {
  const hint = findHint(state.discovered);
  if (!hint) {
    toast('Nothing new within reach — try combining what you have.', 'fail');
    return;
  }
  toast(`Try: ${hint.inputs.map((id) => getItem(id).name).join(' + ')}`);
});

document.querySelector('#mix-btn')!.addEventListener('click', mixBowl);

document.querySelector('#clear-btn')!.addEventListener('click', () => {
  state.board = [];
  state.bowl = [];
  renderAll();
});

document.querySelector('#reset-btn')!.addEventListener('click', () => {
  if (!confirm('Reset all progress? Every discovery will be forgotten.')) return;
  state.reset();
  renderAll();
});

document.querySelector('#book-btn')!.addEventListener('click', () => {
  renderBook();
  bookEl.hidden = false;
});
document.querySelector('#book-close')!.addEventListener('click', () => {
  bookEl.hidden = true;
});
bookEl.addEventListener('click', (e) => {
  if (e.target === bookEl) bookEl.hidden = true;
});

searchInput.addEventListener('input', () => {
  query = searchInput.value.trim().toLowerCase();
  renderPantry();
});

window.addEventListener('resize', renderBoard);

renderFilters();
renderStations();
renderAll();
