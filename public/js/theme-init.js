// Loaded synchronously in <head> so the saved light/dark theme applies before first paint.
(function () {
  try {
    var saved = localStorage.getItem('mk_theme_mode');
    document.documentElement.setAttribute('data-theme', saved === 'dark' ? 'dark' : 'light');
  } catch (e) {}
})();
