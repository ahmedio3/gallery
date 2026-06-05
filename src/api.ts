import type { SearchResult } from './types'

const API = 'https://commons.wikimedia.org/w/api.php'

interface WikiPage {
  pageid: number
  title: string
  imageinfo?: Array<{
    url: string
    thumburl?: string
    thumbwidth?: number
    thumbheight?: number
    width: number
    height: number
    mime: string
    descriptionurl: string
    extmetadata?: Record<string, { value: string }>
  }>
}

interface WikiResponse {
  query?: { pages?: Record<string, WikiPage> }
  continue?: { gsroffset: string; continue: string }
}

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

export interface SearchResponse {
  results: SearchResult[]
  hasMore: boolean
  nextOffset: number
}

export const searchImages = async (
  query: string,
  offset: number = 0,
  limit: number = 24
): Promise<SearchResponse> => {
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
  const res = await fetch(`${API}?${params}`)
  if (!res.ok) throw new Error(`Search failed: ${res.status} ${res.statusText}`)
  const data: WikiResponse = await res.json()
  const pages = data.query?.pages ? Object.values(data.query.pages) : []
  const results: SearchResult[] = []
  for (const p of pages) {
    const info = p.imageinfo?.[0]
    if (!info) continue
    if (!info.mime?.startsWith('image/')) continue
    const em = info.extmetadata || {}
    const artist = cleanArtist(em.Artist?.value || em.Credit?.value || '')
    const licenseName = em.LicenseShortName?.value || ''
    const licenseUrl = em.LicenseUrl?.value || ''
    const descUrl = info.descriptionurl
    const filename = p.title.replace(/^File:/, '')
    results.push({
      id: String(p.pageid),
      title: filename,
      url: info.url,
      thumb: info.thumburl || buildThumb(info.url, 400),
      width: info.thumbwidth || info.width,
      height: info.thumbheight || info.height,
      creator: artist,
      creatorUrl: descUrl,
      license: licenseName,
      licenseUrl,
      foreignUrl: descUrl,
      attribution: artist ? `${filename} by ${artist} (${licenseName})` : filename,
    })
  }
  return {
    results,
    hasMore: !!data.continue,
    nextOffset: data.continue ? Number(data.continue.gsroffset) : offset,
  }
}

export const downloadAsBlob = async (url: string): Promise<{ blob: Blob; filename: string }> => {
  const res = await fetch(url, { mode: 'cors' })
  if (!res.ok) throw new Error(`Download failed: ${res.status}`)
  const blob = await res.blob()
  const ext = blob.type.split('/')[1]?.split('+')[0] || 'jpg'
  const hash = url.split('/').pop() || `img-${Date.now()}.${ext}`
  const filename = hash.split('?')[0] || `img-${Date.now()}.${ext}`
  return { blob, filename }
}
