import { Preview } from '@/dev-pages/workshop/editorial';
export const metadata = {
  title: 'Projects — morimizu works',
  description: 'つくったもの。アプリの構成図と設計判断。',
  alternates: {
    canonical: '/projects',
    languages: { 'ja-JP': '/projects', 'en-US': '/en/projects' },
  },
};
export default function Page() {
  return <Preview path="/projects" preview={false} />;
}
