import type { SearchResult } from './types'

const API = 'https://api.openverse.org/v1/images/'

export interface SearchResponse {
  results: SearchResult[]
  count: number
  pageCount: number
}

export const searchImages = async (
  query: string,
  page: number = 1,
  pageSize: number = 24
): Promise<SearchResponse> => {
  const params = new URLSearchParams({
    q: query,
    page: String(page),
    page_size: String(pageSize),
    mature: 'false',
  })
  const res = await fetch(`${API}?${params}`)
  if (!res.ok) throw new Error(`Search failed: ${res.status}`)
  const data = await res.json()
  const results: SearchResult[] = (data.results || []).map((r: any) => ({
    id: r.id,
    title: r.title || 'Untitled',
    url: r.url,
    thumb: r.thumbnail || r.url,
    width: r.width || 0,
    height: r.height || 0,
    creator: r.creator,
    creatorUrl: r.creator_url,
    license: r.license,
    licenseUrl: r.license_url,
    foreignUrl: r.foreign_landing_url,
    attribution: r.attribution,
  }))
  return {
    results,
    count: data.result_count || 0,
    pageCount: data.page_count || 0,
  }
}

export const downloadAsBlob = async (url: string): Promise<{ blob: Blob; filename: string }> => {
  const res = await fetch(url)
  if (!res.ok) throw new Error('Download failed')
  const blob = await res.blob()
  const ext = blob.type.split('/')[1]?.split('+')[0] || 'jpg'
  const filename = `img-${Date.now()}.${ext}`
  return { blob, filename }
}
