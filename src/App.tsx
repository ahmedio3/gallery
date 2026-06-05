import { useEffect, useRef, useState } from 'react'
import {
  AppBar, Toolbar, Typography, IconButton, Box, Fab, Card, CardActionArea,
  CardMedia, Dialog, DialogContent, IconButton as MuiIconButton, Chip, Snackbar, Alert
} from '@mui/material'
import Grid from '@mui/material/Grid2'
import AddPhotoAlternateIcon from '@mui/icons-material/AddPhotoAlternate'
import CloseIcon from '@mui/icons-material/Close'
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline'
import PhotoLibraryIcon from '@mui/icons-material/PhotoLibrary'
import PlayCircleFilledIcon from '@mui/icons-material/PlayCircleFilled'
import GifBoxIcon from '@mui/icons-material/GifBox'
import { detectType, formatSize, loadItems, saveItems, type MediaItem, type MediaType } from './types'

const ACCEPTS = 'image/*,video/*'

function App() {
  const [items, setItems] = useState<MediaItem[]>([])
  const [open, setOpen] = useState<MediaItem | null>(null)
  const [toast, setToast] = useState<string>('')
  const fileRef = useRef<HTMLInputElement>(null)
  const urlsRef = useRef<string[]>([])

  useEffect(() => {
    const meta = loadItems()
    setItems(meta)
  }, [])

  useEffect(() => {
    return () => { urlsRef.current.forEach(u => URL.revokeObjectURL(u)) }
  }, [])

  const addFiles = (files: FileList | null) => {
    if (!files || !files.length) return
    const next: MediaItem[] = []
    Array.from(files).forEach(f => {
      const url = URL.createObjectURL(f)
      urlsRef.current.push(url)
      next.push({
        id: `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
        file: f,
        url,
        name: f.name,
        type: detectType(f),
        size: f.size,
        addedAt: Date.now(),
      })
    })
    setItems(prev => {
      const updated = [...next, ...prev]
      saveItems(updated)
      return updated
    })
    setToast(`Added ${files.length} file${files.length > 1 ? 's' : ''}`)
  }

  const remove = (id: string) => {
    setItems(prev => {
      const item = prev.find(i => i.id === id)
      if (item) URL.revokeObjectURL(item.url)
      const updated = prev.filter(i => i.id !== id)
      saveItems(updated)
      return updated
    })
    setOpen(null)
  }

  const counts = items.reduce<Record<MediaType, number>>(
    (acc, i) => ({ ...acc, [i.type]: acc[i.type] + 1 }),
    { image: 0, video: 0, gif: 0 }
  )

  return (
    <Box sx={{ minHeight: '100vh', pb: 10 }}>
      <AppBar position="sticky" elevation={0}>
        <Toolbar>
          <PhotoLibraryIcon sx={{ mr: 1 }} />
          <Typography variant="h6" sx={{ flexGrow: 1, fontWeight: 600 }}>Gallery</Typography>
          <Chip label={items.length} size="small" sx={{ bgcolor: 'rgba(255,255,255,0.15)' }} />
        </Toolbar>
      </AppBar>

      <Box sx={{ display: 'flex', gap: 1, p: 1.5, overflowX: 'auto' }}>
        <Chip icon={<PhotoLibraryIcon />} label={`${counts.image} photos`} variant="outlined" size="small" />
        <Chip icon={<PlayCircleFilledIcon />} label={`${counts.video} videos`} variant="outlined" size="small" />
        <Chip icon={<GifBoxIcon />} label={`${counts.gif} gifs`} variant="outlined" size="small" />
      </Box>

      {items.length === 0 ? (
        <Box sx={{
          display: 'flex', flexDirection: 'column', alignItems: 'center',
          justifyContent: 'center', textAlign: 'center', px: 4, mt: 8
        }}>
          <PhotoLibraryIcon sx={{ fontSize: 96, opacity: 0.4, mb: 2 }} />
          <Typography variant="h6" gutterBottom>No media yet</Typography>
          <Typography variant="body2" sx={{ opacity: 0.7, mb: 3 }}>
            Tap the plus button to add photos, videos, or gifs.
            <br />Everything stays on your device — works offline.
          </Typography>
        </Box>
      ) : (
        <Grid container spacing={0.5} sx={{ px: 0.5 }}>
          {items.map(item => (
            <Grid key={item.id} size={{ xs: 4, sm: 3, md: 2 }}>
              <Card sx={{ aspectRatio: '1/1', borderRadius: 1.5 }}>
                <CardActionArea onClick={() => setOpen(item)} sx={{ height: '100%' }}>
                  {item.type === 'video' ? (
                    <Box sx={{ position: 'relative', width: '100%', height: '100%' }}>
                      <video src={item.url} muted style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      <PlayCircleFilledIcon sx={{
                        position: 'absolute', top: '50%', left: '50%',
                        transform: 'translate(-50%, -50%)', fontSize: 32, opacity: 0.9
                      }} />
                    </Box>
                  ) : (
                    <CardMedia
                      component="img"
                      image={item.url}
                      alt={item.name}
                      sx={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    />
                  )}
                </CardActionArea>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}

      <input
        ref={fileRef}
        type="file"
        accept={ACCEPTS}
        multiple
        hidden
        onChange={e => { addFiles(e.target.files); e.target.value = '' }}
      />

      <Fab
        color="primary"
        onClick={() => fileRef.current?.click()}
        sx={{ position: 'fixed', bottom: 24, right: 24 }}
      >
        <AddPhotoAlternateIcon />
      </Fab>

      <Dialog open={!!open} onClose={() => setOpen(null)} maxWidth="md" fullWidth>
        {open && (
          <>
            <AppBar position="relative" elevation={0}>
              <Toolbar>
                <Typography sx={{ flexGrow: 1 }} noWrap>{open.name}</Typography>
                <IconButton color="inherit" onClick={() => remove(open.id)}>
                  <DeleteOutlineIcon />
                </IconButton>
                <MuiIconButton color="inherit" onClick={() => setOpen(null)}>
                  <CloseIcon />
                </MuiIconButton>
              </Toolbar>
            </AppBar>
            <DialogContent sx={{ p: 0, bgcolor: 'black', textAlign: 'center' }}>
              {open.type === 'video' ? (
                <video src={open.url} controls autoPlay style={{ maxWidth: '100%', maxHeight: '80vh' }} />
              ) : (
                <img src={open.url} alt={open.name} style={{ maxWidth: '100%', maxHeight: '80vh' }} />
              )}
              <Typography variant="caption" sx={{ display: 'block', p: 1, color: 'grey.400' }}>
                {formatSize(open.size)} • {open.type}
              </Typography>
            </DialogContent>
          </>
        )}
      </Dialog>

      <Snackbar open={!!toast} autoHideDuration={2200} onClose={() => setToast('')}>
        <Alert severity="success" variant="filled" onClose={() => setToast('')}>{toast}</Alert>
      </Snackbar>
    </Box>
  )
}

export default App
