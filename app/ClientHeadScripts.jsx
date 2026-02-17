'use client';

import { useEffect } from 'react';

/**
 * Injects scripts that must run only on the client to avoid hydration mismatch.
 * - Service Worker registration uses navigator (not available on server).
 * - Metricool loader injects external scripts; order/attributes can differ after load.
 * Rendering these in SSR would cause server HTML to differ from client.
 */
export default function ClientHeadScripts() {
  useEffect(() => {
    const head = document.head;

    // Metricool tracking
    const metricool = document.createElement('script');
    metricool.defer = true;
    metricool.textContent = `function loadScript(a){var b=document.getElementsByTagName("head")[0],c=document.createElement("script");c.type="text/javascript",c.src="https://tracker.metricool.com/resources/be.js",c.onreadystatechange=a,c.onload=a,b.appendChild(c)}loadScript(function(){beTracker.t({hash:"10cc6f6541b9f7bcd21bab9b7ab99987"})});`;
    head.appendChild(metricool);

    // Service Worker registration
    if ('serviceWorker' in navigator) {
      const onLoad = () => {
        navigator.serviceWorker.register('/sw.js')
          .then((registration) => {
            if (process.env.NODE_ENV === 'development') {
              console.log('Service Worker registered:', registration.scope);
            }
          })
          .catch(() => {});
      };
      if (document.readyState === 'complete') {
        onLoad();
      } else {
        window.addEventListener('load', onLoad);
      }
    }

    return () => {
      if (metricool.parentNode) metricool.remove();
    };
  }, []);

  return null;
}
