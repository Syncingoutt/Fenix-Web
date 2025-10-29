import { contextBridge, ipcRenderer } from 'electron';

contextBridge.exposeInMainWorld('electronAPI', {
  getInventory: () => ipcRenderer.invoke('get-inventory'),
  onInventoryUpdate: (callback: () => void) => {
    ipcRenderer.on('inventory-updated', callback);
  }
});