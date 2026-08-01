/* ==========================================================================
   Deepesh Kumar Singh — Portfolio interactions
   ========================================================================== */

document.getElementById('year').textContent = new Date().getFullYear();

/* ---------------- Nav: scroll shadow + mobile toggle ---------------- */
const nav = document.getElementById('nav');
const navToggle = document.getElementById('navToggle');
const mobileMenu = document.getElementById('mobileMenu');

window.addEventListener('scroll', () => {
  nav.style.borderBottomColor = window.scrollY > 20 ? 'rgba(158,170,219,0.28)' : 'rgba(158,170,219,0.14)';
}, { passive: true });

navToggle.addEventListener('click', () => {
  mobileMenu.classList.toggle('open');
  navToggle.classList.toggle('active');
});
mobileMenu.querySelectorAll('a').forEach(a => a.addEventListener('click', () => mobileMenu.classList.remove('open')));

/* ---------------- Scroll reveal ---------------- */
const revealEls = document.querySelectorAll('[data-reveal]');
const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('in-view');
      revealObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.12 });
revealEls.forEach(el => revealObserver.observe(el));

/* ---------------- Back to top ---------------- */
const backToTop = document.getElementById('backToTop');
window.addEventListener('scroll', () => {
  backToTop.classList.toggle('visible', window.scrollY > 600);
}, { passive: true });
backToTop.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));

/* ---------------- Contact form ---------------- */
const contactForm = document.getElementById('contactForm');
const formNote = document.getElementById('formNote');
contactForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  const name = document.getElementById('name').value.trim();
  const email = document.getElementById('email').value.trim();
  const message = document.getElementById('message').value.trim();

  if (!name || !email || !message) {
    formNote.textContent = 'Please fill in all fields before sending your message.';
    return;
  }

  formNote.textContent = 'Sending message...';

  try {
    const response = await fetch('/api/contact', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, message })
    });

    const data = await response.json();
    if (data.success) {
      formNote.textContent = `Thanks${name ? ', ' + name : ''} — your message has been sent successfully.`;
      contactForm.reset();
    } else {
      formNote.textContent = data.error || 'Unable to send message at this time. Please try again later.';
    }
  } catch (error) {
    formNote.textContent = 'Unable to send message at this time. Please try again later.';
  }
});

function githubFallback(img) {
  if (!img || img.dataset.fallbackApplied) return true;
  img.dataset.fallbackApplied = 'true';
  img.style.display = 'none';

  const fallback = document.createElement('div');
  fallback.className = 'github-fallback';
  const title = img.alt.includes('most used')
    ? 'Language stats unavailable right now'
    : 'GitHub activity stats unavailable right now';
  const text = img.alt.includes('most used')
    ? 'This language chart could not load from the external GitHub stats service.'
    : 'This GitHub activity card could not load from the external service.';

  fallback.innerHTML = `
    <div class="github-fallback-title">${title}</div>
    <div class="github-fallback-text">${text} You can still visit my profile for the latest activity.</div>
    <a class="github-fallback-link" href="https://github.com/DEEPESH468" target="_blank" rel="noopener">View GitHub profile</a>
  `;

  img.parentElement.appendChild(fallback);
  return true;
}

/* ==========================================================================
   Signature element: SLAM-style feature-point node field
   Nodes drift and connect like matched feature points / a sparse point cloud —
   a nod to the SLAM & depth-estimation work this site is built to showcase.
   ========================================================================== */
(() => {
  const canvas = document.getElementById('nodeField');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  const heroSection = canvas.closest('.hero');
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  let w, h, nodes, dpr;
  const COLORS = ['#4f7cff', '#8b5cf6', '#22d3ee'];

  function resize() {
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    w = heroSection.offsetWidth;
    h = heroSection.offsetHeight;
    canvas.width = w * dpr;
    canvas.height = h * dpr;
    canvas.style.width = w + 'px';
    canvas.style.height = h + 'px';
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    initNodes();
  }

  function initNodes() {
    const density = w < 700 ? 60 : 110;
    const count = Math.round((w * h) / (1000 * (700 / density)));
    nodes = Array.from({ length: Math.min(count, 90) }, () => ({
      x: Math.random() * w,
      y: Math.random() * h,
      vx: (Math.random() - 0.5) * 0.18,
      vy: (Math.random() - 0.5) * 0.18,
      r: Math.random() * 1.4 + 0.6,
      color: COLORS[Math.floor(Math.random() * COLORS.length)]
    }));
  }

  const mouse = { x: null, y: null };
  heroSection.addEventListener('mousemove', (e) => {
    const rect = heroSection.getBoundingClientRect();
    mouse.x = e.clientX - rect.left;
    mouse.y = e.clientY - rect.top;
  });
  heroSection.addEventListener('mouseleave', () => { mouse.x = null; mouse.y = null; });

  const LINK_DIST = 130;

  function frame() {
    ctx.clearRect(0, 0, w, h);

    for (const n of nodes) {
      n.x += n.vx; n.y += n.vy;
      if (n.x < 0 || n.x > w) n.vx *= -1;
      if (n.y < 0 || n.y > h) n.vy *= -1;

      if (mouse.x !== null) {
        const dx = n.x - mouse.x, dy = n.y - mouse.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 140) {
          const force = (140 - dist) / 140 * 0.03;
          n.vx += (dx / dist) * force;
          n.vy += (dy / dist) * force;
        }
      }
      n.vx *= 0.995; n.vy *= 0.995;
    }

    for (let i = 0; i < nodes.length; i++) {
      for (let j = i + 1; j < nodes.length; j++) {
        const a = nodes[i], b = nodes[j];
        const dx = a.x - b.x, dy = a.y - b.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < LINK_DIST) {
          ctx.strokeStyle = `rgba(139,150,220,${(1 - dist / LINK_DIST) * 0.18})`;
          ctx.lineWidth = 0.6;
          ctx.beginPath();
          ctx.moveTo(a.x, a.y);
          ctx.lineTo(b.x, b.y);
          ctx.stroke();
        }
      }
    }

    for (const n of nodes) {
      ctx.beginPath();
      ctx.arc(n.x, n.y, n.r, 0, Math.PI * 2);
      ctx.fillStyle = n.color;
      ctx.globalAlpha = 0.75;
      ctx.fill();
      ctx.globalAlpha = 1;
    }

    if (!reduceMotion) requestAnimationFrame(frame);
  }

  resize();
  window.addEventListener('resize', resize);
  frame();
  if (reduceMotion) frame(); // draw a single static frame
})();