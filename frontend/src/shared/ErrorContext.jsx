import { createContext, useContext, useState } from 'react';
import Toast from './Toast';

const ErrorContext = createContext(null);

export function useError() {
  return useContext(ErrorContext);
}

export function ErrorProvider({ children }) {
  const [message, setMessage] = useState('');
  return (
    <ErrorContext.Provider value={setMessage}>
      {children}
      <Toast message={message} onClose={() => setMessage('')} />
    </ErrorContext.Provider>
  );
}
