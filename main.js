const {app, BrowserWindow, ipcMain} = require('electron');
const { mouse} = require('@nut-tree-fork/nut-js');
const {GlobalKeyboardListener} = require("node-global-key-listener");

const path = require('path');
const fs = require('fs');
const os = require('os');
const screenshot = require('screenshot-desktop');

let mainWindow;
let screenshotInterval;
let inactivityTime = 0;
let activityTimeout;
let allowTracking = false;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
    },
    icon: path.join(__dirname, 'dist/time-tracker/browser/favicon.ico'),
  });

  // Load the Angular app
  // mainWindow.loadFile(path.join(__dirname, 'dist/timer/browser/index.html'));
  console.log(__dirname)
  mainWindow.loadFile(path.join(__dirname, 'dist/time-tracker/browser/index.html')).then(() => {
  });

  mainWindow.on('closed', function () {
    mainWindow = null;
  });
}

app.whenReady().then(() => {
  createWindow();

  startTrackingGlobalEvents();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});


app.on('window-all-closed', function () {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', function () {
  if (mainWindow === null) {
    createWindow();
  }
  // startTrackingActivity();
});

// Handle IPC events for starting and stopping screenshots
ipcMain.on('start-screenshot', () => {
  if (screenshotInterval) return; // Prevent multiple intervals

  // Start taking screenshots every 10 seconds
  screenshotInterval = setInterval(() => {
    takeScreenshot();
  }, 10000); // 10 seconds interval
});

ipcMain.on('stop-screenshot', () => {
  if (screenshotInterval) {
    clearInterval(screenshotInterval);
    screenshotInterval = null;
  }
});

function takeScreenshot() {
  const desktopDir = path.join(os.homedir(), 'Desktop', 'Screenshots');
  if (!fs.existsSync(desktopDir)) {
    fs.mkdirSync(desktopDir);
  }

  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const filePath = path.join(desktopDir, `screenshot-${timestamp}.png`);

  screenshot({format: 'png'}).then((img) => {
    fs.writeFileSync(filePath, img);
    console.log('Screenshot saved:', filePath);
  }).catch((err) => {
    console.error('Failed to take screenshot:', err);
  });
}

// Handle IPC events for starting and stopping screenshots
ipcMain.on('start-tracking', () => {
  allowTracking = true;
  startTrackingGlobalEvents();
  resetInactivityTimer();
});

// Handle IPC events for starting and stopping screenshots
ipcMain.on('stop-tracking', () => {
  allowTracking = false;
  stopActivityTimer()
});

function startTrackingGlobalEvents() {
  // Listen for key presses
  const keyboardListener = new GlobalKeyboardListener();
  keyboardListener.addListener(() => {
    if (allowTracking) {
      resetInactivityTimer();
    }
  });

  // Listen for mouse movements
  let prevPosition = {};
  mouse.config.autoDelayMs = 0;
  setInterval(async () => {
    const position = await mouse.getPosition();
    if (allowTracking) {
      if (JSON.stringify(prevPosition) !== JSON.stringify(position)) {
        mainWindow.webContents.send('global-mousemove', position);
        prevPosition = position;
        resetInactivityTimer();
      }
    }
  }, 100); // Check mouse position every 100ms
}


function resetInactivityTimer() {
  clearInterval(activityTimeout);

  // Reset inactivity time
  inactivityTime = 0;

  // Increment inactivity time every second
  activityTimeout = setInterval(() => {
    inactivityTime += 1;
    console.log(`Inactivity time: ${inactivityTime} seconds`);

    // Send inactivity time to the renderer process (Angular app)
    BrowserWindow.getAllWindows().forEach((window) => {
      window.webContents.send('inactivity-time', inactivityTime);
    });

    // Perform any necessary action after a specific time of inactivity
    if (inactivityTime >= 300) { // Example: 5 minutes
      // Implement any action such as locking the screen, logging out, etc.
    }
  }, 1000);
}

function stopActivityTimer() {
  clearInterval(activityTimeout);
}
