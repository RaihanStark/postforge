// Electron main process: start the PostForge backend on a free port (serving the
// built frontend from the same origin), then open a window onto it.
import { app, BrowserWindow, shell } from 'electron'
import path from 'node:path'
import net from 'node:net'
import { fileURLToPath } from 'node:url'
import { fixPath } from './fixPath.js'
import { initAutoUpdater } from './updater.js'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

// When launched from the OS GUI, Electron inherits a bare PATH that omits the
// user's toolchain. Restore the login shell's PATH up front so the Claude Agent
// SDK (and anything it shells out to) can find its tools.
fixPath()

function freePort() {
  return new Promise((resolve, reject) => {
    const s = net.createServer()
    s.unref()
    s.on('error', reject)
    s.listen(0, () => { const { port } = s.address(); s.close(() => resolve(port)) })
  })
}

async function startServer() {
  const port = await freePort()
  process.env.PORT = String(port)
  process.env.NODE_ENV = 'production'
  process.env.POSTFORGE_SERVE_WEB = '1'
  const { started } = await import('../server/index.js')
  await started
  return port
}

function createWindow(port) {
  const win = new BrowserWindow({
    width: 1440, height: 920, minWidth: 960, minHeight: 640,
    backgroundColor: '#0d1117', title: 'PostForge',
    autoHideMenuBar: true,
    webPreferences: { contextIsolation: true },
  })
  win.setMenuBarVisibility(false)
  // POSTFORGE_DEMO opens the UI against canned data (no Claude login needed).
  win.loadURL(`http://localhost:${port}${process.env.POSTFORGE_DEMO ? '/?demo' : ''}`)
  // Open target=_blank / external links in the system browser, not a new window.
  win.webContents.setWindowOpenHandler(({ url }) => {
    if (/^https?:/.test(url)) shell.openExternal(url)
    return { action: 'deny' }
  })
  return win
}

app.whenReady().then(async () => {
  let port
  try {
    port = await startServer()
  } catch (e) {
    console.error('Failed to start PostForge backend:', e)
    app.quit()
    return
  }
  const win = createWindow(port)
  // Auto-update from GitHub Releases (no-op in dev / unpackaged runs).
  initAutoUpdater(win)
  app.on('activate', () => { if (BrowserWindow.getAllWindows().length === 0) createWindow(port) })
})

app.on('window-all-closed', () => { if (process.platform !== 'darwin') app.quit() })
