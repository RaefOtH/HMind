const { contextBridge, ipcRenderer } = require('electron')

contextBridge.exposeInMainWorld('electronAPI', {
  loadAllEntries: ()     => ipcRenderer.invoke('load-all-entries'),
  saveEntry:      (data) => ipcRenderer.invoke('save-entry', data),
  deleteEntry:    (data) => ipcRenderer.invoke('delete-entry', data),
  openDataFolder: ()     => ipcRenderer.invoke('open-data-folder'),
  printToPdf: (data) => ipcRenderer.invoke('print-to-pdf', data),
})
