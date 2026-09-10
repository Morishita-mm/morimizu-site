'use client';

import { ChevronDown, Printer } from 'lucide-react';
import { useEffect, useId, useRef, useState } from 'react';
import { ControlLabel } from './control-label';

export function PrintButton({ locale = 'ja' }: { locale?: 'ja' | 'en' }) {
  const isEn = locale === 'en';
  const [open, setOpen] = useState(false);
  const panelId = useId();
  const mobileRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const resume = mobileRef.current?.closest('.poster-page-wrapper');
    let closedEntries: HTMLDetailsElement[] | null = null;
    const prepare = () => {
      if (closedEntries !== null) return;
      closedEntries = Array.from(
        resume?.querySelectorAll<HTMLDetailsElement>(
          '.poster-timeline-node:not([open])',
        ) ?? [],
      );
      for (const entry of closedEntries) entry.open = true;
    };
    const restore = () => {
      for (const entry of closedEntries ?? []) entry.open = false;
      closedEntries = null;
    };
    // Also covers printing from the browser menu or keyboard shortcut.
    window.addEventListener('beforeprint', prepare);
    window.addEventListener('afterprint', restore);
    return () => {
      window.removeEventListener('beforeprint', prepare);
      window.removeEventListener('afterprint', restore);
      restore();
    };
  }, []);

  useEffect(() => {
    if (!open) return;
    const dismissOutside = (event: PointerEvent) => {
      if (!mobileRef.current?.contains(event.target as Node)) setOpen(false);
    };
    const dismissEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setOpen(false);
        triggerRef.current?.focus();
      }
    };
    document.addEventListener('pointerdown', dismissOutside);
    document.addEventListener('keydown', dismissEscape);
    return () => {
      document.removeEventListener('pointerdown', dismissOutside);
      document.removeEventListener('keydown', dismissEscape);
    };
  }, [open]);

  const handlePrint = (orientation: 'portrait' | 'landscape') => {
    if (open) {
      setOpen(false);
      triggerRef.current?.focus();
    }
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

  const choices = (
    <>
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
        <ControlLabel
          locale={locale}
          ja="A4縦で印刷"
          en="Print A4 (Portrait)"
        />
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
        <ControlLabel
          locale={locale}
          ja="A4横で印刷"
          en="Print A4 (Landscape)"
        />
      </button>
    </>
  );

  return (
    <>
      <div className="resume-print-group resume-print-desktop">{choices}</div>
      <div
        className="resume-print-mobile"
        ref={mobileRef}
        onBlur={(event) => {
          if (!event.currentTarget.contains(event.relatedTarget))
            setOpen(false);
        }}
      >
        <button
          ref={triggerRef}
          type="button"
          className="resume-print-button resume-print-trigger"
          aria-expanded={open}
          aria-controls={panelId}
          onClick={() => setOpen(!open)}
        >
          <Printer aria-hidden="true" size={14} />
          <ControlLabel locale={locale} ja="印刷" en="Print" />
          <ChevronDown aria-hidden="true" size={14} />
        </button>
        <div id={panelId} className="resume-print-options" hidden={!open}>
          {choices}
        </div>
      </div>
    </>
  );
}
