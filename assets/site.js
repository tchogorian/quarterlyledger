/* The Quarterly Ledger — shared site JS
   Free access. Personal watchlist via localStorage. Homepage ticker search.
*/
(function(){
  // ---------- Homepage / site-wide search ----------
  function initSearch() {
    const input = document.getElementById('ticker-search');
    const results = document.getElementById('search-results');
    if (!input || !results || !window.TQL_INDEX) return;
    const index = window.TQL_INDEX;

    function render(matches) {
      if (!matches.length) {
        results.innerHTML = `<div class="search-result"><span class="co" style="color:var(--ink-mute)">No matches.</span></div>`;
      } else {
        // Resolve relative path depending on page depth
        const prefix = location.pathname.includes('/stocks/') || location.pathname.includes('/tiers/') ? '../stocks/' : 'stocks/';
        results.innerHTML = matches.slice(0, 40).map(m => `
          <a class="search-result" href="${prefix}${m.ticker}.html">
            <span class="sym">${m.ticker}</span>
            <span class="co">${m.name}</span>
            <span class="tag">${m.tierName || m.sector || ''}</span>
          </a>
        `).join('');
      }
      results.classList.add('open');
    }

    input.addEventListener('input', (e) => {
      const q = e.target.value.trim().toLowerCase();
      if (!q) { results.classList.remove('open'); return; }
      const matches = index.filter(s =>
        s.ticker.toLowerCase().startsWith(q) ||
        s.ticker.toLowerCase().includes(q) ||
        s.name.toLowerCase().includes(q)
      );
      render(matches);
    });

    input.addEventListener('focus', () => {
      if (input.value.trim()) input.dispatchEvent(new Event('input'));
    });
    document.addEventListener('click', (e) => {
      if (!e.target.closest('.search-wrap')) results.classList.remove('open');
    });
    input.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        const first = results.querySelector('.search-result[href]');
        if (first) window.location.href = first.getAttribute('href');
      }
      if (e.key === 'Escape') { results.classList.remove('open'); input.blur(); }
    });
  }

  // ---------- Watchlist badge in nav ----------
  function mountWatchBadge() {
    try {
      const wl = JSON.parse(localStorage.getItem('tql_watchlist') || '[]');
      if (!wl.length) return;
      // Find "My Saves" nav link and append count
      document.querySelectorAll('.nav a').forEach(a => {
        if (/my saves/i.test(a.textContent)) {
          a.innerHTML = a.textContent + ` <span style="font-family:var(--mono);font-size:9px;background:var(--ink);color:var(--paper);padding:1px 6px;margin-left:4px;letter-spacing:0.1em;">${wl.length}</span>`;
        }
      });
    } catch(e) {}
  }

  document.addEventListener('DOMContentLoaded', () => {
    initSearch();
    mountWatchBadge();
  });
})();
