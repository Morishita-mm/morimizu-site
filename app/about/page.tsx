import { SiteShell } from '@/dev-pages/workshop/site/shell';
import { AboutPage } from '@/dev-pages/workshop/site/about';
export const metadata = {
  title: 'About — morimizu works',
  description:
    '個人開発しているエンジニア、森下瑞基。このサイトをつくっている人の好きなことと、使っている道具。',
  alternates: {
    canonical: '/about',
    languages: { 'ja-JP': '/about', 'en-US': '/en/about' },
  },
};
export default function Page() {
  return (
    <SiteShell path="/about">
      <AboutPage />
    </SiteShell>
  );
}
