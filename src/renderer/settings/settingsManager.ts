// Settings menu management (web version)

import { webAPI } from '../webAPI.js';

const myAccountButton = document.getElementById('myAccountButton') as HTMLElement;
const myAccountMenu = document.getElementById('myAccountMenu') as HTMLElement;
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
  if (myAccountButton) {
    myAccountButton.addEventListener('click', (e) => {
      e.stopPropagation();
      settingsMenuOpen = !settingsMenuOpen;
      if (myAccountMenu) {
        myAccountMenu.style.display = settingsMenuOpen ? 'block' : 'none';
      }
      if (myAccountButton) {
        if (settingsMenuOpen) {
          myAccountButton.classList.add('active');
        } else {
          myAccountButton.classList.remove('active');
        }
      }
    });
  }

  // Close menu when clicking outside
  document.addEventListener('click', () => {
    if (settingsMenuOpen) {
      settingsMenuOpen = false;
      if (myAccountMenu) {
        myAccountMenu.style.display = 'none';
      }
      if (myAccountButton) {
        myAccountButton.classList.remove('active');
      }
    }
  });

  // Prevent menu from closing when clicking inside it
  if (myAccountMenu) {
    myAccountMenu.addEventListener('click', (e) => {
      e.stopPropagation();
    });
  }

  return { open: settingsMenuOpen };
}
