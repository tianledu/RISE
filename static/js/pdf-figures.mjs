import * as pdfjsLib from './vendor/pdfjs/pdf.min.mjs';

pdfjsLib.GlobalWorkerOptions.workerSrc = new URL(
  './vendor/pdfjs/pdf.worker.min.mjs',
  import.meta.url
).href;

const figureStates = new WeakMap();

async function renderPdfFigure(container) {
  const cssWidth = Math.round(container.getBoundingClientRect().width);
  if (cssWidth < 32) return;

  let state = figureStates.get(container);
  if (!state) {
    state = {
      documentPromise: pdfjsLib.getDocument({
        url: container.dataset.pdfSrc,
        useWasm: false
      }).promise,
      lastWidth: 0,
      renderTask: null
    };
    figureStates.set(container, state);
  }

  if (Math.abs(state.lastWidth - cssWidth) < 24 && container.classList.contains('is-rendered')) {
    return;
  }

  if (state.renderTask) {
    state.renderTask.cancel();
  }

  try {
    const pdf = await state.documentPromise;
    const page = await pdf.getPage(1);
    const baseViewport = page.getViewport({ scale: 1 });
    const outputScale = Math.min(window.devicePixelRatio || 1, 2);
    const renderScale = (cssWidth / baseViewport.width) * outputScale;
    const viewport = page.getViewport({ scale: renderScale });
    const canvas = container.querySelector('.pdf-figure-canvas');
    const context = canvas.getContext('2d', { alpha: false });

    canvas.width = Math.ceil(viewport.width);
    canvas.height = Math.ceil(viewport.height);
    canvas.style.width = `${Math.ceil(viewport.width / outputScale)}px`;
    canvas.style.height = `${Math.ceil(viewport.height / outputScale)}px`;
    container.style.aspectRatio = `${baseViewport.width} / ${baseViewport.height}`;

    state.renderTask = page.render({
      canvasContext: context,
      viewport,
      background: 'rgb(255, 255, 255)'
    });
    await state.renderTask.promise;
    state.lastWidth = cssWidth;
    state.renderTask = null;
    container.classList.remove('has-error');
    container.classList.add('is-rendered');
  } catch (error) {
    if (error?.name === 'RenderingCancelledException') return;
    const loadingLabel = container.querySelector('.pdf-loading');
    if (loadingLabel) loadingLabel.textContent = 'Unable to render figure. Open the original PDF.';
    container.classList.add('has-error');
    console.error(`Failed to render ${container.dataset.pdfSrc}:`, error);
  }
}

const figures = Array.from(document.querySelectorAll('[data-pdf-src]'));
const visibilityObserver = new IntersectionObserver((entries, observer) => {
  entries.forEach((entry) => {
    if (!entry.isIntersecting) return;
    renderPdfFigure(entry.target);
    observer.unobserve(entry.target);
  });
}, { rootMargin: '500px 0px' });

figures.forEach((figure) => visibilityObserver.observe(figure));

let resizeTimer;
const resizeObserver = new ResizeObserver((entries) => {
  window.clearTimeout(resizeTimer);
  resizeTimer = window.setTimeout(() => {
    entries.forEach((entry) => {
      if (entry.target.classList.contains('is-rendered')) {
        renderPdfFigure(entry.target);
      }
    });
  }, 180);
});

figures.forEach((figure) => resizeObserver.observe(figure));
