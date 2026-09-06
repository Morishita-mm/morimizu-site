import { createRoot } from 'react-dom/client';
import { Preview } from './editorial';
import './preview-fonts.css';
const path = window.location.pathname.replace(/\/$/, '') || '/';
createRoot(document.getElementById('root')!).render(<Preview path={path} />);
