import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'
import { Provider } from 'react-redux'
import store from './components/store/store.js';


const isIosStandalone = window.navigator.standalone === true;
const currentUrlHasId = window.location.search.includes('id=');
const storedId = localStorage.getItem('tagatask_user_id');

// 1. Store the ID permanently if it appears in the URL
if (currentUrlHasId) {
  const params = new URLSearchParams(window.location.search);
  const id = params.get('id');
  if (id) {
    localStorage.setItem('tagatask_user_id', id);
  }
}

// 2. Redirect if ID is missing in URL but is stored in localStorage
// Avoid this redirect in iOS PWA standalone mode
if (storedId && !currentUrlHasId && !isIosStandalone) {
  window.location.replace(`/?id=${storedId}`);
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
