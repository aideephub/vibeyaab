import { github } from './github';
import { googleCse } from './googleCse';
import { onesvibe } from './onesvibe';
import type { SearchSource } from './types';
import { vibeking } from './vibeking';

/** Register new sources here; the UI only talks to the `SearchSource` interface. */
export const ALL_SOURCES: readonly SearchSource[] = [vibeking, onesvibe, googleCse, github];

export const getEnabledSources = (): SearchSource[] => ALL_SOURCES.filter((source) => source.isEnabled());

export const getSource = (id: string): SearchSource | undefined =>
  ALL_SOURCES.find((source) => source.id === id);
