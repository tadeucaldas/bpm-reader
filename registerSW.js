if('serviceWorker' in navigator) {window.addEventListener('load', () => {navigator.serviceWorker.register('/bmp-reader/sw.js', { scope: '/bmp-reader/' })})}