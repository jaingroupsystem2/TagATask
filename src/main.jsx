import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'
import { Provider } from 'react-redux'
import store from './components/store/store.js';


function getCookieValue(name) 
    {
      const regex = new RegExp(`(^| )${name}=([^;]+)`)
      const match = document.cookie.match(regex)
      if (match) {
        return match[2]
      }
   }

// Step 1: Store ID from URL (if present)
if (window.location.search.includes('id=')) {
  const params = new URLSearchParams(window.location.search);
  const id = params.get('id');
  if (id) {
    // Save in both for safety
    localStorage.setItem('tagatask_user_id', id);
    document.cookie = `tagatask_user_id=${id}; path=/; max-age=31536000`; // 1 year
  }
}

// Step 2: Redirect if ?id= is missing but we have a stored ID
if (!window.location.search.includes('id=')) {
  const storedId = getCookieValue('tagatask_user_id') || localStorage.getItem('tagatask_user_id');
  if (storedId) {
    window.location.replace(`/?id=${storedId}`);
  }
}








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
  </React.StrictMode>,
)
