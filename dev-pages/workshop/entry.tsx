import { createRoot } from 'react-dom/client';
import { Preview } from './editorial';
const path = window.location.pathname.replace(/\/$/, '') || '/';
createRoot(document.getElementById('root')!).render(<Preview path={path} />);
