document.getElementById('year').textContent = new Date().getFullYear();

const cursorGlow = document.querySelector('.cursor-glow');
window.addEventListener('pointermove', (event) => {
  if (!cursorGlow || window.matchMedia('(max-width: 800px)').matches) return;
  cursorGlow.style.opacity = '1';
  cursorGlow.style.transform = `translate(${event.clientX}px, ${event.clientY}px) translate(-50%, -50%)`;
});

// O monograma Turing reage ao cursor e se abre em partículas na primeira rolagem.
const hero = document.querySelector('.hero');
const heroArt = document.querySelector('.hero-art');
const field = document.querySelector('.turing-field');
const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

if (hero && heroArt && field && !reduceMotion.matches) {
  const context = field.getContext('2d');
  const pointer = { x: -9999, y: -9999 };
  const particles = [];
  let width = 0;
  let height = 0;
  let progress = 0;
  let frame;
  let rendering = false;
  let outlineCount = 0;

  const random = (seed) => {
    const value = Math.sin(seed * 999.91) * 43758.5453;
    return value - Math.floor(value);
  };

  const resizeField = () => {
    const rect = field.getBoundingClientRect();
    const ratio = Math.min(window.devicePixelRatio || 1, 2);
    width = Math.max(1, rect.width);
    height = Math.max(1, rect.height);
    field.width = Math.round(width * ratio);
    field.height = Math.round(height * ratio);
    context.setTransform(ratio, 0, 0, ratio, 0, 0);

    const amount = window.matchMedia('(max-width: 800px)').matches ? 82 : 184;
    outlineCount = Math.round(amount * 0.54);
    particles.length = 0;
    for (let index = 0; index < amount; index += 1) {
      const seed = index + 1;
      const outline = index < outlineCount;
      particles.push({ seed, outline, x: width / 2, y: height / 2, vx: 0, vy: 0, size: outline ? 1.75 + random(seed * 3) * 3.3 : 1.2 + random(seed * 3) * 3.25 });
    }
  };

  const markShape = () => {
    const barHeight = height * 0.12;
    return {
      left: width * 0.14,
      right: width * 0.86,
      top: height * 0.17,
      barHeight,
      stemX: width * 0.5,
      stemWidth: width * 0.14,
      stemTop: height * 0.17 + barHeight * 0.36,
      stemHeight: height * 0.45,
    };
  };

  const outlineTarget = (index) => {
    const shape = markShape();
    const barTop = shape.top - shape.barHeight / 2;
    const barBottom = shape.top + shape.barHeight / 2;
    const stemLeft = shape.stemX - shape.stemWidth / 2;
    const stemRight = shape.stemX + shape.stemWidth / 2;
    const stemBottom = shape.stemTop + shape.stemHeight;
    const corners = [[shape.left, barTop], [shape.right, barTop], [shape.right, barBottom], [stemRight, barBottom], [stemRight, stemBottom], [stemLeft, stemBottom], [stemLeft, barBottom], [shape.left, barBottom], [shape.left, barTop]];
    const lengths = corners.slice(1).map((point, pointIndex) => Math.hypot(point[0] - corners[pointIndex][0], point[1] - corners[pointIndex][1]));
    const target = (index / Math.max(1, outlineCount - 1)) * lengths.reduce((sum, length) => sum + length, 0);
    let travelled = 0;

    for (let pointIndex = 0; pointIndex < lengths.length; pointIndex += 1) {
      const length = lengths[pointIndex];
      if (target <= travelled + length || pointIndex === lengths.length - 1) {
        const amount = (target - travelled) / length;
        return {
          x: corners[pointIndex][0] + (corners[pointIndex + 1][0] - corners[pointIndex][0]) * amount,
          y: corners[pointIndex][1] + (corners[pointIndex + 1][1] - corners[pointIndex][1]) * amount,
        };
      }
      travelled += length;
    }
    return { x: shape.left, y: barTop };
  };

  const markTarget = (particle, index) => {
    if (particle.outline) return outlineTarget(index);
    const shape = markShape();
    const fillIndex = index - outlineCount;
    const fillCount = particles.length - outlineCount;
    const rowCount = fillCount * 0.6;
    const row = fillIndex < rowCount;
    const offset = row ? fillIndex / Math.max(1, rowCount - 1) : (fillIndex - rowCount) / Math.max(1, fillCount - rowCount - 1);
    return row
      ? { x: shape.left + (shape.right - shape.left) * offset, y: shape.top + (random(particle.seed * 7) - 0.5) * shape.barHeight }
      : { x: shape.stemX + (random(particle.seed * 7) - 0.5) * shape.stemWidth, y: shape.stemTop + shape.stemHeight * offset };
  };

  const expandedTarget = (particle) => {
    const angle = random(particle.seed * 11) * Math.PI * 2;
    const radius = 0.23 + random(particle.seed * 13) * 0.56;
    return {
      x: width * 0.5 + Math.cos(angle) * width * radius,
      y: height * 0.48 + Math.sin(angle) * height * radius * 0.74,
    };
  };

  const setProgress = () => {
    const range = Math.max(hero.offsetHeight * 0.9, 1);
    progress = Math.max(0, Math.min(1, (window.scrollY - hero.offsetTop + 35) / range));
    hero.classList.toggle('is-unfolding', progress > 0.16);
  };

  const draw = () => {
    context.clearRect(0, 0, width, height);
    const open = Math.min(1, Math.max(0, (progress - 0.08) / 0.7));

    particles.forEach((particle, index) => {
      const mark = markTarget(particle, index);
      const expanded = expandedTarget(particle);
      const targetX = mark.x + (expanded.x - mark.x) * open;
      const targetY = mark.y + (expanded.y - mark.y) * open;
      const dx = particle.x - pointer.x;
      const dy = particle.y - pointer.y;
      const distance = Math.hypot(dx, dy) || 1;
      const influence = Math.max(0, 1 - distance / 145);
      const repel = influence * influence * 2.9;

      particle.vx += (targetX - particle.x) * 0.022 + (dx / distance) * repel;
      particle.vy += (targetY - particle.y) * 0.022 + (dy / distance) * repel;
      particle.vx *= 0.84;
      particle.vy *= 0.84;
      particle.x += particle.vx;
      particle.y += particle.vy;

      const alpha = particle.outline ? 0.54 + random(particle.seed * 17) * 0.28 : 0.2 + random(particle.seed * 17) * 0.58;
      context.beginPath();
      context.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
      context.fillStyle = particle.outline ? `rgba(5, 12, 53, ${alpha})` : `rgba(14, 185, 213, ${alpha})`;
      context.fill();
    });
    if (open < 0.8 && particles.length - outlineCount > 2) {
      context.lineWidth = 0.65;
      for (let index = outlineCount; index < particles.length - 1; index += 5) {
        const start = particles[index];
        const end = particles[index + 1];
        context.beginPath();
        context.moveTo(start.x, start.y);
        context.lineTo(end.x, end.y);
        context.strokeStyle = `rgba(32, 204, 230, ${(1 - open) * 0.19})`;
        context.stroke();
      }
    }
    if (rendering) frame = window.requestAnimationFrame(draw);
  };

  const startRendering = () => {
    if (rendering) return;
    rendering = true;
    draw();
  };

  const stopRendering = () => {
    rendering = false;
    window.cancelAnimationFrame(frame);
  };

  heroArt.addEventListener('pointermove', (event) => {
    const rect = field.getBoundingClientRect();
    pointer.x = event.clientX - rect.left;
    pointer.y = event.clientY - rect.top;
  });
  heroArt.addEventListener('pointerleave', () => { pointer.x = -9999; pointer.y = -9999; });
  window.addEventListener('scroll', setProgress, { passive: true });
  window.addEventListener('resize', resizeField, { passive: true });
  resizeField();
  setProgress();
  new IntersectionObserver((entries) => {
    if (entries[0]?.isIntersecting) startRendering();
    else stopRendering();
  }, { rootMargin: '250px 0px' }).observe(hero);
  window.addEventListener('pagehide', stopRendering, { once: true });
}

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
