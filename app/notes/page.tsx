import { Preview } from '@/dev-pages/workshop/editorial';
export const metadata = {
  title: 'Notes — morimizu works',
  description: 'Qiitaで公開した技術ノート。',
  alternates: {
    canonical: '/notes',
    languages: { 'ja-JP': '/notes', 'en-US': '/en/notes' },
  },
};
export default function Page() {
  return <Preview path="/notes" preview={false} />;
}
