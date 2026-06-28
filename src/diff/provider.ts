import type { DiffModel } from './parse';

export interface DiffProvider {
  getDiff(): Promise<DiffModel>;
}
