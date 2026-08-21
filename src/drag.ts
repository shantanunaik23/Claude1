export interface DragPayload {
  itemId: string;
  /** Board chip the drag started from, if any. Consumed on a successful combine. */
  fromUid: number | null;
  /** Index in the prep bowl the drag started from, if any. */
  fromBowl: number | null;
}

interface Handlers {
  onDrop: (payload: DragPayload, target: Element | null, x: number, y: number) => void;
  onClick: (payload: DragPayload) => void;
}

const THRESHOLD = 5;

let handlers: Handlers;
let session: {
  payload: DragPayload;
  makeGhost: () => HTMLElement;
  source: HTMLElement | null;
  startX: number;
  startY: number;
  ghost: HTMLElement | null;
  hovered: Element | null;
} | null = null;

export function initDrag(h: Handlers): void {
  handlers = h;
  window.addEventListener('pointermove', onMove, { passive: false });
  window.addEventListener('pointerup', onUp);
  window.addEventListener('pointercancel', cancel);
}

/**
 * `source` is dimmed and made click-through for the duration of the drag, so it
 * cannot shadow a drop target sitting underneath it.
 */
export function beginDrag(
  e: PointerEvent,
  payload: DragPayload,
  makeGhost: () => HTMLElement,
  source: HTMLElement | null = null,
): void {
  if (e.button !== 0 && e.pointerType === 'mouse') return;
  session = { payload, makeGhost, source, startX: e.clientX, startY: e.clientY, ghost: null, hovered: null };
}

function onMove(e: PointerEvent): void {
  if (!session) return;
  const dx = e.clientX - session.startX;
  const dy = e.clientY - session.startY;
  if (!session.ghost) {
    if (Math.hypot(dx, dy) < THRESHOLD) return;
    session.ghost = session.makeGhost();
    session.ghost.classList.add('drag-ghost');
    document.body.appendChild(session.ghost);
    document.body.classList.add('dragging');
    session.source?.classList.add('is-source');
  }
  e.preventDefault();
  session.ghost.style.transform = `translate(${e.clientX}px, ${e.clientY}px) translate(-50%, -50%)`;
  setHovered(hitTest(e.clientX, e.clientY));
}

function onUp(e: PointerEvent): void {
  if (!session) return;
  const { payload, ghost } = session;
  const target = ghost ? hitTest(e.clientX, e.clientY) : null;
  cleanup();
  if (ghost) handlers.onDrop(payload, target, e.clientX, e.clientY);
  else handlers.onClick(payload);
}

function cancel(): void {
  cleanup();
}

function cleanup(): void {
  if (!session) return;
  setHovered(null);
  session.ghost?.remove();
  session.source?.classList.remove('is-source');
  document.body.classList.remove('dragging');
  session = null;
}

function setHovered(el: Element | null): void {
  if (!session || session.hovered === el) return;
  session.hovered?.classList.remove('drop-hover');
  el?.classList.add('drop-hover');
  session.hovered = el;
}

function hitTest(x: number, y: number): Element | null {
  if (!session?.ghost) return null;
  session.ghost.style.visibility = 'hidden';
  const el = document.elementFromPoint(x, y);
  session.ghost.style.visibility = '';
  return el?.closest('[data-drop]') ?? null;
}
