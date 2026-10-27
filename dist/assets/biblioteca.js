(() => {
  const search = document.querySelector('#publication-search');
  const buttons = [...document.querySelectorAll('[data-filter]')];
  const publications = [...document.querySelectorAll('.publication')];
  let category = 'all';
  const normalize = value => value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().trim();
  function render() {
    const words = normalize(search.value).split(/\s+/).filter(Boolean);
    let count = 0;
    publications.forEach(publication => {
      const matches = (category === 'all' || publication.dataset.category === category) && words.every(word => normalize(publication.dataset.search).includes(word));
      publication.hidden = !matches;
      count += Number(matches);
    });
    buttons.forEach(button => { const selected = button.dataset.filter === category; button.classList.toggle('selected', selected); button.setAttribute('aria-pressed', String(selected)); });
    document.querySelector('.empty-state').hidden = count > 0;
  }
  search.addEventListener('input', render);
  buttons.forEach(button => button.addEventListener('click', () => { category = button.dataset.filter; render(); }));
  document.querySelector('#clear-search').addEventListener('click', () => { search.value = ''; category = 'all'; render(); search.focus(); });
})();
