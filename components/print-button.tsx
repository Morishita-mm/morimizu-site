'use client';

import { Printer } from 'lucide-react';

export function PrintButton({ locale = 'ja' }: { locale?: 'ja' | 'en' }) {
  const isEn = locale === 'en';

  const handlePrint = (orientation: 'portrait' | 'landscape') => {
    document.documentElement.setAttribute(
      'data-print-orientation',
      orientation,
    );

    let styleEl = document.getElementById(
      'print-orientation-style',
    ) as HTMLStyleElement | null;
    if (!styleEl) {
      styleEl = document.createElement('style');
      styleEl.id = 'print-orientation-style';
      document.head.appendChild(styleEl);
    }
    styleEl.textContent = `@page { size: A4 ${orientation}; margin: 8mm 10mm; }`;

    window.print();
  };

  return (
    <div className="resume-print-group">
      <button
        aria-label={
          isEn
            ? 'Print resume as A4 Portrait PDF'
            : '職務経歴書をA4縦向きで印刷またはPDF保存'
        }
        className="resume-print-button"
        onClick={() => handlePrint('portrait')}
        type="button"
      >
        <Printer aria-hidden="true" size={14} />
        <span>{isEn ? 'Print A4 (Portrait)' : 'A4縦で印刷'}</span>
      </button>

      <button
        aria-label={
          isEn
            ? 'Print resume as A4 Landscape PDF'
            : '職務経歴書をA4横向きで印刷またはPDF保存'
        }
        className="resume-print-button resume-print-button-secondary"
        onClick={() => handlePrint('landscape')}
        type="button"
      >
        <Printer aria-hidden="true" size={14} />
        <span>{isEn ? 'Print A4 (Landscape)' : 'A4横で印刷'}</span>
      </button>
    </div>
  );
}
