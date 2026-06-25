// Mobile nav toggle
const hamburger = document.getElementById('hamburger');
const navLinks  = document.querySelector('.nav-links');
if (hamburger && navLinks) {
  hamburger.addEventListener('click', () => navLinks.classList.toggle('open'));
}

// Accordion / detail panels
document.querySelectorAll('.detail-panel-head').forEach(head => {
  head.addEventListener('click', () => {
    const panel = head.closest('.detail-panel');
    const isOpen = panel.classList.contains('open');
    document.querySelectorAll('.detail-panel').forEach(p => p.classList.remove('open'));
    if (!isOpen) panel.classList.add('open');
  });
});

// Tabs
document.querySelectorAll('.tab-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    const group = btn.dataset.group;
    const target = btn.dataset.tab;
    document.querySelectorAll(`.tab-btn[data-group="${group}"]`).forEach(b => b.classList.remove('active'));
    document.querySelectorAll(`.tab-panel[data-group="${group}"]`).forEach(p => p.classList.remove('active'));
    btn.classList.add('active');
    document.querySelector(`.tab-panel[data-group="${group}"][data-tab="${target}"]`).classList.add('active');
  });
});

// Copy buttons
document.querySelectorAll('.code-block').forEach(block => {
  const btn = document.createElement('button');
  btn.className = 'copy-btn';
  btn.textContent = 'Copy';
  block.style.position = 'relative';
  block.appendChild(btn);
  btn.addEventListener('click', () => {
    const text = block.innerText.replace('Copy', '').replace('Copied!', '').trim();
    navigator.clipboard.writeText(text).then(() => {
      btn.textContent = 'Copied!';
      setTimeout(() => btn.textContent = 'Copy', 2000);
    });
  });
});

// Smooth-scroll active nav link highlight
const currentPage = location.pathname.split('/').pop() || 'index.html';
document.querySelectorAll('.nav-link').forEach(link => {
  const href = link.getAttribute('href');
  if (href === currentPage) link.classList.add('active');
  else link.classList.remove('active');
});
