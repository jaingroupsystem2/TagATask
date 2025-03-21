import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'
import { Provider } from 'react-redux'
import store from './components/store/store.js';


const currentPath = window.location.pathname + window.location.search;
const storedId = localStorage.getItem('tagatask_user_id');

// Redirect logic: if we have a stored ID but it's missing in URL
if (storedId && !window.location.search.includes('id=')) {
  window.location.replace(`/?id=${storedId}`);
}

// First-time storage
if (window.location.search.includes('id=')) {
  const params = new URLSearchParams(window.location.search);
  const id = params.get('id');
  if (id) {
    localStorage.setItem('tagatask_user_id', id);
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
