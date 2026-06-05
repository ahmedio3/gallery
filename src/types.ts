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
  provider: string
}

export type ProviderId = 'wikipedia' | 'nasa' | 'pexels' | 'pixabay' | 'unsplash' | 'flickr' | 'bing' | 'e621' | 'danbooru' | 'yandere'

export interface ProviderConfig {
  id: ProviderId
  name: string
  nameAr: string
  description: string
  descriptionAr: string
  needsKey: boolean
  keyLabel?: string
  keyHint?: string
  keyHintAr?: string
  signupUrl?: string
  signupUrlAr?: string
  freeTier?: string
  freeTierAr?: string
  icon?: string
}

export interface Settings {
  enabled: Record<ProviderId, boolean>
  keys: Record<string, string>
  language: 'en' | 'ar'
  autoFullscreen: boolean
  nsfwEnabled: boolean
}

export const PROVIDERS: ProviderConfig[] = [
  {
    id: 'wikipedia',
    name: 'Wikimedia Commons',
    nameAr: 'ويكيميديا كومنز',
    description: '100M+ free images. No key needed.',
    descriptionAr: 'أكثر من 100 مليون صورة مجانية. بدون مفتاح API.',
    needsKey: false,
    freeTier: 'Unlimited',
    freeTierAr: 'غير محدود',
    icon: 'W',
  },
  {
    id: 'nasa',
    name: 'NASA Images',
    nameAr: 'صور ناسا',
    description: 'NASA photo/video archive. No key needed.',
    descriptionAr: 'أرشيف صور وفيديو ناسا. بدون مفتاح API.',
    needsKey: false,
    freeTier: 'Unlimited',
    freeTierAr: 'غير محدود',
    icon: 'N',
  },
  {
    id: 'pexels',
    name: 'Pexels',
    nameAr: 'بيكسلز',
    description: 'High quality stock photos. 200 req/hour free.',
    descriptionAr: 'صور احترافية عالية الجودة. 200 طلب/ساعة مجاناً.',
    needsKey: true,
    keyLabel: 'Pexels API Key',
    keyHint: 'Sign up at pexels.com/api and copy your API key',
    keyHintAr: 'سجّل في pexels.com/api وانسخ مفتاح API',
    signupUrl: 'https://www.pexels.com/api/',
    freeTier: '200/hour',
    freeTierAr: '200/ساعة',
    icon: 'P',
  },
  {
    id: 'pixabay',
    name: 'Pixabay',
    nameAr: 'بيكساباي',
    description: 'Photos, vectors, illustrations. 5000 req/day free.',
    descriptionAr: 'صور وفيكتور ورسومات. 5000 طلب/يوم مجاناً.',
    needsKey: true,
    keyLabel: 'Pixabay API Key',
    keyHint: 'Sign up at pixabay.com/api and copy your key',
    keyHintAr: 'سجّل في pixabay.com/api وانسخ المفتاح',
    signupUrl: 'https://pixabay.com/api/docs/',
    freeTier: '5000/day',
    freeTierAr: '5000/يوم',
    icon: 'Px',
  },
  {
    id: 'unsplash',
    name: 'Unsplash',
    nameAr: 'أنسبلاش',
    description: 'Premium stock photos. 50 req/hour free.',
    descriptionAr: 'صور احترافية مميزة. 50 طلب/ساعة مجاناً.',
    needsKey: true,
    keyLabel: 'Unsplash Access Key',
    keyHint: 'Sign up at unsplash.com/developers, create an app, copy Access Key',
    keyHintAr: 'سجّل في unsplash.com/developers وأنشئ تطبيق وانسخ Access Key',
    signupUrl: 'https://unsplash.com/developers',
    freeTier: '50/hour',
    freeTierAr: '50/ساعة',
    icon: 'U',
  },
  {
    id: 'flickr',
    name: 'Flickr',
    nameAr: 'فليكر',
    description: 'Billions of photos from real users. 3600 req/hour free.',
    descriptionAr: 'مليارات الصور من مستخدمين حقيقيين. 3600 طلب/ساعة مجاناً.',
    needsKey: true,
    keyLabel: 'Flickr API Key',
    keyHint: 'Get a non-commercial key at flickr.com/services/apps/create',
    keyHintAr: 'احصل على مفتاح غير تجاري من flickr.com/services/apps/create',
    signupUrl: 'https://www.flickr.com/services/apps/create/',
    freeTier: '3600/hour',
    freeTierAr: '3600/ساعة',
    icon: 'F',
  },
  {
    id: 'bing',
    name: 'Bing Image Search',
    nameAr: 'بحث صور بينج',
    description: 'Aggregated from across the web (closest to Google). 1000/month free.',
    descriptionAr: 'يجمع من جميع مواقع الويب (الأقرب لجوجل). 1000/شهر مجاناً.',
    needsKey: true,
    keyLabel: 'Bing API Key (Azure)',
    keyHint: 'Create free Azure account, get Bing Search API key in marketplace',
    keyHintAr: 'أنشئ حساب Azure مجاني ثم فعّل Bing Search API من Marketplace',
    signupUrl: 'https://learn.microsoft.com/en-us/bing/search-apis/bing-image-search/overview',
    freeTier: '1000/month',
    freeTierAr: '1000/شهر',
    icon: 'B',
  },
  {
    id: 'e621',
    name: 'E621 (NSFW)',
    nameAr: 'E621 (محتوى للبالغين)',
    description: 'NSFW-friendly art archive. No key. Search: tag1 tag2',
    descriptionAr: 'أرشيف فني يدعم المحتوى للبالغين. بدون مفتاح. ابحث بـ: tag1 tag2',
    needsKey: false,
    freeTier: 'NSFW',
    freeTierAr: 'محتوى بالغ',
    icon: 'e6',
  },
  {
    id: 'danbooru',
    name: 'Danbooru (NSFW)',
    nameAr: 'دانبارو (محتوى للبالغين)',
    description: 'Largest anime booru. NSFW allowed. Tag-based search.',
    descriptionAr: 'أكبر أرشيف أنمي. يدعم المحتوى البالغ. ابحث بالتاجات.',
    needsKey: false,
    freeTier: 'NSFW',
    freeTierAr: 'محتوى بالغ',
    icon: 'D',
  },
  {
    id: 'yandere',
    name: 'Yande.re (NSFW)',
    nameAr: 'ياند.ري (محتوى للبالغين)',
    description: 'High-res anime. NSFW allowed. Tag-based search.',
    descriptionAr: 'صور أنمي عالية الدقة. يدعم المحتوى البالغ. ابحث بالتاجات.',
    needsKey: false,
    freeTier: 'NSFW',
    freeTierAr: 'محتوى بالغ',
    icon: 'Y',
  },
]

export const formatSize = (bytes: number): string => {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  if (bytes < 1024 * 1024 * 1024) return `${(bytes / 1024 / 1024).toFixed(1)} MB`
  return `${(bytes / 1024 / 1024 / 1024).toFixed(1)} GB`
}
