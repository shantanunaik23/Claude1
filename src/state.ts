import { configKey, type Config, type Kitchen } from './engine.ts';
import type { CuisineId, PantrySize } from './types.ts';

const STORAGE_KEY = 'kitchen-alchemy/v2';

export interface BoardChip {
  uid: number;
  itemId: string;
  x: number;
  y: number;
}

interface Persisted {
  config?: Config;
  highlight?: boolean;
  /** Discoveries per configuration, so switching kitchens never loses progress. */
  runs?: Record<string, string[]>;
}

let uidCounter = 0;
export const nextUid = () => ++uidCounter;

const CUISINES: CuisineId[] = ['western', 'indian'];
const SIZES: PantrySize[] = ['small', 'medium', 'large'];

function sane(config: unknown): Config | null {
  const c = config as Config | undefined;
  if (!c || !CUISINES.includes(c.cuisine) || !SIZES.includes(c.size)) return null;
  return { cuisine: c.cuisine, size: c.size };
}

export class GameState {
  config: Config = { cuisine: 'western', size: 'medium' };
  /** True once the player has chosen a kitchen, so setup only blocks a first run. */
  configured = false;
  highlight = true;
  board: BoardChip[] = [];
  bowl: string[] = [];

  private runs = new Map<string, Set<string>>();
  private kitchen!: Kitchen;

  discovered: Set<string> = new Set();

  load(): void {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (!stored) return;
      const parsed = JSON.parse(stored) as Persisted;
      for (const [k, ids] of Object.entries(parsed.runs ?? {})) {
        this.runs.set(k, new Set(ids));
      }
      if (typeof parsed.highlight === 'boolean') this.highlight = parsed.highlight;
      const config = sane(parsed.config);
      if (config) {
        this.config = config;
        this.configured = true;
      }
    } catch {
      // Corrupt or unavailable storage just means a fresh kitchen.
    }
  }

  save(): void {
    try {
      const runs: Record<string, string[]> = {};
      for (const [k, set] of this.runs) runs[k] = [...set];
      const payload: Persisted = { config: this.config, highlight: this.highlight, runs };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
    } catch {
      // Private browsing — play on without persistence.
    }
  }

  /** Points the state at a kitchen, restoring any progress already made there. */
  enter(kitchen: Kitchen): void {
    this.kitchen = kitchen;
    this.config = kitchen.config;
    this.configured = true;
    const k = configKey(this.config);
    let run = this.runs.get(k);
    if (!run) {
      run = new Set();
      this.runs.set(k, run);
    }
    for (const id of kitchen.starting) run.add(id);
    this.discovered = run;
    this.board = [];
    this.bowl = [];
    this.save();
  }

  /** Wipes progress for the current kitchen only. */
  resetRun(): void {
    this.runs.set(configKey(this.config), new Set());
    this.enter(this.kitchen);
  }

  setHighlight(on: boolean): void {
    this.highlight = on;
    this.save();
  }

  /** Returns true if this is the first time the item has been seen here. */
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
