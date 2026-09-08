import { JournalAdmin } from './controls';
export const dynamic = 'force-dynamic';
export const metadata = {
  title: '原稿管理 | Journal',
  robots: { index: false, follow: false },
  alternates: { canonical: null },
};
export default function AdminPage() {
  return <JournalAdmin />;
}
