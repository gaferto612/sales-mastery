// Sales Mastery — shared interactive components & language toggle

document.addEventListener('DOMContentLoaded', () => {
  // Language Toggle via Google Translate (Works on file:// and http://)
  const langToggle = document.getElementById('langToggle');
  
  if (langToggle) {
    let isArabic = localStorage.getItem('salesMasteryLang') === 'ar';
    
    // Check if the googtrans cookie is set, sync localStorage if needed
    if (document.cookie.includes('googtrans=/en/ar')) {
      isArabic = true;
      localStorage.setItem('salesMasteryLang', 'ar');
    }
    
    const updateUI = (toArabic) => {
      document.documentElement.lang = toArabic ? 'ar' : 'en';
      document.documentElement.dir = toArabic ? 'rtl' : 'ltr';
      const enSpan = langToggle.querySelector('.lang-en');
      const arSpan = langToggle.querySelector('.lang-ar');
      if (enSpan && arSpan) {
        enSpan.style.display = toArabic ? 'none' : 'inline';
        arSpan.style.display = toArabic ? 'inline' : 'none';
      }
    };

    updateUI(isArabic);

    // If Arabic is selected, auto-trigger the Google Translate dropdown once it loads
    if (isArabic) {
      document.cookie = "googtrans=/en/ar; path=/";
      const interval = setInterval(() => {
        const select = document.querySelector('.goog-te-combo');
        if (select) {
          if (select.value !== 'ar') {
            select.value = 'ar';
            select.dispatchEvent(new Event('change', { bubbles: true }));
          }
          clearInterval(interval);
        }
      }, 200);
    }

    langToggle.addEventListener('click', () => {
      isArabic = !isArabic;
      
      if (isArabic) {
        localStorage.setItem('salesMasteryLang', 'ar');
        document.cookie = "googtrans=/en/ar; path=/";
        const select = document.querySelector('.goog-te-combo');
        if (select) {
          select.value = 'ar';
          select.dispatchEvent(new Event('change', { bubbles: true }));
          updateUI(true);
        } else {
          location.reload();
        }
      } else {
        localStorage.setItem('salesMasteryLang', 'en');
        document.cookie = "googtrans=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
        document.cookie = "googtrans=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; domain=" + location.hostname + ";";
        location.reload();
      }
    });
  }

  // Accordion
  document.querySelectorAll('.accordion-trigger').forEach(trigger => {
    const item = trigger.closest('.accordion-item');
    trigger.setAttribute('aria-expanded', item.classList.contains('open') ? 'true' : 'false');
    trigger.addEventListener('click', () => {
      const open = item.classList.toggle('open');
      trigger.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
  });

  // Tabs
  document.querySelectorAll('.tabs').forEach(tabContainer => {
    const buttons = tabContainer.querySelectorAll('.tab-btn');
    const panels = tabContainer.querySelectorAll('.tab-panel');
    buttons.forEach((btn, i) => {
      btn.setAttribute('role', 'tab');
      btn.setAttribute('aria-selected', btn.classList.contains('active') ? 'true' : 'false');
      btn.setAttribute('tabindex', btn.classList.contains('active') ? '0' : '-1');
      btn.addEventListener('click', () => {
        buttons.forEach(b => {
          b.classList.remove('active');
          b.setAttribute('aria-selected', 'false');
          b.setAttribute('tabindex', '-1');
        });
        panels.forEach(p => p.classList.remove('active'));
        btn.classList.add('active');
        btn.setAttribute('aria-selected', 'true');
        btn.setAttribute('tabindex', '0');
        panels[i].classList.add('active');
      });
      btn.addEventListener('keydown', (e) => {
        if (e.key !== 'ArrowRight' && e.key !== 'ArrowLeft') return;
        e.preventDefault();
        const dir = e.key === 'ArrowRight' ? 1 : -1;
        const next = buttons[(i + dir + buttons.length) % buttons.length];
        next.focus();
        next.click();
      });
    });
  });

  // Range sliders display value
  document.querySelectorAll('input[type="range"]').forEach(range => {
    const valDisplay = range.parentElement.querySelector('.range-value');
    if (valDisplay) {
      const update = () => {
        const suffix = range.dataset.suffix || '';
        const prefix = range.dataset.prefix || '';
        valDisplay.textContent = prefix + range.value + suffix;
      };
      range.addEventListener('input', update);
      update();
    }
  });

  // --- Progress Tracking ---
  let completedModules = JSON.parse(localStorage.getItem('salesMasteryProgress') || '[]');
  
  // 1. If on a module page, mark complete
  const path = window.location.pathname;
  const match = path.match(/module-(\d+)\.html/);
  if (match) {
    const modId = match[1];
    if (!completedModules.includes(modId)) {
      completedModules.push(modId);
      localStorage.setItem('salesMasteryProgress', JSON.stringify(completedModules));
    }
  }

  // 2. If on index, update the UI
  const progressCount = document.getElementById('progressCount');
  const progressBar = document.getElementById('progressBar');
  if (progressCount && progressBar) {
    const totalModules = 17;
    const completedCount = completedModules.length;
    progressCount.textContent = completedCount;
    progressBar.style.width = (completedCount / totalModules * 100) + '%';
    
    // Mark cards as completed
    document.querySelectorAll('.mod-card').forEach(card => {
      const href = card.getAttribute('href');
      if (!href) return;
      const cardMatch = href.match(/module-(\d+)\.html/);
      if (cardMatch && completedModules.includes(cardMatch[1])) {
        card.classList.add('completed');
      }
    });

    // Update Hero CTA
    if (completedCount > 0 && completedCount < totalModules) {
      const cta = document.querySelector('.hero-cta');
      if (cta) {
        cta.textContent = 'Continue course';
        // Find highest completed module and go to the next one
        const maxCompleted = Math.max(...completedModules.map(n => parseInt(n, 10)));
        if (maxCompleted < totalModules - 1) {
          const nextMod = (maxCompleted + 1).toString().padStart(2, '0');
          cta.setAttribute('href', `module-${nextMod}.html`);
        }
      }
    }
  }
});

// Helper: format currency
window.fmtMoney = (n) => {
  if (n >= 1e6) return '€' + (n / 1e6).toFixed(2) + 'M';
  if (n >= 1e3) return '€' + (n / 1e3).toFixed(1) + 'K';
  return '€' + Math.round(n);
};

window.fmtPct = (n) => (n * 100).toFixed(1) + '%';

// --- Mermaid.js Integration ---
(function() {
  const mermaidContainers = document.querySelectorAll('.mermaid');
  if (mermaidContainers.length > 0) {
    const script = document.createElement('script');
    script.src = 'https://cdn.jsdelivr.net/npm/mermaid@10/dist/mermaid.min.js';
    script.onload = () => {
      mermaid.initialize({
        startOnLoad: true,
        theme: 'base',
        themeVariables: {
          fontFamily: 'Inter, sans-serif',
          primaryColor: '#faf6ec',        // var(--ink)
          primaryTextColor: '#1a1410',    // var(--paper)
          primaryBorderColor: '#c8431a',  // var(--orange)
          lineColor: '#c8431a',           // var(--orange)
          secondaryColor: '#f1ead7',      // var(--ink-soft)
          tertiaryColor: '#f1ead7',
          noteBkgColor: '#f1ead7',
          noteTextColor: '#3a3228',       // var(--cream)
          mainBkg: '#faf6ec',
          nodeBorder: '#c8431a',
          clusterBkg: 'rgba(241, 234, 215, 0.4)',
          clusterBorder: '#d8cfb8'        // var(--line)
        }
      });
    };
    document.head.appendChild(script);
  }
})();
