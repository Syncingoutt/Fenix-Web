// UI event handlers (web version)

import { webAPI } from '../webAPI.js';
import { handleLogFileUpload } from '../webAPI.js';

let closeSettingsModal: () => void;

export function initUIEvents(
  settingsModalCloseFn: () => void
): void {
  closeSettingsModal = settingsModalCloseFn;
  
  let logHandle: FileSystemFileHandle | null = null;
  let logWatchInterval: number | null = null;
  let logWatchInFlight = false;
  const logWatchDelayMs = 10 * 1000;
  const setupGuideDismissedKey = 'fenix_setup_guide_dismissed';
  const inventoryCacheKey = 'fenix_inventory_cache';
  
  // CTA close handler (persist dismissal for this browser)
  const ctaBanner = document.getElementById('ctaBanner');
  const ctaCloseBtn = document.getElementById('ctaCloseBtn');
  if (ctaBanner) {
    const dismissed = localStorage.getItem('fenix_cta_dismissed') === 'true';
    if (!dismissed) {
      ctaBanner.classList.remove('is-hidden');
    }
  }
  if (ctaBanner && ctaCloseBtn) {
    ctaCloseBtn.addEventListener('click', () => {
      ctaBanner.classList.add('is-hidden');
      localStorage.setItem('fenix_cta_dismissed', 'true');
    });
  }

  // File upload button handler
  const uploadLogBtn = document.getElementById('uploadLogBtn') as HTMLButtonElement | null;
  if (uploadLogBtn) {
    const fileInput = document.createElement('input');
    fileInput.type = 'file';
    fileInput.accept = '.log';
    fileInput.style.display = 'none';
    document.body.appendChild(fileInput);

    uploadLogBtn.addEventListener('click', () => {
      fileInput.click();
    });

    fileInput.addEventListener('change', async (e) => {
      const target = e.target as HTMLInputElement;
      const file = target.files?.[0];
      
      if (!file) return;
      
      if (!file.name.toLowerCase().endsWith('.log')) {
        alert('Please select a .log file');
        return;
      }

      try {
        uploadLogBtn.disabled = true;
        const span = uploadLogBtn.querySelector('span');
        if (span) span.textContent = 'Uploading...';
        
        await handleLogFileUpload(file);
        closeSetupGuide(true);
        
        if (span) span.textContent = 'Upload Log';
        // Reload inventory will be triggered by webAPI
      } catch (error: any) {
        console.error('Failed to upload log file:', error);
        alert(`Failed to upload: ${error.message || 'Unknown error'}`);
      } finally {
        uploadLogBtn.disabled = false;
        target.value = '';
      }
    });
  }
  
  const watchLogBtn = document.getElementById('watchLogBtn') as HTMLButtonElement | null;
  if (watchLogBtn) {
    const updateWatchLabel = (watching: boolean): void => {
      const span = watchLogBtn.querySelector('span');
      if (span) {
        span.textContent = watching ? 'Stop Watch' : 'Watch Log';
      }
    };
    
    const stopWatching = (): void => {
      if (logWatchInterval !== null) {
        window.clearInterval(logWatchInterval);
        logWatchInterval = null;
      }
      updateWatchLabel(false);
    };
    
    watchLogBtn.addEventListener('click', async () => {
      const picker = (window as Window & { showOpenFilePicker?: Function }).showOpenFilePicker;
      if (!picker) {
        alert('Live log watch is only supported in Chromium-based browsers (Chrome/Edge).');
        return;
      }
      
      if (logWatchInterval !== null) {
        stopWatching();
        return;
      }
      
      try {
        const [handle] = await picker({
          types: [{ description: 'UE Log', accept: { 'text/plain': ['.log'] } }],
          multiple: false
        });
        logHandle = handle ?? null;
      } catch (error) {
        // User cancelled the picker or permission denied.
        return;
      }
      
      if (!logHandle) {
        return;
      }
      
      updateWatchLabel(true);
      markSetupGuideCompleted();
      
      const readAndUpload = async (): Promise<void> => {
        if (!logHandle || logWatchInFlight) return;
        logWatchInFlight = true;
        try {
          const file = await logHandle.getFile();
          await handleLogFileUpload(file);
          closeSetupGuide(true);
        } catch (error) {
          console.warn('Failed to read watched log file:', error);
        } finally {
          logWatchInFlight = false;
        }
      };
      
      // Run once immediately, then every 20 seconds.
      void readAndUpload();
      logWatchInterval = window.setInterval(readAndUpload, logWatchDelayMs);
    });
  }

  // Setup guide modal (auto-show on first run or no inventory yet)
  const setupGuideModal = document.getElementById('setupGuideModal');
  const setupGuideClose = document.getElementById('setupGuideClose') as HTMLButtonElement | null;
  const setupGuidePrev = document.getElementById('setupGuidePrev') as HTMLButtonElement | null;
  const setupGuideNext = document.getElementById('setupGuideNext') as HTMLButtonElement | null;
  const setupGuideProgress = document.getElementById('setupGuideProgress');
  const setupGuideSteps = document.querySelectorAll('.setup-guide-step');
  const setupGuideSpotlight = document.getElementById('setupGuideSpotlight');
  const setupGuideLink = document.getElementById('openSetupGuideLink') as HTMLButtonElement | null;
  const setupGuideSpotlightBack = document.getElementById('setupGuideSpotlightBack') as HTMLButtonElement | null;

  const markSetupGuideCompleted = (): void => {
    localStorage.setItem(setupGuideDismissedKey, 'true');
  };

  const updateSetupGuideStep = (index: number): void => {
    setupGuideSteps.forEach((step, i) => {
      step.classList.toggle('active', i === index);
    });
    if (setupGuideProgress) {
      setupGuideProgress.textContent = `Step ${index + 1} of ${setupGuideSteps.length}`;
    }
    if (setupGuidePrev) {
      setupGuidePrev.style.display = index === 0 ? 'none' : '';
    }
    if (setupGuideNext) {
      setupGuideNext.style.display = index === setupGuideSteps.length - 1 ? 'none' : '';
    }
    if (setupGuideSpotlight) {
      const isSpotlightStep = index === setupGuideSteps.length - 1;
      setupGuideSpotlight.classList.toggle('active', isSpotlightStep);
      if (setupGuideModal) {
        setupGuideModal.classList.toggle('active', !isSpotlightStep);
      }
      if (isSpotlightStep) {
        const logCtaActions = document.querySelector('.log-cta-actions') as HTMLElement | null;
        if (logCtaActions) {
          const ctaRect = logCtaActions.getBoundingClientRect();
          const x = Math.max(0, ctaRect.left - 8);
          const y = Math.max(0, ctaRect.top - 8);
          const w = ctaRect.width + 16;
          const h = ctaRect.height + 16;
          setupGuideSpotlight.style.setProperty('--spotlight-x', `${x}px`);
          setupGuideSpotlight.style.setProperty('--spotlight-y', `${y}px`);
          setupGuideSpotlight.style.setProperty('--spotlight-w', `${w}px`);
          setupGuideSpotlight.style.setProperty('--spotlight-h', `${h}px`);
        }

        const segmented = document.querySelector('.segmented-wrapper') as HTMLElement | null;
        const noteAnchor = segmented ?? logCtaActions;
        if (noteAnchor) {
          const anchorRect = noteAnchor.getBoundingClientRect();
          const noteX = Math.max(0, anchorRect.left);
          const noteY = Math.max(0, anchorRect.top - 84);
          setupGuideSpotlight.style.setProperty('--note-x', `${noteX}px`);
          setupGuideSpotlight.style.setProperty('--note-y', `${noteY}px`);
        }
      }
    }
  };

  const closeSetupGuide = (completed?: boolean): void => {
    if (!setupGuideModal) return;
    setupGuideModal.classList.remove('active');
    if (setupGuideSpotlight) {
      setupGuideSpotlight.classList.remove('active');
    }
    // Closing counts as dismissal; completion also counts.
    if (completed) {
      markSetupGuideCompleted();
    } else {
      markSetupGuideCompleted();
    }
  };

  if (setupGuideModal && setupGuideSteps.length > 0) {
    let currentStep = 0;

    setupGuidePrev?.addEventListener('click', () => {
      currentStep = Math.max(0, currentStep - 1);
      updateSetupGuideStep(currentStep);
    });

    setupGuideNext?.addEventListener('click', () => {
      currentStep = Math.min(setupGuideSteps.length - 1, currentStep + 1);
      updateSetupGuideStep(currentStep);
    });

    setupGuideClose?.addEventListener('click', () => closeSetupGuide());
    setupGuideSpotlightBack?.addEventListener('click', () => {
      currentStep = Math.max(0, currentStep - 1);
      updateSetupGuideStep(currentStep);
    });

    setupGuideModal.addEventListener('click', (event) => {
      if (event.target === setupGuideModal) {
        closeSetupGuide();
      }
    });

    window.addEventListener('resize', () => {
      const activeIndex = Array.from(setupGuideSteps).findIndex(step => step.classList.contains('active'));
      if (activeIndex >= 0) {
        updateSetupGuideStep(activeIndex);
      }
    });

    const localDismissed = localStorage.getItem(setupGuideDismissedKey);
    const dismissed = localDismissed === 'true';
    if (!dismissed) {
      setupGuideModal.classList.add('active');
      updateSetupGuideStep(currentStep);
    }
  }

  if (setupGuideLink && setupGuideModal && setupGuideSteps.length > 0) {
    setupGuideLink.addEventListener('click', () => {
      let currentStep = 0;
      setupGuideModal.classList.add('active');
      localStorage.removeItem(setupGuideDismissedKey);
      updateSetupGuideStep(currentStep);
    });
  }
  
  // SPA Navigation handlers
  const navItems = document.querySelectorAll('.nav-item');
  const pages = document.querySelectorAll('.page');
  
  function navigateToPage(pageId: string): void {
    // Update nav active state
    navItems.forEach(item => item.classList.remove('active'));
    const activeNav = document.getElementById(`nav-${pageId}`);
    if (activeNav) activeNav.classList.add('active');
    
    // Update page visibility
    pages.forEach(page => page.classList.remove('active'));
    const activePage = document.getElementById(`page-${pageId}`);
    if (activePage) activePage.classList.add('active');
  }
  
  // Add click handlers to nav items
  navItems.forEach(item => {
    item.addEventListener('click', () => {
      const pageId = item.id.replace('nav-', '');
      navigateToPage(pageId);
    });
  });
}
