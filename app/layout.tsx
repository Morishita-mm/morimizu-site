import type { Metadata } from 'next';
import { Inter, IBM_Plex_Mono, Instrument_Sans } from 'next/font/google';
import { AgentationClient } from '@/components/agentation-client';
import editorialCss from '@/dev-pages/workshop/editorial.css?inline';
import notoCss from '@/lib/generated/fonts/noto.css?inline';

const inter = Inter({
  variable: '--font-inter',
  subsets: ['latin'],
  display: 'swap',
});

const instrument = Instrument_Sans({
  preload: false,
  variable: '--font-instrument',
  subsets: ['latin'],
});

const plexMono = IBM_Plex_Mono({
  preload: false,
  variable: '--font-plex-mono',
  subsets: ['latin'],
  weight: ['400', '500'],
});

export const metadata: Metadata = {
  metadataBase: new URL('https://morimizu.dev'),
  title: 'morimizu works — Mizuki',
  description: 'Mizukiが個人で作っているアプリと、作りながら書いた技術ノート。',
  alternates: {
    canonical: '/',
    languages: {
      'ja-JP': '/',
      'en-US': '/en',
    },
  },
  icons: {
    icon: '/favicon.svg',
  },
  openGraph: {
    type: 'website',
    locale: 'ja_JP',
    siteName: 'morimizu works',
    title: 'morimizu — Mizuki',
    description:
      'Mizukiが個人で作っているアプリと、作りながら書いた技術ノート。',
    images: [
      {
        url: '/og.png',
        width: 1200,
        height: 630,
        alt: 'morimizu.dev',
      },
    ],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja">
      <head>
        {/* Deliver the shared styles with HTML, avoiding a blocking round trip. */}
        <style dangerouslySetInnerHTML={{ __html: editorialCss }} />
        <style dangerouslySetInnerHTML={{ __html: notoCss }} />
      </head>
      <body
        className={`${inter.variable} ${instrument.variable} ${plexMono.variable}`}
      >
        {children}
        <AgentationClient />
      </body>
    </html>
  );
}
