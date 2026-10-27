const source = window.INFO_SOURCE;
document.querySelectorAll('a.brand[href="index.html"]').forEach(link => link.addEventListener('click', event => {
  event.preventDefault();
  location.reload();
}));
const conclusionList = document.querySelector('#conclusion-list');
source.conclusions.forEach((conclusion) => {
  const item = document.createElement('li');
  item.className = 'reveal';
  const paragraph = document.createElement('p');
  paragraph.textContent = conclusion;
  item.append(paragraph);
  conclusionList.append(item);
});

const revealObserver = new IntersectionObserver((entries) => {
  for (const entry of entries) {
    if (entry.isIntersecting) {
      entry.target.classList.add('is-visible');
      revealObserver.unobserve(entry.target);
    }
  }
}, {threshold: .08, rootMargin: '0px 0px -30px 0px'});
document.querySelectorAll('.reveal').forEach(element => revealObserver.observe(element));

const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
function animateCounter(element, delay = 0) {
  if (element.dataset.animated) return;
  element.dataset.animated = 'true';
  const finalValue = Number(element.dataset.count);
  const originalText = element.textContent.trim();
  const originalNumber = element.firstChild;
  const decimalPlaces = (element.dataset.count.split('.')[1] || '').length;
  const leadingZero = /^0\d/.test(originalNumber.textContent.trim());
  element.setAttribute('aria-label', originalText);
  if (reducedMotion.matches || !Number.isFinite(finalValue)) return;

  setTimeout(() => {
    const startedAt = performance.now();
    const duration = 1400;
    function frame(now) {
      if (reducedMotion.matches) {
        originalNumber.textContent = element.dataset.count.padStart(leadingZero ? 2 : 0, '0');
        return;
      }
      const progress = Math.min(1, (now - startedAt) / duration);
      const eased = 1 - (1 - progress) ** 3;
      const value = (finalValue * eased).toFixed(decimalPlaces);
      originalNumber.textContent = leadingZero ? value.padStart(2, '0') : value;
      if (progress < 1) requestAnimationFrame(frame);
      else originalNumber.textContent = originalText.replace(/[^0-9.]/g, '') || element.dataset.count;
    }
    requestAnimationFrame(frame);
  }, delay);
}

const counterGroups = [...new Set([...document.querySelectorAll('[data-count]')].map(element =>
  element.closest('.arm, .comparison, .primary-stat, .metric-card, .safety-card') || element
))];
const counterObserver = new IntersectionObserver(entries => {
  for (const entry of entries) {
    if (!entry.isIntersecting) continue;
    const groupDelay = entry.target.classList.contains('arm-b') ? 320 : entry.target.classList.contains('arm-a') ? 120 : 0;
    entry.target.querySelectorAll('[data-count]').forEach((element, index) => animateCounter(element, groupDelay + index * 180));
    counterObserver.unobserve(entry.target);
  }
}, {threshold:.35, rootMargin:'0px 0px -40px 0px'});
counterGroups.forEach(group => counterObserver.observe(group));

const progressFill = document.querySelector('#progress-fill');
function updateProgress() {
  const scrollable = Math.max(1, document.documentElement.scrollHeight - innerHeight);
  progressFill.style.width = `${Math.max(0, Math.min(100, scrollY / scrollable * 100))}%`;
}
addEventListener('scroll', updateProgress, {passive:true});
addEventListener('resize', updateProgress);
updateProgress();

const dialog = document.querySelector('#source-dialog');
const dialogTitle = document.querySelector('#source-dialog-title');
const dialogBody = document.querySelector('#source-dialog-body');
const titles = {
  study:'El estudio', efs:'Resultado principal', relapse:'Recaídas y ERM',
  safety:'Seguridad y sobrevida global', references:'Referencias',
};
document.querySelectorAll('[data-source]').forEach(button => button.addEventListener('click', () => {
  const key = button.dataset.source;
  dialogTitle.textContent = titles[key];
  dialogBody.replaceChildren();
  if (key === 'references') {
    const list = document.createElement('ol');
    source.references.forEach(reference => {
      const item = document.createElement('li');
      item.textContent = reference;
      list.append(item);
    });
    dialogBody.append(list);
  } else {
    source.passages[key].split('\n\n').forEach(text => {
      const paragraph = document.createElement('p');
      paragraph.textContent = text;
      dialogBody.append(paragraph);
    });
  }
  const citation = document.createElement('div');
  citation.className = 'dialog-source';
  citation.textContent = `Fuente editorial de esta prueba: ${source.sourceFile}. Verificar contra la versión final aprobada.`;
  dialogBody.append(citation);
  dialog.showModal();
}));
document.querySelector('#close-dialog').addEventListener('click', () => dialog.close());
dialog.addEventListener('click', event => { if (event.target === dialog) dialog.close(); });
