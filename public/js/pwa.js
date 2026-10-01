/* ================= PWA CONTROLLER & MOBILE INSTALLATION ================= */
(function() {
  let deferredPrompt = null;
  const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
  const isStandalone = window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone === true;

  // Add standalone class if running as installed PWA
  if (isStandalone) {
    document.documentElement.classList.add('is-pwa-standalone');
  }

  // 1. Register Service Worker
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      navigator.serviceWorker.register('/sw.js', { scope: '/' })
        .then((registration) => {
          console.log('[PWA] Service Worker registered with scope:', registration.scope);

          // Check for service worker updates
          registration.addEventListener('updatefound', () => {
            const newWorker = registration.installing;
            if (!newWorker) return;
            newWorker.addEventListener('statechange', () => {
              if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                showUpdateBanner(registration);
              }
            });
          });
        })
        .catch((error) => {
          console.error('[PWA] Service Worker registration failed:', error);
        });
    });

    let refreshing = false;
    navigator.serviceWorker.addEventListener('controllerchange', () => {
      if (!refreshing) {
        refreshing = true;
        window.location.reload();
      }
    });
  }

  // 2. Capture 'beforeinstallprompt' for Android/Chrome/Edge
  window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    deferredPrompt = e;
    console.log('[PWA] Captured beforeinstallprompt event');
    updateInstallButtonVisibility(true);
  });

  window.addEventListener('appinstalled', () => {
    console.log('[PWA] App successfully installed');
    deferredPrompt = null;
    updateInstallButtonVisibility(false);
    showPwaToast('SkillSphere installed successfully! Enjoy your mobile app.', 'success');
  });

  // 3. Online / Offline Monitoring
  function updateOnlineStatus() {
    if (navigator.onLine) {
      document.body.classList.remove('is-offline');
      showPwaToast('Back Online — All features connected', 'online', 3000);
    } else {
      document.body.classList.add('is-offline');
      showPwaToast('Offline Mode — Cached data is accessible', 'offline', 5000);
    }
  }
  window.addEventListener('online', updateOnlineStatus);
  window.addEventListener('offline', updateOnlineStatus);

  // 4. Update banner
  function showUpdateBanner(registration) {
    let banner = document.getElementById('pwa-update-banner');
    if (!banner) {
      banner = document.createElement('div');
      banner.id = 'pwa-update-banner';
      banner.className = 'pwa-notification-banner';
      banner.innerHTML = `
        <div class="pwa-banner-content">
          <span>✨ New version available!</span>
          <button id="pwa-update-btn" class="btn small">Update</button>
        </div>
      `;
      document.body.appendChild(banner);
      document.getElementById('pwa-update-btn').onclick = () => {
        if (registration.waiting) {
          registration.waiting.postMessage({ type: 'SKIP_WAITING' });
        }
      };
    }
  }

  // 5. Toast notification
  function showPwaToast(msg, type = 'info', duration = 3500) {
    let toast = document.getElementById('pwa-toast');
    if (!toast) {
      toast = document.createElement('div');
      toast.id = 'pwa-toast';
      document.body.appendChild(toast);
    }
    toast.className = `pwa-toast toast-${type} show`;
    toast.innerHTML = `<span class="toast-dot"></span><span>${msg}</span>`;

    if (window._pwaToastTimer) clearTimeout(window._pwaToastTimer);
    if (duration > 0) {
      window._pwaToastTimer = setTimeout(() => {
        toast.classList.remove('show');
      }, duration);
    }
  }

  // 6. Trigger App Installation
  async function promptInstall() {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const choiceResult = await deferredPrompt.userChoice;
      console.log('[PWA] User choice:', choiceResult.outcome);
      if (choiceResult.outcome === 'accepted') {
        deferredPrompt = null;
        updateInstallButtonVisibility(false);
      }
    } else if (isIOS && !isStandalone) {
      showIOSInstallModal();
    } else {
      // General instructions modal
      showGenericInstallModal();
    }
  }

  // 7. iOS Install Guide Modal
  function showIOSInstallModal() {
    let modal = document.getElementById('pwa-ios-modal');
    if (!modal) {
      modal = document.createElement('div');
      modal.id = 'pwa-ios-modal';
      modal.className = 'pwa-modal-backdrop';
      modal.innerHTML = `
        <div class="pwa-modal-card">
          <div class="pwa-modal-header">
            <div class="pwa-brand-icon">${ICONS ? ICONS.logomark : ''}</div>
            <div class="pwa-modal-title">
              <h3>Install SkillSphere</h3>
              <p>Add to your iPhone / iPad Home Screen</p>
            </div>
            <button class="pwa-modal-close" onclick="window.closePwaModal('pwa-ios-modal')">×</button>
          </div>
          <div class="pwa-steps">
            <div class="pwa-step">
              <div class="pwa-step-num">1</div>
              <div class="pwa-step-desc">
                Tap the <strong>Share</strong> button <span class="ios-icon-share">⎋</span> in Safari's toolbar.
              </div>
            </div>
            <div class="pwa-step">
              <div class="pwa-step-num">2</div>
              <div class="pwa-step-desc">
                Scroll down and select <strong>"Add to Home Screen"</strong> <span class="ios-icon-add">⊞</span>.
              </div>
            </div>
            <div class="pwa-step">
              <div class="pwa-step-num">3</div>
              <div class="pwa-step-desc">
                Tap <strong>"Add"</strong> in the top-right corner to install!
              </div>
            </div>
          </div>
          <button class="btn block" onclick="window.closePwaModal('pwa-ios-modal')">Got it</button>
        </div>
      `;
      document.body.appendChild(modal);
    }
    modal.classList.add('open');
  }

  function showGenericInstallModal() {
    let modal = document.getElementById('pwa-generic-modal');
    if (!modal) {
      modal = document.createElement('div');
      modal.id = 'pwa-generic-modal';
      modal.className = 'pwa-modal-backdrop';
      modal.innerHTML = `
        <div class="pwa-modal-card">
          <div class="pwa-modal-header">
            <div class="pwa-brand-icon">${ICONS ? ICONS.logomark : ''}</div>
            <div class="pwa-modal-title">
              <h3>Install SkillSphere</h3>
              <p>Install as a native application</p>
            </div>
            <button class="pwa-modal-close" onclick="window.closePwaModal('pwa-generic-modal')">×</button>
          </div>
          <div class="pwa-steps">
            <div class="pwa-step">
              <div class="pwa-step-num">📱</div>
              <div class="pwa-step-desc">
                On Chrome/Android: Tap the three dots <strong>⋮</strong> in the address bar and select <strong>"Install app"</strong> or <strong>"Add to Home screen"</strong>.
              </div>
            </div>
            <div class="pwa-step">
              <div class="pwa-step-num">💻</div>
              <div class="pwa-step-desc">
                On Desktop Chrome/Edge: Click the <strong>Install</strong> icon in the address bar to install standalone app.
              </div>
            </div>
          </div>
          <button class="btn block" onclick="window.closePwaModal('pwa-generic-modal')">Close</button>
        </div>
      `;
      document.body.appendChild(modal);
    }
    modal.classList.add('open');
  }

  window.closePwaModal = function(id) {
    const el = document.getElementById(id);
    if (el) el.classList.remove('open');
  };

  function updateInstallButtonVisibility(available) {
    const buttons = document.querySelectorAll('.pwa-install-trigger');
    buttons.forEach(btn => {
      if (isStandalone) {
        btn.style.display = 'none';
      } else {
        btn.style.display = available || isIOS ? 'inline-flex' : 'none';
      }
    });
  }

  // Handle URL shortcut query params on load (e.g., ?view=matches)
  function handleUrlShortcuts() {
    const urlParams = new URLSearchParams(window.location.search);
    const requestedView = urlParams.get('view');
    if (requestedView && typeof window.setView === 'function' && window.state && window.state.profile) {
      window.setView(requestedView);
    }
  }

  // Expose global methods
  window.PWA = {
    promptInstall,
    isStandalone,
    isIOS,
    showIOSInstallModal,
    updateInstallButtonVisibility
  };

  // Re-check buttons after DOM updates
  document.addEventListener('DOMContentLoaded', () => {
    handleUrlShortcuts();
    setTimeout(() => {
      updateInstallButtonVisibility(Boolean(deferredPrompt || isIOS));
    }, 400);
  });

})();
