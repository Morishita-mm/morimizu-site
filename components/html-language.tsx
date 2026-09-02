'use client';

import { useEffect } from 'react';

export function HtmlLanguage({ locale }: { locale: 'ja' | 'en' }) {
  useEffect(() => {
    document.documentElement.lang = locale;
  }, [locale]);

  return null;
}
