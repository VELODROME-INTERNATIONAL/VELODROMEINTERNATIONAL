(() => {
  const favicon = document.createElement("link");

  favicon.rel = "icon";
  favicon.type = "image/png";
  favicon.href = new URL(
    "assets/brand/favicon.png?v=2",
    document.currentScript.src
  ).href;

  document.querySelectorAll('link[rel~="icon"]').forEach(icon => icon.remove());
  document.head.appendChild(favicon);
})();

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
document.addEventListener("DOMContentLoaded", () => {
  const page = document.body;
  const closeButton = document.getElementById("project-close");
  const projectImages = document.querySelectorAll(".project-media");
  const params = new URLSearchParams(window.location.search);

  const view = params.get("view") === "archive"
    ? "archive"
    : "category";

  const from = params.get("from") || "";

  page.classList.add(`view-${view}`);


  /* DESTINO DE LA X */

  const returnPages = {
    archive: "../../archive.html",
    live: "../../archive.html?filter=live",
    shows: "../../archive.html?filter=shows",
    broadcast: "../../archive.html?filter=broadcast",
    releases: "../../archive.html?filter=releases",
    albums: "../../archive.html?filter=albums",
    "music-video": "../../archive.html?filter=music-video",
    cover: "../../archive.html?filter=cover"
  };

  if (closeButton) {
    if (view === "archive") {
      closeButton.href = returnPages.archive;
    } else {
      closeButton.href = returnPages[from] || returnPages.archive;
    }
  }


  /* GALERÍA DEL MODO ARCHIVE */

  if (view === "archive") {
    projectImages.forEach(image => {
      image.addEventListener("click", () => {
        if (image.classList.contains("is-selected")) return;

        projectImages.forEach(item => {
          item.classList.remove("is-selected");
        });

        image.classList.add("is-selected");

        window.scrollTo({
          top: 0,
          behavior: "smooth"
        });
      });
    });
  }
});

/* AGRUPAR IMÁGENES EN LA VISTA DE CATEGORÍA */
(() => {
  function initProjectRows() {
    const view = new URLSearchParams(location.search).get("view");
    if (view === "archive") return;

    const gallery = document.querySelector(".project-page .project-images");
    if (!gallery || gallery.dataset.rowsReady) return;
    gallery.dataset.rowsReady = "true";

    const items = [...gallery.children].filter(el =>
      el.matches(".project-media") && el.querySelector("img")
    );
    if (!items.length) return;

    const photos = items.map(item => item.querySelector("img"));
    const rows = [];
    let frame;

    function resizeRows() {
      const header = document.querySelector(".project-site-header");
      const headerHeight = header?.getBoundingClientRect().height || 0;
      const availableHeight = Math.max(1, window.innerHeight - headerHeight);

      rows.forEach(({ row, group }) => {
        const gap = parseFloat(getComputedStyle(row).columnGap) || 0;
        const ratios = group.map(item => {
          const img = item.querySelector("img");
          return img.naturalWidth / img.naturalHeight || 1;
        });
        const availableWidth = row.clientWidth - gap * (group.length - 1);
        const height = Math.max(1, Math.min(
          availableHeight,
          availableWidth / ratios.reduce((sum, ratio) => sum + ratio, 0)
        ));

        row.style.setProperty("--row-height", `${height}px`);
        group.forEach((item, index) => {
          item.style.setProperty("--photo-width", `${height * ratios[index]}px`);
        });
      });
    }

    function scheduleResize() {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(resizeRows);
    }

    function buildRows() {
      // Esperar a conocer las proporciones de todas las imágenes.
      if (!photos.every(img => img.complete)) return;

      rows.forEach(({ row }) => row.remove());
      rows.length = 0;

      const vertical = item => {
        const img = item?.querySelector("img");
        return img && img.naturalHeight > img.naturalWidth;
      };

      for (let i = 0; i < items.length; i++) {
        const group = [items[i]];
        if (vertical(items[i]) && vertical(items[i + 1])) {
          group.push(items[++i]);
        }

        const row = document.createElement("div");
        row.className = "project-image-row";
        row.append(...group);
        gallery.append(row);
        rows.push({ row, group });
      }

      scheduleResize();
    }

    photos.forEach(img => {
      img.loading = "eager";
      img.addEventListener("load", buildRows);
      img.addEventListener("error", buildRows);
    });

    buildRows();
    window.addEventListener("resize", scheduleResize);
    new ResizeObserver(scheduleResize).observe(gallery);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initProjectRows);
  } else {
    initProjectRows();
  }
})();
