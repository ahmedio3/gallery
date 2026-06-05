export type MediaType = 'image' | 'video' | 'gif'

export interface MediaItem {
  id: string
  file: File
  url: string
  name: string
  type: MediaType
  size: number
  addedAt: number
}

export const detectType = (file: File): MediaType => {
  const t = file.type
  if (t === 'image/gif') return 'gif'
  if (t.startsWith('video/')) return 'video'
  return 'image'
}

export const formatSize = (bytes: number): string => {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  if (bytes < 1024 * 1024 * 1024) return `${(bytes / 1024 / 1024).toFixed(1)} MB`
  return `${(bytes / 1024 / 1024 / 1024).toFixed(1)} GB`
}

const KEY = 'gallery-items'

export const loadItems = (): MediaItem[] => {
  try {
    const raw = localStorage.getItem(KEY)
    if (!raw) return []
    return JSON.parse(raw)
  } catch {
    return []
  }
}

export const saveItems = (items: MediaItem[]) => {
  const slim = items.map(({ id, name, type, size, addedAt }) => ({ id, name, type, size, addedAt }))
  localStorage.setItem(KEY, JSON.stringify(slim))
}
