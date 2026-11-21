/**
 * Utility helpers for how2bin:
 * - showToast (Notification banners)
 * - showSafetyModal (Safety alerts)
 * - showSparkles (Particle burst effects)
 */

function showToast(message, type = 'info') {
  const container = document.getElementById('toast-container');
  if (!container) return;

  const toast = document.createElement('div');
  toast.className = `toast toast-${type} fade-in-up`;

  const icons = {
    info: 'ℹ️',
    success: '🎉',
    warning: '⚠️',
    error: '❌'
  };

  toast.innerHTML = `
    <span class="toast-icon">${icons[type] || '🔔'}</span>
    <span class="toast-text">${message}</span>
  `;

  container.appendChild(toast);

  setTimeout(() => {
    toast.classList.add('fade-out');
    setTimeout(() => toast.remove(), 400);
  }, 4200);
}

function showSafetyModal(optionsOrTitle, message, rule, onDismiss) {
  const overlay = document.getElementById('safety-modal-overlay');
  if (!overlay) return;

  let title = '';
  if (typeof optionsOrTitle === 'object' && optionsOrTitle !== null) {
    title = optionsOrTitle.title || '';
    message = optionsOrTitle.message || '';
    rule = optionsOrTitle.rule || '';
    onDismiss = optionsOrTitle.onDismiss;
  } else {
    title = optionsOrTitle || '';
  }

  const titleEl = document.getElementById('modal-title');
  const msgEl = document.getElementById('modal-message');
  const ruleEl = document.getElementById('modal-rule');
  const dismissBtn = document.getElementById('modal-dismiss-btn');

  if (titleEl) titleEl.textContent = title;
  if (msgEl) msgEl.textContent = message;
  if (ruleEl) ruleEl.textContent = rule;

  overlay.classList.remove('hidden');

  const handleDismiss = () => {
    overlay.classList.add('hidden');
    if (dismissBtn) dismissBtn.removeEventListener('click', handleDismiss);
    if (onDismiss) onDismiss();
  };

  if (dismissBtn) dismissBtn.addEventListener('click', handleDismiss);
}

function showSparkles(element) {
  if (!element || typeof element.getBoundingClientRect !== 'function') return;
  const rect = element.getBoundingClientRect();
  const count = 12;

  for (let i = 0; i < count; i++) {
    const spark = document.createElement('div');
    spark.className = 'sparkle-particle';
    spark.textContent = ['✨', '🌟', '⭐', '💫'][Math.floor(Math.random() * 4)];

    const x = rect.left + rect.width / 2 + (Math.random() - 0.5) * rect.width;
    const y = rect.top + rect.height / 2 + (Math.random() - 0.5) * rect.height;

    spark.style.left = `${x}px`;
    spark.style.top = `${y}px`;
    document.body.appendChild(spark);

    setTimeout(() => spark.remove(), 800);
  }
}
