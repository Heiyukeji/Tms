const fs = require('node:fs');
const path = require('node:path');
const { app, ipcMain } = require('electron');

function getStorePath() {
  const userDataPath = app.getPath('userData');
  fs.mkdirSync(userDataPath, { recursive: true });
  return path.join(userDataPath, 'panel-addresses.json');
}

function readPanels() {
  try {
    const panels = JSON.parse(fs.readFileSync(getStorePath(), 'utf8'));
    return Array.isArray(panels) ? panels : [];
  } catch {
    return [];
  }
}

function writePanels(panels) {
  fs.writeFileSync(getStorePath(), JSON.stringify(panels, null, 2), 'utf8');
  return panels;
}

function validateName(name) {
  if (typeof name !== 'string' || !name.trim()) {
    throw new Error('Panel name must not be empty.');
  }
  return name.trim();
}

function normalizeAddress(address) {
  if (typeof address !== 'string') {
    throw new Error('Panel address must be an HTTP(S) URL.');
  }

  const value = address.trim();
  let parsedUrl;
  try {
    parsedUrl = new URL(value);
  } catch {
    throw new Error('Panel address must be an HTTP(S) URL.');
  }

  if (
    (parsedUrl.protocol !== 'http:' && parsedUrl.protocol !== 'https:') ||
    !parsedUrl.hostname
  ) {
    throw new Error('Panel address must be an HTTP(S) URL.');
  }

  return value.replace(/\/+$/, '');
}

function savePanelAddress(name, address) {
  const panels = readPanels();
  panels.push({
    name: validateName(name),
    address: normalizeAddress(address),
    inx: false,
  });
  return writePanels(panels);
}

function setCurrentPanelAddress(name) {
  const currentName = validateName(name);
  const panels = readPanels().map((panel) => ({
    ...panel,
    inx: panel.name === currentName,
  }));
  return writePanels(panels);
}

function deletePanelAddress(name) {
  const deletedName = validateName(name);
  const panels = readPanels().filter((panel) => panel.name !== deletedName);
  return writePanels(panels);
}

function registerPanelStoreHandlers() {
  ipcMain.handle('desktop-panel:get', () => readPanels());
  ipcMain.handle('desktop-panel:save', (_event, name, address) =>
    savePanelAddress(name, address),
  );
  ipcMain.handle('desktop-panel:set-current', (_event, name) =>
    setCurrentPanelAddress(name),
  );
  ipcMain.handle('desktop-panel:delete', (_event, name) =>
    deletePanelAddress(name),
  );
}

module.exports = { registerPanelStoreHandlers };
