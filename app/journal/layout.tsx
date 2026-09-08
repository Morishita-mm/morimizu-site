import 'katex/dist/katex.min.css';
import './journal.css';
import { JournalFreshness } from './freshness';
export default function JournalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <JournalFreshness />
      {children}
    </>
  );
}
