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
});

// Helper: format currency
window.fmtMoney = (n) => {
  if (n >= 1e6) return '€' + (n / 1e6).toFixed(2) + 'M';
  if (n >= 1e3) return '€' + (n / 1e3).toFixed(1) + 'K';
  return '€' + Math.round(n);
};

window.fmtPct = (n) => (n * 100).toFixed(1) + '%';
