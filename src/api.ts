export const downloadAsBlob = async (url: string): Promise<{ blob: Blob; filename: string }> => {
  const res = await fetch(url, { mode: 'cors' })
  if (!res.ok) throw new Error(`Download failed: ${res.status}`)
  const blob = await res.blob()
  const ext = blob.type.split('/')[1]?.split('+')[0] || 'jpg'
  const hash = url.split('/').pop() || `img-${Date.now()}.${ext}`
  const filename = hash.split('?')[0] || `img-${Date.now()}.${ext}`
  return { blob, filename }
}
