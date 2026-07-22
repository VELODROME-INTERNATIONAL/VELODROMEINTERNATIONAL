const links = [...document.querySelectorAll('.project-link')];
const mediaItems = [...document.querySelectorAll('.media-item')];
const infoPanel = document.querySelector('.info-panel');
const infoToggle = document.querySelector('.info-toggle');
const infoClose = document.querySelector('.info-close');
const soundToggle = document.querySelector('.sound-toggle');

function activateProject(id) {
  links.forEach(link => link.classList.toggle('is-active', link.dataset.target === id));
  mediaItems.forEach(item => item.classList.toggle('is-active', item.dataset.media === id));
}

links.forEach(link => {
  link.addEventListener('mouseenter', () => activateProject(link.dataset.target));
  link.addEventListener('focus', () => activateProject(link.dataset.target));
});

function setInfo(open) {
  infoPanel.classList.toggle('is-open', open);
  infoPanel.setAttribute('aria-hidden', String(!open));
  infoToggle.setAttribute('aria-expanded', String(open));
}

infoToggle.addEventListener('click', () => setInfo(true));
infoClose.addEventListener('click', () => setInfo(false));
document.addEventListener('keydown', event => {
  if (event.key === 'Escape') setInfo(false);
});

soundToggle.addEventListener('click', () => {
  const isOn = soundToggle.getAttribute('aria-pressed') === 'true';
  soundToggle.setAttribute('aria-pressed', String(!isOn));
  soundToggle.textContent = isOn ? 'UNMUTE' : 'MUTE';

  document.querySelectorAll('video').forEach(video => {
    video.muted = isOn;
  });
});
