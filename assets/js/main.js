/* ===================================================
   SỮAHẠT DANA - Main JavaScript
   Handles: GSAP animations, Lenis scroll, Particles, Cursor, Navbar
   hnguyenworks.id.vn
   =================================================== */

document.addEventListener('DOMContentLoaded', () => {

  // =================== LOADING SCREEN ===================
  const loadingScreen = document.getElementById('loading-screen');
  if (loadingScreen) {
    setTimeout(() => {
      loadingScreen.classList.add('hidden');
      document.body.style.overflow = '';
      initHeroAnimations();
    }, 1900);
    document.body.style.overflow = 'hidden';
  } else {
    initHeroAnimations();
  }

  // =================== CUSTOM CURSOR ===================
  const cursor = document.getElementById('cursor');
  const cursorTrail = document.getElementById('cursor-trail');
  if (cursor && cursorTrail && window.innerWidth > 768) {
    let mouseX = 0, mouseY = 0;
    let trailX = 0, trailY = 0;

    document.addEventListener('mousemove', (e) => {
      mouseX = e.clientX; mouseY = e.clientY;
    });

    function renderCursor() {
      // Cursor chính đi theo tức thì
      cursor.style.left = mouseX + 'px';
      cursor.style.top  = mouseY + 'px';
      
      // Cursor đuôi dùng thuật toán Lerp để theo sau mượt mà
      trailX += (mouseX - trailX) * 0.15;
      trailY += (mouseY - trailY) * 0.15;
      cursorTrail.style.left = trailX + 'px';
      cursorTrail.style.top  = trailY + 'px';
      
      requestAnimationFrame(renderCursor);
    }
    requestAnimationFrame(renderCursor);

    document.querySelectorAll('a, button, .btn, .product-card, .blog-card, .add-btn, [data-cursor-hover]').forEach(el => {
      el.addEventListener('mouseenter', () => document.body.classList.add('cursor-hover'));
      el.addEventListener('mouseleave', () => document.body.classList.remove('cursor-hover'));
    });
  }

  // =================== SMOOTH SCROLL (Lenis) ===================
  // ĐÃ TẮT: Theo phản hồi người dùng, thư viện JS smooth scroll tạo cảm giác delay/lag khi lăn chuột.
  // Trình duyệt sẽ dùng lại cuộn tự nhiên truyền thống (Native Scroll) để hoàn toàn không bị trễ.
  /*
  let lenis;
  if (typeof Lenis !== 'undefined') {
    lenis = new Lenis({ 
      lerp: 0.12,
      smoothWheel: true, 
      syncTouch: true 
    });
    
    if (typeof gsap !== 'undefined') {
      gsap.ticker.add((time) => { lenis.raf(time * 1000) });
      gsap.ticker.lagSmoothing(0);
    } else {
      function rafLoop(time) { lenis.raf(time); requestAnimationFrame(rafLoop); }
      requestAnimationFrame(rafLoop);
    }
  }
  */

  // =================== NAVBAR ===================
  const navbar = document.querySelector('.navbar');
  if (navbar) {
    window.addEventListener('scroll', () => {
      navbar.classList.toggle('scrolled', window.scrollY > 60);
    }, { passive: true });
  }

  // =================== MOBILE MENU ===================
  const hamburger = document.querySelector('.hamburger');
  const mobileMenu = document.querySelector('.mobile-menu');
  const mobileOverlay = document.querySelector('.mobile-menu-overlay');
  if (hamburger && mobileMenu) {
    hamburger.addEventListener('click', () => {
      hamburger.classList.toggle('open');
      mobileMenu.classList.toggle('open');
      mobileOverlay?.classList.toggle('show');
    });
    mobileOverlay?.addEventListener('click', () => {
      hamburger.classList.remove('open');
      mobileMenu.classList.remove('open');
      mobileOverlay.classList.remove('show');
    });
  }

  // =================== HERO ANIMATIONS (GSAP) ===================
  function initHeroAnimations() {
    if (typeof gsap === 'undefined') return;

    // Register plugins
    if (gsap.registerPlugin && typeof ScrollTrigger !== 'undefined') {
      gsap.registerPlugin(ScrollTrigger);
    }

    const heroLabel = document.querySelector('.hero-label');
    const heroWords = document.querySelectorAll('.hero-title .word');
    const heroSub   = document.querySelector('.hero-subtitle');
    const heroActs  = document.querySelector('.hero-actions');
    const heroImg   = document.querySelector('.hero-image');
    const scrollInd = document.querySelector('.hero-scroll-indicator');

    const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });

    if (heroLabel) tl.to(heroLabel, { opacity: 1, y: 0, duration: 0.7 }, 0.1);
    if (heroWords.length) {
      tl.to(heroWords, { opacity: 1, y: 0, duration: 0.9, stagger: 0.08 }, 0.3);
    }
    if (heroSub)   tl.to(heroSub,   { opacity: 1, y: 0, duration: 0.7 }, 0.8);
    if (heroActs)  tl.to(heroActs,  { opacity: 1, y: 0, duration: 0.7 }, 1.0);
    if (heroImg)   tl.to(heroImg,   { opacity: 1, x: 0, duration: 1.0 }, 0.5);
    if (scrollInd) tl.to(scrollInd, { opacity: 1, duration: 0.7 }, 1.4);

    // Hero parallax on scroll
    const heroBg = document.querySelector('.hero-bg');
    if (heroBg && typeof ScrollTrigger !== 'undefined') {
      gsap.to(heroBg, {
        yPercent: 35,
        ease: 'none',
        scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true }
      });
    }

    // Section reveals via ScrollTrigger
    document.querySelectorAll('[data-gsap="fade-up"]').forEach(el => {
      gsap.from(el, {
        opacity: 0, y: 50, duration: 0.85, ease: 'power3.out',
        scrollTrigger: { trigger: el, start: 'top 88%', end: 'bottom 20%', once: true }
      });
    });
  }

  // =================== SCROLL REVEAL (IntersectionObserver) ===================
  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('revealed');
        revealObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -60px 0px' });

  document.querySelectorAll('[data-reveal], [data-stagger]').forEach(el => {
    revealObserver.observe(el);
  });

  // =================== ANIMATED COUNTERS ===================
  function animateCounter(el) {
    const target = parseInt(el.getAttribute('data-count'));
    const suffix = el.getAttribute('data-suffix') || '';
    const duration = 2000;
    const start = performance.now();
    const startVal = 0;

    function update(now) {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      const ease = 1 - Math.pow(1 - progress, 3); // easeOutCubic
      const val = Math.floor(startVal + (target - startVal) * ease);
      el.textContent = val.toLocaleString('vi-VN') + suffix;
      if (progress < 1) requestAnimationFrame(update);
      else el.closest('.stat-item')?.style.setProperty('animation', 'countPop 0.4s ease');
    }
    requestAnimationFrame(update);
  }

  const counterObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        animateCounter(entry.target);
        counterObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.5 });

  document.querySelectorAll('[data-count]').forEach(el => counterObserver.observe(el));

  // =================== 3D TILT EFFECT ===================
  document.querySelectorAll('.tilt-card').forEach(card => {
    card.addEventListener('mousemove', (e) => {
      const r = card.getBoundingClientRect();
      const x = (e.clientX - r.left - r.width  / 2) / (r.width  / 2);
      const y = (e.clientY - r.top  - r.height / 2) / (r.height / 2);
      card.style.transform = `perspective(1000px) rotateY(${x * 7}deg) rotateX(${-y * 7}deg) scale(1.02)`;
    });
    card.addEventListener('mouseleave', () => {
      card.style.transform = 'perspective(1000px) rotateY(0) rotateX(0) scale(1)';
    });
  });

  // =================== MAGNETIC BUTTON EFFECT ===================
  document.querySelectorAll('.btn-magnetic').forEach(wrap => {
    const btn = wrap.querySelector('.btn') || wrap;
    wrap.addEventListener('mousemove', (e) => {
      const r = wrap.getBoundingClientRect();
      const x = (e.clientX - r.left - r.width  / 2) * 0.35;
      const y = (e.clientY - r.top  - r.height / 2) * 0.35;
      btn.style.transform = `translate(${x}px, ${y}px)`;
    });
    wrap.addEventListener('mouseleave', () => {
      btn.style.transform = '';
    });
  });

  // =================== RIPPLE EFFECT ===================
  document.querySelectorAll('.btn, .add-btn').forEach(btn => {
    btn.addEventListener('click', function(e) {
      const ripple = document.createElement('span');
      ripple.classList.add('ripple-effect');
      const r = this.getBoundingClientRect();
      ripple.style.left = (e.clientX - r.left) + 'px';
      ripple.style.top  = (e.clientY - r.top)  + 'px';
      this.style.position = 'relative';
      this.style.overflow = 'hidden';
      this.appendChild(ripple);
      setTimeout(() => ripple.remove(), 700);
    });
  });

  // =================== HERO PARTICLE CANVAS ===================
  const canvas = document.getElementById('hero-canvas');
  if (canvas) {
    const ctx = canvas.getContext('2d');
    let particles = [];
    let animFrame;

    function resizeCanvas() {
      canvas.width  = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
    }

    class Particle {
      constructor() { this.reset(); }
      reset() {
        this.x  = Math.random() * canvas.width;
        this.y  = Math.random() * canvas.height;
        this.vx = (Math.random() - 0.5) * 0.4;
        this.vy = (Math.random() - 0.5) * 0.3 - 0.2;
        this.r  = Math.random() * 5 + 2;
        this.opacity = Math.random() * 0.5 + 0.1;
        this.life = 0;
        this.maxLife = Math.random() * 200 + 100;
        // Color: alternates between sage and brown tones
        const pallete = ['107,143,113', '139,94,60', '168,197,175', '196,154,108'];
        this.color = pallete[Math.floor(Math.random() * pallete.length)];
      }
      update() {
        this.x += this.vx;
        this.y += this.vy;
        this.life++;
        if (this.life > this.maxLife || this.y < -20 || this.x < -20 || this.x > canvas.width + 20)
          this.reset();
      }
      draw() {
        const progress = this.life / this.maxLife;
        const alpha = this.opacity * (1 - Math.pow(progress, 2));
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${this.color},${alpha})`;
        ctx.fill();
      }
    }

    function initParticles() {
      particles = Array.from({ length: 55 }, () => new Particle());
    }
    function loop() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      particles.forEach(p => { p.update(); p.draw(); });
      animFrame = requestAnimationFrame(loop);
    }

    resizeCanvas();
    initParticles();
    loop();
    const ro = new ResizeObserver(() => { resizeCanvas(); initParticles(); });
    ro.observe(canvas.parentElement || document.body);
  }

  // =================== ACCORDION ===================
  document.querySelectorAll('.accordion-header').forEach(header => {
    header.addEventListener('click', () => {
      const item = header.parentElement;
      const body = item.querySelector('.accordion-body');
      const inner = body?.querySelector('.accordion-body-inner');
      const isOpen = item.classList.contains('open');

      // Close all
      document.querySelectorAll('.accordion-item.open').forEach(o => {
        o.classList.remove('open');
        const b = o.querySelector('.accordion-body');
        if (b) b.style.maxHeight = '0';
      });

      if (!isOpen && body && inner) {
        item.classList.add('open');
        body.style.maxHeight = inner.scrollHeight + 'px';
      }
    });
  });

  // =================== FILTER TABS ===================
  document.querySelectorAll('.filter-tab').forEach(tab => {
    tab.addEventListener('click', () => {
      document.querySelectorAll('.filter-tab').forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      const filter = tab.getAttribute('data-filter');
      document.querySelectorAll('[data-category]').forEach(card => {
        if (filter === 'all' || card.getAttribute('data-category') === filter) {
          card.style.display = '';
          card.style.animation = 'scaleIn 0.4s ease forwards';
        } else {
          card.style.display = 'none';
        }
      });
    });
  });

  // =================== TABS (Account page) ===================
  document.querySelectorAll('.tab-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const target = btn.getAttribute('data-tab');
      document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
      document.querySelectorAll('.tab-pane').forEach(p => p.classList.remove('active'));
      btn.classList.add('active');
      document.getElementById(target)?.classList.add('active');
    });
  });

  // =================== TOAST UTILITY ===================
  window.showToast = function(msg, icon = '✅', duration = 3000) {
    const container = document.querySelector('.toast-container') || (() => {
      const d = document.createElement('div');
      d.className = 'toast-container';
      document.body.appendChild(d);
      return d;
    })();
    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.innerHTML = `<span class="toast-icon">${icon}</span><span class="toast-text">${msg}</span>`;
    container.appendChild(toast);
    setTimeout(() => {
      toast.classList.add('removing');
      setTimeout(() => toast.remove(), 350);
    }, duration);
  };

  // =================== IMAGE LAZY LOAD ===================
  const lazyObs = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const img = entry.target;
        if (img.dataset.src) { img.src = img.dataset.src; img.removeAttribute('data-src'); }
        lazyObs.unobserve(img);
      }
    });
  }, { rootMargin: '200px' });
  document.querySelectorAll('img[data-src]').forEach(img => lazyObs.observe(img));

  // =================== ACTIVE NAV LINK ===================
  const currentPath = window.location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('.nav-links a').forEach(a => {
    if (a.getAttribute('href') === currentPath) a.classList.add('active');
  });

});
