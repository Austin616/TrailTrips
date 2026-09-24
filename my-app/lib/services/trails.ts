import { trails } from '@/lib/data/mock';
// Replace this adapter with API calls; UI components only consume typed results.
export const trailService = { list: async () => trails, get: async (slug: string) => trails.find(t => t.slug === slug) };
