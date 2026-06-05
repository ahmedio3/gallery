import type { SearchResult } from '../types'

const stripHtml = (s: string): string => s.replace(/<[^>]+>/g, '').trim()

const cleanArtist = (raw: string): string => {
  if (!raw) return ''
  return stripHtml(raw)
    .replace(/\[\[|\]\]/g, '')
    .replace(/\{\{[^}]+\}\}/g, '')
    .replace(/\s+/g, ' ')
    .trim()
}

const buildThumb = (url: string, width: number): string => {
  const hash = url.split('/').pop()
  if (!hash) return url
  return `https://commons.wikimedia.org/w/thumb.php?width=${width}&f=${encodeURIComponent(hash)}`
}

export const searchWikipedia = async (
  query: string,
  _key: string | undefined,
  offset: number,
  limit: number,
  signal?: AbortSignal
): Promise<{ results: SearchResult[]; hasMore: boolean; nextOffset: number }> => {
  const params = new URLSearchParams({
    action: 'query',
    format: 'json',
    generator: 'search',
    gsrsearch: query,
    gsrnamespace: '6',
    gsrlimit: String(limit),
    gsroffset: String(offset),
    prop: 'imageinfo',
    iiprop: 'url|size|mime|extmetadata',
    iiurlwidth: '400',
    origin: '*',
  })
  const res = await fetch(`https://commons.wikimedia.org/w/api.php?${params}`, { signal })
  if (!res.ok) throw new Error(`Wikipedia: ${res.status}`)
  const data = await res.json()
  const pages: any[] = data.query?.pages ? Object.values(data.query.pages) : []
  const results: SearchResult[] = []
  for (const p of pages) {
    const info = p.imageinfo?.[0]
    if (!info) continue
    if (!info.mime?.startsWith('image/')) continue
    const em = info.extmetadata || {}
    const artist = cleanArtist(em.Artist?.value || em.Credit?.value || '')
    const licenseName = em.LicenseShortName?.value || ''
    const filename = p.title.replace(/^File:/, '')
    results.push({
      id: `wikipedia-${p.pageid}`,
      title: filename,
      url: info.url,
      thumb: info.thumburl || buildThumb(info.url, 400),
      width: info.thumbwidth || info.width,
      height: info.thumbheight || info.height,
      creator: artist,
      creatorUrl: info.descriptionurl,
      license: licenseName,
      licenseUrl: em.LicenseUrl?.value,
      foreignUrl: info.descriptionurl,
      attribution: artist ? `${filename} • ${artist} • ${licenseName}` : filename,
      provider: 'wikipedia',
    })
  }
  return {
    results,
    hasMore: !!data.continue,
    nextOffset: data.continue ? Number(data.continue.gsroffset) : offset,
  }
}
