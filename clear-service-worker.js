// Run this in your browser console to clear the service worker cache
// Open DevTools (F12) → Console tab → Paste and run:

if ('serviceWorker' in navigator) {
  navigator.serviceWorker.getRegistrations().then(function(registrations) {
    for(let registration of registrations) {
      registration.unregister();
      console.log('Service Worker unregistered');
    }
  });
  
  // Clear all caches
  caches.keys().then(function(names) {
    for (let name of names) {
      caches.delete(name);
      console.log('Cache deleted:', name);
    }
  });
  
  // Reload the page
  setTimeout(() => {
    window.location.reload(true);
  }, 1000);
}

