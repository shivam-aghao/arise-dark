document.addEventListener('DOMContentLoaded', () => {
  // =========================================================================
  // 1. HIGH-PERFORMANCE CONSTELLATION & STARFIELD CANVAS
  // =========================================================================
  const canvas = document.getElementById('particles-canvas');
  if (canvas) {
    const ctx = canvas.getContext('2d');
    let width, height;
    let particles = [];
    const maxParticles = window.innerWidth < 768 ? 35 : 75;
    const maxDistance = 120;
    
    let mouse = {
      x: null,
      y: null,
      radius: 140
    };

    function resize() {
      width = canvas.width = canvas.parentElement.offsetWidth || window.innerWidth;
      height = canvas.height = canvas.parentElement.offsetHeight || window.innerHeight;
    }

    window.addEventListener('resize', resize);
    resize();

    window.addEventListener('mousemove', (e) => {
      const rect = canvas.getBoundingClientRect();
      if (
        e.clientX >= rect.left &&
        e.clientX <= rect.right &&
        e.clientY >= rect.top &&
        e.clientY <= rect.bottom
      ) {
        mouse.x = e.clientX - rect.left;
        mouse.y = e.clientY - rect.top;
      } else {
        mouse.x = null;
        mouse.y = null;
      }
    });

    window.addEventListener('mouseleave', () => {
      mouse.x = null;
      mouse.y = null;
    });

    class StarParticle {
      constructor() {
        this.x = Math.random() * width;
        this.y = Math.random() * height;
        this.radius = Math.random() * 1.8 + 0.6;
        this.vx = (Math.random() - 0.5) * 0.45;
        this.vy = (Math.random() - 0.5) * 0.45;
        this.alpha = Math.random() * 0.6 + 0.2;
        this.pulseSpeed = Math.random() * 0.02 + 0.008;
        this.color = Math.random() > 0.4 ? '168, 85, 247' : '56, 189, 248';
      }

      update() {
        this.x += this.vx;
        this.y += this.vy;

        if (this.x < 0 || this.x > width) this.vx *= -1;
        if (this.y < 0 || this.y > height) this.vy *= -1;

        // Subtle twinkling pulse
        this.alpha += this.pulseSpeed;
        if (this.alpha > 0.85 || this.alpha < 0.2) {
          this.pulseSpeed = -this.pulseSpeed;
        }

        // Mouse interaction
        if (mouse.x !== null && mouse.y !== null) {
          const dx = mouse.x - this.x;
          const dy = mouse.y - this.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < mouse.radius) {
            const force = (mouse.radius - dist) / mouse.radius;
            this.x -= (dx / dist) * force * 1.5;
            this.y -= (dy / dist) * force * 1.5;
          }
        }
      }

      draw() {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${this.color}, ${this.alpha})`;
        ctx.shadowBlur = 8;
        ctx.shadowColor = `rgba(${this.color}, 0.5)`;
        ctx.fill();
        ctx.shadowBlur = 0;
      }
    }

    // Initialize particles
    for (let i = 0; i < maxParticles; i++) {
      particles.push(new StarParticle());
    }

    function animate() {
      ctx.clearRect(0, 0, width, height);

      // Connect particles with constellation lines
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < maxDistance) {
            const lineAlpha = (1 - dist / maxDistance) * 0.18;
            ctx.beginPath();
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.strokeStyle = `rgba(168, 85, 247, ${lineAlpha})`;
            ctx.lineWidth = 0.8;
            ctx.stroke();
          }
        }

        // Connect to mouse cursor
        if (mouse.x !== null && mouse.y !== null) {
          const mdx = particles[i].x - mouse.x;
          const mdy = particles[i].y - mouse.y;
          const mdist = Math.sqrt(mdx * mdx + mdy * mdy);
          if (mdist < mouse.radius) {
            const mAlpha = (1 - mdist / mouse.radius) * 0.28;
            ctx.beginPath();
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(mouse.x, mouse.y);
            ctx.strokeStyle = `rgba(56, 189, 248, ${mAlpha})`;
            ctx.lineWidth = 1;
            ctx.stroke();
          }
        }

        particles[i].update();
        particles[i].draw();
      }

      requestAnimationFrame(animate);
    }

    animate();
  }

  // =========================================================================
  // 2. SPOTLIGHT MOUSE-GLOW CARDS
  // =========================================================================
  const spotlightCards = document.querySelectorAll('.spotlight-card');
  spotlightCards.forEach((card) => {
    card.addEventListener('mousemove', (e) => {
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      card.style.setProperty('--mouse-x', `${x}px`);
      card.style.setProperty('--mouse-y', `${y}px`);
    });
  });

  // =========================================================================
  // 3. FLOATING NAVBAR DOCK & SCROLLSPY
  // =========================================================================
  const navbar = document.getElementById('navbar');
  const navLinks = document.querySelectorAll('.nav-link');
  const sections = document.querySelectorAll('section[id]');

  window.addEventListener('scroll', () => {
    const scrollY = window.scrollY;

    // Navbar scrolled styles
    if (navbar) {
      if (scrollY > 50) {
        navbar.classList.add('navbar-dock', 'py-3');
        navbar.classList.remove('py-5');
      } else {
        navbar.classList.remove('navbar-dock');
        navbar.classList.add('py-5');
      }
    }

    // ScrollSpy active state
    let currentSection = '';
    sections.forEach((section) => {
      const sectionTop = section.offsetTop - 120;
      const sectionHeight = section.offsetHeight;
      if (scrollY >= sectionTop && scrollY < sectionTop + sectionHeight) {
        currentSection = section.getAttribute('id');
      }
    });

    navLinks.forEach((link) => {
      link.classList.remove('text-purple-400', 'font-bold');
      if (link.getAttribute('href') === `#${currentSection}`) {
        link.classList.add('text-purple-400', 'font-bold');
      }
    });
  });

  // =========================================================================
  // 4. MOBILE MENU DRAWER
  // =========================================================================
  const hamburger = document.getElementById('hamburger');
  const mobileMenu = document.getElementById('mobile-menu');
  const closeMenu = document.getElementById('close-menu');
  const mobileLinks = document.querySelectorAll('#mobile-menu a');

  function openMobileMenu() {
    if (!mobileMenu) return;
    mobileMenu.classList.remove('-translate-y-full', 'opacity-0', 'pointer-events-none');
    mobileMenu.classList.add('translate-y-0', 'opacity-100', 'pointer-events-auto');
    document.body.style.overflow = 'hidden';
  }

  function closeMobileMenu() {
    if (!mobileMenu) return;
    mobileMenu.classList.add('-translate-y-full', 'opacity-0', 'pointer-events-none');
    mobileMenu.classList.remove('translate-y-0', 'opacity-100', 'pointer-events-auto');
    document.body.style.overflow = '';
  }

  if (hamburger) hamburger.addEventListener('click', openMobileMenu);
  if (closeMenu) closeMenu.addEventListener('click', closeMobileMenu);
  mobileLinks.forEach((link) => link.addEventListener('click', closeMobileMenu));

  // =========================================================================
  // 5. SMOOTH SCROLL FOR ANCHORS
  // =========================================================================
  document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
    anchor.addEventListener('click', function (e) {
      const targetId = this.getAttribute('href');
      if (targetId === '#' || targetId === '') return;
      const targetEl = document.querySelector(targetId);
      if (targetEl) {
        e.preventDefault();
        const headerOffset = 80;
        const elementPosition = targetEl.getBoundingClientRect().top;
        const offsetPosition = elementPosition + window.pageYOffset - headerOffset;
        window.scrollTo({
          top: offsetPosition,
          behavior: 'smooth'
        });
      }
    });
  });

  // =========================================================================
  // 6. INTERACTIVE TAB FILTERS (EVENTS / PROJECTS)
  // =========================================================================
  const eventTabBtns = document.querySelectorAll('.event-tab-btn');
  const eventCards = document.querySelectorAll('.event-card-item');

  if (eventTabBtns.length > 0) {
    eventTabBtns.forEach((btn) => {
      btn.addEventListener('click', () => {
        eventTabBtns.forEach((b) => b.classList.remove('active'));
        btn.classList.add('active');

        const filter = btn.getAttribute('data-filter');
        eventCards.forEach((card) => {
          if (filter === 'all' || card.getAttribute('data-category') === filter) {
            card.style.display = 'block';
            setTimeout(() => {
              card.style.opacity = '1';
              card.style.transform = 'translateY(0)';
            }, 50);
          } else {
            card.style.opacity = '0';
            card.style.transform = 'translateY(10px)';
            setTimeout(() => {
              card.style.display = 'none';
            }, 200);
          }
        });
      });
    });
  }

  // =========================================================================
  // 7. CONTACT FORM SUBMISSION SIMULATION
  // =========================================================================
  const contactForm = document.getElementById('contact-form');
  const formSuccess = document.getElementById('form-success');

  if (contactForm) {
    contactForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const submitBtn = contactForm.querySelector('button[type="submit"]');
      const originalText = submitBtn.innerHTML;

      submitBtn.innerHTML = `<i class="fas fa-spinner fa-spin mr-2"></i> Sending...`;
      submitBtn.disabled = true;

      setTimeout(() => {
        submitBtn.innerHTML = `<i class="fas fa-check mr-2"></i> Sent Successfully!`;
        submitBtn.classList.remove('btn-primary');
        submitBtn.classList.add('bg-green-600', 'text-white');

        if (formSuccess) {
          formSuccess.classList.remove('hidden');
        }

        contactForm.reset();

        setTimeout(() => {
          submitBtn.innerHTML = originalText;
          submitBtn.disabled = false;
          submitBtn.classList.remove('bg-green-600');
          submitBtn.classList.add('btn-primary');
          if (formSuccess) {
            formSuccess.classList.add('hidden');
          }
        }, 4000);
      }, 1000);
    });
  }
});