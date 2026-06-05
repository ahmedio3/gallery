import type { SearchResult } from '../types'

export const searchNasa = async (
  query: string,
  _key: string | undefined,
  _offset: number,
  limit: number,
  signal?: AbortSignal
): Promise<{ results: SearchResult[]; hasMore: boolean; nextOffset: number }> => {
  const params = new URLSearchParams({
    q: query,
    media_type: 'image',
    page_size: String(limit),
  })
  const res = await fetch(`https://images-api.nasa.gov/search?${params}`, { signal })
  if (!res.ok) throw new Error(`NASA: ${res.status}`)
  const data = await res.json()
  const items: any[] = data.collection?.items || []
  const results: SearchResult[] = []
  for (const it of items) {
    const d = it.data?.[0]
    const l = it.links?.[0]
    if (!d || !l || !l.href) continue
    const preview = `${l.href}?w=400`
    results.push({
      id: `nasa-${d.nasa_id}`,
      title: d.title || d.nasa_id,
      url: l.href,
      thumb: preview,
      width: 0,
      height: 0,
      creator: d.center || 'NASA',
      creatorUrl: d.secondary_creator,
      foreignUrl: l.href,
      attribution: `${d.title} • NASA • Public Domain`,
      provider: 'nasa',
    })
  }
  return { results, hasMore: false, nextOffset: 0 }
}
