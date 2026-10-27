const TOTAL_PAGES = 604;
const INDEX_PAGE_SIZE = 24;
const SOURCE_BASE = "https://raw.githubusercontent.com/kausikhussain/Al-Madinah/main/quran-pages/";
const SOURCE_REPO = "https://github.com/kausikhussain/Al-Madinah/tree/main/quran-pages";
const PDFJS_MODULE_URL = "https://cdn.jsdelivr.net/npm/pdfjs-dist@4.10.38/build/pdf.mjs";
const PDFJS_WORKER_URL = "https://cdn.jsdelivr.net/npm/pdfjs-dist@4.10.38/build/pdf.worker.mjs";

const stage = document.getElementById("page-stage");
const canvasA = document.getElementById("page-canvas-a");
const canvasB = document.getElementById("page-canvas-b");
const placeholder = document.getElementById("page-placeholder");
const previewError = document.getElementById("preview-error");
const statusLabel = document.getElementById("stage-status");
const counterLabel = document.getElementById("counter-label");
const viewerPageInput = document.getElementById("viewer-page-number");
const pageIndexGrid = document.getElementById("page-index-grid");
const indexRangeLabel = document.getElementById("index-range-label");
const indexPageLabel = document.getElementById("index-page-label");
const previousButton = document.getElementById("page-prev");
const nextButton = document.getElementById("page-next");
const indexPreviousButton = document.getElementById("index-prev");
const indexNextButton = document.getElementById("index-next");
const downloadSource = document.getElementById("download-source");
const exportButton = document.getElementById("export-button");
const fullscreenButton = document.getElementById("fullscreen-button");
const toast = document.getElementById("toast");

let pdfjsPromise = null;
let activeCanvas = canvasA;
let inactiveCanvas = canvasB;
let activeDocument = null;
let activePageNumber = 1;
let activeRenderTask = null;
let loadVersion = 0;
let indexStart = 1;
let toastTimer = null;

function pageFilename(pageNumber) {
  return String(pageNumber).padStart(3, "0") + "___Hafs39__DM.ai";
}

function pageUrl(pageNumber) {
  return SOURCE_BASE + encodeURIComponent(pageFilename(pageNumber));
}

function formatPage(pageNumber) {
  return String(pageNumber).padStart(3, "0");
}

function setStatus(message) {
  statusLabel.textContent = message;
}

function announce(message) {
  if (toastTimer) window.clearTimeout(toastTimer);
  toast.textContent = message;
  toast.classList.add("is-visible");
  toastTimer = window.setTimeout(function () {
    toast.classList.remove("is-visible");
  }, 2600);
}

function getPdfJs() {
  if (!pdfjsPromise) {
    pdfjsPromise = import(PDFJS_MODULE_URL).then(function (pdfjs) {
      pdfjs.GlobalWorkerOptions.workerSrc = PDFJS_WORKER_URL;
      return pdfjs;
    });
  }
  return pdfjsPromise;
}

function updateViewerMetadata(pageNumber) {
  viewerPageInput.value = String(pageNumber);
  document.getElementById("browse-page-number").value = String(pageNumber);
  counterLabel.innerHTML = "PAGE " + formatPage(pageNumber) + " <span aria-hidden=\"true\">/</span> " + TOTAL_PAGES;
  previousButton.disabled = pageNumber <= 1;
  nextButton.disabled = pageNumber >= TOTAL_PAGES;
  downloadSource.href = pageUrl(pageNumber);
  downloadSource.setAttribute("download", pageFilename(pageNumber));
  downloadSource.setAttribute("aria-label", "Open original AI file for page " + pageNumber);
  document.getElementById("error-source-link").href = pageUrl(pageNumber);
  document.getElementById("error-source-link").setAttribute("download", pageFilename(pageNumber));
}

function setLoadingState(pageNumber) {
  previewError.hidden = true;
  placeholder.style.opacity = "1";
  stage.classList.remove("is-loaded");
  setStatus("Loading page " + formatPage(pageNumber) + "…");
  updateViewerMetadata(pageNumber);
}

function getDisplayScale(page, viewportAtOne) {
  const stageRect = stage.getBoundingClientRect();
  const availableWidth = Math.max(160, stageRect.width - 44);
  const availableHeight = Math.max(220, stageRect.height - 44);
  return Math.min(availableWidth / viewportAtOne.width, availableHeight / viewportAtOne.height);
}

async function renderDocumentPage(pdfDocument, pageNumber, requestVersion) {
  const page = await pdfDocument.getPage(1);
  if (requestVersion !== loadVersion) return false;

  const pdfjs = await getPdfJs();
  const normalViewport = page.getViewport({ scale: 1 });
  const displayScale = getDisplayScale(page, normalViewport);
  const pixelRatio = Math.min(window.devicePixelRatio || 1, 2);
  const renderViewport = page.getViewport({ scale: displayScale * pixelRatio });
  const displayWidth = normalViewport.width * displayScale;
  const displayHeight = normalViewport.height * displayScale;

  const stagingCanvas = document.createElement("canvas");
  stagingCanvas.width = Math.ceil(renderViewport.width);
  stagingCanvas.height = Math.ceil(renderViewport.height);
  const stagingContext = stagingCanvas.getContext("2d", { alpha: false });
  if (!stagingContext) throw new Error("Canvas rendering is unavailable in this browser.");
  stagingContext.fillStyle = "#fffefa";
  stagingContext.fillRect(0, 0, stagingCanvas.width, stagingCanvas.height);

  if (activeRenderTask && typeof activeRenderTask.cancel === "function") {
    try { activeRenderTask.cancel(); } catch (_error) { /* The prior render may already have finished. */ }
  }

  const renderTask = page.render({ canvasContext: stagingContext, viewport: renderViewport, background: "#fffefa" });
  activeRenderTask = renderTask;
  await renderTask.promise;
  if (activeRenderTask === renderTask) activeRenderTask = null;

  if (requestVersion !== loadVersion) return false;

  inactiveCanvas.width = stagingCanvas.width;
  inactiveCanvas.height = stagingCanvas.height;
  inactiveCanvas.style.width = displayWidth + "px";
  inactiveCanvas.style.height = displayHeight + "px";
  const targetContext = inactiveCanvas.getContext("2d", { alpha: false });
  if (!targetContext) throw new Error("Canvas rendering is unavailable in this browser.");
  targetContext.clearRect(0, 0, inactiveCanvas.width, inactiveCanvas.height);
  targetContext.drawImage(stagingCanvas, 0, 0);
  stagingCanvas.width = 0;
  stagingCanvas.height = 0;

  inactiveCanvas.classList.add("is-active");
  activeCanvas.classList.remove("is-active");
  activeCanvas.setAttribute("aria-hidden", "true");
  inactiveCanvas.setAttribute("aria-hidden", "false");
  const previousCanvas = activeCanvas;
  activeCanvas = inactiveCanvas;
  inactiveCanvas = previousCanvas;
  stage.classList.add("is-loaded");
  previewError.hidden = true;
  exportButton.disabled = false;
  setStatus("Page " + formatPage(pageNumber) + " ready");
  activePageNumber = pageNumber;
  renderPageIndex();
  return true;
}

async function showPage(pageNumber, options) {
  const opts = options || {};
  const requested = Math.max(1, Math.min(TOTAL_PAGES, Number.parseInt(pageNumber, 10) || 1));
  const requestVersion = ++loadVersion;
  setLoadingState(requested);

  let nextDocument = null;
  try {
    const pdfjs = await getPdfJs();
    if (requestVersion !== loadVersion) return;
    const loadingTask = pdfjs.getDocument({
      url: pageUrl(requested),
      withCredentials: false,
      rangeChunkSize: 65536,
      useSystemFonts: true
    });
    nextDocument = await loadingTask.promise;
    if (requestVersion !== loadVersion) {
      await nextDocument.destroy();
      return;
    }
    const previousDocument = activeDocument;
    const rendered = await renderDocumentPage(nextDocument, requested, requestVersion);
    if (!rendered || requestVersion !== loadVersion) {
      if (nextDocument !== activeDocument) await nextDocument.destroy();
      return;
    }
    activeDocument = nextDocument;
    if (previousDocument && previousDocument !== nextDocument) {
      try { await previousDocument.destroy(); } catch (_error) { /* Ignore cleanup errors from an old page. */ }
    }
    updateViewerMetadata(requested);
    if (opts.scrollToViewer) {
      document.getElementById("viewer").scrollIntoView({ behavior: prefersReducedMotion() ? "auto" : "smooth", block: "start" });
    }
  } catch (error) {
    if (requestVersion !== loadVersion) {
      if (nextDocument && nextDocument !== activeDocument) {
        try { await nextDocument.destroy(); } catch (_cleanupError) { /* Ignore stale load cleanup errors. */ }
      }
      return;
    }
    console.error("Unable to render Mushaf page", requested, error);
    previewError.hidden = false;
    stage.classList.add("is-loaded");
    setStatus("Preview unavailable for page " + formatPage(requested));
    exportButton.disabled = true;
    announce("The preview could not be rendered. The original file link is available.");
    if (nextDocument && nextDocument !== activeDocument) {
      try { await nextDocument.destroy(); } catch (_cleanupError) { /* Ignore cleanup errors. */ }
    }
  }
}

function renderPageIndex() {
  const start = indexStart;
  const end = Math.min(TOTAL_PAGES, start + INDEX_PAGE_SIZE - 1);
  const fragment = document.createDocumentFragment();
  for (let pageNumber = start; pageNumber <= end; pageNumber += 1) {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "page-index-item" + (pageNumber === activePageNumber ? " is-current" : "");
    button.setAttribute("aria-label", "Open page " + pageNumber);
    if (pageNumber === activePageNumber) button.setAttribute("aria-current", "page");
    const small = document.createElement("span");
    small.className = "index-label";
    small.textContent = "PAGE";
    const number = document.createElement("span");
    number.className = "index-number";
    number.textContent = formatPage(pageNumber);
    button.append(small, number);
    button.addEventListener("click", function () { showPage(pageNumber, { scrollToViewer: true }); });
    fragment.appendChild(button);
  }
  pageIndexGrid.replaceChildren(fragment);
  indexRangeLabel.textContent = "Pages " + formatPage(start) + "–" + formatPage(end) + " of " + TOTAL_PAGES;
  indexPageLabel.textContent = "INDEX " + String(Math.floor((start - 1) / INDEX_PAGE_SIZE) + 1).padStart(2, "0") + " / " + String(Math.ceil(TOTAL_PAGES / INDEX_PAGE_SIZE)).padStart(2, "0");
  indexPreviousButton.disabled = start <= 1;
  indexNextButton.disabled = end >= TOTAL_PAGES;
}

function updateIndexToPage(pageNumber) {
  indexStart = Math.floor((pageNumber - 1) / INDEX_PAGE_SIZE) * INDEX_PAGE_SIZE + 1;
  renderPageIndex();
}

function parsePageInput(input) {
  const value = Number.parseInt(input.value, 10);
  if (!Number.isInteger(value) || value < 1 || value > TOTAL_PAGES) {
    input.setAttribute("aria-invalid", "true");
    announce("Enter a page number between 1 and " + TOTAL_PAGES + ".");
    input.focus();
    return null;
  }
  input.removeAttribute("aria-invalid");
  return value;
}

function prefersReducedMotion() {
  return window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

function exportCurrentPreview() {
  if (!stage.classList.contains("is-loaded") || !activeCanvas.width) {
    announce("Load a page before exporting its preview.");
    return;
  }
  activeCanvas.toBlob(function (blob) {
    if (!blob) {
      announce("The preview export could not be created.");
      return;
    }
    const objectUrl = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = objectUrl;
    link.download = "mushaf-al-madinah-page-" + formatPage(activePageNumber) + "-preview.png";
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.setTimeout(function () { URL.revokeObjectURL(objectUrl); }, 1500);
    announce("PNG preview exported. This is a raster preview, not the original vector file.");
  }, "image/png");
}

function toggleNavigation() {
  const button = document.getElementById("nav-toggle");
  const nav = document.getElementById("primary-nav");
  const isOpen = nav.classList.toggle("is-open");
  button.setAttribute("aria-expanded", String(isOpen));
  button.setAttribute("aria-label", isOpen ? "Close navigation" : "Open navigation");
}

function setupRevealMotion() {
  const elements = document.querySelectorAll(".reveal");
  if (prefersReducedMotion() || !("IntersectionObserver" in window)) {
    elements.forEach(function (element) { element.classList.add("is-visible"); });
    return;
  }
  const observer = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (entry.isIntersecting) {
        entry.target.classList.add("is-visible");
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.08, rootMargin: "0px 0px -30px 0px" });
  elements.forEach(function (element) { observer.observe(element); });
}

function setupEvents() {
  document.getElementById("viewer-jump-form").addEventListener("submit", function (event) {
    event.preventDefault();
    const pageNumber = parsePageInput(viewerPageInput);
    if (pageNumber !== null) showPage(pageNumber);
  });
  document.getElementById("browse-jump-form").addEventListener("submit", function (event) {
    event.preventDefault();
    const input = document.getElementById("browse-page-number");
    const pageNumber = parsePageInput(input);
    if (pageNumber !== null) {
      updateIndexToPage(pageNumber);
      showPage(pageNumber, { scrollToViewer: true });
    }
  });
  previousButton.addEventListener("click", function () { if (activePageNumber > 1) showPage(activePageNumber - 1); });
  nextButton.addEventListener("click", function () { if (activePageNumber < TOTAL_PAGES) showPage(activePageNumber + 1); });
  indexPreviousButton.addEventListener("click", function () {
    indexStart = Math.max(1, indexStart - INDEX_PAGE_SIZE);
    renderPageIndex();
  });
  indexNextButton.addEventListener("click", function () {
    indexStart = Math.min(Math.floor((TOTAL_PAGES - 1) / INDEX_PAGE_SIZE) * INDEX_PAGE_SIZE + 1, indexStart + INDEX_PAGE_SIZE);
    renderPageIndex();
  });
  exportButton.addEventListener("click", exportCurrentPreview);
  fullscreenButton.addEventListener("click", async function () {
    try {
      if (document.fullscreenElement) await document.exitFullscreen();
      else await document.getElementById("page-stage-shell").requestFullscreen();
    } catch (_error) {
      announce("Fullscreen viewing is not available in this browser.");
    }
  });
  document.getElementById("nav-toggle").addEventListener("click", toggleNavigation);
  document.querySelectorAll("#primary-nav a").forEach(function (link) {
    link.addEventListener("click", function () {
      document.getElementById("primary-nav").classList.remove("is-open");
      document.getElementById("nav-toggle").setAttribute("aria-expanded", "false");
      document.getElementById("nav-toggle").setAttribute("aria-label", "Open navigation");
    });
  });
  document.addEventListener("keydown", function (event) {
    if (event.altKey || event.ctrlKey || event.metaKey) return;
    const tag = document.activeElement && document.activeElement.tagName;
    if (tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT") return;
    if (event.key === "ArrowLeft" && activePageNumber > 1) showPage(activePageNumber - 1);
    if (event.key === "ArrowRight" && activePageNumber < TOTAL_PAGES) showPage(activePageNumber + 1);
    if (event.key === "Escape" && document.fullscreenElement) document.exitFullscreen().catch(function () {});
  });
  window.addEventListener("pagehide", function () {
    if (activeRenderTask && typeof activeRenderTask.cancel === "function") {
      try { activeRenderTask.cancel(); } catch (_error) { /* no-op */ }
    }
    if (activeDocument && typeof activeDocument.destroy === "function") activeDocument.destroy();
  });
}

setupEvents();
setupRevealMotion();
renderPageIndex();
showPage(1);
