// UI event handlers (web version)

import { webAPI } from '../webAPI.js';
import { handleLogFileUpload } from '../webAPI.js';

let closeSettingsModal: () => void;

export function initUIEvents(
  settingsModalCloseFn: () => void
): void {
  closeSettingsModal = settingsModalCloseFn;
  
  // File upload button handler
  const uploadLogBtn = document.getElementById('uploadLogBtn');
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
