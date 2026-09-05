import { Preview } from '@/dev-pages/workshop/editorial';
export const metadata = {
  title: 'About / Résumé — morimizu works',
  description: 'Mizuki Morishitaの職務経歴とスキル。',
  alternates: {
    canonical: '/about',
    languages: { 'ja-JP': '/about', 'en-US': '/en/about' },
  },
};
export default function Page() {
  return <Preview path="/about" preview={false} />;
}
