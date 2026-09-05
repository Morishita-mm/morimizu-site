import {
  createContext,
  useContext,
  useEffect,
  useSyncExternalStore,
  type ReactNode,
} from 'react';

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
      try {
        const saved = localStorage.getItem('morimizu-locale');
        return saved === 'ja' || saved === 'en' ? saved : initialLocale;
      } catch {
        return memoryLocale ?? initialLocale;
      }
    },
    () => initialLocale,
  );
  useEffect(() => {
    document.documentElement.lang = locale;
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
