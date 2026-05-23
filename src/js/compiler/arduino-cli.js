// arduino-cli.js — Wrapper untuk Arduino CLI (compile, upload, library, board manager)

const ARDUINO_CLI_DOWNLOAD = {
  win32:  'https://downloads.arduino.cc/arduino-cli/arduino-cli_latest_Windows_64bit.zip',
  darwin: 'https://downloads.arduino.cc/arduino-cli/arduino-cli_latest_macOS_64bit.tar.gz',
  linux:  'https://downloads.arduino.cc/arduino-cli/arduino-cli_latest_Linux_64bit.tar.gz',
};

class ArduinoCLI {
  constructor(cliPath, cliDir) {
    this.cliPath = cliPath;
    this.cliDir  = cliDir;
  }

  /** Jalankan arduino-cli dengan argumen tertentu */
  async run(args, onOutput = null) {
    return window.electronAPI.cliRun(args);
  }

  /** Inisialisasi arduino-cli (config, update index) */
  async init() {
    await this.run(['config', 'init', '--overwrite']);
    await this.run(['core', 'update-index']);
  }

  /** Tambah board manager URL untuk ESP32, ESP8266, STM32 */
  async addBoardManagerURL(url) {
    await this.run(['config', 'add', 'board_manager.additional_urls', url]);
    await this.run(['core', 'update-index']);
  }

  /** Install core/board package (misal: esp32:esp32) */
  async installCore(packageName) {
    return this.run(['core', 'install', packageName]);
  }

  /** Daftar core yang terinstall */
  async listCores() {
    const res = await this.run(['core', 'list', '--format', 'json']);
    try { return JSON.parse(res.output); } catch { return []; }
  }

  /** Install library (misal: "DHT sensor library") */
  async installLibrary(name) {
    return this.run(['lib', 'install', name]);
  }

  /** Cari library dari index */
  async searchLibrary(query) {
    const res = await this.run(['lib', 'search', query, '--format', 'json']);
    try {
      const parsed = JSON.parse(res.output);
      return parsed.libraries || [];
    } catch { return []; }
  }

  /** Daftar library terinstall */
  async listLibraries() {
    const res = await this.run(['lib', 'list', '--format', 'json']);
    try {
      const parsed = JSON.parse(res.output);
      return parsed.installed_libraries || [];
    } catch { return []; }
  }

  /** Uninstall library */
  async uninstallLibrary(name) {
    return this.run(['lib', 'uninstall', name]);
  }

  /** Compile sketch */
  async compile(sketchPath, fqbn, onOutput) {
    if (onOutput) window.electronAPI.onCliOutput(onOutput);
    return this.run(['compile', '--fqbn', fqbn, sketchPath]);
  }

  /** Upload ke board */
  async upload(sketchPath, fqbn, port, onOutput) {
    if (onOutput) window.electronAPI.onCliOutput(onOutput);
    return this.run(['upload', '-p', port, '--fqbn', fqbn, sketchPath]);
  }

  /** Compile & Upload */
  async compileAndUpload(sketchPath, fqbn, port, onOutput) {
    if (onOutput) window.electronAPI.onCliOutput(onOutput);
    return this.run(['compile', '--fqbn', fqbn, '--upload', '-p', port, sketchPath]);
  }

  /** Daftar board yang terhubung via USB */
  async listBoards() {
    const res = await this.run(['board', 'list', '--format', 'json']);
    try { return JSON.parse(res.output); } catch { return []; }
  }

  /** Verifikasi/check sketch tanpa upload */
  async verify(sketchPath, fqbn, onOutput) {
    if (onOutput) window.electronAPI.onCliOutput(onOutput);
    return this.run(['compile', '--fqbn', fqbn, '--verify-only', sketchPath]);
  }
}

// ─── Download & Install arduino-cli (pertama kali) ────────────────────────────
async function downloadArduinoCLI(cliDir, onProgress) {
  const platform = navigator.platform.toLowerCase().includes('win') ? 'win32' : 
                   navigator.platform.toLowerCase().includes('mac') ? 'darwin' : 'linux';
  const url = ARDUINO_CLI_DOWNLOAD[platform];
  onProgress?.('Mengunduh Arduino CLI...');
  // Download via main process (tidak bisa fetch ke file system dari renderer)
  // Ini akan dihandle oleh IPC handler di main.js
  const result = await window.electronAPI.cliRun(['--version']); // check apakah sudah ada
  if (result.success) { onProgress?.('Arduino CLI sudah tersedia!'); return true; }
  onProgress?.(`Arduino CLI tidak ditemukan. Unduh manual dari:\nhttps://arduino.github.io/arduino-cli/latest/installation/`);
  return false;
}

module.exports = { ArduinoCLI, downloadArduinoCLI };
