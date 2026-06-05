import type { SearchResult, ProviderId, Settings } from '../types'
import { searchWikipedia } from './wikipedia'
import { searchNasa } from './nasa'
import { searchPexels } from './pexels'
import { searchPixabay } from './pixabay'
import { searchUnsplash } from './unsplash'
import { searchFlickr } from './flickr'
import { searchBing } from './bing'
import { searchE621 } from './e621'
import { searchDanbooru } from './danbooru'
import { searchYandere } from './yandere'

export interface ProviderStatus {
  id: ProviderId
  ok: boolean
  count: number
  error?: string
}

export interface SearchAllResult {
  results: SearchResult[]
  statuses: ProviderStatus[]
}

const PROVIDER_FNS: Record<ProviderId, (
  query: string, key: string | undefined, offset: number, limit: number, signal?: AbortSignal
) => Promise<{ results: SearchResult[]; hasMore: boolean; nextOffset: number }>> = {
  wikipedia: searchWikipedia,
  nasa: searchNasa,
  pexels: searchPexels,
  pixabay: searchPixabay,
  unsplash: searchUnsplash,
  flickr: searchFlickr,
  bing: searchBing,
  e621: searchE621,
  danbooru: searchDanbooru,
  yandere: searchYandere,
}

const seen = new Set<string>()

const dedupe = (results: SearchResult[]): SearchResult[] => {
  const out: SearchResult[] = []
  for (const r of results) {
    const key = `${r.provider}:${r.url}`
    if (seen.has(key)) continue
    seen.add(key)
    out.push(r)
  }
  return out
}

export const searchAll = async (
  query: string,
  settings: Settings,
  limit: number = 12,
  signal?: AbortSignal
): Promise<SearchAllResult> => {
  seen.clear()
  const enabled = (Object.entries(settings.enabled) as [ProviderId, boolean][])
    .filter(([, on]) => on)
  const tasks = enabled.map(async ([id]): Promise<{ status: ProviderStatus; results: SearchResult[] }> => {
    try {
      const fn = PROVIDER_FNS[id]
      const res = await fn(query, settings.keys[id], 0, limit, signal)
      return { status: { id, ok: true, count: res.results.length }, results: res.results }
    } catch (e: any) {
      return { status: { id, ok: false, count: 0, error: e.message }, results: [] }
    }
  })
  const settled = await Promise.allSettled(tasks)
  const statuses: ProviderStatus[] = []
  const allResults: SearchResult[] = []
  settled.forEach((s) => {
    if (s.status === 'fulfilled') {
      statuses.push(s.value.status)
      allResults.push(...s.value.results)
    } else {
      statuses.push({ id: 'wikipedia', ok: false, count: 0, error: 'rejected' })
    }
  })
  const shuffled = dedupe(allResults).sort(() => Math.random() - 0.5)
  return { results: shuffled, statuses }
}
