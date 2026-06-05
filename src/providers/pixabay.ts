import type { SearchResult } from '../types'

export const searchPixabay = async (
  query: string,
  key: string | undefined,
  _offset: number,
  limit: number,
  signal?: AbortSignal
): Promise<{ results: SearchResult[]; hasMore: boolean; nextOffset: number }> => {
  if (!key) throw new Error('Pixabay: API key missing')
  const params = new URLSearchParams({
    key,
    q: query,
    per_page: String(limit),
    image_type: 'photo',
    safesearch: 'false',
  })
  const res = await fetch(`https://pixabay.com/api/?${params}`, { signal })
  if (!res.ok) throw new Error(`Pixabay: ${res.status}`)
  const data = await res.json()
  const results: SearchResult[] = (data.hits || []).map((h: any) => ({
    id: `pixabay-${h.id}`,
    title: h.tags || 'Pixabay image',
    url: h.largeImageURL,
    thumb: h.webformatURL,
    width: h.imageWidth,
    height: h.imageHeight,
    creator: h.user,
    creatorUrl: `https://pixabay.com/users/${h.user}-${h.user_id}/`,
    foreignUrl: h.pageURL,
    attribution: `${h.tags} • ${h.user} • Pixabay License`,
    provider: 'pixabay',
  }))
  return { results, hasMore: results.length >= limit, nextOffset: 0 }
}
