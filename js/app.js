/**
 * Abhinav Hospital - Main Application Logic & Interactivity
 * Kuchaman City, Rajasthan
 */

(function () {
  'use strict';

  // DOM Ready Bootstrap
  function startApp() {
    initNavigation();
    initModal();
    initFAQ();
    initDistancePlanner();
    initLiveStatus();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', startApp);
  } else {
    startApp();
  }

  // Mobile Menu & Header Scroll
  function initNavigation() {
    const menuToggle = document.getElementById('menuToggle');
    const navLinks = document.getElementById('navLinks');
    const header = document.querySelector('header');

    if (menuToggle && navLinks) {
      menuToggle.addEventListener('click', () => {
        const isOpen = navLinks.classList.toggle('open');
        menuToggle.setAttribute('aria-expanded', String(isOpen));
        menuToggle.textContent = isOpen ? '✕' : '☰';
      });

      // Close menu on link click
      navLinks.querySelectorAll('a').forEach(link => {
        link.addEventListener('click', () => {
          navLinks.classList.remove('open');
          menuToggle.setAttribute('aria-expanded', 'false');
          menuToggle.textContent = '☰';
        });
      });
    }

    // Header shadow on scroll
    window.addEventListener('scroll', () => {
      if (header) {
        header.classList.toggle('scrolled', window.scrollY > 40);
      }
    });

    // Set Copyright Year
    const yearEl = document.getElementById('current-year');
    if (yearEl) {
      yearEl.textContent = new Date().getFullYear();
    }
  }

  // Appointment Modal & WhatsApp Integration
  function initModal() {
    const modal = document.getElementById('appointmentModal');
    const openBtns = document.querySelectorAll('[data-open-modal]');
    const closeBtn = document.getElementById('closeModalBtn');
    const form = document.getElementById('appointmentForm');

    if (!modal) return;

    openBtns.forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        const dep = btn.dataset.department || 'pediatrics';
        const select = document.getElementById('formDepartment');
        if (select) select.value = dep;
        modal.classList.add('active');
        document.body.style.overflow = 'hidden';
      });
    });

    const closeModal = () => {
      modal.classList.remove('active');
      document.body.style.overflow = '';
    };

    if (closeBtn) closeBtn.addEventListener('click', closeModal);

    // Close when clicking outside modal window
    modal.addEventListener('click', (e) => {
      if (e.target === modal) closeModal();
    });

    // Handle Form Submit
    if (form) {
      form.addEventListener('submit', (e) => {
        e.preventDefault();

        const name = document.getElementById('patientName')?.value.trim() || '';
        const phone = document.getElementById('patientPhone')?.value.trim() || '';
        const dept = document.getElementById('formDepartment')?.value || 'General Consultation';
        const date = document.getElementById('appointmentDate')?.value || 'Earliest Available';
        const note = document.getElementById('patientNote')?.value.trim() || 'None';

        if (!name || !phone) {
          alert('Please enter patient name and contact number.');
          return;
        }

        // Compose WhatsApp message
        const messageText = `*Abhinav Hospital Appointment Request*%0A%0A` +
          `*Patient Name:* ${encodeURIComponent(name)}%0A` +
          `*Contact:* ${encodeURIComponent(phone)}%0A` +
          `*Department:* ${encodeURIComponent(dept)}%0A` +
          `*Preferred Date:* ${encodeURIComponent(date)}%0A` +
          `*Note / Concern:* ${encodeURIComponent(note)}%0A%0A` +
          `_Sent from Abhinav Hospital Official Website (Kuchaman City)_`;

        const whatsappUrl = `https://wa.me/919166263755?text=${messageText}`;

        // Feedback alert
        alert(`Thank you ${name}! You are now being connected to Abhinav Hospital reception via WhatsApp for instant appointment confirmation.`);
        window.open(whatsappUrl, '_blank');

        closeModal();
        form.reset();
      });
    }
  }

  // FAQ Accordion
  function initFAQ() {
    const faqItems = document.querySelectorAll('.faq-item');
    faqItems.forEach(item => {
      const question = item.querySelector('.faq-question');
      if (question) {
        question.addEventListener('click', () => {
          const isActive = item.classList.contains('active');
          // Close other items
          faqItems.forEach(i => i.classList.remove('active'));
          if (!isActive) {
            item.classList.add('active');
          }
        });
      }
    });
  }

  // Distance Calculator & Route Planner
  function initDistancePlanner() {
    const routeBtns = document.querySelectorAll('[data-route-from]');
    const resultBox = document.getElementById('route-result-text');

    const ROUTE_DATA = {
      busstand: {
        from: 'Kuchaman Central Bus Stand / Chungi Naka',
        dist: '1.2 km',
        time: '3 - 4 mins via Budsu Road',
        directions: 'Head southwest towards Budsu Road past the Old Power House. Abhinav Hospital is prominently located on the main road with dedicated ambulance access.'
      },
      railway: {
        from: 'Kuchaman City Railway Station (KMNC)',
        dist: '3.4 km',
        time: '8 - 10 mins',
        directions: 'Take Station Road towards Kuchaman Town, take the bypass link to Budsu Road. Direct auto-rickshaws and cabs are readily available 24/7.'
      },
      didwana: {
        from: 'Mega Highway / Didwana-Kuchaman Junction',
        dist: '4.8 km',
        time: '10 - 12 mins',
        directions: 'Follow the state corridor straight onto Budsu Road. Hospital entry features wide ambulance bays and ample parking.'
      }
    };

    routeBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        routeBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');

        const key = btn.dataset.routeFrom;
        const data = ROUTE_DATA[key];
        if (data && resultBox) {
          resultBox.innerHTML = `<strong>From ${data.from}:</strong> Distance is approx <strong>${data.dist}</strong> (${data.time}). ${data.directions}`;
        }
      });
    });
  }

  // Live Hospital Status (Open 24/7 ticker)
  function initLiveStatus() {
    const statusPill = document.getElementById('liveStatusTicker');
    if (statusPill) {
      const now = new Date();
      const options = { weekday: 'short', hour: '2-digit', minute: '2-digit' };
      const timeStr = now.toLocaleTimeString([], options);
      statusPill.title = `Live status as of ${timeStr}`;
    }
  }

})();
