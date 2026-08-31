import type { Metadata } from 'next';
import { IBM_Plex_Mono, Instrument_Sans, Noto_Sans_JP } from 'next/font/google';
import './globals.css';

const instrument = Instrument_Sans({
  variable: '--font-instrument',
  subsets: ['latin'],
});

const notoSansJp = Noto_Sans_JP({
  variable: '--font-noto-jp',
  subsets: ['latin'],
});

const plexMono = IBM_Plex_Mono({
  variable: '--font-plex-mono',
  subsets: ['latin'],
  weight: ['400', '500'],
});

export const metadata: Metadata = {
  metadataBase: new URL('https://morimizu.dev'),
  title: 'morimizu — Mizuki',
  description: 'Mizukiの個人開発ラボ。小さなアプリと、制作から得た技術ノート。',
  alternates: {
    canonical: '/',
  },
  icons: {
    icon: '/favicon.svg',
  },
  openGraph: {
    type: 'website',
    locale: 'ja_JP',
    siteName: 'morimizu.dev',
    title: 'morimizu — Mizuki',
    description: 'Mizukiの個人開発ラボ。小さなアプリと、制作から得た技術ノート。',
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
      <body
        className={`${instrument.variable} ${notoSansJp.variable} ${plexMono.variable}`}
      >
        {children}
      </body>
    </html>
  );
}
