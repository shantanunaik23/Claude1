import { STARTING_ITEMS } from './data/items';

const STORAGE_KEY = 'kitchen-alchemy/v1';

export interface BoardChip {
  uid: number;
  itemId: string;
  x: number;
  y: number;
}

interface Persisted {
  discovered: string[];
}

let uidCounter = 0;
export const nextUid = () => ++uidCounter;

export class GameState {
  discovered = new Set<string>(STARTING_ITEMS);
  board: BoardChip[] = [];
  bowl: string[] = [];

  load(): void {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (!stored) return;
      const parsed = JSON.parse(stored) as Persisted;
      for (const id of parsed.discovered ?? []) this.discovered.add(id);
    } catch {
      // Corrupt or unavailable storage just means a fresh kitchen.
    }
  }

  save(): void {
    try {
      const payload: Persisted = { discovered: [...this.discovered] };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
    } catch {
      // Private browsing — play on without persistence.
    }
  }

  reset(): void {
    this.discovered = new Set(STARTING_ITEMS);
    this.board = [];
    this.bowl = [];
    this.save();
  }

  /** Returns true if this is the first time the item has been seen. */
  discover(id: string): boolean {
    if (this.discovered.has(id)) return false;
    this.discovered.add(id);
    this.save();
    return true;
  }

  addChip(itemId: string, x: number, y: number): BoardChip {
    const chip = { uid: nextUid(), itemId, x, y };
    this.board.push(chip);
    return chip;
  }

  removeChip(uid: number): void {
    this.board = this.board.filter((c) => c.uid !== uid);
  }

  chip(uid: number): BoardChip | undefined {
    return this.board.find((c) => c.uid === uid);
  }
}
