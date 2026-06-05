import type { SearchResult } from '../types'

export const searchE621 = async (
  query: string,
  _key: string | undefined,
  _offset: number,
  limit: number,
  signal?: AbortSignal
): Promise<{ results: SearchResult[]; hasMore: boolean; nextOffset: number }> => {
  const tags = query.trim().split(/\s+/).filter(Boolean).join(' ')
  const params = new URLSearchParams({
    limit: String(Math.min(limit, 50)),
    tags: tags ? `${tags} rating:e` : 'rating:e',
  })
  const res = await fetch(`https://e621.net/posts.json?${params}`, { signal })
  if (!res.ok) throw new Error(`E621: ${res.status}`)
  const data = await res.json()
  const posts: any[] = data.posts || []
  const results: SearchResult[] = []
  for (const p of posts) {
    if (!p.file?.url) continue
    const sample = p.sample?.url || p.file.url
    const preview = p.preview?.url || sample
    const artist = p.tags?.artist?.[0] || 'unknown'
    const char = p.tags?.character?.[0] || ''
    const title = char || p.tags?.general?.slice(0, 3).join(', ') || `E621 #${p.id}`
    results.push({
      id: `e621-${p.id}`,
      title,
      url: sample,
      thumb: preview,
      width: p.sample?.width || p.file.width,
      height: p.sample?.height || p.file.height,
      creator: artist,
      creatorUrl: `https://e621.net/posts/${p.id}`,
      license: 'e621',
      foreignUrl: `https://e621.net/posts/${p.id}`,
      attribution: `${title} • ${artist} • e621`,
      provider: 'e621',
    })
  }
  return { results, hasMore: results.length >= limit, nextOffset: 0 }
}
