import { useCallback, useEffect, useRef, useState } from 'react'
import type { MediaItem } from './types'
import { saveItem, getAllItems, deleteItem, getItemBlob } from './db'

export const useMedia = () => {
  const [items, setItems] = useState<MediaItem[]>([])
  const [loading, setLoading] = useState(true)
  const urlsRef = useRef<Map<string, string>>(new Map())

  const getUrl = useCallback(async (id: string): Promise<string | null> => {
    if (urlsRef.current.has(id)) return urlsRef.current.get(id)!
    const blob = await getItemBlob(id)
    if (!blob) return null
    const url = URL.createObjectURL(blob)
    urlsRef.current.set(id, url)
    return url
  }, [])

  useEffect(() => {
    (async () => {
      try {
        const all = await getAllItems()
        setItems(all)
      } catch (e) {
        console.error('Load items failed', e)
      } finally {
        setLoading(false)
      }
    })()
    return () => {
      urlsRef.current.forEach(u => URL.revokeObjectURL(u))
      urlsRef.current.clear()
    }
  }, [])

  const add = useCallback(async (item: MediaItem, blob?: Blob) => {
    await saveItem(item, blob)
    setItems(prev => [item, ...prev])
  }, [])

  const remove = useCallback(async (id: string) => {
    await deleteItem(id)
    const url = urlsRef.current.get(id)
    if (url) {
      URL.revokeObjectURL(url)
      urlsRef.current.delete(id)
    }
    setItems(prev => prev.filter(i => i.id !== id))
  }, [])

  return { items, loading, add, remove, getUrl }
}
