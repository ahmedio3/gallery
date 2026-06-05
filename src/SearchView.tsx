import { useEffect, useRef, useState } from 'react'
import {
  Box, TextField, InputAdornment, IconButton, Card, CardActionArea,
  CardMedia, Typography, Skeleton, Chip, Alert, CircularProgress,
  Grow, Zoom, Fab, Tooltip,
} from '@mui/material'
import Grid from '@mui/material/Grid2'
import SearchIcon from '@mui/icons-material/Search'
import ClearIcon from '@mui/icons-material/Clear'
import DownloadIcon from '@mui/icons-material/Download'
import CheckCircleIcon from '@mui/icons-material/CheckCircle'
import { searchAll, type ProviderStatus } from './providers'
import { downloadAsBlob } from './api'
import type { SearchResult, MediaItem, Settings } from './types'
import { t } from './i18n'

interface Props {
  onSave: (item: MediaItem, blob: Blob) => Promise<void>
  savedIds: Set<string>
  settings: Settings
}

const SUGGESTIONS_EN = ['cats', 'nature', 'mountains', 'space', 'ocean', 'flowers', 'city', 'dogs']
const SUGGESTIONS_AR = ['قطط', 'طبيعة', 'جبال', 'فضاء', 'محيط', 'زهور', 'مدينة', 'كلاب']

const SearchView = ({ onSave, savedIds, settings }: Props) => {
  const lang = settings.language
  const tr = t(lang)
  const isAr = lang === 'ar'
  const [query, setQuery] = useState('')
  const [activeQuery, setActiveQuery] = useState('')
  const [results, setResults] = useState<SearchResult[]>([])
  const [statuses, setStatuses] = useState<ProviderStatus[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string>('')
  const [saving, setSaving] = useState<Set<string>>(new Set())
  const inputRef = useRef<HTMLInputElement>(null)
  const abortRef = useRef<AbortController | null>(null)

  useEffect(() => { inputRef.current?.focus() }, [])

  const runSearch = async (q: string) => {
    if (!q.trim()) return
    abortRef.current?.abort()
    const controller = new AbortController()
    abortRef.current = controller
    setLoading(true)
    setError('')
    setResults([])
    setStatuses([])
    try {
      const res = await searchAll(q, settings, 12, controller.signal)
      setResults(res.results)
      setStatuses(res.statuses)
      if (!res.results.length) setError(tr.noResults)
    } catch (e: any) {
      if (e.name !== 'AbortError') setError(e.message || 'Search failed')
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const q = query.trim()
    if (!q) return
    setActiveQuery(q)
    runSearch(q)
  }

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

  const suggestions = isAr ? SUGGESTIONS_AR : SUGGESTIONS_EN
  const enabledCount = statuses.filter(s => s.ok).length
  const failedProviders = statuses.filter(s => !s.ok)

  return (
    <Box sx={{ pb: 12, direction: isAr ? 'rtl' : 'ltr' }}>
      <Box component="form" onSubmit={handleSubmit} sx={{ p: 1.5, position: 'sticky', top: 64, zIndex: 5, backdropFilter: 'blur(20px)', bgcolor: 'rgba(0,0,0,0.6)' }}>
        <TextField
          inputRef={inputRef}
          fullWidth
          value={query}
          onChange={e => setQuery(e.target.value)}
          placeholder={isAr ? 'ابحث عن صور...' : 'Search images...'}
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
          <Typography variant="overline" sx={{ opacity: 0.7 }}>
            {isAr ? 'جرّب' : 'Try'}
          </Typography>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mt: 1 }}>
            {suggestions.map((s, i) => (
              <Grow in key={s} timeout={300 + i * 60}>
                <Chip
                  label={s}
                  onClick={() => { setQuery(s); setActiveQuery(s); runSearch(s) }}
                  sx={{ cursor: 'pointer', transition: 'transform 0.2s', '&:hover': { transform: 'scale(1.08)' } }}
                />
              </Grow>
            ))}
          </Box>
          <Box sx={{ mt: 4, textAlign: 'center', opacity: 0.6 }}>
            <SearchIcon sx={{ fontSize: 80, opacity: 0.3 }} />
            <Typography variant="body2" sx={{ mt: 1 }}>{tr.searchHint}</Typography>
            <Typography variant="caption" sx={{ display: 'block', mt: 1, opacity: 0.7 }}>
              {isAr ? 'يمكنك إضافة مفاتيح API من الإعدادات' : 'Add API keys in Settings for more sources'}
            </Typography>
          </Box>
        </Box>
      )}

      {statuses.length > 0 && (
        <Box sx={{ px: 2, py: 1, display: 'flex', flexWrap: 'wrap', gap: 0.5, alignItems: 'center' }}>
          <Chip
            size="small"
            label={isAr ? '🔞 NSFW: مفعّل' : '🔞 NSFW: ON'}
            color="warning"
            sx={{ height: 20, fontSize: 10, fontWeight: 600 }}
          />
          {statuses.map(s => (
            <Tooltip
              key={s.id}
              title={s.ok ? `${s.count} results` : s.error || 'failed'}
            >
              <Chip
                size="small"
                label={s.id}
                color={s.ok ? (s.count > 0 ? 'success' : 'default') : 'error'}
                variant={s.ok ? 'outlined' : 'filled'}
                sx={{ height: 20, fontSize: 10, opacity: s.ok ? 1 : 0.7 }}
              />
            </Tooltip>
          ))}
        </Box>
      )}

      {error && <Alert severity={failedProviders.length === statuses.length && statuses.length > 0 ? 'warning' : 'info'} sx={{ m: 2 }}>{error}</Alert>}

      {loading && (
        <Grid container spacing={1} sx={{ p: 1 }}>
          {Array.from({ length: 9 }).map((_, i) => (
            <Grid key={i} size={{ xs: 6, sm: 4, md: 3 }}>
              <Skeleton variant="rectangular" sx={{ aspectRatio: '1/1', borderRadius: 1.5 }} animation="wave" />
            </Grid>
          ))}
        </Grid>
      )}

      {!loading && results.length > 0 && (
        <>
          <Typography variant="caption" sx={{ px: 2, display: 'block', opacity: 0.6 }}>
            {results.length} {isAr ? 'نتيجة من' : 'results from'} {enabledCount} {isAr ? 'مصدر' : 'sources'}
          </Typography>
          <Grid container spacing={1} sx={{ p: 1 }}>
            {results.map((r, i) => {
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
                        <Box sx={{
                          position: 'absolute', top: 4, [isAr ? 'left' : 'right']: 4,
                          bgcolor: 'rgba(0,0,0,0.6)', color: 'white',
                          px: 0.7, py: 0.2, borderRadius: 0.5, fontSize: 9, fontWeight: 600,
                        }}>
                          {r.provider}
                        </Box>
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
                            sx={{ position: 'absolute', bottom: 6, [isAr ? 'left' : 'right']: 6, opacity: 0, transition: 'opacity 0.2s', '.MuiCard-root:hover &': { opacity: 1 } }}
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
        </>
      )}
    </Box>
  )
}

export default SearchView
