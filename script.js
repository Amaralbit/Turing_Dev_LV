document.getElementById('year').textContent = new Date().getFullYear();

const cursorGlow = document.querySelector('.cursor-glow');
window.addEventListener('pointermove', (event) => {
  if (!cursorGlow || window.matchMedia('(max-width: 800px)').matches) return;
  cursorGlow.style.opacity = '1';
  cursorGlow.style.transform = `translate(${event.clientX}px, ${event.clientY}px) translate(-50%, -50%)`;
});

const header = document.querySelector('.site-header');
window.addEventListener('scroll', () => {
  header?.classList.toggle('scrolled', window.scrollY > 28);
}, { passive: true });

const observer = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) entry.target.classList.add('visible');
  });
}, { threshold: 0.12 });

document.querySelectorAll('.reveal').forEach((element, index) => {
  element.style.transitionDelay = `${Math.min(index % 4, 3) * 70}ms`;
  observer.observe(element);
});

const menuButton = document.querySelector('.menu-button');
menuButton?.addEventListener('click', () => {
  const open = menuButton.getAttribute('aria-expanded') === 'true';
  menuButton.setAttribute('aria-expanded', String(!open));
});

const megaCarousel = document.querySelector('[data-mega-carousel]');
if (megaCarousel && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
  const track = megaCarousel.querySelector('.mega-track');
  const slides = Array.from(megaCarousel.querySelectorAll('.mega-slide'));
  const dots = Array.from(megaCarousel.querySelectorAll('.mega-dots button'));
  let active = 0;
  let timer;
  const show = (index) => {
    active = (index + slides.length) % slides.length;
    track.style.transform = `translateX(-${active * 100}%)`;
    slides.forEach((slide, slideIndex) => slide.classList.toggle('is-active', slideIndex === active));
    dots.forEach((dot, dotIndex) => dot.classList.toggle('is-active', dotIndex === active));
  };
  const start = () => { clearInterval(timer); timer = setInterval(() => show(active + 1), 5000); };
  slides.forEach((slide, index) => slide.addEventListener('click', () => { show(index === active ? active + 1 : index); start(); }));
  dots.forEach((dot, index) => dot.addEventListener('click', () => { show(index); start(); }));
  megaCarousel.addEventListener('mouseenter', () => clearInterval(timer));
  megaCarousel.addEventListener('mouseleave', start);
  megaCarousel.addEventListener('focusin', () => clearInterval(timer));
  megaCarousel.addEventListener('focusout', start);
  start();
}
