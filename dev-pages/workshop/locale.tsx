import {
  createContext,
  useContext,
  useEffect,
  useSyncExternalStore,
  type ReactNode,
} from 'react';
import { chooseLocale } from './locale-choice';

export type Locale = 'ja' | 'en';
let memoryLocale: Locale | undefined;
function subscribe(notify: () => void) {
  window.addEventListener('storage', notify);
  window.addEventListener('morimizu-language', notify);
  return () => {
    window.removeEventListener('storage', notify);
    window.removeEventListener('morimizu-language', notify);
  };
}
const Context = createContext({ locale: 'ja' as Locale, toggle: () => {} });
export function LocaleProvider({
  children,
  initialLocale = 'ja',
}: {
  children: ReactNode;
  initialLocale?: Locale;
}) {
  const locale = useSyncExternalStore(
    subscribe,
    () => {
      let saved: string | null = memoryLocale ?? null;
      try {
        saved = localStorage.getItem('morimizu-locale') ?? saved;
      } catch {
        /* Optional storage. */
      }
      return chooseLocale(
        saved,
        new URL(window.location.href).searchParams.get('lang'),
        navigator.languages?.[0] ?? navigator.language,
        initialLocale === 'en',
      );
    },
    () => initialLocale,
  );
  useEffect(() => {
    document.documentElement.lang = locale;
    const url = new URL(window.location.href);
    const hint = url.searchParams.get('lang');
    if (hint === 'ja' || hint === 'en') {
      let saved: string | null = memoryLocale ?? null;
      try {
        saved = localStorage.getItem('morimizu-locale') ?? saved;
      } catch {
        /* Optional storage. */
      }
      const resolved = chooseLocale(saved, hint, undefined);
      memoryLocale = resolved;
      try {
        localStorage.setItem('morimizu-locale', resolved);
      } catch {
        /* Optional storage. */
      }
      url.searchParams.delete('lang');
      window.history.replaceState(
        window.history.state,
        '',
        url.pathname + url.search + url.hash,
      );
      window.dispatchEvent(new Event('morimizu-language'));
    }
  }, [locale]);
  function toggle() {
    const next = locale === 'ja' ? 'en' : 'ja';
    memoryLocale = next;
    try {
      localStorage.setItem('morimizu-locale', next);
    } catch {
      /* Optional storage. */
    }
    window.dispatchEvent(new Event('morimizu-language'));
  }
  return (
    <Context.Provider
      value={{
        locale,
        toggle,
      }}
    >
      {children}
    </Context.Provider>
  );
}
export function useLocale() {
  const value = useContext(Context);
  return {
    ...value,
    en: value.locale === 'en',
    t: (ja: string, en: string) => (value.locale === 'en' ? en : ja),
  };
}
export function LanguageToggle() {
  const { en, toggle } = useLocale();
  return (
    <button
      className="e-language-toggle"
      type="button"
      onClick={toggle}
      lang={en ? 'ja' : 'en'}
      aria-label={en ? '日本語に切り替え' : 'Switch to English'}
    >
      {en ? '日本語' : 'EN'}
    </button>
  );
}
