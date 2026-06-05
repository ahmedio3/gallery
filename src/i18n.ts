export type Lang = 'en' | 'ar'

const T = {
  en: {
    appTitle: 'Gallery',
    myGallery: 'My Gallery',
    searchWeb: 'Search Web',
    settings: 'Settings',
    fullscreen: 'Fullscreen',
    exitFullscreen: 'Exit fullscreen',
    noMedia: 'No media yet',
    noMediaHint: 'Add local files or search the web for free images.\nEverything stays on your device — works offline.',
    searchHint: 'Search millions of free images on the web',
    noResults: 'No results. Try a different word.',
    searchFailed: 'Search failed. Check the error above or your API keys.',
    enabledProviders: 'Enabled',
    addFromDevice: 'Add from device',
    addedFiles: (n: number) => `Added ${n} file${n > 1 ? 's' : ''}`,
    savedFile: (name: string) => `Saved "${name}"`,
    noKeyHint: 'Add at least one API key in Settings, or enable Wikimedia/NASA (no key needed).',
  },
  ar: {
    appTitle: 'معرض الصور',
    myGallery: 'معرضي',
    searchWeb: 'بحث الويب',
    settings: 'الإعدادات',
    fullscreen: 'ملء الشاشة',
    exitFullscreen: 'الخروج من ملء الشاشة',
    noMedia: 'لا توجد صور بعد',
    noMediaHint: 'أضف ملفات محلية أو ابحث في الويب عن صور مجانية.\nكل شيء يبقى على جهازك — يعمل بدون إنترنت.',
    searchHint: 'ابحث في ملايين الصور المجانية على الإنترنت',
    noResults: 'لا توجد نتائج. جرّب كلمة أخرى.',
    searchFailed: 'فشل البحث. تحقق من الخطأ أعلاه أو من مفاتيح API.',
    enabledProviders: 'مفعّل',
    addFromDevice: 'إضافة من الجهاز',
    addedFiles: (n: number) => `تمت إضافة ${n} ${n > 1 ? 'ملفات' : 'ملف'}`,
    savedFile: (name: string) => `تم حفظ "${name}"`,
    noKeyHint: 'أضف مفتاح API واحد على الأقل من الإعدادات، أو فعّل ويكيميديا/ناسا (بدون مفتاح).',
  },
}

export const t = (lang: Lang) => T[lang]
