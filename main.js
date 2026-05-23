const { app, BrowserWindow, ipcMain, dialog, Menu, shell } = require('electron');
const path = require('path');
const fs = require('fs');
const { exec, spawn } = require('child_process');
const Store = require('electron-store');
const os = require('os');

const store = new Store();
let mainWindow;
let arduinoCliProcess = null;

// ─── Arduino CLI Path ──────────────────────────────────────────────────────────
const PLATFORM = process.platform;
const CLI_DIR = path.join(app.getPath('userData'), 'arduino-cli');
const CLI_BIN = path.join(CLI_DIR, PLATFORM === 'win32' ? 'arduino-cli.exe' : 'arduino-cli');

// ─── Window Creation ───────────────────────────────────────────────────────────
function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1600,
    height: 960,
    minWidth: 1200,
    minHeight: 700,
    frame: false,
    titleBarStyle: 'hidden',
    backgroundColor: '#0a0a0f',
    icon: path.join(__dirname, 'src', 'assets', 'icon.png'),
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: false,
    },
  });

  mainWindow.loadFile(path.join(__dirname, 'src', 'index.html'));

  if (process.argv.includes('--dev')) {
    mainWindow.webContents.openDevTools({ mode: 'detach' });
  }

  mainWindow.on('closed', () => { mainWindow = null; });
}

// ─── App Menu ──────────────────────────────────────────────────────────────────
function buildMenu() {
  const template = [
    {
      label: 'File',
      submenu: [
        { label: 'New Project', accelerator: 'CmdOrCtrl+N', click: () => mainWindow.webContents.send('menu:new-project') },
        { label: 'Open Project...', accelerator: 'CmdOrCtrl+O', click: async () => {
          const result = await dialog.showOpenDialog({ filters: [{ name: 'CircuitForge Project', extensions: ['circuitforge'] }] });
          if (!result.canceled) mainWindow.webContents.send('menu:open-project', result.filePaths[0]);
        }},
        { label: 'Save Project', accelerator: 'CmdOrCtrl+S', click: () => mainWindow.webContents.send('menu:save-project') },
        { label: 'Save Project As...', accelerator: 'CmdOrCtrl+Shift+S', click: () => mainWindow.webContents.send('menu:save-project-as') },
        { type: 'separator' },
        { label: 'Quit', accelerator: 'CmdOrCtrl+Q', click: () => app.quit() },
      ],
    },
    {
      label: 'View',
      submenu: [
        { label: 'Toggle DevTools', accelerator: 'F12', click: () => mainWindow.webContents.toggleDevTools() },
        { label: 'Reload', accelerator: 'CmdOrCtrl+R', click: () => mainWindow.reload() },
        { type: 'separator' },
        { label: 'Zoom In', accelerator: 'CmdOrCtrl+=', click: () => mainWindow.webContents.setZoomLevel(mainWindow.webContents.getZoomLevel() + 0.5) },
        { label: 'Zoom Out', accelerator: 'CmdOrCtrl+-', click: () => mainWindow.webContents.setZoomLevel(mainWindow.webContents.getZoomLevel() - 0.5) },
        { label: 'Reset Zoom', accelerator: 'CmdOrCtrl+0', click: () => mainWindow.webContents.setZoomLevel(0) },
      ],
    },
    {
      label: 'Help',
      submenu: [
        { label: 'Arduino Reference', click: () => shell.openExternal('https://www.arduino.cc/reference/en/') },
        { label: 'ESP32 Pinout', click: () => shell.openExternal('https://randomnerdtutorials.com/esp32-pinout-reference-gpios/') },
        { label: 'MQTT Explorer', click: () => shell.openExternal('https://mqtt-explorer.com') },
      ],
    },
  ];
  Menu.setApplicationMenu(Menu.buildFromTemplate(template));
}

// ─── IPC: Window Controls ──────────────────────────────────────────────────────
ipcMain.on('window:minimize', () => mainWindow?.minimize());
ipcMain.on('window:maximize', () => mainWindow?.isMaximized() ? mainWindow.unmaximize() : mainWindow.maximize());
ipcMain.on('window:close', () => mainWindow?.close());

// ─── IPC: File Operations ──────────────────────────────────────────────────────
ipcMain.handle('file:save', async (_, { filePath, data }) => {
  const savePath = filePath || (await dialog.showSaveDialog({
    defaultPath: 'project.circuitforge',
    filters: [{ name: 'CircuitForge Project', extensions: ['circuitforge'] }],
  })).filePath;
  if (!savePath) return { success: false };
  fs.writeFileSync(savePath, JSON.stringify(data, null, 2), 'utf8');
  return { success: true, filePath: savePath };
});

ipcMain.handle('file:open', async (_, filePath) => {
  const loadPath = filePath || (await dialog.showOpenDialog({
    filters: [{ name: 'CircuitForge Project', extensions: ['circuitforge'] }],
  })).filePaths[0];
  if (!loadPath) return { success: false };
  const data = JSON.parse(fs.readFileSync(loadPath, 'utf8'));
  return { success: true, data, filePath: loadPath };
});

ipcMain.handle('file:save-sketch', async (_, { code }) => {
  const sketchDir = path.join(app.getPath('temp'), 'cf_sketch');
  fs.mkdirSync(sketchDir, { recursive: true });
  const sketchFile = path.join(sketchDir, 'cf_sketch.ino');
  fs.writeFileSync(sketchFile, code, 'utf8');
  return sketchFile;
});

// ─── IPC: Arduino CLI ──────────────────────────────────────────────────────────
ipcMain.handle('cli:exists', () => fs.existsSync(CLI_BIN));
ipcMain.handle('cli:path', () => CLI_BIN);
ipcMain.handle('cli:dir', () => CLI_DIR);

ipcMain.handle('cli:run', async (_, args) => {
  return new Promise((resolve) => {
    if (!fs.existsSync(CLI_BIN)) {
      resolve({ success: false, output: 'Arduino CLI not found. Please install it from the Settings panel.' });
      return;
    }
    const proc = spawn(CLI_BIN, args, { cwd: CLI_DIR });
    let stdout = '', stderr = '';
    proc.stdout.on('data', d => { stdout += d.toString(); mainWindow?.webContents.send('cli:output', d.toString()); });
    proc.stderr.on('data', d => { stderr += d.toString(); mainWindow?.webContents.send('cli:output', d.toString()); });
    proc.on('close', code => resolve({ success: code === 0, output: stdout + stderr, code }));
  });
});

// ─── IPC: Serial Ports ─────────────────────────────────────────────────────────
ipcMain.handle('serial:list', async () => {
  const { SerialPort } = require('serialport');
  try {
    const ports = await SerialPort.list();
    return ports;
  } catch (e) {
    return [];
  }
});

// ─── IPC: Store ────────────────────────────────────────────────────────────────
ipcMain.handle('store:get', (_, key) => store.get(key));
ipcMain.handle('store:set', (_, key, value) => store.set(key, value));

// ─── App Lifecycle ─────────────────────────────────────────────────────────────
app.whenReady().then(() => {
  buildMenu();
  createWindow();
});

app.on('window-all-closed', () => { if (process.platform !== 'darwin') app.quit(); });
app.on('activate', () => { if (BrowserWindow.getAllWindows().length === 0) createWindow(); });
