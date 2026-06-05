import { useEffect, useMemo, useState } from 'react'
import {
  AppBar, Toolbar, Typography, IconButton, Box, Fab, Card, CardActionArea,
  CardMedia, Dialog, DialogContent, IconButton as MuiIconButton, Chip, Snackbar, Alert,
  BottomNavigation, BottomNavigationAction, Slide, Fade, Zoom, Tooltip,
} from '@mui/material'
import AddPhotoAlternateIcon from '@mui/icons-material/AddPhotoAlternate'
import CloseIcon from '@mui/icons-material/Close'
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline'
import PhotoLibraryIcon from '@mui/icons-material/PhotoLibrary'
import PlayCircleFilledIcon from '@mui/icons-material/PlayCircleFilled'
import GifBoxIcon from '@mui/icons-material/GifBox'
import SearchIcon from '@mui/icons-material/Search'
import SettingsIcon from '@mui/icons-material/Settings'
import FullscreenIcon from '@mui/icons-material/Fullscreen'
import FullscreenExitIcon from '@mui/icons-material/FullscreenExit'
import { useMedia } from './useMedia'
import { useSettings } from './useSettings'
import { useFullscreen } from './useFullscreen'
import { formatSize, type MediaItem, type MediaType } from './types'
import { t } from './i18n'
import SearchView from './SearchView'
import SettingsView from './Settings'

const ACCEPTS = 'image/*,video/*'

function App() {
  const { items, loading, add, remove, getUrl } = useMedia()
  const { settings } = useSettings()
  const { isFullscreen, toggle: toggleFs } = useFullscreen()
  const [tab, setTab] = useState(0)
  const [open, setOpen] = useState<MediaItem | null>(null)
  const [openUrl, setOpenUrl] = useState<string>('')
  const [toast, setToast] = useState<string>('')
  const isAr = settings.language === 'ar'
  const tr = t(settings.language)

  useEffect(() => {
    document.documentElement.lang = settings.language
    document.documentElement.dir = isAr ? 'rtl' : 'ltr'
  }, [settings.language, isAr])

  useEffect(() => {
    if (settings.autoFullscreen && !isFullscreen) {
      const t = setTimeout(() => toggleFs(), 500)
      return () => clearTimeout(t)
    }
  }, [settings.autoFullscreen])

  const savedIds = useMemo(() => new Set(items.map(i => i.id)), [items])

  const onView = async (item: MediaItem) => {
    setOpen(item)
    setOpenUrl('')
    if (item.source === 'web') {
      const url = await getUrl(item.id)
      if (url) setOpenUrl(url)
    } else {
      setOpenUrl(item.url)
    }
  }

  const onClose = () => { setOpen(null); setOpenUrl('') }
  const onDelete = async (id: string) => { await remove(id); onClose() }

  const addLocalFiles = (files: FileList | null) => {
    if (!files || !files.length) return
    Array.from(files).forEach(f => {
      const url = URL.createObjectURL(f)
      const type: MediaType = f.type === 'image/gif' ? 'gif' : f.type.startsWith('video/') ? 'video' : 'image'
      const id = `local-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`
      add({
        id, url, name: f.name, type, size: f.size, addedAt: Date.now(), source: 'local',
      })
    })
    setToast(tr.addedFiles(files.length))
  }

  const saveFromWeb = async (item: MediaItem, blob: Blob) => {
    await add(item, blob)
    setToast(tr.savedFile(item.name))
  }

  const counts = items.reduce<Record<MediaType, number>>(
    (acc, i) => ({ ...acc, [i.type]: acc[i.type] + 1 }),
    { image: 0, video: 0, gif: 0 }
  )

  return (
    <Box sx={{ minHeight: '100vh', pb: 10, direction: isAr ? 'rtl' : 'ltr' }}>
      <AppBar position="sticky" elevation={0} sx={{ background: 'linear-gradient(180deg, rgba(25,118,210,0.25) 0%, rgba(0,0,0,0) 100%)', backdropFilter: 'blur(20px)' }}>
        <Toolbar>
          <PhotoLibraryIcon sx={{ mr: 1, transition: 'transform 0.5s', transform: tab === 0 ? 'rotate(0deg)' : 'rotate(360deg)' }} />
          <Typography variant="h6" sx={{ flexGrow: 1, fontWeight: 600 }}>{tr.appTitle}</Typography>
          <Tooltip title={isAr ? (isFullscreen ? 'الخروج من ملء الشاشة' : 'ملء الشاشة') : (isFullscreen ? 'Exit fullscreen' : 'Fullscreen')}>
            <IconButton color="inherit" onClick={toggleFs}>
              {isFullscreen ? <FullscreenExitIcon /> : <FullscreenIcon />}
            </IconButton>
          </Tooltip>
          <Chip label={items.length} size="small" sx={{ bgcolor: 'rgba(255,255,255,0.15)', fontWeight: 600 }} />
        </Toolbar>
      </AppBar>

      {tab === 0 && (
        <Box>
          <Fade in timeout={400}>
            <Box sx={{ display: 'flex', gap: 1, p: 1.5, overflowX: 'auto' }}>
              <Chip icon={<PhotoLibraryIcon />} label={`${counts.image}`} variant="outlined" size="small" />
              <Chip icon={<PlayCircleFilledIcon />} label={`${counts.video}`} variant="outlined" size="small" />
              <Chip icon={<GifBoxIcon />} label={`${counts.gif}`} variant="outlined" size="small" />
            </Box>
          </Fade>

          {loading ? (
            <Box sx={{ p: 4, textAlign: 'center', opacity: 0.6 }}>Loading…</Box>
          ) : items.length === 0 ? (
            <Fade in timeout={600}>
              <Box sx={{
                display: 'flex', flexDirection: 'column', alignItems: 'center',
                justifyContent: 'center', textAlign: 'center', px: 4, mt: 8,
              }}>
                <Zoom in timeout={800} style={{ transitionDelay: '200ms' }}>
                  <PhotoLibraryIcon sx={{ fontSize: 96, opacity: 0.4, mb: 2 }} />
                </Zoom>
                <Typography variant="h6" gutterBottom>{tr.noMedia}</Typography>
                <Typography variant="body2" sx={{ opacity: 0.7, mb: 3, maxWidth: 320, whiteSpace: 'pre-line' }}>
                  {tr.noMediaHint}
                </Typography>
              </Box>
            </Fade>
          ) : (
            <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 0.5, px: 0.5 }}>
              {items.map((item, i) => (
                <Box
                  key={item.id}
                  sx={{
                    aspectRatio: '1/1',
                    animation: `fadeUp 0.4s ease both`,
                    animationDelay: `${Math.min(i * 30, 600)}ms`,
                    '@keyframes fadeUp': {
                      from: { opacity: 0, transform: 'scale(0.85) translateY(10px)' },
                      to: { opacity: 1, transform: 'scale(1) translateY(0)' },
                    },
                  }}
                >
                  <GalleryThumb item={item} onClick={() => onView(item)} getUrl={getUrl} isAr={isAr} />
                </Box>
              ))}
            </Box>
          )}

          <input
            id="file-input"
            type="file"
            accept={ACCEPTS}
            multiple
            hidden
            onChange={e => { addLocalFiles(e.target.files); e.target.value = '' }}
          />

          <Zoom in timeout={300}>
            <Fab
              color="primary"
              onClick={() => document.getElementById('file-input')?.click()}
              sx={{
                position: 'fixed', bottom: 88, [isAr ? 'left' : 'right']: 24,
                boxShadow: '0 8px 24px rgba(144,202,249,0.4)',
                transition: 'transform 0.3s',
                '&:hover': { transform: 'scale(1.1) rotate(90deg)' },
                '&:active': { transform: 'scale(0.95)' },
              }}
            >
              <AddPhotoAlternateIcon />
            </Fab>
          </Zoom>
        </Box>
      )}

      {tab === 1 && (
        <Slide in direction={isAr ? 'right' : 'left'} timeout={300} mountOnEnter unmountOnExit>
          <Box>
            <SearchView onSave={saveFromWeb} savedIds={savedIds} settings={settings} />
          </Box>
        </Slide>
      )}

      {tab === 2 && (
        <SettingsView onBack={() => setTab(0)} />
      )}

      <Slide in direction="up" timeout={500}>
        <BottomNavigation
          value={tab}
          onChange={(_, v) => setTab(v)}
          showLabels
          sx={{
            position: 'fixed', bottom: 0, left: 0, right: 0,
            backdropFilter: 'blur(20px)',
            bgcolor: 'rgba(20,20,20,0.85)',
            borderTop: '1px solid rgba(255,255,255,0.08)',
            zIndex: 10,
          }}
        >
          <BottomNavigationAction label={tr.myGallery} icon={<PhotoLibraryIcon />} />
          <BottomNavigationAction label={tr.searchWeb} icon={<SearchIcon />} />
          <BottomNavigationAction label={tr.settings} icon={<SettingsIcon />} />
        </BottomNavigation>
      </Slide>

      <Dialog open={!!open} onClose={onClose} maxWidth="md" fullWidth TransitionComponent={Slide} transitionDuration={300}>
        {open && (
          <>
            <AppBar position="relative" elevation={0} sx={{ background: 'linear-gradient(180deg, rgba(0,0,0,0.6) 0%, rgba(0,0,0,0) 100%)' }}>
              <Toolbar>
                <Typography sx={{ flexGrow: 1 }} noWrap>{open.name}</Typography>
                <IconButton color="inherit" onClick={() => onDelete(open.id)}>
                  <DeleteOutlineIcon />
                </IconButton>
                <MuiIconButton color="inherit" onClick={onClose}>
                  <CloseIcon />
                </MuiIconButton>
              </Toolbar>
            </AppBar>
            <DialogContent sx={{ p: 0, bgcolor: 'black', textAlign: 'center', minHeight: 300 }}>
              {open.type === 'video' ? (
                <video src={openUrl} controls autoPlay style={{ maxWidth: '100%', maxHeight: '80vh' }} />
              ) : openUrl ? (
                <Fade in timeout={400}>
                  <img src={openUrl} alt={open.name} style={{ maxWidth: '100%', maxHeight: '80vh' }} />
                </Fade>
              ) : (
                <Box sx={{ p: 4, color: 'grey.500' }}>Loading…</Box>
              )}
              <Typography variant="caption" sx={{ display: 'block', p: 1, color: 'grey.400' }}>
                {formatSize(open.size)} • {open.type}
                {open.creator && ` • ${open.creator}`}
              </Typography>
            </DialogContent>
          </>
        )}
      </Dialog>

      <Snackbar open={!!toast} autoHideDuration={2200} onClose={() => setToast('')} TransitionComponent={Slide}>
        <Alert severity="success" variant="filled" onClose={() => setToast('')}>{toast}</Alert>
      </Snackbar>
    </Box>
  )
}

const GalleryThumb = ({ item, onClick, getUrl, isAr }: { item: MediaItem; onClick: () => void; getUrl: (id: string) => Promise<string | null>; isAr: boolean }) => {
  const [url, setUrl] = useState<string>(item.url)

  useEffect(() => {
    if (item.source === 'web' && !url) {
      getUrl(item.id).then(u => u && setUrl(u))
    }
  }, [item.id, item.source])

  return (
    <Card sx={{ aspectRatio: '1/1', borderRadius: 1.5, overflow: 'hidden', height: '100%' }}>
      <CardActionArea onClick={onClick} sx={{ height: '100%' }}>
        {item.type === 'video' ? (
          <Box sx={{ position: 'relative', width: '100%', height: '100%' }}>
            <video src={url} muted style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            <PlayCircleFilledIcon sx={{
              position: 'absolute', top: '50%', left: '50%',
              transform: 'translate(-50%, -50%)', fontSize: 32, opacity: 0.9,
              filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.5))',
            }} />
          </Box>
        ) : (
          <CardMedia
            component="img"
            image={url}
            alt={item.name}
            loading="lazy"
            sx={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.4s', '&:hover': { transform: 'scale(1.08)' } }}
          />
        )}
        {item.source === 'web' && (
          <Box sx={{
            position: 'absolute', top: 4, [isAr ? 'left' : 'right']: 4,
            bgcolor: 'rgba(0,0,0,0.6)', color: 'white',
            px: 0.7, py: 0.2, borderRadius: 0.5, fontSize: 9, fontWeight: 600,
          }}>
            web
          </Box>
        )}
      </CardActionArea>
    </Card>
  )
}

export default App
