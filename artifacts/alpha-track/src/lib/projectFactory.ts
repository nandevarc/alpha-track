import type { MeridioProject, PlayType, Layer } from '../types/project';
import { DEFAULT_STATE_PER_LAYER } from '../types/project';

export function createProject(
  name: string,
  playType: PlayType = 'Other',
  layer: Layer = 'RAW'
): MeridioProject {
  const now = new Date().toISOString();
  const id = crypto.randomUUID();
  return {
    id,
    schemaVersion: 1,
    name,
    chain: '',
    playType,
    layer,
    state: DEFAULT_STATE_PER_LAYER[layer]!,
    convictionNotes: '',
    lastInteractionAt: now,
    events: [{
      id: `${id}-created`,
      timestamp: now,
      type: 'CREATED',
      source: 'RESEARCHER',
    }],
    createdAt: now,
    updatedAt: now,
  };
}
