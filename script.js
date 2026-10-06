(() => {
  /* La carpeta de script.js es la raíz de la web. */
  const script = document.currentScript;
  const siteRoot = new URL("./", script?.src || document.baseURI);
  const siteURL = path => new URL(path, siteRoot).href;

  /* FAVICON */
  const favicon = document.createElement("link");
  favicon.rel = "icon";
  favicon.type = "image/png";
  favicon.href = siteURL("assets/brand/favicon.png?v=2");

  document.querySelectorAll('link[rel~="icon"]').forEach(el => el.remove());
  document.head.append(favicon);

  function init() {
    /* RUTAS DEL HEADER */
    const routes = {
      live: "live.html",
      show: "show.html",
      shows: "show.html",
      broadcast: "broadcast.html",
      releases: "releases.html",
      album: "album.html",
      albums: "album.html",
      "music video": "music-video.html",
      "music-video": "music-video.html",
      cover: "cover.html",
      archive: "archive.html"
    };

    const currentFile = location.pathname.split("/").pop();
    const parentPages = {
      "show.html": "live.html",
      "broadcast.html": "live.html",
      "album.html": "releases.html",
      "music-video.html": "releases.html",
      "cover.html": "releases.html"
    };
    const isMainPage = Object.values(routes).includes(currentFile)
      || currentFile === "home.html"
      || currentFile === "index.html";

    document.querySelectorAll(".site-header a").forEach(link => {
      if (link.classList.contains("header-logo")) {
        link.href = siteURL("home.html");
        link.removeAttribute("aria-current");

        if (currentFile === "home.html") {
          link.setAttribute("aria-current", "page");
        }
        return;
      }

      const label = link.textContent.trim().toLowerCase().replace(/\s+/g, " ");
      const route = routes[label];
      if (!route) return;

      link.href = siteURL(route);

      if (isMainPage) {
        const exact = route === currentFile;
        const parent = route === parentPages[currentFile];

        link.classList.toggle("active", exact || parent);
        link.removeAttribute("aria-current");
        if (exact) link.setAttribute("aria-current", "page");
      }
    });

    /* PROYECTOS CON CAMBIO DE IMAGEN AL PASAR EL RATÓN */
    const projectLinks = document.querySelectorAll(".project-link");
    const mediaItems = document.querySelectorAll(".media-item");

    function activateProject(id) {
      if (!id) return;

      projectLinks.forEach(link => {
        link.classList.toggle("is-active", link.dataset.target === id);
      });
      mediaItems.forEach(item => {
        item.classList.toggle("is-active", item.dataset.media === id);
      });
    }

    projectLinks.forEach(link => {
      link.addEventListener("mouseenter", () => activateProject(link.dataset.target));
      link.addEventListener("focus", () => activateProject(link.dataset.target));
    });

    /* HEADER TRANSPARENTE */
    const siteHeader = document.getElementById("site-header");
    const archiveScroller = document.querySelector(".archive-projects");

    function updateHeader() {
      const scrolled = window.scrollY > 20
        || (archiveScroller?.scrollTop || 0) > 20;
      siteHeader?.classList.toggle("is-scrolled", scrolled);
    }

    window.addEventListener("scroll", updateHeader, { passive: true });
    archiveScroller?.addEventListener("scroll", updateHeader, { passive: true });
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

    infoOpen?.addEventListener("click", () => {
      setInfo(!infoPanel?.classList.contains("is-open"));
    });
    infoClose?.addEventListener("click", () => setInfo(false));

    /* CONTROL GENERAL DE SONIDO */
    const soundToggle = document.querySelector(".sound-toggle");

    soundToggle?.addEventListener("click", () => {
      const soundIsOn = soundToggle.getAttribute("aria-pressed") === "true";

      document.querySelectorAll("video").forEach(video => {
        video.muted = soundIsOn;
      });

      soundToggle.setAttribute("aria-pressed", String(!soundIsOn));
      soundToggle.textContent = soundIsOn ? "UNMUTE" : "MUTE";
    });

    /* SHOWREEL */
    const modal = document.getElementById("showreel-modal");
    const video = document.getElementById("showreel-video");
    const openButton = document.getElementById("open-showreel");
    const closeButton = document.getElementById("close-showreel");
    const playButton = document.getElementById("play-button");
    const soundButton = document.getElementById("sound-button");
    const progress = document.getElementById("video-progress");

    function syncVideoControls() {
      if (!video) return;
      if (playButton) playButton.textContent = video.paused ? "Play" : "Pause";
      if (soundButton) soundButton.textContent = video.muted ? "Unmute" : "Mute";
    }

    async function playVideo(allowMutedFallback = false) {
      if (!video) return;

      try {
        await video.play();
      } catch {
        if (allowMutedFallback && modal?.classList.contains("is-open")) {
          video.muted = true;
          try {
            await video.play();
          } catch {
            // El usuario podrá iniciar la reproducción con Play.
          }
        }
      }
      syncVideoControls();
    }

    function openShowreel() {
      if (!modal || !video) return;

      setInfo(false);
      modal.classList.add("is-open");
      modal.setAttribute("aria-hidden", "false");
      document.body.classList.add("showreel-open");

      video.currentTime = 0;
      video.muted = false;
      if (progress) progress.value = 0;
      playVideo(true);
    }

    function closeShowreel() {
      if (!modal || !video) return;

      modal.classList.remove("is-open");
      modal.setAttribute("aria-hidden", "true");
      document.body.classList.remove("showreel-open");
      video.pause();
      syncVideoControls();
    }

    openButton?.addEventListener("click", openShowreel);
    closeButton?.addEventListener("click", closeShowreel);

    playButton?.addEventListener("click", () => {
      if (!video) return;
      if (video.paused) playVideo();
      else video.pause();
    });

    soundButton?.addEventListener("click", () => {
      if (video) video.muted = !video.muted;
    });

    if (video) {
      ["play", "pause", "ended", "volumechange"].forEach(event => {
        video.addEventListener(event, syncVideoControls);
      });

      video.addEventListener("timeupdate", () => {
        if (progress && Number.isFinite(video.duration) && video.duration > 0) {
          progress.value = video.currentTime / video.duration * 100;
        }
      });

      progress?.addEventListener("input", () => {
        if (Number.isFinite(video.duration) && video.duration > 0) {
          video.currentTime = Number(progress.value) / 100 * video.duration;
        }
      });

      syncVideoControls();
    }

    document.addEventListener("keydown", event => {
      if (event.key !== "Escape") return;
      setInfo(false);
      closeShowreel();
    });

    /* GALERÍA ANTIGUA CON MINIATURAS */
    const mainImage = document.getElementById("project-main-image");
    const thumbnails = [...document.querySelectorAll(".project-thumbnail")];
    let imageRequest = 0;

    if (mainImage && thumbnails.length) {
      thumbnails.forEach(thumbnail => {
        thumbnail.addEventListener("click", () => {
          const source = thumbnail.dataset.image;
          if (!source) return;

          const request = ++imageRequest;
          const preload = new Image();
          mainImage.classList.add("is-changing");

          preload.onload = () => {
            if (request !== imageRequest) return;

            mainImage.src = source;
            mainImage.classList.remove("is-changing");
            thumbnails.forEach(item => {
              item.classList.toggle("is-active", item === thumbnail);
            });
          };

          preload.onerror = () => {
            if (request === imageRequest) {
              mainImage.classList.remove("is-changing");
            }
          };

          preload.src = source;
        });
      });
    }

    /* FILTROS DEL ARCHIVO */
    const filters = [...document.querySelectorAll(".archive-filter")];
    const cards = [...document.querySelectorAll(".archive-card")];
    const params = new URLSearchParams(location.search);

    if (filters.length && cards.length) {
      const matches = (card, filter) => {
        const categories = (card.dataset.category || "").trim().split(/\s+/);
        return filter === "all" || categories.includes(filter);
      };

      function filterProjects(filter, scroll = true) {
        cards.forEach(card => {
          card.hidden = !matches(card, filter);
        });

        filters.forEach(button => {
          const active = button.dataset.filter === filter;
          button.classList.toggle("active", active);
          button.setAttribute("aria-pressed", String(active));
        });

        if (scroll) {
          archiveScroller?.scrollTo({ top: 0, behavior: "auto" });
        }
        updateHeader();
      }

      filters.forEach(button => {
        const total = cards.filter(card => matches(card, button.dataset.filter)).length;
        const counter = button.querySelector("span:last-child");
        if (counter) counter.textContent = String(total).padStart(3, "0");

        button.addEventListener("click", event => {
          event.preventDefault();
          filterProjects(button.dataset.filter);
        });
      });

      const requested = params.get("filter");
      const initial = filters.some(button => button.dataset.filter === requested)
        ? requested
        : "all";

      filterProjects(initial, false);
    }

    /* DOBLE VISTA: SOLO EN PÁGINAS DE PROYECTO */
    if (document.body.classList.contains("project-page")) {
      const view = params.get("view") === "archive" ? "archive" : "category";

      document.documentElement.dataset.projectView = view;
      document.body.classList.remove("view-archive", "view-category");
      document.body.classList.add(`view-${view}`);

      /* DESTINO DE LA X */
      const returnPages = {
        archive: "archive.html",
        live: "live.html",
        show: "show.html",
        shows: "show.html",
        broadcast: "broadcast.html",
        releases: "releases.html",
        album: "album.html",
        albums: "album.html",
        "music-video": "music-video.html",
        cover: "cover.html",

        // Cambia este ejemplo por el nombre real de tu álbum.
        "album-ejemplo": "RELEASES/album-ejemplo.html"
      };

      const from = params.get("from") || "archive";
      const destination = Object.prototype.hasOwnProperty.call(returnPages, from)
        ? returnPages[from]
        : returnPages.archive;

      document.querySelectorAll(".project-page-close, #project-close").forEach(close => {
        close.href = siteURL(destination);
        close.setAttribute(
          "aria-label",
          destination === "archive.html" ? "Volver al archivo" : "Volver al listado de origen"
        );
      });

      /* Compatibilidad con la galería antigua.
         La galería actual se inicia desde el HTML de cada proyecto. */
      if (view === "archive" && !document.querySelector(".archive-viewer")) {
        const images = [...document.querySelectorAll(".project-media")];

        images.forEach(image => {
          image.addEventListener("click", () => {
            images.forEach(item => {
              item.classList.toggle("is-selected", item === image);
            });
            window.scrollTo({ top: 0, behavior: "auto" });
          });
        });
      }

      if (view === "category") initProjectRows();
    }
  }

  /* IMÁGENES A ALTURA DE VENTANA Y VERTICALES EN PAREJAS */
  function initProjectRows() {
    const gallery = document.querySelector(".project-page .project-images");
    if (!gallery || gallery.dataset.rowsReady) return;

    const items = [...gallery.children].filter(element =>
      element.matches(".project-media") && element.querySelector("img")
    );
    if (!items.length) return;

    gallery.dataset.rowsReady = "true";
    const photos = items.map(item => item.querySelector("img"));
    const rows = [];
    let frame;
    let built = false;

    function resizeRows() {
      const header = document.querySelector(".project-site-header");
      const headerHeight = header?.getBoundingClientRect().height || 0;
      const availableHeight = Math.max(1, window.innerHeight - headerHeight);

      rows.forEach(({ row, group }) => {
        const gap = parseFloat(getComputedStyle(row).columnGap) || 0;

        const ratios = group.map(item => {
          const image = item.querySelector("img");
          return image.naturalWidth > 0 && image.naturalHeight > 0
            ? image.naturalWidth / image.naturalHeight
            : 1;
        });

        const availableWidth = Math.max(1, row.clientWidth - gap * (group.length - 1));
        const sum = ratios.reduce((total, ratio) => total + ratio, 0);
        const height = Math.min(availableHeight, availableWidth / sum);

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
      if (built || !photos.every(image => image.complete)) return;
      built = true;

      const vertical = item => {
        const image = item?.querySelector("img");
        return image && image.naturalWidth > 0
          && image.naturalHeight > image.naturalWidth;
      };

      for (let index = 0; index < items.length; index++) {
        const group = [items[index]];

        if (vertical(items[index]) && vertical(items[index + 1])) {
          group.push(items[++index]);
        }

        const row = document.createElement("div");
        row.className = "project-image-row";
        row.append(...group);
        gallery.append(row);
        rows.push({ row, group });
      }

      scheduleResize();
    }

    photos.forEach(image => {
      image.addEventListener("load", buildRows, { once: true });
      image.addEventListener("error", buildRows, { once: true });
      image.loading = "eager";
    });

    buildRows();
    window.addEventListener("resize", scheduleResize);

    if ("ResizeObserver" in window) {
      const observer = new ResizeObserver(scheduleResize);
      observer.observe(gallery);
    }
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init, { once: true });
  } else {
    init();
  }
})();

// La X vuelve a la página del álbum indicada en el enlace.
(() => {
  const raiz = new URL("./", document.currentScript.src);

  function actualizarCierre() {
    const parametros = new URLSearchParams(location.search);
    if (parametros.get("from") !== "album") return;

    const destino = new URL(parametros.get("return") || "album.html", raiz);
    if (destino.origin !== raiz.origin || !destino.pathname.startsWith(raiz.pathname)) return;

    document.querySelectorAll(".project-page-close, #project-close").forEach(enlace => {
      enlace.href = destino.href;
      enlace.setAttribute("aria-label", "Volver al álbum");
    });
  }

  if (document.readyState === "complete") actualizarCierre();
  else window.addEventListener("load", actualizarCierre, { once: true });
})();

// Buscar proyectos dentro del archivo.
(() => {
  function iniciarBuscadorArchivo() {
    const buscador = document.getElementById("archive-search");
    const listado = document.getElementById("archive-projects");
    if (!buscador || !listado || buscador.dataset.ready) return;
    buscador.dataset.ready = "true";

    const tarjetas = [...listado.querySelectorAll(".archive-card")];
    const filtros = [...document.querySelectorAll(".archive-filter")];

    const normalizar = texto => texto
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase()
      .trim();

    const proyectos = tarjetas.map(tarjeta => ({
      tarjeta,
      texto: normalizar([
        tarjeta.querySelector(".archive-artist")?.textContent || "",
        tarjeta.querySelector(".archive-project-name")?.textContent || ""
      ].join(" ")),
      categorias: (tarjeta.dataset.category || "").split(/\s+/)
    }));

    const mensaje = document.createElement("p");
    mensaje.className = "archive-search-empty";
    mensaje.setAttribute("role", "status");
    mensaje.hidden = true;
    listado.append(mensaje);

    let categoria = filtros.find(filtro =>
      filtro.classList.contains("active")
    )?.dataset.filter || "all";

    function filtrar() {
      const palabras = normalizar(buscador.value).split(/\s+/).filter(Boolean);
      let visibles = 0;

      proyectos.forEach(({ tarjeta, texto, categorias }) => {
        const coincideCategoria = categoria === "all" || categorias.includes(categoria);
        const coincideBusqueda = palabras.every(palabra => texto.includes(palabra));
        const mostrar = coincideCategoria && coincideBusqueda;

        tarjeta.hidden = !mostrar;
        if (mostrar) visibles++;
      });

      mensaje.textContent = visibles ? "" : "No se han encontrado proyectos.";
      mensaje.hidden = visibles > 0;
      listado.scrollTop = 0;
    }

    buscador.addEventListener("input", filtrar);

    filtros.forEach(filtro => {
      filtro.addEventListener("click", () => {
        categoria = filtro.dataset.filter || "all";
        // Aplicar la búsqueda después del filtro de categoría existente.
        queueMicrotask(filtrar);
      });
    });

    filtrar();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", iniciarBuscadorArchivo, { once: true });
  } else {
    iniciarBuscadorArchivo();
  }
})();
