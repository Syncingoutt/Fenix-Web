// Settings modal management (web version)

import { getIncludeTax, setIncludeTax } from '../state/settingsState.js';
import { getCurrentItems } from '../state/inventoryState.js';
import { showSyncDisableConfirmModal } from './syncDisableConfirmModal.js';
import { webAPI } from '../webAPI.js';
import { handleLogFileUpload } from '../webAPI.js';

let currentSettings: { includeTax?: boolean } = {};
let pendingIncludeTax: boolean | null = null;
let pendingCloudSyncEnabled: boolean | null = null;
let currentCloudSyncEnabled: boolean | null = null;

let settingsMenuOpen = false;
let renderInventory: () => void;
let renderBreakdown: () => void;
let updateStats: (items: any[]) => void;

const settingsModal = document.getElementById('settingsModal')!;
const settingsCloseBtn = document.getElementById('settingsCloseBtn') as HTMLButtonElement;
const settingsSaveBtn = document.getElementById('settingsSaveBtn') as HTMLButtonElement;
const settingsFooterMessage = document.getElementById('settingsFooterMessage')!;
const generalSection = document.getElementById('generalSection')!;
const preferencesSection = document.getElementById('preferencesSection')!;
const includeTaxCheckbox = document.getElementById('includeTaxCheckbox') as HTMLInputElement | null;
const cloudSyncCheckbox = document.getElementById('cloudSyncCheckbox') as HTMLInputElement | null;
const cloudSyncHelperText = document.getElementById('cloudSyncHelperText') as HTMLElement | null;
const settingsSidebarItems = document.querySelectorAll('.settings-sidebar-item');
const settingsUploadLogBtn = document.getElementById('settingsUploadLogBtn') as HTMLButtonElement | null;

// Create hidden file input for settings modal
const settingsFileInput = document.createElement('input');
settingsFileInput.type = 'file';
settingsFileInput.accept = '.log';
settingsFileInput.style.display = 'none';
document.body.appendChild(settingsFileInput);

export function initSettingsModal(
  inventoryRenderer: () => void,
  breakdownRenderer: () => void,
  statsUpdater: (items: any[]) => void,
  settingsMenuState: { open: boolean }
): void {
  renderInventory = inventoryRenderer;
  renderBreakdown = breakdownRenderer;
  updateStats = statsUpdater;
  settingsMenuOpen = settingsMenuState.open;
  
  // Open settings modal
  const openSettingsBtn = document.getElementById('openSettingsBtn') as HTMLButtonElement;
  if (openSettingsBtn) {
    openSettingsBtn.addEventListener('click', async () => {
      settingsMenuState.open = false;
      const settingsMenu = document.getElementById('settingsMenu');
      if (settingsMenu) {
        settingsMenu.style.display = 'none';
      }
      
      // Load current settings
      currentSettings = await webAPI.getSettings();
      pendingIncludeTax = currentSettings.includeTax !== undefined ? currentSettings.includeTax : false;
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
      
      // Reset save button state
      settingsSaveBtn.disabled = false;
      settingsSaveBtn.textContent = 'Save';
      
      // Clear footer message
      settingsFooterMessage.textContent = '';
      settingsFooterMessage.classList.remove('show', 'success', 'error');
      
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
      
      settingsModal.classList.add('active');
    });
  }
  
  // Close settings modal
  settingsCloseBtn.addEventListener('click', () => {
    closeSettingsModal();
  });
  
  settingsModal.addEventListener('click', (e) => {
    if (e.target === settingsModal) {
      closeSettingsModal();
    }
  });
  
  // Handle tax checkbox change
  if (includeTaxCheckbox) {
    includeTaxCheckbox.addEventListener('change', () => {
      if (includeTaxCheckbox) {
        pendingIncludeTax = includeTaxCheckbox.checked;
      }
    });
  }

  // Handle file upload in settings
  if (settingsUploadLogBtn) {
    settingsUploadLogBtn.addEventListener('click', () => {
      settingsFileInput.click();
    });
  }

  settingsFileInput.addEventListener('change', async (e) => {
    const target = e.target as HTMLInputElement;
    const file = target.files?.[0];
    
    if (!file) return;
    
    if (!file.name.toLowerCase().endsWith('.log')) {
      alert('Please select a .log file');
      return;
    }

    try {
      if (settingsUploadLogBtn) {
        settingsUploadLogBtn.disabled = true;
        const originalText = settingsUploadLogBtn.querySelector('span')?.textContent || 'Upload UE_game.log';
        const span = settingsUploadLogBtn.querySelector('span');
        if (span) span.textContent = 'Uploading...';
        
        await handleLogFileUpload(file);
        
        if (span) span.textContent = originalText;
        settingsFooterMessage.textContent = 'Log file uploaded successfully!';
        settingsFooterMessage.classList.add('show', 'success');
        
        // Reload inventory
        const loadInventory = async () => {
          const inventory = await webAPI.getInventory();
          updateStats(inventory);
        };
        await loadInventory();
      }
    } catch (error: any) {
      console.error('Failed to upload log file:', error);
      settingsFooterMessage.textContent = `Failed to upload: ${error.message || 'Unknown error'}`;
      settingsFooterMessage.classList.add('show', 'error');
    } finally {
      if (settingsUploadLogBtn) {
        settingsUploadLogBtn.disabled = false;
      }
      target.value = '';
    }
  });

  if (cloudSyncCheckbox) {
    cloudSyncCheckbox.addEventListener('change', () => {
      pendingCloudSyncEnabled = cloudSyncCheckbox.checked;
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
  
  // Save settings
  settingsSaveBtn.addEventListener('click', async () => {
    settingsSaveBtn.disabled = true;
    settingsSaveBtn.textContent = 'Saving...';
    
    try {
      const settingsToSave: { includeTax?: boolean } = {};
      
      const checkboxElement = document.getElementById('includeTaxCheckbox') as HTMLInputElement | null;
      const currentTaxValue = checkboxElement ? checkboxElement.checked : (pendingIncludeTax ?? false);
      settingsToSave.includeTax = currentTaxValue;

      if (pendingCloudSyncEnabled !== null && currentCloudSyncEnabled !== null) {
        if (pendingCloudSyncEnabled !== currentCloudSyncEnabled) {
          if (!pendingCloudSyncEnabled) {
            const confirmDisable = await showSyncDisableConfirmModal();
            if (!confirmDisable) {
              if (cloudSyncCheckbox) {
                cloudSyncCheckbox.checked = currentCloudSyncEnabled;
                pendingCloudSyncEnabled = currentCloudSyncEnabled;
              }
              settingsSaveBtn.disabled = false;
              settingsSaveBtn.textContent = 'Save';
              return;
            }
          }
          
          const syncResult = await webAPI.setCloudSyncEnabled(pendingCloudSyncEnabled);
          if (!syncResult.success) {
            settingsFooterMessage.textContent = syncResult.error || 'Failed to update cloud sync';
            settingsFooterMessage.classList.add('show', 'error');
            settingsSaveBtn.disabled = false;
            settingsSaveBtn.textContent = 'Save';
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
        settingsFooterMessage.textContent = 'Settings saved successfully';
        settingsFooterMessage.classList.add('show', 'success');
        
        // Update stats with new tax setting
        updateStats(getCurrentItems());
        renderBreakdown();
      } else {
        settingsFooterMessage.textContent = saveResult.error || 'Failed to save settings';
        settingsFooterMessage.classList.add('show', 'error');
      }
    } catch (error: any) {
      console.error('Failed to save settings:', error);
      settingsFooterMessage.textContent = error.message || 'Failed to save settings';
      settingsFooterMessage.classList.add('show', 'error');
    } finally {
      settingsSaveBtn.disabled = false;
      settingsSaveBtn.textContent = 'Save';
    }
  });
}

export function closeSettingsModal(): void {
  settingsModal.classList.remove('active');
  settingsFooterMessage.textContent = '';
  settingsFooterMessage.classList.remove('show', 'success', 'error');
}
