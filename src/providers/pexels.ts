import type { SearchResult } from '../types'

export const searchPexels = async (
  query: string,
  key: string | undefined,
  _offset: number,
  limit: number,
  signal?: AbortSignal
): Promise<{ results: SearchResult[]; hasMore: boolean; nextOffset: number }> => {
  if (!key) throw new Error('Pexels: API key missing')
  const params = new URLSearchParams({
    query,
    per_page: String(limit),
  })
  const res = await fetch(`https://api.pexels.com/v1/search?${params}`, {
    headers: { Authorization: key },
    signal,
  })
  if (!res.ok) throw new Error(`Pexels: ${res.status}`)
  const data = await res.json()
  const results: SearchResult[] = (data.photos || []).map((p: any) => ({
    id: `pexels-${p.id}`,
    title: p.alt || p.photographer,
    url: p.src.original,
    thumb: p.src.medium,
    width: p.width,
    height: p.height,
    creator: p.photographer,
    creatorUrl: p.photographer_url,
    foreignUrl: p.url,
    attribution: `${p.alt || p.photographer} • ${p.photographer} • Pexels License`,
    provider: 'pexels',
  }))
  return { results, hasMore: results.length >= limit, nextOffset: 0 }
}
