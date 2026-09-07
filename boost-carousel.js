const boostCarousel = document.querySelector('[data-boost-carousel]');

if (boostCarousel) {
  const track = boostCarousel.querySelector('.boost-carousel-track');
  const slides = Array.from(boostCarousel.querySelectorAll('.boost-slide'));
  const dots = Array.from(boostCarousel.querySelectorAll('.boost-carousel-dots button'));
  const previous = boostCarousel.querySelector('[data-boost-prev]');
  const next = boostCarousel.querySelector('[data-boost-next]');
  const current = boostCarousel.querySelector('[data-boost-current]');
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  let active = 0;
  let timer;

  const show = (index) => {
    active = (index + slides.length) % slides.length;
    track.style.transform = `translateX(-${active * 100}%)`;
    slides.forEach((slide, slideIndex) => slide.setAttribute('aria-hidden', String(slideIndex !== active)));
    dots.forEach((dot, dotIndex) => {
      const selected = dotIndex === active;
      dot.classList.toggle('is-active', selected);
      dot.setAttribute('aria-current', String(selected));
    });
    current.textContent = String(active + 1).padStart(2, '0');
  };

  const stop = () => clearInterval(timer);
  const start = () => {
    if (!reduceMotion) {
      stop();
      timer = setInterval(() => show(active + 1), 6000);
    }
  };

  previous.addEventListener('click', () => { show(active - 1); start(); });
  next.addEventListener('click', () => { show(active + 1); start(); });
  dots.forEach((dot, index) => dot.addEventListener('click', () => { show(index); start(); }));
  boostCarousel.addEventListener('mouseenter', stop);
  boostCarousel.addEventListener('mouseleave', start);
  boostCarousel.addEventListener('focusin', stop);
  boostCarousel.addEventListener('focusout', start);
  start();
}
