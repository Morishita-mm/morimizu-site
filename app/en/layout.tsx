import type { Metadata } from 'next';
import { HtmlLanguage } from '@/components/html-language';

export const metadata: Metadata = {
  title: 'morimizu — Mizuki',
  description:
    'Personal software projects, architecture notes, and technical writing by Mizuki.',
  alternates: {
    canonical: '/en',
    languages: {
      'ja-JP': '/',
      'en-US': '/en',
    },
  },
  openGraph: {
    locale: 'en_US',
    title: 'morimizu — Mizuki',
    description:
      'Personal software projects, architecture notes, and technical writing by Mizuki.',
  },
};

export default function EnglishLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <div lang="en">
      <HtmlLanguage locale="en" />
      {children}
    </div>
  );
}
