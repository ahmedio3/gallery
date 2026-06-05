export type MediaType = 'image' | 'video' | 'gif'

export interface MediaItem {
  id: string
  url: string
  name: string
  type: MediaType
  size: number
  addedAt: number
  source?: 'local' | 'web'
  attribution?: string
  license?: string
  creator?: string
  foreignUrl?: string
}

export interface SearchResult {
  id: string
  title: string
  url: string
  thumb: string
  width: number
  height: number
  creator?: string
  creatorUrl?: string
  license?: string
  licenseUrl?: string
  foreignUrl?: string
  attribution?: string
}

export const formatSize = (bytes: number): string => {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  if (bytes < 1024 * 1024 * 1024) return `${(bytes / 1024 / 1024).toFixed(1)} MB`
  return `${(bytes / 1024 / 1024 / 1024).toFixed(1)} GB`
}
