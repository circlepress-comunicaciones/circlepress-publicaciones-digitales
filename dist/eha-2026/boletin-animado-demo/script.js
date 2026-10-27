const wordBlocks = new Map(window.BULLETIN_SOURCE.blocks.map(block => [block.id, block]));
document.querySelectorAll('a.brand[href="index.html"]').forEach(link => link.addEventListener('click', event => {
  event.preventDefault();
  location.reload();
}));
document.querySelectorAll('[data-word-id]').forEach(element => {
  const block = wordBlocks.get(element.dataset.wordId);
  if (block) element.textContent = block.text;
});
document.querySelectorAll('figure[data-block-id]').forEach(figure => {
  const block = wordBlocks.get(figure.dataset.blockId);
  if (!block) return;
  const title = block.text.replace(/^Cuadro \d+\.\s*/, '');
  figure.dataset.chart = title;
  figure.querySelector('.graphic-label b').textContent = title;
  figure.querySelector('figcaption').textContent = block.notes[0].text.replace(/2026([45])$/, (_, number) => `2026${number === '4' ? '⁴' : '⁵'}`);
});
document.querySelectorAll('.conclusion-list li p').forEach((element, index) => {
  element.textContent = wordBlocks.get(`word-${32 + index}`).text;
});
document.querySelectorAll('.references li').forEach((element, index) => {
  element.textContent = wordBlocks.get(`word-${38 + index}`).text;
});

const observer = new IntersectionObserver(entries => {
  for (const entry of entries) if (entry.isIntersecting) {
    entry.target.classList.add('is-visible');
    observer.unobserve(entry.target);
  }
}, {threshold: 0.1, rootMargin: '0px 0px -30px 0px'});
document.querySelectorAll('.reveal').forEach(el => observer.observe(el));

const progressBar = document.querySelector('#read-progress-bar');
function updateProgress() {
  const total = Math.max(1, document.documentElement.scrollHeight - innerHeight);
  progressBar.style.width = `${Math.min(100, Math.max(0, scrollY / total * 100))}%`;
}
addEventListener('scroll', updateProgress, {passive:true});
addEventListener('resize', updateProgress);
updateProgress();

const dialog = document.querySelector('#chart-dialog');
const dialogImage = document.querySelector('#dialog-image');
const dialogTitle = document.querySelector('#dialog-title');
document.querySelectorAll('.expand-chart').forEach(button => button.addEventListener('click', () => {
  const figure = button.closest('figure');
  const image = figure.querySelector('img');
  dialogTitle.textContent = figure.dataset.chart;
  dialogImage.src = image.src;
  dialogImage.alt = image.alt;
  dialog.showModal();
}));
document.querySelector('#close-dialog').addEventListener('click', () => dialog.close());
dialog.addEventListener('click', event => { if (event.target === dialog) dialog.close(); });
