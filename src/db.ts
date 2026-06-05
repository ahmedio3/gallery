import type { MediaItem } from './types'

const DB_NAME = 'gallery-db'
const DB_VERSION = 1
const STORE = 'items'
const META_STORE = 'meta'

let dbPromise: Promise<IDBDatabase> | null = null

const openDB = (): Promise<IDBDatabase> => {
  if (dbPromise) return dbPromise
  dbPromise = new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, DB_VERSION)
    req.onupgradeneeded = () => {
      const db = req.result
      if (!db.objectStoreNames.contains(STORE)) {
        const store = db.createObjectStore(STORE, { keyPath: 'id' })
        store.createIndex('addedAt', 'addedAt', { unique: false })
      }
      if (!db.objectStoreNames.contains(META_STORE)) {
        db.createObjectStore(META_STORE, { keyPath: 'key' })
      }
    }
    req.onsuccess = () => resolve(req.result)
    req.onerror = () => reject(req.error)
  })
  return dbPromise
}

const tx = async (store: string, mode: IDBTransactionMode) => {
  const db = await openDB()
  return db.transaction(store, mode).objectStore(store)
}

export const saveItem = async (item: MediaItem, blob?: Blob): Promise<void> => {
  const store = await tx(STORE, 'readwrite')
  const record: any = { ...item }
  if (blob) record.blob = blob
  return new Promise((resolve, reject) => {
    const req = store.put(record)
    req.onsuccess = () => resolve()
    req.onerror = () => reject(req.error)
  })
}

export const getItemBlob = async (id: string): Promise<Blob | null> => {
  const store = await tx(STORE, 'readonly')
  return new Promise((resolve, reject) => {
    const req = store.get(id)
    req.onsuccess = () => resolve(req.result?.blob ?? null)
    req.onerror = () => reject(req.error)
  })
}

export const getAllItems = async (): Promise<MediaItem[]> => {
  const store = await tx(STORE, 'readonly')
  return new Promise((resolve, reject) => {
    const req = store.getAll()
    req.onsuccess = () => {
      const records: any[] = req.result || []
      resolve(records
        .map(({ blob, ...rest }) => rest)
        .sort((a, b) => b.addedAt - a.addedAt))
    }
    req.onerror = () => reject(req.error)
  })
}

export const deleteItem = async (id: string): Promise<void> => {
  const store = await tx(STORE, 'readwrite')
  return new Promise((resolve, reject) => {
    const req = store.delete(id)
    req.onsuccess = () => resolve()
    req.onerror = () => reject(req.error)
  })
}

export const hasBlob = async (id: string): Promise<boolean> => {
  const store = await tx(STORE, 'readonly')
  return new Promise((resolve, reject) => {
    const req = store.get(id)
    req.onsuccess = () => resolve(!!req.result?.blob)
    req.onerror = () => reject(req.error)
  })
}
