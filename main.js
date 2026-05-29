/* =========================================================
   Mario Salvador Camacho — Personal Website
   main.js — Shared polish behaviors across all pages
   ---------------------------------------------------------
   Includes:
   1. Smooth page transitions (fade-out on internal navigation)
   2. Magnetic cursor on primary buttons
   3. Scroll progress indicator (top bar)
   4. Scroll-aware header (border on scroll)
   ========================================================= */

(function() {
  'use strict';

  /* =========================================================
     1. PAGE TRANSITIONS
     ========================================================= */
  // When user clicks an internal link, fade the page out before
  // navigating. The pageEnter animation on body handles fade-in.
  document.addEventListener('DOMContentLoaded', () => {

    const isInternal = (url) => {
      if (!url) return false;
      if (url.startsWith('#')) return false; // anchor only
      if (url.startsWith('mailto:')) return false;
      if (url.startsWith('tel:')) return false;
      try {
        const parsed = new URL(url, window.location.href);
        return parsed.origin === window.location.origin;
      } catch (e) {
        return false;
      }
    };

    document.addEventListener('click', (e) => {
      const link = e.target.closest('a');
      if (!link) return;

      const href = link.getAttribute('href');
      if (!href) return;

      // Skip externals, downloads, new-tab links, modifier keys
      if (link.hasAttribute('download')) return;
      if (link.getAttribute('target') === '_blank') return;
      if (e.metaKey || e.ctrlKey || e.shiftKey) return;
      if (!isInternal(href)) return;
      if (href.startsWith('#')) return;

      // Skip if it points to the same page (no real navigation)
      const currentPath = window.location.pathname.split('/').pop() || 'index.html';
      const targetPath = href.split('#')[0].split('?')[0];
      if (targetPath === '' || targetPath === currentPath) return;

      e.preventDefault();
      document.body.classList.add('is-leaving');
      setTimeout(() => {
        window.location.href = href;
      }, 320);
    });
  });

  /* =========================================================
     2. MAGNETIC BUTTONS
     ========================================================= */
  // Subtle attraction effect: button (and arrow inside) follow the
  // cursor when it gets close. Disabled on touch and reduced-motion.
  const supportsHover = window.matchMedia('(hover: hover)').matches;
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  if (supportsHover && !reducedMotion) {
    document.addEventListener('DOMContentLoaded', () => {

      const magnetize = (el, strength = 0.25) => {
        const arrow = el.querySelector('.arrow');

        el.addEventListener('mousemove', (e) => {
          const rect = el.getBoundingClientRect();
          const x = e.clientX - rect.left - rect.width / 2;
          const y = e.clientY - rect.top - rect.height / 2;
          el.style.transform = `translate(${x * strength}px, ${y * strength}px)`;
          if (arrow) {
            arrow.style.transform = `translate(${x * strength * 1.4}px, ${y * strength * 1.4}px)`;
          }
        });

        el.addEventListener('mouseleave', () => {
          el.style.transform = '';
          if (arrow) arrow.style.transform = '';
        });
      };

      // Apply to primary buttons (most impactful)
      document.querySelectorAll('.btn-primary, .btn-secondary').forEach(btn => {
        magnetize(btn, 0.2);
      });

      // Lighter effect on email-link in CTAs
      document.querySelectorAll('.email-link').forEach(link => {
        magnetize(link, 0.12);
      });
    });
  }

  /* =========================================================
     3. SCROLL PROGRESS BAR
     ========================================================= */
  document.addEventListener('DOMContentLoaded', () => {
    const bar = document.createElement('div');
    bar.className = 'scroll-progress';
    bar.setAttribute('aria-hidden', 'true');
    document.body.appendChild(bar);

    let ticking = false;
    const updateProgress = () => {
      const scrollTop = window.scrollY;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      const progress = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
      bar.style.transform = `scaleX(${progress / 100})`;
      ticking = false;
    };

    window.addEventListener('scroll', () => {
      if (!ticking) {
        window.requestAnimationFrame(updateProgress);
        ticking = true;
      }
    }, { passive: true });

    updateProgress();
  });

})();
