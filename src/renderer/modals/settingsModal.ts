// Settings page management (web version)

import { getIncludeTax, setIncludeTax } from '../state/settingsState.js';
import { getCurrentItems } from '../state/inventoryState.js';
import { webAPI } from '../webAPI.js';

let currentSettings: { includeTax?: boolean } = {};
let pendingIncludeTax: boolean | null = null;
let pendingCloudSyncEnabled: boolean | null = null;
let currentCloudSyncEnabled: boolean | null = null;

let renderInventory: () => void;
let renderBreakdown: () => void;
let updateStats: (items: any[]) => void;
let isSaving = false;
let saveQueued = false;

const settingsBackBtn = document.getElementById('settingsBackBtn') as HTMLButtonElement | null;
const generalSection = document.getElementById('generalSection')!;
const preferencesSection = document.getElementById('preferencesSection')!;
const includeTaxCheckbox = document.getElementById('includeTaxCheckbox') as HTMLInputElement | null;
const cloudSyncCheckbox = document.getElementById('cloudSyncCheckbox') as HTMLInputElement | null;
const cloudSyncHelperText = document.getElementById('cloudSyncHelperText') as HTMLElement | null;
const settingsSidebarItems = document.querySelectorAll('.settings-sidebar-item');
const settingsDownloadDesktopBtn = document.getElementById('settingsDownloadDesktopBtn') as HTMLButtonElement | null;

export function initSettingsModal(
  inventoryRenderer: () => void,
  breakdownRenderer: () => void,
  statsUpdater: (items: any[]) => void,
  settingsMenuState: { open: boolean }
): void {
  renderInventory = inventoryRenderer;
  renderBreakdown = breakdownRenderer;
  updateStats = statsUpdater;

  const header = document.querySelector('.header') as HTMLElement | null;

  function navigateToSettingsPage(): void {
    document.querySelectorAll('.nav-item').forEach(item => item.classList.remove('active'));
    document.querySelectorAll('.page').forEach(page => page.classList.remove('active'));
    const settingsEl = document.getElementById('page-settings');
    if (settingsEl) settingsEl.classList.add('active');
    if (header) header.classList.add('hidden');
  }

  async function persistSettingsChanges(): Promise<void> {
    const settingsToSave: { includeTax?: boolean } = {};

    const checkboxElement = document.getElementById('includeTaxCheckbox') as HTMLInputElement | null;
    const currentTaxValue = checkboxElement ? checkboxElement.checked : (pendingIncludeTax ?? false);
    settingsToSave.includeTax = currentTaxValue;

    if (pendingCloudSyncEnabled !== null && currentCloudSyncEnabled !== null) {
      if (pendingCloudSyncEnabled !== currentCloudSyncEnabled) {
        const syncResult = await webAPI.setCloudSyncEnabled(pendingCloudSyncEnabled);
        if (!syncResult.success) {
          if (cloudSyncCheckbox) {
            cloudSyncCheckbox.checked = currentCloudSyncEnabled;
          }
          return;
        }

        currentCloudSyncEnabled = pendingCloudSyncEnabled;
        if (cloudSyncHelperText) {
          cloudSyncHelperText.textContent = currentCloudSyncEnabled
            ? 'Cloud Sync is enabled. Disabling it will stop all cloud reads and writes.'
            : 'Cloud Sync is disabled. You will only see local prices.';
        }
      }
    }

    const saveResult = await webAPI.saveSettings(settingsToSave);
    if (saveResult.success) {
      setIncludeTax(settingsToSave.includeTax ?? false);
      updateStats(getCurrentItems());
      renderBreakdown();
    }
  }

  async function queueAutoSave(): Promise<void> {
    if (isSaving) {
      saveQueued = true;
      return;
    }

    isSaving = true;
    do {
      saveQueued = false;
      try {
        await persistSettingsChanges();
      } catch (error) {
        console.error('Auto-save settings failed:', error);
      }
    } while (saveQueued);
    isSaving = false;
  }

  // Open settings page
  const openSettingsBtn = document.getElementById('openSettingsBtn') as HTMLButtonElement;
  if (openSettingsBtn) {
    openSettingsBtn.addEventListener('click', async () => {
      settingsMenuState.open = false;
      const myAccountMenu = document.getElementById('myAccountMenu');
      const myAccountButton = document.getElementById('myAccountButton');
      if (myAccountMenu) {
        myAccountMenu.style.display = 'none';
      }
      if (myAccountButton) {
        myAccountButton.classList.remove('active');
      }
      
      // Load current settings
      currentSettings = await webAPI.getSettings();
      pendingIncludeTax = currentSettings.includeTax !== undefined ? currentSettings.includeTax : true;
      setIncludeTax(pendingIncludeTax);
      const cloudSyncStatus = await webAPI.getCloudSyncStatus();
      currentCloudSyncEnabled = cloudSyncStatus.enabled;
      pendingCloudSyncEnabled = cloudSyncStatus.enabled;
      
      // Set tax checkbox
      if (includeTaxCheckbox) {
        includeTaxCheckbox.checked = pendingIncludeTax;
      }

      if (cloudSyncCheckbox && cloudSyncHelperText && currentCloudSyncEnabled !== null) {
        cloudSyncCheckbox.checked = currentCloudSyncEnabled;
        cloudSyncHelperText.textContent = currentCloudSyncEnabled
          ? 'Cloud Sync is enabled. Disabling it will stop all cloud reads and writes.'
          : 'Cloud Sync is disabled. You will only see local prices.';
      }
      
      // Show general section by default
      generalSection.classList.add('active');
      preferencesSection.classList.remove('active');
      
      // Reset sidebar active state
      settingsSidebarItems.forEach(item => {
        const section = item.getAttribute('data-section');
        if (section === 'general') {
          item.classList.add('active');
        } else {
          item.classList.remove('active');
        }
      });

      navigateToSettingsPage();
    });
  }

  settingsBackBtn?.addEventListener('click', () => {
    closeSettingsModal();
  });
  
  // Handle tax checkbox change
  if (includeTaxCheckbox) {
    includeTaxCheckbox.addEventListener('change', () => {
      if (includeTaxCheckbox) {
        pendingIncludeTax = includeTaxCheckbox.checked;
        void queueAutoSave();
      }
    });
  }

  if (settingsDownloadDesktopBtn) {
    settingsDownloadDesktopBtn.addEventListener('click', () => {
      window.open('https://github.com/Syncingoutt/Fenix/releases', '_blank', 'noopener,noreferrer');
    });
  }


  if (cloudSyncCheckbox) {
    cloudSyncCheckbox.addEventListener('change', () => {
      pendingCloudSyncEnabled = cloudSyncCheckbox.checked;
      void queueAutoSave();
    });
  }
  
  // Sidebar navigation
  settingsSidebarItems.forEach(item => {
    item.addEventListener('click', () => {
      const section = item.getAttribute('data-section');
      if (!section) return;
      
      settingsSidebarItems.forEach(i => i.classList.remove('active'));
      item.classList.add('active');
      
      if (section === 'general') {
        generalSection.classList.add('active');
        preferencesSection.classList.remove('active');
      } else if (section === 'preferences') {
        generalSection.classList.remove('active');
        preferencesSection.classList.add('active');
      }
    });
  });
  
}

export function closeSettingsModal(): void {
  document.querySelectorAll('.page').forEach(page => page.classList.remove('active'));
  const homePage = document.getElementById('page-home');
  if (homePage) homePage.classList.add('active');
  document.querySelectorAll('.nav-item').forEach(item => item.classList.remove('active'));
  const homeNav = document.getElementById('nav-home');
  if (homeNav) homeNav.classList.add('active');
  const header = document.querySelector('.header') as HTMLElement | null;
  if (header) header.classList.remove('hidden');
}
