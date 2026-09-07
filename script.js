document.addEventListener("DOMContentLoaded", () => {
  /* PROYECTOS */

  const projectLinks = document.querySelectorAll(".project-link");
  const mediaItems = document.querySelectorAll(".media-item");

  function activateProject(id) {
    projectLinks.forEach(link => {
      link.classList.toggle("is-active", link.dataset.target === id);
    });

    mediaItems.forEach(item => {
      item.classList.toggle("is-active", item.dataset.media === id);
    });
  }

  projectLinks.forEach(link => {
    link.addEventListener("mouseenter", () => {
      activateProject(link.dataset.target);
    });

    link.addEventListener("focus", () => {
      activateProject(link.dataset.target);
    });
  });


  /* HEADER TRANSPARENTE AL HACER SCROLL */

  const siteHeader = document.getElementById("site-header");

  function updateHeader() {
    if (!siteHeader) return;
    siteHeader.classList.toggle("is-scrolled", window.scrollY > 20);
  }

  window.addEventListener("scroll", updateHeader);
  updateHeader();


  /* PANEL INFO */

  const infoPanel = document.getElementById("info-panel");
  const infoOpen = document.getElementById("open-info");
  const infoClose = document.getElementById("close-info");

  function setInfo(open) {
    if (!infoPanel || !infoOpen) return;

    infoPanel.classList.toggle("is-open", open);
    infoPanel.setAttribute("aria-hidden", String(!open));
    infoOpen.setAttribute("aria-expanded", String(open));
  }

  if (infoOpen) {
    infoOpen.addEventListener("click", () => {
      const isOpen = infoPanel?.classList.contains("is-open");
      setInfo(!isOpen);
    });
  }

  if (infoClose) {
    infoClose.addEventListener("click", () => setInfo(false));
  }


  /* CONTROL GENERAL DE SONIDO */

  const soundToggle = document.querySelector(".sound-toggle");

  if (soundToggle) {
    soundToggle.addEventListener("click", () => {
      const soundIsOn =
        soundToggle.getAttribute("aria-pressed") === "true";

      document.querySelectorAll("video").forEach(video => {
        video.muted = soundIsOn;
      });

      soundToggle.setAttribute(
        "aria-pressed",
        String(!soundIsOn)
      );

      soundToggle.textContent = soundIsOn ? "UNMUTE" : "MUTE";
    });
  }


  /* SHOWREEL AMPLIADO */

  const showreelModal = document.getElementById("showreel-modal");
  const showreelVideo = document.getElementById("showreel-video");
  const showreelOpen = document.getElementById("open-showreel");
  const showreelClose = document.getElementById("close-showreel");
  const playButton = document.getElementById("play-button");
  const soundButton = document.getElementById("sound-button");
  const progress = document.getElementById("video-progress");

  function openShowreel() {
    if (!showreelModal || !showreelVideo) return;

    setInfo(false);

    showreelModal.classList.add("is-open");
    showreelModal.setAttribute("aria-hidden", "false");
    document.body.classList.add("showreel-open");

    showreelVideo.currentTime = 0;
    showreelVideo.muted = false;

    showreelVideo.play().catch(() => {
      showreelVideo.muted = true;
      showreelVideo.play();
    });

    if (playButton) playButton.textContent = "Pause";

    if (soundButton) {
      soundButton.textContent = showreelVideo.muted
        ? "Unmute"
        : "Mute";
    }
  }

  function closeShowreel() {
    if (!showreelModal || !showreelVideo) return;

    showreelModal.classList.remove("is-open");
    showreelModal.setAttribute("aria-hidden", "true");
    document.body.classList.remove("showreel-open");

    showreelVideo.pause();

    if (playButton) playButton.textContent = "Play";
  }

  if (showreelOpen) {
    showreelOpen.addEventListener("click", openShowreel);
  }

  if (showreelClose) {
    showreelClose.addEventListener("click", closeShowreel);
  }

  if (playButton && showreelVideo) {
    playButton.addEventListener("click", () => {
      if (showreelVideo.paused) {
        showreelVideo.play();
        playButton.textContent = "Pause";
      } else {
        showreelVideo.pause();
        playButton.textContent = "Play";
      }
    });
  }

  if (soundButton && showreelVideo) {
    soundButton.addEventListener("click", () => {
      showreelVideo.muted = !showreelVideo.muted;
      soundButton.textContent = showreelVideo.muted
        ? "Unmute"
        : "Mute";
    });
  }

  if (progress && showreelVideo) {
    showreelVideo.addEventListener("timeupdate", () => {
      if (showreelVideo.duration) {
        progress.value =
          (showreelVideo.currentTime / showreelVideo.duration) * 100;
      }
    });

    progress.addEventListener("input", () => {
      if (showreelVideo.duration) {
        showreelVideo.currentTime =
          (progress.value / 100) * showreelVideo.duration;
      }
    });

    showreelVideo.addEventListener("ended", () => {
      if (playButton) playButton.textContent = "Play";
    });
  }


  /* CERRAR CON ESCAPE */

  document.addEventListener("keydown", event => {
    if (event.key !== "Escape") return;

    setInfo(false);
    closeShowreel();
  });
});
document.addEventListener("DOMContentLoaded", () => {
  const mainProjectImage = document.getElementById("project-main-image");
  const projectThumbnails = document.querySelectorAll(".project-thumbnail");

  if (!mainProjectImage || !projectThumbnails.length) return;

  projectThumbnails.forEach(thumbnail => {
    thumbnail.addEventListener("click", () => {
      const newImage = thumbnail.dataset.image;

      if (!newImage || mainProjectImage.src.endsWith(newImage)) return;

      projectThumbnails.forEach(item => {
        item.classList.remove("is-active");
      });

      thumbnail.classList.add("is-active");
      mainProjectImage.classList.add("is-changing");

      const preloadImage = new Image();
      preloadImage.src = newImage;

      preloadImage.onload = () => {
        mainProjectImage.src = newImage;
        mainProjectImage.classList.remove("is-changing");
      };
    });
  });
});

document.addEventListener("DOMContentLoaded", () => {
  const filterButtons = document.querySelectorAll(".archive-filter");
  const archiveCards = document.querySelectorAll(".archive-card");
  const projectsContainer = document.querySelector(".archive-projects");

  if (!filterButtons.length || !archiveCards.length) return;

  function getCategories(card) {
    return (card.dataset.category || "")
      .trim()
      .split(/\s+/);
  }

  function projectMatches(card, filter) {
    if (filter === "all") return true;
    return getCategories(card).includes(filter);
  }

  function updateCounters() {
    filterButtons.forEach(button => {
      const filter = button.dataset.filter;

      const total = [...archiveCards].filter(card => {
        return projectMatches(card, filter);
      }).length;

      const counter = button.querySelector("span:last-child");

      if (counter) {
        counter.textContent = String(total).padStart(3, "0");
      }
    });
  }

  function filterProjects(filter) {
    archiveCards.forEach(card => {
      const visible = projectMatches(card, filter);
      card.hidden = !visible;
    });

    filterButtons.forEach(button => {
      const active = button.dataset.filter === filter;

      button.classList.toggle("active", active);
      button.setAttribute("aria-pressed", String(active));
    });

    if (projectsContainer) {
      projectsContainer.scrollTo({
        top: 0,
        behavior: "smooth"
      });
    }
  }

  filterButtons.forEach(button => {
    button.addEventListener("click", () => {
      filterProjects(button.dataset.filter);
    });
  });

  updateCounters();
  filterProjects("all");
});
