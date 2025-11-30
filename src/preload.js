const { contextBridge, ipcRenderer } = require('electron');

// Expose a limited, safe API to the renderer process
contextBridge.exposeInMainWorld('countupAPI', {
  getStartTime: () => ipcRenderer.invoke('get-start-time'),
  getIsRunning: () => ipcRenderer.invoke('get-is-running'),
  startCounter: () => ipcRenderer.invoke('start-counter'),
  resetCounter: () => ipcRenderer.invoke('reset-counter'),
  getEventName: () => ipcRenderer.invoke('get-event-name'),
  setEventName: (name) => ipcRenderer.invoke('set-event-name', name),
  getResetHistory: () => ipcRenderer.invoke('get-reset-history'),
  getStats: () => ipcRenderer.invoke('get-stats'),
  
  // Event listeners
  onCounterStarted: (callback) => {
    ipcRenderer.on('counter-started', callback);
  },
  onCounterReset: (callback) => {
    ipcRenderer.on('counter-reset', callback);
  }
});
