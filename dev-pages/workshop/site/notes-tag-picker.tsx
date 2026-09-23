'use client';
/* oxlint-disable jsx-a11y/prefer-tag-over-role, jsx-a11y/no-noninteractive-element-to-interactive-role, jsx-a11y/click-events-have-key-events -- The searchable combobox keeps keyboard focus on its input and controls listbox options through aria-activedescendant. */
import {
  useEffect,
  useId,
  useRef,
  useState,
  useSyncExternalStore,
} from 'react';
import { useLocale } from '../locale';
const subscribeHydration = () => () => {};
export function NotesTagPicker({
  tags,
  value,
  onChange,
}: {
  tags: { value: string; count: number }[];
  value: string;
  onChange: (value: string) => void;
}) {
  const { t } = useLocale();
  const id = useId();
  const root = useRef<HTMLDivElement>(null);
  const trigger = useRef<HTMLButtonElement>(null);
  const input = useRef<HTMLInputElement>(null);
  const enhanced = useSyncExternalStore(
    subscribeHydration,
    () => true,
    () => false,
  );
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [active, setActive] = useState(0);
  const all = [{ value: '', count: 0 }, ...tags];
  const normalize = (text: string) =>
    text.normalize('NFKC').toLocaleLowerCase();
  const options = all.filter((tag) =>
    normalize(tag.value || t('すべてのタグ', 'All tags')).includes(
      normalize(query),
    ),
  );
  useEffect(() => {
    if (!open) return;
    input.current?.focus();
    const outside = (event: PointerEvent) => {
      if (event.target instanceof Node && !root.current?.contains(event.target))
        setOpen(false);
    };
    document.addEventListener('pointerdown', outside);
    return () => document.removeEventListener('pointerdown', outside);
  }, [open]);
  useEffect(() => {
    root.current
      ?.querySelector('[data-active="true"]')
      ?.scrollIntoView({ block: 'nearest' });
  }, [active, query]);
  const close = () => {
    setOpen(false);
    trigger.current?.focus();
  };
  const choose = (tag: string) => {
    onChange(tag);
    close();
  };
  const show = () => {
    setQuery('');
    setActive(
      Math.max(
        0,
        all.findIndex((tag) => tag.value === value),
      ),
    );
    setOpen(true);
  };
  return (
    <div className="tag-field">
      <label
        id={`${id}-label`}
        htmlFor={enhanced ? `${id}-trigger` : `${id}-native`}
      >
        {t('タグ', 'Tag')}
      </label>
      <div
        className="tag-picker"
        ref={root}
        onBlur={(event) => {
          if (!event.currentTarget.contains(event.relatedTarget))
            setOpen(false);
        }}
      >
        {!enhanced && (
          <span className="select-wrap">
            <select
              id={`${id}-native`}
              value={value}
              onChange={(event) => onChange(event.target.value)}
            >
              {all.map((tag) => (
                <option key={tag.value} value={tag.value}>
                  {tag.value
                    ? `${tag.value} (${tag.count})`
                    : t('すべてのタグ', 'All tags')}
                </option>
              ))}
            </select>
            <i className="icon arrow-icon select-caret" aria-hidden="true" />
          </span>
        )}
        {enhanced && (
          <button
            ref={trigger}
            id={`${id}-trigger`}
            type="button"
            className="tag-trigger"
            aria-labelledby={`${id}-label ${id}-value`}
            aria-expanded={open}
            aria-controls={`${id}-popup`}
            onClick={() => (open ? setOpen(false) : show())}
            onKeyDown={(event) => {
              if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
                event.preventDefault();
                show();
              }
            }}
          >
            <span id={`${id}-value`}>
              {value || t('すべてのタグ', 'All tags')}
            </span>
            <i className="icon arrow-icon select-caret" aria-hidden="true" />
          </button>
        )}
        {open && (
          <div className="tag-popup" id={`${id}-popup`}>
            <input
              ref={input}
              type="search"
              role="combobox"
              aria-label={t('タグを検索', 'Search tags')}
              placeholder={t('タグ名を入力', 'Type a tag name')}
              aria-autocomplete="list"
              aria-expanded={open}
              aria-controls={`${id}-options`}
              aria-activedescendant={
                options[active] ? `${id}-option-${active}` : undefined
              }
              autoComplete="off"
              spellCheck={false}
              value={query}
              onChange={(event) => {
                setQuery(event.target.value);
                setActive(0);
              }}
              onKeyDown={(event) => {
                if (event.key === 'Escape') {
                  event.preventDefault();
                  close();
                } else if (
                  event.key === 'ArrowDown' ||
                  event.key === 'ArrowUp'
                ) {
                  event.preventDefault();
                  setActive((index) =>
                    Math.max(
                      0,
                      Math.min(
                        options.length - 1,
                        index + (event.key === 'ArrowDown' ? 1 : -1),
                      ),
                    ),
                  );
                } else if (event.key === 'Home' || event.key === 'End') {
                  event.preventDefault();
                  setActive(
                    event.key === 'Home' ? 0 : Math.max(0, options.length - 1),
                  );
                } else if (event.key === 'Enter') {
                  event.preventDefault();
                  if (options[active]) choose(options[active].value);
                }
              }}
            />
            <ul
              id={`${id}-options`}
              role="listbox"
              aria-label={t('タグの候補', 'Tag options')}
            >
              {options.map((tag, index) => (
                <li
                  role="option"
                  id={`${id}-option-${index}`}
                  key={tag.value}
                  aria-selected={value === tag.value}
                  data-active={active === index}
                  className={active === index ? 'is-active' : undefined}
                  onPointerMove={() => setActive(index)}
                  onMouseDown={(event) => event.preventDefault()}
                  onClick={() => choose(tag.value)}
                >
                  {tag.value
                    ? `${tag.value} (${tag.count})`
                    : t('すべてのタグ', 'All tags')}
                </li>
              ))}
            </ul>
            {!options.length && (
              <p className="tag-empty" role="status">
                {t('一致するタグがありません', 'No matching tags')}
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
