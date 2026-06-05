import { useEffect, useRef, useState } from 'react'
import {
  Box, TextField, InputAdornment, IconButton, Card, CardActionArea,
  CardMedia, Typography, Skeleton, Chip, Alert, CircularProgress,
  Grow, Zoom, Fab,
} from '@mui/material'
import Grid from '@mui/material/Grid2'
import SearchIcon from '@mui/icons-material/Search'
import ClearIcon from '@mui/icons-material/Clear'
import DownloadIcon from '@mui/icons-material/Download'
import CheckCircleIcon from '@mui/icons-material/CheckCircle'
import { searchImages, downloadAsBlob, type SearchResponse } from './api'
import type { SearchResult, MediaItem } from './types'

interface Props {
  onSave: (item: MediaItem, blob: Blob) => Promise<void>
  savedIds: Set<string>
}

const SUGGESTIONS = ['cats', 'nature', 'mountains', 'space', 'ocean', 'flowers', 'city', 'dogs']

const SearchView = ({ onSave, savedIds }: Props) => {
  const [query, setQuery] = useState('')
  const [activeQuery, setActiveQuery] = useState('')
  const [data, setData] = useState<SearchResponse | null>(null)
  const [page, setPage] = useState(1)
  const [loading, setLoading] = useState(false)
  const [loadingMore, setLoadingMore] = useState(false)
  const [error, setError] = useState<string>('')
  const [saving, setSaving] = useState<Set<string>>(new Set())
  const inputRef = useRef<HTMLInputElement>(null)
  const sentinelRef = useRef<HTMLDivElement>(null)

  useEffect(() => { inputRef.current?.focus() }, [])

  const runSearch = async (q: string, p: number, append: boolean) => {
    if (!q.trim()) return
    if (append) setLoadingMore(true)
    else setLoading(true)
    setError('')
    try {
      const res = await searchImages(q, p, 24)
      setData(prev => append && prev
        ? { ...res, results: [...prev.results, ...res.results] }
        : res)
    } catch (e: any) {
      setError(e.message || 'Search failed. Check your connection.')
    } finally {
      setLoading(false)
      setLoadingMore(false)
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const q = query.trim()
    if (!q) return
    setActiveQuery(q)
    setPage(1)
    runSearch(q, 1, false)
  }

  useEffect(() => {
    if (!sentinelRef.current || !data || loadingMore) return
    const obs = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting && page < data.pageCount && !loadingMore) {
        const next = page + 1
        setPage(next)
        runSearch(activeQuery, next, true)
      }
    }, { rootMargin: '400px' })
    obs.observe(sentinelRef.current)
    return () => obs.disconnect()
  }, [data, page, loadingMore, activeQuery])

  const saveImage = async (r: SearchResult) => {
    if (saving.has(r.id) || savedIds.has(r.id)) return
    setSaving(prev => new Set(prev).add(r.id))
    try {
      const { blob, filename } = await downloadAsBlob(r.url)
      const item: MediaItem = {
        id: r.id,
        url: '',
        name: filename,
        type: 'image',
        size: blob.size,
        addedAt: Date.now(),
        source: 'web',
        attribution: r.attribution,
        license: r.license,
        creator: r.creator,
        foreignUrl: r.foreignUrl,
      }
      await onSave(item, blob)
    } catch (e) {
      console.error('Save failed', e)
    } finally {
      setSaving(prev => {
        const next = new Set(prev)
        next.delete(r.id)
        return next
      })
    }
  }

  return (
    <Box sx={{ pb: 12 }}>
      <Box component="form" onSubmit={handleSubmit} sx={{ p: 1.5, position: 'sticky', top: 64, zIndex: 5, backdropFilter: 'blur(20px)', bgcolor: 'rgba(0,0,0,0.6)' }}>
        <TextField
          inputRef={inputRef}
          fullWidth
          value={query}
          onChange={e => setQuery(e.target.value)}
          placeholder="Search images..."
          variant="outlined"
          size="small"
          sx={{
            '& .MuiOutlinedInput-root': {
              borderRadius: 999,
              bgcolor: 'rgba(255,255,255,0.08)',
              transition: 'all 0.3s',
              '&.Mui-focused': { bgcolor: 'rgba(255,255,255,0.12)' },
            }
          }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon sx={{ color: 'primary.main' }} />
              </InputAdornment>
            ),
            endAdornment: query && (
              <InputAdornment position="end">
                <IconButton size="small" onClick={() => setQuery('')}>
                  <ClearIcon fontSize="small" />
                </IconButton>
              </InputAdornment>
            )
          }}
        />
      </Box>

      {!activeQuery && (
        <Box sx={{ px: 2, pt: 2 }}>
          <Typography variant="overline" sx={{ opacity: 0.7 }}>Try</Typography>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mt: 1 }}>
            {SUGGESTIONS.map((s, i) => (
              <Grow in key={s} timeout={300 + i * 60}>
                <Chip
                  label={s}
                  onClick={() => { setQuery(s); setActiveQuery(s); setPage(1); runSearch(s, 1, false) }}
                  sx={{ cursor: 'pointer', transition: 'transform 0.2s', '&:hover': { transform: 'scale(1.08)' } }}
                />
              </Grow>
            ))}
          </Box>
          <Box sx={{ mt: 4, textAlign: 'center', opacity: 0.6 }}>
            <SearchIcon sx={{ fontSize: 80, opacity: 0.3 }} />
            <Typography variant="body2" sx={{ mt: 1 }}>
              Search millions of Creative Commons images
            </Typography>
          </Box>
        </Box>
      )}

      {error && <Alert severity="error" sx={{ m: 2 }}>{error}</Alert>}

      {loading && (
        <Grid container spacing={1} sx={{ p: 1 }}>
          {Array.from({ length: 9 }).map((_, i) => (
            <Grid key={i} size={{ xs: 4, sm: 4, md: 3 }}>
              <Skeleton variant="rectangular" sx={{ aspectRatio: '1/1', borderRadius: 1.5 }} animation="wave" />
            </Grid>
          ))}
        </Grid>
      )}

      {data && !loading && (
        <>
          <Typography variant="caption" sx={{ px: 2, display: 'block', opacity: 0.6 }}>
            {data.count.toLocaleString()} results for "{activeQuery}"
          </Typography>
          <Grid container spacing={1} sx={{ p: 1 }}>
            {data.results.map((r, i) => {
              const isSaved = savedIds.has(r.id)
              const isSaving = saving.has(r.id)
              return (
                <Grid key={r.id} size={{ xs: 6, sm: 4, md: 3 }}>
                  <Zoom in timeout={200 + (i % 8) * 40}>
                    <Card sx={{ aspectRatio: '1/1', borderRadius: 1.5, position: 'relative', overflow: 'hidden', transition: 'transform 0.25s', '&:hover': { transform: 'scale(1.02)' } }}>
                      <CardActionArea onClick={() => saveImage(r)} sx={{ height: '100%' }}>
                        <CardMedia
                          component="img"
                          image={r.thumb}
                          alt={r.title}
                          loading="lazy"
                          sx={{ width: '100%', height: '100%', objectFit: 'cover' }}
                        />
                        {isSaved && (
                          <Box sx={{
                            position: 'absolute', inset: 0,
                            bgcolor: 'rgba(0,0,0,0.45)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                          }}>
                            <CheckCircleIcon sx={{ fontSize: 48, color: 'success.main' }} />
                          </Box>
                        )}
                        {isSaving && (
                          <Box sx={{
                            position: 'absolute', inset: 0,
                            bgcolor: 'rgba(0,0,0,0.5)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                          }}>
                            <CircularProgress size={32} />
                          </Box>
                        )}
                        {!isSaved && !isSaving && (
                          <Fab
                            size="small"
                            color="primary"
                            onClick={(e) => { e.stopPropagation(); saveImage(r) }}
                            sx={{ position: 'absolute', bottom: 6, right: 6, opacity: 0, transition: 'opacity 0.2s', '.MuiCard-root:hover &': { opacity: 1 } }}
                          >
                            <DownloadIcon fontSize="small" />
                          </Fab>
                        )}
                      </CardActionArea>
                    </Card>
                  </Zoom>
                </Grid>
              )
            })}
          </Grid>
          <div ref={sentinelRef} style={{ height: 40, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
            {loadingMore && <CircularProgress size={24} />}
          </div>
        </>
      )}
    </Box>
  )
}

export default SearchView
