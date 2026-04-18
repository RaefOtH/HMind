const { app, BrowserWindow, ipcMain, shell } = require('electron')
const path = require('path')
const fs   = require('fs')

const DATA_DIR = path.join(app.getPath('userData'), 'entries')

function ensureDir(dir) {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true })
}

function themeFilePath(theme) {
  ensureDir(DATA_DIR)
  const safe = theme.replace(/[^a-zA-Z0-9 _-]/g, '').trim() || 'General'
  return path.join(DATA_DIR, `${safe}.json`)
}

function loadThemeEntries(theme) {
  try { return JSON.parse(fs.readFileSync(themeFilePath(theme), 'utf-8')) }
  catch { return [] }
}

function saveThemeEntries(theme, entries) {
  fs.writeFileSync(themeFilePath(theme), JSON.stringify(entries, null, 2))
}

// ── IPC ────────────────────────────────────────────────────────

ipcMain.handle('load-all-entries', () => {
  ensureDir(DATA_DIR)
  const files = fs.readdirSync(DATA_DIR).filter(f => f.endsWith('.json'))
  const all = []
  for (const file of files) {
    const theme = path.basename(file, '.json')
    try {
      const entries = JSON.parse(fs.readFileSync(path.join(DATA_DIR, file), 'utf-8'))
      entries.forEach(e => all.push({ ...e, theme }))
    } catch {}
  }
  return all.sort((a, b) => b.id - a.id)
})

ipcMain.handle('save-entry', (_, { text, theme, timestamp }) => {
  const entries = loadThemeEntries(theme)
  const entry   = { id: Date.now(), text, theme, timestamp }
  entries.unshift(entry)
  saveThemeEntries(theme, entries)
  return entry
})

ipcMain.handle('delete-entry', (_, { id, theme }) => {
  const entries = loadThemeEntries(theme).filter(e => e.id !== id)
  saveThemeEntries(theme, entries)
  if (entries.length === 0) {
    try { fs.unlinkSync(themeFilePath(theme)) } catch {}
  }
  return true
})

ipcMain.handle('open-data-folder', () => {
  ensureDir(DATA_DIR)
  shell.openPath(DATA_DIR)
})

ipcMain.handle('print-to-pdf', async (_, { html, filename }) => {
  const win = new BrowserWindow({ show: false,
    webPreferences: { contextIsolation: true }
  })
  await win.loadURL('data:text/html;charset=utf-8,' + encodeURIComponent(html))
  // Small delay so the page fully renders
  await new Promise(r => setTimeout(r, 400))
  const pdfBuffer = await win.webContents.printToPDF({
    printBackground: true,
    pageSize: 'A4',
    margins: { top: 0.5, bottom: 0.5, left: 0.5, right: 0.5 }
  })
  win.close()
  const savePath = path.join(app.getPath('documents'), filename)
  fs.writeFileSync(savePath, pdfBuffer)
  shell.openPath(path.dirname(savePath)) // open the folder after saving
  return savePath
})

// ── Window ─────────────────────────────────────────────────────

function createWindow() {
  const win = new BrowserWindow({
    width: 980, height: 660,
    minWidth: 680, minHeight: 480,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false
    },
    title: 'Smart Text Organizer'
  })
  win.loadFile('index.html')
}

app.whenReady().then(() => {
  createWindow()
  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit()
})
