// Cloud sync consent modal (web version)

import { webAPI } from '../webAPI.js';

const syncConsentModal = document.getElementById('syncConsentModal')!;
const syncConsentEnableBtn = document.getElementById('syncConsentEnableBtn') as HTMLButtonElement | null;
const syncConsentDisableBtn = document.getElementById('syncConsentDisableBtn') as HTMLButtonElement | null;

function showSyncConsentModal(): void {
  syncConsentModal.classList.add('active');
}

function hideSyncConsentModal(): void {
  syncConsentModal.classList.remove('active');
}

export function initSyncConsentModal(): void {
  if (syncConsentEnableBtn) {
    syncConsentEnableBtn.addEventListener('click', async () => {
      await webAPI.setCloudSyncEnabled(true);
      hideSyncConsentModal();
    });
  }

  if (syncConsentDisableBtn) {
    syncConsentDisableBtn.addEventListener('click', async () => {
      await webAPI.setCloudSyncEnabled(false);
      hideSyncConsentModal();
    });
  }

  // Check sync status on load and show modal if needed
  webAPI.getCloudSyncStatus().then(status => {
    if (status.consent === 'pending') {
      showSyncConsentModal();
    }
  });
}
