// Update modal management (web version)

import { UpdateType } from '../types.js';

const YIHUO_ETOR_URL = 'https://github.com/Giboork/TLI-tracker-translated';
const TITRACK_URL = 'https://github.com/astockman99/TITrack';

let currentUpdateType: UpdateType | null = null;
let currentUpdateVersion = '';

const updateModal = document.getElementById('updateModal');
const updateModalTitle = document.getElementById('updateModalTitle');
const updateModalSubtitle = document.getElementById('updateModalSubtitle');
const updateModalMessage = document.getElementById('updateModalMessage');
const updateModalChangelog = document.getElementById('updateModalChangelog');
const updateProgressContainer = document.getElementById('updateProgressContainer');
const updateBtnPrimary = document.getElementById('updateBtnPrimary') as HTMLButtonElement | null;
const updateBtnSecondary = document.getElementById('updateBtnSecondary') as HTMLButtonElement | null;

function showSunsetNoticeModal(): void {
  if (!updateModal || !updateModalTitle || !updateModalSubtitle || !updateModalMessage || !updateModalChangelog || !updateProgressContainer || !updateBtnPrimary || !updateBtnSecondary) {
    return;
  }

  updateModalTitle.textContent = 'Goodbye from Fenix';
  updateModalSubtitle.textContent = '';
  updateModalMessage.textContent = 'Thanks for using Fenix. This website will shut down on April 30th. I suggest moving onto a new tracker instead. Here are some trusted community tools that are safe and free:';
  updateModalChangelog.innerHTML = `<a href="${YIHUO_ETOR_URL}" target="_blank" rel="noopener noreferrer">YiHuo Etor</a> or <a href="${TITRACK_URL}" target="_blank" rel="noopener noreferrer">TITrack</a>`;
  updateModalChangelog.style.display = 'block';
  updateProgressContainer.style.display = 'none';

  updateBtnPrimary.textContent = 'Understood';
  updateBtnSecondary.style.display = 'none';

  updateBtnPrimary.onclick = () => {
    hideUpdateModal();
  };

  updateBtnSecondary.onclick = null;

  updateModal.onclick = (event: MouseEvent) => {
    if (event.target === updateModal) {
      hideUpdateModal();
    }
  };

  document.addEventListener('keydown', (event: KeyboardEvent) => {
    if (event.key === 'Escape') {
      hideUpdateModal();
    }
  });

  updateModal.classList.add('active');
}

/**
 * Show the update modal (no-op in web version)
 */
export function showUpdateModal(_type: UpdateType, _version: string, _currentVersion?: string): void {
  // Not used in web version; kept for API compatibility.
}

/**
 * Hide the update modal
 */
export function hideUpdateModal(): void {
  if (!updateModal) {
    return;
  }
  updateModal.classList.remove('active');
  currentUpdateType = null;
  currentUpdateVersion = '';
}

/**
 * Show download progress (no-op in web version)
 */
export function showDownloadProgress(): void {
  // No-op in web version
}

/**
 * Update download progress percentage (no-op in web version)
 */
export function updateDownloadProgress(_percent: number): void {
  // No-op in web version
}

/**
 * Transition to install prompt after download completes (no-op in web version)
 */
export function transitionToInstallPrompt(_version: string): void {
  // No-op in web version
}

/**
 * Initialize update modal event listeners (no-op in web version)
 */
export function initUpdateModal(): void {
  showSunsetNoticeModal();
}
