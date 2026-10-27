// Shared project copy, credits and connections. Empty copy stays hidden until supplied.
(() => {
  const root = new URL('./', document.currentScript.src);
  const pagePath = decodeURIComponent(location.pathname.slice(root.pathname.length));
  const params = new URLSearchParams(location.search);
  const view = params.get('view') === 'archive' ? 'archive' : 'category';

  function projectLink(path) {
    const url = new URL(path, root);
    url.searchParams.set('view', view);
    url.searchParams.set('from', params.get('from') || (view === 'archive' ? 'archive' : 'work'));
    if (params.has('return')) url.searchParams.set('return', params.get('return'));
    return url.href;
  }

  function element(tag, className, text) {
    const el = document.createElement(tag);
    if (className) el.className = className;
    if (text) el.textContent = text;
    return el;
  }

  async function init() {
    const story = document.querySelector('.project-story');
    const gallery = document.querySelector('.project-images, .album-overview');
    if (!story || !gallery) return;
    // Archive keeps the full gallery before explanatory copy.
    if (view === 'archive') {
      gallery.after(story); story.hidden = true;
      const header = document.querySelector('.project-header');
      const sizeHeader = () => document.documentElement.style.setProperty('--archive-header-height', `${header?.getBoundingClientRect().height || 58}px`);
      sizeHeader();
      if (header && 'ResizeObserver' in window) new ResizeObserver(sizeHeader).observe(header);
    }
    try {
      const response = await fetch(new URL('project-content.json', root));
      if (!response.ok) throw new Error(`Project content: ${response.status}`);
      const { projects, selections, universes } = await response.json();
      const project = projects[pagePath];
      if (!project) return;

      for (const [key, selector] of [['description', '.project-description'], ['role', '.project-role']]) {
        const block = story.querySelector(selector);
        if (block && project[key]) {
          block.textContent = key === 'role' ? `Vélodrome — ${project[key]}` : project[key];
          block.hidden = false;
          story.hidden = false;
        }
      }

      let after = story.compareDocumentPosition(gallery) & Node.DOCUMENT_POSITION_FOLLOWING ? gallery : story;
      let credits = document.querySelector('.project-credits');
      if (!credits && project.credits?.length) {
        credits = element('section', 'project-credits');
        credits.setAttribute('aria-label', 'Créditos del proyecto');
        const list = element('dl', 'credits-list');
        project.credits.forEach(credit => {
          const row = element('div');
          row.append(element('dt', '', credit.role), element('dd', '', credit.name));
          list.append(row);
        });
        credits.append(list);
      }
      if (credits) { after.after(credits); after = credits; }

      // Connections come from the existing album pages, not just a matching artist name.
      const related = (project.related || []).filter(path => projects[path]);
      if (related.length && !universes[pagePath]) {
        const section = element('section', 'related-projects');
        section.append(element('h2', 'section-kicker', 'In the same universe'));
        const grid = element('div', 'related-grid');
        related.forEach(path => {
          const item = projects[path];
          const link = element('a', 'related-card');
          link.href = projectLink(path);
          if (item.image) {
            const image = element('img');
            image.src = new URL(item.image, root).href;
            image.alt = `${item.artist} — ${item.title}`;
            image.loading = 'lazy';
            link.append(image);
          }
          link.append(element('span', '', item.title));
          grid.append(link);
        });
        section.append(grid);
        after.after(section); after = section;
      }

      let sequence = selections[params.get('from')] || Object.keys(projects);
      const album = params.get('return');
      if (params.get('from') === 'album' && universes[album]?.includes(pagePath)) sequence = universes[album];
      if (!sequence.includes(pagePath)) sequence = Object.keys(projects);
      const index = sequence.indexOf(pagePath);
      if (index !== -1 && sequence.length > 1) {
        const nav = element('nav', 'project-pagination');
        nav.setAttribute('aria-label', 'Más proyectos');
        [[-1, '← Previous project'], [1, 'Next project →']].forEach(([offset, label]) => {
          const path = sequence[(index + offset + sequence.length) % sequence.length];
          const item = projects[path];
          if (!item) return;
          const link = element('a');
          link.href = projectLink(path);
          link.append(element('span', 'pagination-label', label), element('span', '', item.artist), element('span', '', item.title));
          nav.append(link);
        });
        after.after(nav);
      }
    } catch (error) {
      console.error('No se pudo cargar el contexto del proyecto:', error);
    }
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init, { once: true });
  else init();
})();
