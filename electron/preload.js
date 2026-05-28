const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('petAPI', {
  updatePosition: (x, y) => ipcRenderer.send('pet-position', { x, y }),
  interactionStart: () => ipcRenderer.send('interaction-start'),
  interactionEnd: () => ipcRenderer.send('interaction-end'),
  getScreenBounds: () => ipcRenderer.invoke('get-screen-bounds'),
  onScreenBoundsChanged: (callback) => {
    ipcRenderer.on('screen-bounds', (_event, bounds) => callback(bounds));
  },
});
