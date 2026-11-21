const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('desktopPanel', {
  getPanelAddresses: () => ipcRenderer.invoke('desktop-panel:get'),
  savePanelAddress: (name, address) =>
    ipcRenderer.invoke('desktop-panel:save', name, address),
  setCurrentPanelAddress: (name) =>
    ipcRenderer.invoke('desktop-panel:set-current', name),
  deletePanelAddress: (name) =>
    ipcRenderer.invoke('desktop-panel:delete', name),
});
