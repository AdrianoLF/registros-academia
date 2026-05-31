import { useEffect } from 'react';

function Toast({ message, onClose }) {
  useEffect(() => {
    if (!message) {
      return;
    }
    const timer = setTimeout(onClose, 4000);
    return () => clearTimeout(timer);
  }, [message, onClose]);

  if (!message) {
    return null;
  }

  return (
    <div className="fixed bottom-6 right-6 bg-red-600 text-white px-4 py-3 rounded-lg shadow-lg">
      {message}
    </div>
  );
}

export default Toast;
