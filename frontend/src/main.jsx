import { createRoot } from 'react-dom/client';
import App from './App';
import { ErrorProvider } from './shared/ErrorContext';
import './index.css';

createRoot(document.getElementById('root')).render(
  <ErrorProvider>
    <App />
  </ErrorProvider>
);
