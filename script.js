// Sales Mastery — shared interactive components & language toggle

document.addEventListener('DOMContentLoaded', () => {
  // Language Toggle via Google Translate
  const langToggle = document.getElementById('langToggle');
  
  if (langToggle) {
    // Check current state from googtrans cookie
    const isArabic = document.cookie.includes('googtrans=/en/ar');
    
    // Update UI
    const enSpan = langToggle.querySelector('.lang-en');
    const arSpan = langToggle.querySelector('.lang-ar');
    if (isArabic) {
      document.documentElement.lang = 'ar';
      document.documentElement.dir = 'rtl';
      if (enSpan && arSpan) {
        enSpan.style.display = 'none';
        arSpan.style.display = 'inline';
      }
    } else {
      document.documentElement.lang = 'en';
      document.documentElement.dir = 'ltr';
      if (enSpan && arSpan) {
        enSpan.style.display = 'inline';
        arSpan.style.display = 'none';
      }
    }

    langToggle.addEventListener('click', () => {
      if (!isArabic) {
        // Switch to Arabic
        document.cookie = "googtrans=/en/ar; path=/";
        document.cookie = "googtrans=/en/ar; domain=" + window.location.hostname + "; path=/";
      } else {
        // Switch to English and clear Arabic
        document.cookie = "googtrans=/en/en; path=/";
        document.cookie = "googtrans=/en/en; domain=" + window.location.hostname + "; path=/";
        document.cookie = "googtrans=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
      }
      location.reload();
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
});

// Helper: format currency
window.fmtMoney = (n) => {
  if (n >= 1e6) return '€' + (n / 1e6).toFixed(2) + 'M';
  if (n >= 1e3) return '€' + (n / 1e3).toFixed(1) + 'K';
  return '€' + Math.round(n);
};

window.fmtPct = (n) => (n * 100).toFixed(1) + '%';
