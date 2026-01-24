// Setup modal removed for web version. Keep API to avoid breaking imports.

export function showSetupModal(): void {
  // No-op
}

export function hideSetupModal(): void {
  // No-op
}

export function initSetupModal(
  _inventoryLoader: () => Promise<void>,
  _fileUploadHandler: (file: File) => Promise<void>
): void {
  // No-op
}
