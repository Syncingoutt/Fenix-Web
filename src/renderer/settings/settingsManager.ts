// Settings menu management (web version)

import { webAPI } from '../webAPI.js';

const settingsButton = document.getElementById('settingsButton') as HTMLElement;
const settingsMenu = document.getElementById('settingsMenu') as HTMLElement;
const appVersion = document.getElementById('appVersion') as HTMLElement;

let settingsMenuOpen = false;

export function initSettingsManager(): { open: boolean } {
  // Load app version
  webAPI.getAppVersion().then(version => {
    if (appVersion) {
      appVersion.textContent = version;
    }
  });

  // Toggle settings menu
  if (settingsButton) {
    settingsButton.addEventListener('click', (e) => {
      e.stopPropagation();
      settingsMenuOpen = !settingsMenuOpen;
      if (settingsMenu) {
        settingsMenu.style.display = settingsMenuOpen ? 'block' : 'none';
      }
    });
  }

  // Close menu when clicking outside
  document.addEventListener('click', () => {
    if (settingsMenuOpen) {
      settingsMenuOpen = false;
      if (settingsMenu) {
        settingsMenu.style.display = 'none';
      }
    }
  });

  // Prevent menu from closing when clicking inside it
  if (settingsMenu) {
    settingsMenu.addEventListener('click', (e) => {
      e.stopPropagation();
    });
  }

  return { open: settingsMenuOpen };
}
