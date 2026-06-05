import type { SearchResult } from '../types'

export const searchUnsplash = async (
  query: string,
  key: string | undefined,
  _offset: number,
  limit: number,
  signal?: AbortSignal
): Promise<{ results: SearchResult[]; hasMore: boolean; nextOffset: number }> => {
  if (!key) throw new Error('Unsplash: API key missing')
  const params = new URLSearchParams({
    query,
    per_page: String(limit),
  })
  const res = await fetch(`https://api.unsplash.com/search/photos?${params}`, {
    headers: { Authorization: `Client-ID ${key}` },
    signal,
  })
  if (!res.ok) throw new Error(`Unsplash: ${res.status}`)
  const data = await res.json()
  const results: SearchResult[] = (data.results || []).map((r: any) => ({
    id: `unsplash-${r.id}`,
    title: r.alt_description || r.description || 'Unsplash photo',
    url: r.urls.full || r.urls.regular,
    thumb: r.urls.small,
    width: r.width,
    height: r.height,
    creator: r.user?.name,
    creatorUrl: r.user?.links?.html,
    foreignUrl: r.links?.html,
    attribution: `${r.alt_description || 'Photo'} • ${r.user?.name} • Unsplash License`,
    provider: 'unsplash',
  }))
  return { results, hasMore: results.length >= limit, nextOffset: 0 }
}
