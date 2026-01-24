// Setup modal for log file upload (web version)

const setupModal = document.getElementById('setupModal')!;
const setupBtnSelect = document.getElementById('setupBtnSelect') as HTMLButtonElement;

let loadInventory: () => Promise<void>;
let handleFileUpload: (file: File) => Promise<void>;

// Create hidden file input
const fileInput = document.createElement('input');
fileInput.type = 'file';
fileInput.accept = '.log';
fileInput.style.display = 'none';
document.body.appendChild(fileInput);

/**
 * Show the setup modal
 */
export function showSetupModal(): void {
  setupModal.classList.add('active');
}

/**
 * Hide the setup modal
 */
export function hideSetupModal(): void {
  setupModal.classList.remove('active');
}

/**
 * Initialize setup modal event listeners
 */
export function initSetupModal(
  inventoryLoader: () => Promise<void>,
  fileUploadHandler: (file: File) => Promise<void>
): void {
  loadInventory = inventoryLoader;
  handleFileUpload = fileUploadHandler;

  // Log file selection button - triggers file input
  setupBtnSelect.addEventListener('click', () => {
    fileInput.click();
  });

  // Handle file selection
  fileInput.addEventListener('change', async (e) => {
    const target = e.target as HTMLInputElement;
    const file = target.files?.[0];
    
    if (!file) return;
    
    if (!file.name.toLowerCase().endsWith('.log')) {
      alert('Please select a .log file');
      return;
    }

    try {
      setupBtnSelect.disabled = true;
      setupBtnSelect.textContent = 'Uploading...';
      
      await handleFileUpload(file);
      
      hideSetupModal();
      await loadInventory();
    } catch (error: any) {
      console.error('Failed to upload log file:', error);
      alert(`Failed to upload log file: ${error.message || 'Unknown error'}`);
    } finally {
      setupBtnSelect.disabled = false;
      setupBtnSelect.textContent = 'Select Log File';
      target.value = ''; // Reset input
    }
  });

  // Check if log has been uploaded on page load
  if (localStorage.getItem('fenix_log_uploaded') !== 'true') {
    showSetupModal();
  }
}
