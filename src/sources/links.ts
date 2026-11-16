import type { SourceId } from './types';

export type CuratedLink = { id: string; name: string; url: string; source: SourceId };

export const GITHUB_TOPICS: CuratedLink[] = [
  { id: 'vibe-coded', name: 'vibe-coded', url: 'https://github.com/topics/vibe-coded', source: 'github' },
  { id: 'vibecoding', name: 'vibecoding', url: 'https://github.com/topics/vibecoding', source: 'github' },
  { id: 'vibe-coding', name: 'vibe-coding', url: 'https://github.com/topics/vibe-coding', source: 'github' },
];

export const DIRECTORIES: CuratedLink[] = [
  { id: 'vibeking', name: 'VibeKing', url: 'https://vibeking.fun', source: 'vibeking' },
  { id: 'onesvibe', name: 'One’s Vibe', url: 'https://onesvibe.app', source: 'onesvibe' },
  { id: 'youraiproject', name: 'YourAIProject', url: 'https://youraiproject.com', source: 'youraiproject' },
  { id: 'opensaas', name: 'Open SaaS Directory', url: 'https://opensaas.directory', source: 'opensaas' },
];

export const AWESOME_LISTS: CuratedLink[] = [
  {
    id: 'jefferylee',
    name: 'awesome-vibe-coded-apps',
    url: 'https://github.com/JefferyLee/awesome-vibe-coded-apps',
    source: 'awesome',
  },
  {
    id: '0xwelt',
    name: 'Awesome-Vibe-Coding',
    url: 'https://github.com/0xWelt/Awesome-Vibe-Coding',
    source: 'awesome',
  },
  {
    id: 'awesome-vibe-coding',
    name: 'awesome-vibe-coding',
    url: 'https://github.com/awesome-vibe-coding/awesome-vibe-coding',
    source: 'awesome',
  },
  {
    id: 'anil-matcha',
    name: 'awesome-vibecoded-saas',
    url: 'https://github.com/Anil-matcha/awesome-vibecoded-saas',
    source: 'awesome',
  },
  {
    id: 'archestack',
    name: 'best-of-vibe-coding',
    url: 'https://github.com/archestack/best-of-vibe-coding',
    source: 'awesome',
  },
];

export const githubSearchUrl = (query: string): string =>
  `https://github.com/search?q=${encodeURIComponent(query)}&type=repositories`;
