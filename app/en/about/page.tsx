import { SiteShell } from '@/dev-pages/workshop/site/shell';
import { AboutPage } from '@/dev-pages/workshop/site/about';
export const metadata = {
  title: 'About — morimizu works',
  description:
    'Meet Mizuki Morishita, a software engineer who enjoys personal projects and discussions with AI. Interests, values, and the tools I use.',
  alternates: {
    canonical: '/en/about',
    languages: { 'ja-JP': '/about', 'en-US': '/en/about' },
  },
};
export default function Page() {
  return (
    <SiteShell path="/about" initialLocale="en">
      <AboutPage />
    </SiteShell>
  );
}
