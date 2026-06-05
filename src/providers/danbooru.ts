import type { SearchResult } from '../types'

export const searchDanbooru = async (
  query: string,
  _key: string | undefined,
  page: number,
  limit: number,
  signal?: AbortSignal
): Promise<{ results: SearchResult[]; hasMore: boolean; nextOffset: number }> => {
  const tags = query.trim().split(/\s+/).filter(Boolean)
  const allTags = tags.length ? `${tags.join(' ')} rating:g,s,e` : 'rating:g,s,e'
  const params = new URLSearchParams({
    limit: String(Math.min(limit, 20)),
    page: String(page),
    tags: allTags,
  })
  const res = await fetch(`https://danbooru.donmai.us/posts.json?${params}`, { signal })
  if (!res.ok) throw new Error(`Danbooru: ${res.status}`)
  const posts: any[] = await res.json()
  const results: SearchResult[] = []
  for (const p of posts) {
    const file = p.media_asset?.variants?.find((v: any) => v.type === 'sample')?.url
      || p.media_asset?.variants?.find((v: any) => v.type === 'original')?.url
      || p.file_url
    if (!file) continue
    const preview = p.preview_file_url
    const artist = p.tag_string_artist?.split(' ')[0] || 'unknown'
    const char = p.tag_string_character?.split(' ')[0] || ''
    const title = char || p.tag_string_general?.split(' ').slice(0, 3).join(', ') || `Danbooru #${p.id}`
    results.push({
      id: `danbooru-${p.id}`,
      title,
      url: file,
      thumb: preview || file,
      width: p.image_width,
      height: p.image_height,
      creator: artist,
      creatorUrl: `https://danbooru.donmai.us/posts/${p.id}`,
      license: 'danbooru',
      foreignUrl: `https://danbooru.donmai.us/posts/${p.id}`,
      attribution: `${title} • ${artist} • Danbooru`,
      provider: 'danbooru',
    })
  }
  return { results, hasMore: results.length >= limit, nextOffset: page + 1 }
}
