// Sales Mastery — shared interactive components

document.addEventListener('DOMContentLoaded', () => {
  // Accordion
  document.querySelectorAll('.accordion-trigger').forEach(trigger => {
    trigger.addEventListener('click', () => {
      const item = trigger.closest('.accordion-item');
      item.classList.toggle('open');
    });
  });

  // Tabs
  document.querySelectorAll('.tabs').forEach(tabContainer => {
    const buttons = tabContainer.querySelectorAll('.tab-btn');
    const panels = tabContainer.querySelectorAll('.tab-panel');
    buttons.forEach((btn, i) => {
      btn.addEventListener('click', () => {
        buttons.forEach(b => b.classList.remove('active'));
        panels.forEach(p => p.classList.remove('active'));
        btn.classList.add('active');
        panels[i].classList.add('active');
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
