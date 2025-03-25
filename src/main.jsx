import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import './index.css';
import { Provider } from 'react-redux';
import store from './components/store/store.js';

// ✅ Store ID if present in URL (no redirect here)
if (window.location.search.includes('id=')) {
  const params = new URLSearchParams(window.location.search);
  const id = params.get('id');
  if (id) {
    localStorage.setItem('tagatask_user_id', id);
    document.cookie = `tagatask_user_id=${id}; path=/; max-age=31536000`; // 1 year
  }
}

// ✅ Do NOT redirect here anymore — handled in redirect.html

if ("serviceWorker" in navigator && "PushManager" in window) {
  navigator.serviceWorker
    .register("/sw.js")
    .then((registration) => {
      console.log("Service Worker registered with scope:", registration.scope);
    })
    .catch((error) => {
      console.error("Service Worker registration failed:", error);
    });
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <Provider store={store}>
      <App />
    </Provider>
  </React.StrictMode>
);
