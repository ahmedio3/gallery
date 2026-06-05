import type { SearchResult } from '../types'

export const searchYandere = async (
  query: string,
  _key: string | undefined,
  page: number,
  limit: number,
  signal?: AbortSignal
): Promise<{ results: SearchResult[]; hasMore: boolean; nextOffset: number }> => {
  const tags = query.trim().split(/\s+/).filter(Boolean)
  const allTags = tags.length ? `${tags.join(' ')} rating:s,e` : 'rating:s,e'
  const params = new URLSearchParams({
    limit: String(Math.min(limit, 20)),
    page: String(page),
    tags: allTags,
  })
  const res = await fetch(`https://yande.re/post.json?${params}`, { signal })
  if (!res.ok) throw new Error(`Yande.re: ${res.status}`)
  const posts: any[] = await res.json()
  const results: SearchResult[] = []
  for (const p of posts) {
    if (!p.file_url) continue
    const preview = p.preview_url
    const sample = p.sample_url || p.jpeg_url || p.file_url
    const artist = p.author || 'unknown'
    const title = p.tags?.split(' ').slice(0, 3).join(', ') || `Yande.re #${p.id}`
    results.push({
      id: `yandere-${p.id}`,
      title,
      url: sample,
      thumb: preview,
      width: p.width,
      height: p.height,
      creator: artist,
      creatorUrl: `https://yande.re/post/show/${p.id}`,
      license: 'yande.re',
      foreignUrl: `https://yande.re/post/show/${p.id}`,
      attribution: `${title} • ${artist} • Yande.re`,
      provider: 'yandere',
    })
  }
  return { results, hasMore: results.length >= limit, nextOffset: page + 1 }
}
