import React from 'react';
import { useApp } from '../context/AppContext.jsx';

export default function ToastContainer() {
  const { toasts } = useApp();

  return (
    <div className="toast-container" id="toast-container">
      {toasts.map((t) => {
        const icon = t.type === 'success' ? '✅' : t.type === 'error' ? '❌' : 'ℹ️';
        return (
          <div key={t.id} className={`toast toast-${t.type}`}>
            <span>{icon}</span>
            <span>{t.message}</span>
          </div>
        );
      })}
    </div>
  );
}
