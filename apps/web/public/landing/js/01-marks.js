// Insert SVG marks into placeholders
(function(){
  const seed = (size, color = '#7CFC00') => `
    <svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none">
      <path d="M12 21V11" stroke="${color}" stroke-width="1.6" stroke-linecap="round"/>
      <path d="M12 11C12 7 9 5 5 5C5 9 7.5 11 12 11Z" fill="${color}" fill-opacity=".18" stroke="${color}" stroke-width="1.4" stroke-linejoin="round"/>
      <path d="M12 13C12 9.5 14.5 7 19 7C19 11.5 16.5 13 12 13Z" fill="${color}" fill-opacity=".28" stroke="${color}" stroke-width="1.4" stroke-linejoin="round"/>
    </svg>`;
  document.getElementById('hero-mark')?.insertAdjacentHTML('beforeend', seed(36));
  document.getElementById('loader-mark')?.insertAdjacentHTML('beforeend', seed(18, '#7CFC00'));
  document.getElementById('nav-mark')?.insertAdjacentHTML('beforeend', seed(18, '#7CFC00'));
})();
