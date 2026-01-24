// Update modal management (web version - no-op since updates not available)

import { UpdateType } from '../types.js';

let currentUpdateType: UpdateType | null = null;
let currentUpdateVersion: string = '';

const updateModal = document.getElementById('updateModal')!;
const updateModalTitle = document.getElementById('updateModalTitle')!;
const updateModalSubtitle = document.getElementById('updateModalSubtitle')!;
const updateModalMessage = document.getElementById('updateModalMessage')!;
const updateModalChangelog = document.getElementById('updateModalChangelog')!;
const updateProgressContainer = document.getElementById('updateProgressContainer')!;
const updateProgressFill = document.getElementById('updateProgressFill')!;
const updateProgressText = document.getElementById('updateProgressText')!;
const updateBtnPrimary = document.getElementById('updateBtnPrimary') as HTMLButtonElement;
const updateBtnSecondary = document.getElementById('updateBtnSecondary') as HTMLButtonElement;

/**
 * Show the update modal (no-op in web version)
 */
export function showUpdateModal(_type: UpdateType, _version: string, _currentVersion?: string): void {
  // No-op in web version
}

/**
 * Hide the update modal
 */
export function hideUpdateModal(): void {
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
  // No-op in web version - updates not available
}
