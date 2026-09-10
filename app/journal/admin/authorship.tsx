'use client';
import { useId } from 'react';
import type { JournalAuthorship } from '@/lib/journal/types';
import { readFrontMatter } from '@/lib/content/frontmatter.mjs';
import { serializeManuscript } from '@/journal/manuscript.mjs';
import type { Preview } from './preview';

export function withAuthorship<T extends Preview>(
  preview: T,
  authorship: JournalAuthorship,
): T {
  const parsed = readFrontMatter(preview.source);
  return {
    ...preview,
    source: serializeManuscript({ ...parsed.data, authorship }, parsed.content),
    document: { ...preview.document, authorship },
  };
}

export function AuthorshipField({
  value = 'unknown',
  onChange,
  disabled = false,
}: {
  value?: JournalAuthorship;
  onChange: (value: JournalAuthorship) => void;
  disabled?: boolean;
}) {
  const id = useId();
  return (
    <fieldset
      className="ja-authorship"
      disabled={disabled}
      aria-describedby={`${id}-help`}
    >
      <legend>AI生成について</legend>
      <div className="ja-authorship-options">
        {(
          [
            ['human', '人間が執筆', 'Not By AIバッジを表示'],
            ['ai', 'AI生成', 'AI生成ラベルを表示'],
            ['unknown', '未設定', 'バッジを表示しない'],
          ] as const
        ).map(([key, title, description]) => (
          <label
            aria-label={title}
            key={key}
            htmlFor={`${id}-${key}`}
            className={value === key ? 'is-selected' : ''}
          >
            <input
              id={`${id}-${key}`}
              type="radio"
              name={id}
              value={key}
              checked={value === key}
              onChange={() => onChange(key)}
            />
            <span>
              <strong>{title}</strong>
              <small>{description}</small>
            </span>
          </label>
        ))}
      </div>
      <p id={`${id}-help`} className="ja-muted">
        著者による自己申告です。「人間が執筆」は内容の90%以上を人間が制作し、核となる意味や創作の方向をAIに委ねていない場合に選びます。
        <a href="https://notbyai.fyi/jp/" target="_blank" rel="noreferrer">
          バッジの条件 ↗
        </a>
      </p>
    </fieldset>
  );
}
