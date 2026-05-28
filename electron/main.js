const { app, BrowserWindow, Tray, Menu, screen, ipcMain } = require('electron');
const path = require('path');

let mainWindow = null;
let tray = null;
let petScreenX = 0;
let petScreenY = 0;
let isInteracting = false;
let screenWidth = 1920;
let screenHeight = 1080;

const WINDOW_W = 70;
const WINDOW_H = 70;

function updateScreenBounds() {
  const display = screen.getPrimaryDisplay();
  screenWidth = display.workAreaSize.width;
  screenHeight = display.workAreaSize.height;
}

function createWindow() {
  updateScreenBounds();

  mainWindow = new BrowserWindow({
    width: WINDOW_W,
    height: WINDOW_H,
    x: Math.round(screenWidth / 2) - 35,
    y: screenHeight - WINDOW_H,
    frame: false,
    transparent: true,
    alwaysOnTop: true,
    skipTaskbar: true,
    resizable: false,
    hasShadow: false,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: false,
    },
  });

  const isDev = !app.isPackaged;
  if (isDev) {
    mainWindow.loadURL('http://localhost:5173');
  } else {
    mainWindow.loadFile(path.join(__dirname, '..', 'dist', 'index.html'));
  }

  mainWindow.webContents.on('did-finish-load', () => {
    mainWindow.webContents.send('screen-bounds', {
      width: screenWidth,
      height: screenHeight,
    });
  });

  screen.on('display-metrics-changed', () => {
    updateScreenBounds();
    if (mainWindow) {
      mainWindow.webContents.send('screen-bounds', {
        width: screenWidth,
        height: screenHeight,
      });
    }
  });
}

function createTray() {
  const iconPath = path.join(__dirname, '..', 'assets', 'tray-icon.png');
  try {
    tray = new Tray(iconPath);
    tray.setToolTip('桌面宠物 - 青苹果');
    tray.setContextMenu(Menu.buildFromTemplate([
      { label: '退出', click: () => app.quit() },
    ]));
  } catch (e) {
    console.warn('Tray icon not found, skipping tray:', e.message);
  }
}

// ── IPC ──

ipcMain.on('pet-position', (_event, { x, y }) => {
  petScreenX = x;
  petScreenY = y;
  if (!isInteracting && mainWindow) {
    mainWindow.setBounds({
      x: Math.round(x),
      y: Math.round(y),
      width: WINDOW_W,
      height: WINDOW_H,
    });
  }
});

ipcMain.on('interaction-start', () => {
  isInteracting = true;
});

ipcMain.on('interaction-end', () => {
  isInteracting = false;
  if (mainWindow) {
    mainWindow.setBounds({
      x: Math.round(petScreenX),
      y: Math.round(petScreenY),
      width: WINDOW_W,
      height: WINDOW_H,
    });
  }
});

ipcMain.handle('get-screen-bounds', () => {
  return { width: screenWidth, height: screenHeight };
});

// ── App Lifecycle ──

app.whenReady().then(() => {
  createTray();
  createWindow();
});

app.on('window-all-closed', () => {
  // keep running in tray
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) createWindow();
});
