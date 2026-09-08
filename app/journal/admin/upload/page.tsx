import { JournalUpload } from './upload';
export const dynamic = 'force-dynamic';
export const metadata = {
  title: '原稿をアップロード | Journal',
  robots: { index: false, follow: false },
  alternates: { canonical: null },
};
export default function UploadPage() {
  return <JournalUpload />;
}
