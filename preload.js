const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  // Window controls
  minimize: () => ipcRenderer.send('window:minimize'),
  maximize: () => ipcRenderer.send('window:maximize'),
  close:    () => ipcRenderer.send('window:close'),

  // File operations
  saveFile:    (data)       => ipcRenderer.invoke('file:save', data),
  openFile:    (filePath)   => ipcRenderer.invoke('file:open', filePath),
  saveSketch:  (data)       => ipcRenderer.invoke('file:save-sketch', data),

  // Arduino CLI
  cliExists: ()       => ipcRenderer.invoke('cli:exists'),
  cliPath:   ()       => ipcRenderer.invoke('cli:path'),
  cliDir:    ()       => ipcRenderer.invoke('cli:dir'),
  cliRun:    (args)   => ipcRenderer.invoke('cli:run', args),
  onCliOutput: (cb)   => ipcRenderer.on('cli:output', (_, data) => cb(data)),

  // Serial ports
  listPorts: () => ipcRenderer.invoke('serial:list'),

  // Persistent store
  storeGet: (key)        => ipcRenderer.invoke('store:get', key),
  storeSet: (key, value) => ipcRenderer.invoke('store:set', key, value),

  // Menu events
  onMenuEvent: (cb) => {
    ['menu:new-project','menu:open-project','menu:save-project','menu:save-project-as'].forEach(event => {
      ipcRenderer.on(event, (_, data) => cb(event, data));
    });
  },
});
