'use client';

import Image from 'next/image';
import { useState } from 'react';
import { DiagnosticMark } from '@/components/diagnostic-mark';

export function DiagnosticProjectPreview() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className={`journal-project-preview${isOpen ? ' is-open' : ''}`}>
      <button
        aria-label={
          isOpen
            ? '設計診断の画面を閉じてアイコンに戻す'
            : '設計診断の画面を見る'
        }
        aria-pressed={isOpen}
        className="journal-project-preview-button"
        onClick={() => setIsOpen((current) => !current)}
        type="button"
      >
        <span className="journal-project-preview-icon" aria-hidden="true">
          <span className="journal-site-domain">設計診断</span>
          <DiagnosticMark />
        </span>

        <span className="journal-project-preview-screen" aria-hidden="true">
          <Image
            alt=""
            height={712}
            src="/work/tech-interviewer-home.png"
            width={1265}
          />
        </span>

        <span className="journal-project-preview-action" aria-hidden="true">
          {isOpen ? 'アイコンに戻す' : '画面を見る'}
        </span>
      </button>
    </div>
  );
}
