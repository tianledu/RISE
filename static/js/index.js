window.HELP_IMPROVE_VIDEOJS = false;

function copyBibTeX() {
  const bibtexElement = document.getElementById('bibtex-code');
  const button = document.querySelector('.copy-bibtex-btn');
  const copyText = button?.querySelector('.copy-text');

  if (!bibtexElement || !button || !copyText) return;

  const showCopiedState = () => {
    button.classList.add('copied');
    copyText.textContent = 'Copied';
    window.setTimeout(() => {
      button.classList.remove('copied');
      copyText.textContent = 'Copy';
    }, 2000);
  };

  const fallbackCopy = () => {
    const textArea = document.createElement('textarea');
    textArea.value = bibtexElement.textContent;
    textArea.setAttribute('readonly', '');
    textArea.style.position = 'fixed';
    textArea.style.opacity = '0';
    document.body.appendChild(textArea);
    textArea.select();
    document.execCommand('copy');
    document.body.removeChild(textArea);
    showCopiedState();
  };

  if (navigator.clipboard && window.isSecureContext) {
    navigator.clipboard.writeText(bibtexElement.textContent).then(showCopiedState).catch(fallbackCopy);
  } else {
    fallbackCopy();
  }
}

function scrollToTop() {
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

window.addEventListener('scroll', () => {
  const scrollButton = document.querySelector('.scroll-to-top');
  if (!scrollButton) return;
  scrollButton.classList.toggle('visible', window.scrollY > 300);
}, { passive: true });

document.addEventListener('DOMContentLoaded', () => {
  const carouselOptions = {
    slidesToScroll: 1,
    slidesToShow: 1,
    breakpoints: [
      { changePoint: 480, slidesToShow: 1, slidesToScroll: 1 },
      { changePoint: 640, slidesToShow: 1, slidesToScroll: 1 },
      { changePoint: 768, slidesToShow: 1, slidesToScroll: 1 }
    ],
    loop: true,
    infinite: true,
    autoplay: false
  };

  if (window.bulmaCarousel) {
    window.bulmaCarousel.attach('.carousel', carouselOptions);
  }

  if (window.bulmaSlider) {
    window.bulmaSlider.attach();
  }
});
