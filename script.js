// Sales Mastery — shared interactive components

document.addEventListener('DOMContentLoaded', () => {
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
