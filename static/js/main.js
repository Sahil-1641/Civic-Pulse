/**
 * CivicPulse - Interactive Application Controller
 * Inspired by Ledgion Design with 3D Tilt, Real-Time Upvoting, Leaflet Map & Character Glow
 */

document.addEventListener('DOMContentLoaded', () => {
  initThemeToggle();
  init3DPerspectiveTilt();
  initInteractiveMap();
  initAnimatedCounters();
  initTypewriterHero();
  initUpvoteButtons();
  initReportModal();
  initCharacterRibbonGlow();
  initDockActions();
});

/* ==========================================================================
   1. Dark / Light Theme Toggle with LocalStorage
   ========================================================================== */
function initThemeToggle() {
  const themeToggleBtn = document.getElementById('theme-toggle-btn');
  const htmlRoot = document.documentElement;
  
  // Default to dark theme as requested
  const savedTheme = localStorage.getItem('civicpulse-theme') || 'dark';
  htmlRoot.setAttribute('data-theme', savedTheme);
  updateToggleIcon(savedTheme);

  if (themeToggleBtn) {
    themeToggleBtn.addEventListener('click', () => {
      const currentTheme = htmlRoot.getAttribute('data-theme');
      const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
      htmlRoot.setAttribute('data-theme', newTheme);
      localStorage.setItem('civicpulse-theme', newTheme);
      updateToggleIcon(newTheme);
      
      // Update map tiles if map exists
      if (window.civicMapTileLayer) {
        updateMapTiles(newTheme);
      }
    });
  }
}

function updateToggleIcon(theme) {
  const themeIcon = document.getElementById('theme-icon');
  if (themeIcon) {
    themeIcon.className = theme === 'dark' ? 'fas fa-moon' : 'fas fa-sun';
  }
}

/* ==========================================================================
   2. 3D Perspective Tilt on Mouse Move (Ledgion Signature)
   ========================================================================== */
function init3DPerspectiveTilt() {
  const container = document.querySelector('.perspective-container');
  const windowEl = document.querySelector('.deck-showcase-window');

  if (!container || !windowEl) return;

  container.addEventListener('mousemove', (e) => {
    const rect = container.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    
    // Subtle, high-end 3D rotation
    const rotateX = ((y - centerY) / centerY) * -5;
    const rotateY = ((x - centerX) / centerX) * 7;
    
    windowEl.style.transform = `rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-4px)`;
  });

  container.addEventListener('mouseleave', () => {
    windowEl.style.transform = 'rotateY(-4deg) rotateX(3deg)';
  });
}

/* ==========================================================================
   3. Interactive Leaflet Map with Custom Status Markers & Theme Switching
   ========================================================================== */
let civicMapInstance = null;
let currentTileLayer = null;

function initInteractiveMap() {
  const mapElement = document.getElementById('map-container');
  if (!mapElement) return;

  // Center on coordinates
  const defaultLat = 28.6139;
  const defaultLng = 77.2090;

  civicMapInstance = L.map('map-container', {
    center: [defaultLat, defaultLng],
    zoom: 12,
    scrollWheelZoom: false,
  });

  const currentTheme = document.documentElement.getAttribute('data-theme') || 'dark';
  updateMapTiles(currentTheme);

  // Load Issues from JSON Embedded in Template
  if (window.civicMapData && Array.isArray(window.civicMapData)) {
    renderMapMarkers(window.civicMapData);
  }
}

function updateMapTiles(theme) {
  if (currentTileLayer && civicMapInstance) {
    civicMapInstance.removeLayer(currentTileLayer);
  }

  // Dark or Light carto tiles
  const tileUrl = theme === 'dark' 
    ? 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png'
    : 'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png';

  currentTileLayer = L.tileLayer(tileUrl, {
    attribution: '&copy; <a href="https://carto.com/">CARTO</a> &copy; OpenStreetMap',
    maxZoom: 19
  }).addTo(civicMapInstance);

  window.civicMapTileLayer = currentTileLayer;
}

function renderMapMarkers(issues) {
  if (!civicMapInstance) return;

  issues.forEach(issue => {
    const statusIconMap = {
      'reported': 'fa-flag',
      'acknowledged': 'fa-eye',
      'in_progress': 'fa-tools',
      'resolved': 'fa-check'
    };

    const iconHtml = `
      <div class="custom-pin pin-${issue.status}">
        <i class="fas ${statusIconMap[issue.status] || 'fa-map-pin'}"></i>
      </div>
    `;

    const customIcon = L.divIcon({
      className: 'leaflet-custom-marker',
      html: iconHtml,
      iconSize: [32, 32],
      iconAnchor: [16, 32],
      popupAnchor: [0, -32]
    });

    const popupContent = `
      <div style="font-family: 'Plus Jakarta Sans', sans-serif; min-width: 220px; color: #0f172a; padding: 4px;">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px;">
          <span style="font-size: 11px; font-weight: 800; color: #7c3aed;">${issue.ticket_id}</span>
          <span style="font-size: 10px; font-weight: 700; text-transform: uppercase; padding: 2px 8px; border-radius: 99px; background: rgba(124, 58, 237, 0.15); color: #7c3aed;">${issue.status_display}</span>
        </div>
        <h4 style="font-size: 14px; font-weight: 700; margin-bottom: 4px; line-height: 1.3;">${issue.title}</h4>
        <p style="font-size: 12px; color: #64748b; margin-bottom: 8px;"><i class="fas fa-map-marker-alt" style="color:#7c3aed; margin-right: 4px;"></i>${issue.address}</p>
        <div style="display: flex; justify-content: space-between; align-items: center; border-top: 1px solid #e2e8f0; padding-top: 6px; font-size: 12px;">
          <span style="font-weight: 700; color: #7c3aed;"><i class="fas fa-thumbs-up"></i> ${issue.upvotes} Citizens</span>
          <span style="color: #94a3b8; font-size: 11px;">${issue.created_at}</span>
        </div>
      </div>
    `;

    L.marker([issue.lat, issue.lng], { icon: customIcon })
      .addTo(civicMapInstance)
      .bindPopup(popupContent);
  });
}

/* ==========================================================================
   4. Animated Stat Counters
   ========================================================================== */
function initAnimatedCounters() {
  const counterElements = document.querySelectorAll('[data-counter-target]');
  
  const observer = new IntersectionObserver((entries, obs) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const el = entry.target;
        const target = parseInt(el.getAttribute('data-counter-target'), 10) || 0;
        animateNumber(el, 0, target, 1800);
        obs.unobserve(el);
      }
    });
  }, { threshold: 0.3 });

  counterElements.forEach(el => observer.observe(el));
}

function animateNumber(element, start, end, duration) {
  let startTime = null;

  function step(timestamp) {
    if (!startTime) startTime = timestamp;
    const progress = Math.min((timestamp - startTime) / duration, 1);
    const easeProgress = easeOutQuad(progress);
    element.textContent = Math.floor(easeProgress * (end - start) + start);
    if (progress < 1) {
      window.requestAnimationFrame(step);
    } else {
      element.textContent = end;
    }
  }

  window.requestAnimationFrame(step);
}

function easeOutQuad(x) {
  return 1 - (1 - x) * (1 - x);
}

/* ==========================================================================
   5. Dynamic Typewriter Effect in Hero (Ledgion Style)
   ========================================================================== */
function initTypewriterHero() {
  const tickerEl = document.getElementById('hero-typewriter-text');
  if (!tickerEl) return;

  const phrases = [
    "Broken Roads & Potholes",
    "Water Logging & Floods",
    "Non-Functional Streetlights",
    "Overflowing Garbage Dumps",
    "Hazardous Open Drains"
  ];

  let phraseIndex = 0;
  let charIndex = 0;
  let isDeleting = false;
  let typingSpeed = 90;

  function type() {
    const currentPhrase = phrases[phraseIndex];

    if (isDeleting) {
      tickerEl.textContent = currentPhrase.substring(0, charIndex - 1);
      charIndex--;
      typingSpeed = 45;
    } else {
      tickerEl.textContent = currentPhrase.substring(0, charIndex + 1);
      charIndex++;
      typingSpeed = 90;
    }

    if (!isDeleting && charIndex === currentPhrase.length) {
      isDeleting = true;
      typingSpeed = 1800; // Pause at end of word
    } else if (isDeleting && charIndex === 0) {
      isDeleting = false;
      phraseIndex = (phraseIndex + 1) % phrases.length;
      typingSpeed = 400;
    }

    setTimeout(type, typingSpeed);
  }

  type();
}

/* ==========================================================================
   6. Live Asynchronous Upvoting with Micro-Jump Animation
   ========================================================================== */
function initUpvoteButtons() {
  document.querySelectorAll('.upvote-btn').forEach(btn => {
    btn.addEventListener('click', async (e) => {
      e.preventDefault();
      const issueId = btn.getAttribute('data-issue-id');
      const countSpan = btn.querySelector('.upvote-count');
      const icon = btn.querySelector('i');

      try {
        const response = await fetch(`/api/upvote/${issueId}/`, {
          method: 'POST',
          headers: {
            'X-Requested-With': 'XMLHttpRequest'
          }
        });

        const data = await response.json();
        if (data.status === 'success') {
          btn.classList.add('upvoted');
          if (countSpan) {
            countSpan.textContent = data.upvotes;
          }
          if (icon) {
            icon.classList.remove('far');
            icon.classList.add('fas');
          }
          // Micro vibration effect
          btn.style.transform = 'scale(1.25)';
          setTimeout(() => {
            btn.style.transform = 'scale(1)';
          }, 250);
        }
      } catch (err) {
        console.error('Error upvoting:', err);
      }
    });
  });
}

/* ==========================================================================
   7. Quick Issue Report Modal & GPS Auto-Detection
   ========================================================================== */
function initReportModal() {
  const modalOverlay = document.getElementById('report-modal-overlay');
  const openButtons = document.querySelectorAll('.open-report-modal-btn');
  const closeButtons = document.querySelectorAll('.close-report-modal-btn');
  const gpsDetectBtn = document.getElementById('gps-detect-btn');
  const latInput = document.getElementById('report-lat');
  const lngInput = document.getElementById('report-lng');
  const addressInput = document.getElementById('report-address');
  const reportForm = document.getElementById('quick-report-form');

  // Open modal
  openButtons.forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      if (modalOverlay) modalOverlay.classList.add('active');
    });
  });

  // Close modal
  closeButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      if (modalOverlay) modalOverlay.classList.remove('active');
    });
  });

  if (modalOverlay) {
    modalOverlay.addEventListener('click', (e) => {
      if (e.target === modalOverlay) modalOverlay.classList.remove('active');
    });
  }

  // HTML5 GPS Geolocation
  if (gpsDetectBtn) {
    gpsDetectBtn.addEventListener('click', () => {
      if (navigator.geolocation) {
        gpsDetectBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Detecting GPS...';
        navigator.geolocation.getCurrentPosition(
          (position) => {
            const lat = position.coords.latitude.toFixed(5);
            const lng = position.coords.longitude.toFixed(5);
            if (latInput) latInput.value = lat;
            if (lngInput) lngInput.value = lng;
            if (addressInput && !addressInput.value) {
              addressInput.value = `Near GPS (${lat}, ${lng})`;
            }
            gpsDetectBtn.innerHTML = '<i class="fas fa-check-circle" style="color:#10b981;"></i> Location Locked!';
          },
          (error) => {
            // Fallback for simulation / permissions denied
            const mockLat = 28.6139 + (Math.random() - 0.5) * 0.05;
            const mockLng = 77.2090 + (Math.random() - 0.5) * 0.05;
            if (latInput) latInput.value = mockLat.toFixed(5);
            if (lngInput) lngInput.value = mockLng.toFixed(5);
            if (addressInput && !addressInput.value) {
              addressInput.value = 'Sector 18, Central City Zone';
            }
            gpsDetectBtn.innerHTML = '<i class="fas fa-satellite"></i> GPS Simulated';
          },
          { timeout: 8000 }
        );
      }
    });
  }

  // AJAX Submission for Instant Feedback
  if (reportForm) {
    reportForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const submitBtn = reportForm.querySelector('button[type="submit"]');
      const originalText = submitBtn.innerHTML;
      submitBtn.disabled = true;
      submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Publishing to Dispatch...';

      const formData = new FormData(reportForm);

      try {
        const response = await fetch('/report/', {
          method: 'POST',
          body: formData,
          headers: {
            'X-Requested-With': 'XMLHttpRequest'
          }
        });

        const result = await response.json();
        if (result.status === 'success') {
          showNotificationToast(`🎉 Ticket #${result.ticket_id} submitted successfully!`);
          if (modalOverlay) modalOverlay.classList.remove('active');
          reportForm.reset();
          setTimeout(() => {
            window.location.reload();
          }, 1200);
        } else {
          alert('Submission error: ' + (result.message || 'Please check all required fields.'));
        }
      } catch (err) {
        // Normal form fallback submission
        reportForm.submit();
      } finally {
        submitBtn.disabled = false;
        submitBtn.innerHTML = originalText;
      }
    });
  }
}

/* ==========================================================================
   8. USER SPECIAL REQUEST:
   Interactive "CIVICPULSE" Character Ribbon Wave & Glow
   ========================================================================== */
function initCharacterRibbonGlow() {
  const charBoxes = document.querySelectorAll('.char-box');
  if (!charBoxes.length) return;

  charBoxes.forEach((box, index) => {
    // Mouse hover wave: gently elevate adjacent sibling characters
    box.addEventListener('mouseenter', () => {
      if (index > 0) {
        charBoxes[index - 1].style.transform = 'translateY(-6px) scale(1.06)';
        charBoxes[index - 1].style.borderColor = 'rgba(168, 85, 247, 0.4)';
      }
      if (index < charBoxes.length - 1) {
        charBoxes[index + 1].style.transform = 'translateY(-6px) scale(1.06)';
        charBoxes[index + 1].style.borderColor = 'rgba(168, 85, 247, 0.4)';
      }
    });

    box.addEventListener('mouseleave', () => {
      if (index > 0) {
        charBoxes[index - 1].style.transform = '';
        charBoxes[index - 1].style.borderColor = '';
      }
      if (index < charBoxes.length - 1) {
        charBoxes[index + 1].style.transform = '';
        charBoxes[index + 1].style.borderColor = '';
      }
    });
  });
}

/* ==========================================================================
   9. macOS Dock Navigation Actions
   ========================================================================== */
function initDockActions() {
  const dockButtons = document.querySelectorAll('.dock-btn');
  dockButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      dockButtons.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      const targetAction = btn.getAttribute('data-dock-action');
      if (targetAction === 'map') {
        document.getElementById('map')?.scrollIntoView({ behavior: 'smooth' });
      } else if (targetAction === 'feed') {
        document.getElementById('feed')?.scrollIntoView({ behavior: 'smooth' });
      } else if (targetAction === 'report') {
        document.getElementById('report-modal-overlay')?.classList.add('active');
      } else if (targetAction === 'overview') {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    });
  });
}

/* ==========================================================================
   10. Toast Notification System
   ========================================================================== */
function showNotificationToast(message) {
  const toast = document.createElement('div');
  toast.className = 'civic-toast';
  toast.innerHTML = `
    <div style="
      position: fixed;
      bottom: 24px;
      right: 24px;
      background: rgba(15, 13, 25, 0.95);
      backdrop-filter: blur(16px);
      border: 1px solid #a855f7;
      box-shadow: 0 0 25px rgba(168, 85, 247, 0.5);
      color: #fff;
      padding: 14px 22px;
      border-radius: 99px;
      font-size: 14px;
      font-weight: 700;
      z-index: 300;
      display: flex;
      align-items: center;
      gap: 10px;
      animation: slideUpToast 0.4s cubic-bezier(0.16, 1, 0.3, 1);
    ">
      <i class="fas fa-check-circle" style="color: #34d399; font-size: 16px;"></i>
      <span>${message}</span>
    </div>
  `;
  document.body.appendChild(toast);

  setTimeout(() => {
    toast.remove();
  }, 4000);
}
