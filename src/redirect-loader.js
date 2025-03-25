// src/redirect-loader.js

const cookies = document.cookie.split(';').reduce((acc, cookie) => {
    const [key, value] = cookie.trim().split('=');
    acc[key] = value;
    return acc;
  }, {});
  
  const id = cookies['tagatask_user_id'];
  
  if (id) {
    window.location.replace(`/?id=${id}`);
  } else {
    // Load the full app if no cookie found
    import('./main.jsx');
  }
  