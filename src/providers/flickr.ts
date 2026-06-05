import type { SearchResult } from '../types'

export const searchFlickr = async (
  query: string,
  key: string | undefined,
  page: number,
  limit: number,
  signal?: AbortSignal
): Promise<{ results: SearchResult[]; hasMore: boolean; nextOffset: number }> => {
  if (!key) throw new Error('Flickr: API key missing')
  const params = new URLSearchParams({
    method: 'flickr.photos.search',
    api_key: key,
    text: query,
    format: 'json',
    nojsoncallback: '1',
    per_page: String(limit),
    page: String(page),
    content_type: '1',
    license: '1,2,3,4,5,6,7,8,9,10',
    safe_search: '3',
    extras: 'owner_name,license,url_z,url_l',
    sort: 'relevance',
  })
  const res = await fetch(`https://api.flickr.com/services/rest/?${params}`, { signal })
  if (!res.ok) throw new Error(`Flickr: ${res.status}`)
  const data = await res.json()
  if (data.stat !== 'ok') throw new Error(`Flickr: ${data.message || 'error'}`)
  const photos = data.photos?.photos || []
  const results: SearchResult[] = photos.map((p: any) => ({
    id: `flickr-${p.id}`,
    title: p.title || 'Flickr photo',
    url: p.url_l || p.url_z,
    thumb: p.url_z,
    width: p.width_z,
    height: p.height_z,
    creator: p.ownername,
    creatorUrl: `https://www.flickr.com/photos/${p.owner}/`,
    license: `Flickr CC ${p.license}`,
    foreignUrl: `https://www.flickr.com/photos/${p.owner}/${p.id}`,
    attribution: `${p.title} • ${p.ownername} • Flickr CC`,
    provider: 'flickr',
  })).filter((r: SearchResult) => r.url)
  const totalPages = data.photos?.pages || 1
  return { results, hasMore: page < totalPages, nextOffset: page + 1 }
}
