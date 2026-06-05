import { useState } from 'react'
import {
  Box, Typography, Switch, TextField, IconButton, Collapse, Divider,
  Card, CardContent, Button, Chip, Alert, ToggleButton, ToggleButtonGroup, Slide,
} from '@mui/material'
import ArrowBackIcon from '@mui/icons-material/ArrowBack'
import ExpandMoreIcon from '@mui/icons-material/ExpandMore'
import OpenInNewIcon from '@mui/icons-material/OpenInNew'
import VisibilityIcon from '@mui/icons-material/Visibility'
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff'
import LanguageIcon from '@mui/icons-material/Language'
import FullscreenIcon from '@mui/icons-material/Fullscreen'
import { PROVIDERS, type ProviderId, type ProviderConfig } from './types'
import { useSettings } from './useSettings'

interface Props {
  onBack: () => void
}

const AR_GUIDE: Record<ProviderId, string[]> = {
  wikipedia: [
    'لا يحتاج مفتاح. فعّل المزود للاستخدام فوراً.',
  ],
  nasa: [
    'لا يحتاج مفتاح. فعّل المزود للاستخدام فوراً.',
  ],
  pexels: [
    '1. افتح الرابط: pexels.com/api',
    '2. اضغط "Get Started" وسجّل حساباً مجانياً (يمكن استخدام حساب Google).',
    '3. بعد التسجيل، اذهب إلى لوحة التحكم وستجد "Your API Key".',
    '4. انسخ المفتاح والصقه في الحقل أدناه.',
    '5. فعّل المزود بالزر في الأعلى.',
  ],
  pixabay: [
    '1. افتح الرابط: pixabay.com/api/docs',
    '2. اضغط "Get Started" وسجّل حساباً مجانياً.',
    '3. بعد تأكيد الإيميل، ستجد مفتاحك في صفحة الـ API.',
    '4. انسخ المفتاح والصقه في الحقل أدناه.',
    '5. فعّل المزود بالزر في الأعلى.',
  ],
  unsplash: [
    '1. افتح الرابط: unsplash.com/developers',
    '2. سجّل حساباً (يمكن بحساب Google).',
    '3. اذهب إلى "Your Apps" واضغط "New Application".',
    '4. اقبل الشروط وأكمل البيانات (يمكنك كتابة أي اسم ووصف).',
    '5. ستجد "Access Key" — انسخه والصقه هنا.',
    '6. فعّل المزود.',
  ],
  flickr: [
    '1. افتح: flickr.com/services/apps/create',
    '2. سجّل دخولك (يمكن بحساب Google أو Yahoo).',
    '3. اختر "Apply for a non-commercial key".',
    '4. سمّ التطبيق واكتب وصفاً قصيراً.',
    '5. انسخ "Key" والصقه هنا.',
    '6. فعّل المزود.',
  ],
  bing: [
    '1. افتح: azure.microsoft.com/free',
    '2. سجّل حساب Azure مجاني (لا يتطلب بطاقة بنكية للتحقق البسيط).',
    '3. بعد الدخول، اذهب إلى portal.azure.com',
    '4. اضغط "Create a resource" وابحث عن "Bing Search v7".',
    '5. اختر "Free F1" pricing tier وأنشئ المورد.',
    '6. اذهب إلى "Keys and Endpoint" وانسخ KEY 1.',
    '7. الصق المفتاح هنا وفعّل المزود.',
    'ملاحظة: 1000 طلب/شهر مجاناً (يكفي للاستخدام الشخصي).',
  ],
  e621: [
    'لا يحتاج مفتاح. فعّل المزود للاستخدام.',
    'البحث يكون بالتاجات: مثلاً "cat anthro" أو "female solo".',
    'يدعم المحتوى البالغ (NSFW) بالكامل.',
  ],
  danbooru: [
    'لا يحتاج مفتاح. فعّل المزود للاستخدام.',
    'البحث يكون بالتاجات: مثلاً "1girl cat_ears" أو "male solo".',
    'يدعم المحتوى البالغ. استخدم تاجات مثل rating:e للنتائج الحصرية.',
  ],
  yandere: [
    'لا يحتاج مفتاح. فعّل المزود للاستخدام.',
    'البحث يكون بالتاجات: مثلاً "cat_ears dress" أو "1girl".',
    'يدعم المحتوى البالغ (NSFW).',
  ],
}

const EN_GUIDE: Record<ProviderId, string[]> = {
  wikipedia: ['No key needed. Just enable and use.'],
  nasa: ['No key needed. Just enable and use.'],
  pexels: [
    '1. Open: pexels.com/api',
    '2. Click "Get Started" and sign up free (Google account works).',
    '3. After signup, your dashboard shows "Your API Key".',
    '4. Copy the key and paste it below.',
    '5. Toggle the provider on.',
  ],
  pixabay: [
    '1. Open: pixabay.com/api/docs',
    '2. Click "Get Started" and sign up free.',
    '3. After email confirmation, find your key on the API page.',
    '4. Copy the key and paste it below.',
    '5. Toggle the provider on.',
  ],
  unsplash: [
    '1. Open: unsplash.com/developers',
    '2. Sign up (Google works).',
    '3. Go to "Your Apps" → "New Application".',
    '4. Accept terms, fill any name/description.',
    '5. Copy the "Access Key" and paste it here.',
    '6. Toggle the provider on.',
  ],
  flickr: [
    '1. Open: flickr.com/services/apps/create',
    '2. Sign in (Google or Yahoo works).',
    '3. Choose "Apply for a non-commercial key".',
    '4. Name your app, short description.',
    '5. Copy the "Key" and paste it here.',
    '6. Toggle the provider on.',
  ],
  bing: [
    '1. Open: azure.microsoft.com/free',
    '2. Sign up for a free Azure account.',
    '3. After login, go to portal.azure.com',
    '4. "Create a resource" → search "Bing Search v7".',
    '5. Choose "Free F1" tier and create.',
    '6. Go to "Keys and Endpoint", copy KEY 1.',
    '7. Paste here and toggle the provider on.',
    'Note: 1000 requests/month free.',
  ],
  e621: [
    'No key needed. Just toggle on.',
    'Search by tags: e.g. "cat anthro" or "female solo".',
    'Full NSFW support.',
  ],
  danbooru: [
    'No key needed. Just toggle on.',
    'Search by tags: e.g. "1girl cat_ears" or "male solo".',
    'NSFW supported. Add rating:e for explicit only.',
  ],
  yandere: [
    'No key needed. Just toggle on.',
    'Search by tags: e.g. "cat_ears dress" or "1girl".',
    'NSFW supported.',
  ],
}

const SettingsView = ({ onBack }: Props) => {
  const { settings, toggleProvider, setKey, setLanguage, setAutoFullscreen, setNsfwEnabled, resetSettings } = useSettings()
  const [showKey, setShowKey] = useState<Record<string, boolean>>({})
  const [expanded, setExpanded] = useState<Record<string, boolean>>({})
  const isAr = settings.language === 'ar'

  return (
    <Slide in direction="left" timeout={300} mountOnEnter unmountOnExit>
      <Box sx={{ pb: 12, direction: isAr ? 'rtl' : 'ltr' }}>
        <Box sx={{
          p: 1.5, position: 'sticky', top: 0, zIndex: 10,
          backdropFilter: 'blur(20px)', bgcolor: 'rgba(0,0,0,0.6)',
          display: 'flex', alignItems: 'center', gap: 1,
        }}>
          <IconButton onClick={onBack}><ArrowBackIcon /></IconButton>
          <Typography variant="h6" sx={{ fontWeight: 600 }}>
            {isAr ? 'الإعدادات' : 'Settings'}
          </Typography>
        </Box>

        <Box sx={{ p: 2 }}>
          <Card sx={{ mb: 2, bgcolor: 'rgba(255,255,255,0.04)' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                <LanguageIcon color="primary" />
                <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                  {isAr ? 'اللغة' : 'Language'}
                </Typography>
              </Box>
              <ToggleButtonGroup
                value={settings.language}
                exclusive
                onChange={(_, v) => v && setLanguage(v)}
                fullWidth
                size="small"
              >
                <ToggleButton value="en">English</ToggleButton>
                <ToggleButton value="ar">العربية</ToggleButton>
              </ToggleButtonGroup>
            </CardContent>
          </Card>

          <Card sx={{ mb: 2, bgcolor: 'rgba(255,255,255,0.04)' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <FullscreenIcon color="primary" />
                <Box sx={{ flexGrow: 1 }}>
                  <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                    {isAr ? 'ملء الشاشة عند الفتح' : 'Auto fullscreen on launch'}
                  </Typography>
                  <Typography variant="caption" sx={{ opacity: 0.7 }}>
                    {isAr
                      ? 'يدخل وضع ملء الشاشة تلقائياً عند فتح التطبيق'
                      : 'Enter fullscreen mode automatically when app opens'}
                  </Typography>
                </Box>
                <Switch
                  checked={settings.autoFullscreen}
                  onChange={(e) => setAutoFullscreen(e.target.checked)}
                />
              </Box>
            </CardContent>
          </Card>

          <Card sx={{ mb: 2, bgcolor: settings.nsfwEnabled ? 'rgba(255,167,38,0.12)' : 'rgba(255,255,255,0.04)' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Typography sx={{ fontSize: 22 }}>🔞</Typography>
                <Box sx={{ flexGrow: 1 }}>
                  <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                    {isAr ? 'السماح بالمحتوى البالغ' : 'Allow NSFW content'}
                  </Typography>
                  <Typography variant="caption" sx={{ opacity: 0.7 }}>
                    {isAr
                      ? 'يعرض النتائج الحصرية من Bing، Flickr، Pixabay وbooru providers'
                      : 'Shows explicit results from Bing, Flickr, Pixabay and booru providers'}
                  </Typography>
                </Box>
                <Switch
                  checked={settings.nsfwEnabled}
                  onChange={(e) => setNsfwEnabled(e.target.checked)}
                  color="warning"
                />
              </Box>
            </CardContent>
          </Card>

          <Divider sx={{ my: 2 }} />

          <Typography variant="overline" sx={{ opacity: 0.7, px: 1 }}>
            {isAr ? 'محركات البحث' : 'Search Providers'}
          </Typography>
          {settings.enabled.wikipedia === false && settings.enabled.nasa === false &&
            Object.values(settings.enabled).every(v => !v) && (
            <Alert severity="info" sx={{ m: 1 }}>
              {isAr
                ? 'فعّل مزوداً واحداً على الأقل للبدء'
                : 'Enable at least one provider to start'}
            </Alert>
          )}

          {PROVIDERS.map((p) => (
            <ProviderCard
              key={p.id}
              p={p}
              enabled={settings.enabled[p.id]}
              value={settings.keys[p.id] || ''}
              showKey={!!showKey[p.id]}
              expanded={!!expanded[p.id]}
              isAr={isAr}
              onToggle={() => toggleProvider(p.id)}
              onChangeKey={(v) => setKey(p.id, v)}
              onToggleShow={() => setShowKey(s => ({ ...s, [p.id]: !s[p.id] }))}
              onToggleExpand={() => setExpanded(s => ({ ...s, [p.id]: !s[p.id] }))}
            />
          ))}

          <Button
            fullWidth
            variant="outlined"
            color="warning"
            onClick={() => {
              if (confirm(isAr ? 'هل تريد إعادة تعيين كل الإعدادات؟' : 'Reset all settings to defaults?')) {
                resetSettings()
              }
            }}
            sx={{ mt: 2 }}
          >
            {isAr ? 'إعادة تعيين الإعدادات' : 'Reset all settings'}
          </Button>
        </Box>
      </Box>
    </Slide>
  )
}

interface CardProps {
  p: ProviderConfig
  enabled: boolean
  value: string
  showKey: boolean
  expanded: boolean
  isAr: boolean
  onToggle: () => void
  onChangeKey: (v: string) => void
  onToggleShow: () => void
  onToggleExpand: () => void
}

const ProviderCard = ({
  p, enabled, value, showKey, expanded, isAr,
  onToggle, onChangeKey, onToggleShow, onToggleExpand,
}: CardProps) => {
  const guide = isAr ? AR_GUIDE[p.id] : EN_GUIDE[p.id]
  return (
    <Card sx={{ mb: 1.5, bgcolor: enabled ? 'rgba(144,202,249,0.08)' : 'rgba(255,255,255,0.03)' }}>
      <CardContent sx={{ pb: 1 }}>
        <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1.5 }}>
          <Box sx={{
            width: 44, height: 44, borderRadius: 2,
            bgcolor: enabled ? 'primary.main' : 'rgba(255,255,255,0.1)',
            color: enabled ? 'primary.contrastText' : 'text.secondary',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontWeight: 700, fontSize: 16, flexShrink: 0, transition: 'all 0.2s',
          }}>
            {p.icon}
          </Box>
          <Box sx={{ flexGrow: 1, minWidth: 0 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
              <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                {isAr ? p.nameAr : p.name}
              </Typography>
              <Chip
                size="small"
                label={isAr ? p.freeTierAr : p.freeTier}
                sx={{ height: 18, fontSize: 10 }}
                color="success"
                variant="outlined"
              />
            </Box>
            <Typography variant="caption" sx={{ opacity: 0.7, display: 'block' }}>
              {isAr ? p.descriptionAr : p.description}
            </Typography>
          </Box>
          <Switch checked={enabled} onChange={onToggle} />
        </Box>

        {p.needsKey && (
          <Box sx={{ mt: 1.5 }}>
            <TextField
              fullWidth
              size="small"
              type={showKey ? 'text' : 'password'}
              value={value}
              onChange={(e) => onChangeKey(e.target.value)}
              placeholder={p.keyLabel}
              label={p.keyLabel}
              autoComplete="off"
              InputProps={{
                endAdornment: (
                  <IconButton size="small" onClick={onToggleShow} edge="end">
                    {showKey ? <VisibilityOffIcon fontSize="small" /> : <VisibilityIcon fontSize="small" />}
                  </IconButton>
                )
              }}
            />
          </Box>
        )}

        <Box sx={{ mt: 1, display: 'flex', gap: 1, alignItems: 'center' }}>
          {p.signupUrl && (
            <Button
              size="small"
              startIcon={<OpenInNewIcon />}
              href={p.signupUrl}
              target="_blank"
              rel="noopener"
            >
              {isAr ? 'احصل على مفتاح' : 'Get key'}
            </Button>
          )}
          <Button
            size="small"
            onClick={onToggleExpand}
            endIcon={
              <ExpandMoreIcon
                sx={{ transition: 'transform 0.2s', transform: expanded ? 'rotate(180deg)' : 'rotate(0deg)' }}
              />
            }
          >
            {isAr ? 'كيف أحصل على المفتاح؟' : 'How to get the key?'}
          </Button>
        </Box>

        <Collapse in={expanded}>
          <Alert severity="info" sx={{ mt: 1, '& .MuiAlert-message': { width: '100%' } }}>
            <Box component="ol" sx={{ pl: 2, m: 0 }}>
              {guide.map((step, i) => (
                <li key={i} style={{ marginBottom: 4 }}>{step}</li>
              ))}
            </Box>
          </Alert>
        </Collapse>
      </CardContent>
    </Card>
  )
}

export default SettingsView
