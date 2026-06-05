import type { SearchResult } from '../types'

export const searchBing = async (
  query: string,
  key: string | undefined,
  offset: number,
  limit: number,
  signal?: AbortSignal
): Promise<{ results: SearchResult[]; hasMore: boolean; nextOffset: number }> => {
  if (!key) throw new Error('Bing: API key missing')
  const params = new URLSearchParams({
    q: query,
    count: String(limit),
    offset: String(offset),
    safeSearch: 'off',
  })
  const res = await fetch(`https://api.bing.microsoft.com/v7.0/images/search?${params}`, {
    headers: { 'Ocp-Apim-Subscription-Key': key },
    signal,
  })
  if (!res.ok) throw new Error(`Bing: ${res.status}`)
  const data = await res.json()
  const results: SearchResult[] = (data.value || []).map((v: any) => ({
    id: `bing-${v.imageId || v.contentUrl}`,
    title: v.name || 'Bing image',
    url: v.contentUrl,
    thumb: v.thumbnailUrl,
    width: v.width || 0,
    height: v.height || 0,
    creator: v.hostPageDisplayUrl,
    creatorUrl: v.hostPageUrl,
    foreignUrl: v.hostPageUrl,
    attribution: `${v.name} • ${v.hostPageDisplayUrl}`,
    provider: 'bing',
  }))
  const total = data.totalEstimatedMatches || 0
  return { results, hasMore: offset + limit < total, nextOffset: offset + limit }
}
