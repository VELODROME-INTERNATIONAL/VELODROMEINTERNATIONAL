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
<script>
  const modal = document.getElementById("showreel-modal");
  const video = document.getElementById("showreel-video");
  const openButton = document.getElementById("open-showreel");
  const closeButton = document.getElementById("close-showreel");
  const playButton = document.getElementById("play-button");
  const soundButton = document.getElementById("sound-button");
  const progress = document.getElementById("video-progress");

  function openShowreel() {
    modal.classList.add("is-open");
    modal.setAttribute("aria-hidden", "false");
    document.body.classList.add("showreel-open");

    video.currentTime = 0;
    video.muted = false;
    video.play();

    playButton.textContent = "Pause";
    soundButton.textContent = "Mute";
  }

  function closeShowreel() {
    modal.classList.remove("is-open");
    modal.setAttribute("aria-hidden", "true");
    document.body.classList.remove("showreel-open");

    video.pause();
    playButton.textContent = "Play";
  }

  openButton.addEventListener("click", openShowreel);
  closeButton.addEventListener("click", closeShowreel);

  playButton.addEventListener("click", () => {
    if (video.paused) {
      video.play();
      playButton.textContent = "Pause";
    } else {
      video.pause();
      playButton.textContent = "Play";
    }
  });

  soundButton.addEventListener("click", () => {
    video.muted = !video.muted;
    soundButton.textContent = video.muted ? "Unmute" : "Mute";
  });

  video.addEventListener("timeupdate", () => {
    if (video.duration) {
      progress.value = (video.currentTime / video.duration) * 100;
    }
  });

  progress.addEventListener("input", () => {
    if (video.duration) {
      video.currentTime = (progress.value / 100) * video.duration;
    }
  });

  video.addEventListener("ended", () => {
    playButton.textContent = "Play";
  });

  document.addEventListener("keydown", event => {
    if (event.key === "Escape") closeShowreel();
  });
</script>
const infoPanel = document.getElementById("info-panel");
const openInfo = document.getElementById("open-info");
const closeInfo = document.getElementById("close-info");

function showInfo() {
  infoPanel.classList.add("is-open");
  infoPanel.setAttribute("aria-hidden", "false");
  openInfo.setAttribute("aria-expanded", "true");
}

function hideInfo() {
  infoPanel.classList.remove("is-open");
  infoPanel.setAttribute("aria-hidden", "true");
  openInfo.setAttribute("aria-expanded", "false");
}

openInfo.addEventListener("click", () => {
  infoPanel.classList.contains("is-open") ? hideInfo() : showInfo();
});

closeInfo.addEventListener("click", hideInfo);

document.addEventListener("keydown", event => {
  if (event.key === "Escape") hideInfo();
});
