// runtime.js — Implementasi Arduino API dalam JavaScript untuk simulasi
// Mendukung: digitalWrite, analogRead, Serial, Wire (I2C), SoftwareSerial, tone, dll.

/**
 * Buat runtime instance untuk satu board
 */
function createRuntime(board, busRouter, serialOut) {
  const pinStates = board.pinStates;
  const boardDef  = board.boardDef;

  // Buffer untuk data yang masuk dari luar (UART/BT/NRF24)
  const injectBuffers = {
    serial:    [],  // dari UART board lain
    serial1:   [],
    serial2:   [],
    bluetooth: [],  // dari HC-05 paired board
    nrf24:     [],  // dari NRF24L01 peer board
    i2cReceive:[],  // data yang diterima saat jadi I2C slave
  };

  let i2cRequestHandler   = null;  // fungsi yang dipanggil saat jadi slave & diminta data
  let i2cReceiveHandler   = null;  // fungsi yang dipanggil saat jadi slave & menerima data
  let loopDelay           = 0;     // ms antara loop() iterations (diatur oleh delay())
  let simTime             = 0;     // waktu simulasi dalam ms
  let toneFreq            = 0;     // frekuensi tone aktif

  // ─── Pin API ─────────────────────────────────────────────────────────────────

  function pinMode(pin, mode) {
    if (pinStates[pin]) pinStates[pin].mode = mode;
    _notifyPinChange(pin);
  }

  function digitalWrite(pin, value) {
    if (!pinStates[pin]) pinStates[pin] = { mode: 'OUTPUT', value: 0, pwm: 0 };
    pinStates[pin].value = value ? 1 : 0;
    busRouter.gpioWrite(board.id, pin, pinStates[pin].value);
    _notifyPinChange(pin);
  }

  function digitalRead(pin) {
    if (!pinStates[pin]) return 0;
    return pinStates[pin].value;
  }

  function analogWrite(pin, value) {
    const v = Math.max(0, Math.min(255, value));
    if (!pinStates[pin]) pinStates[pin] = { mode: 'OUTPUT', value: v > 127 ? 1 : 0, pwm: v };
    pinStates[pin].pwm = v;
    pinStates[pin].value = v > 127 ? 1 : 0;
    busRouter.gpioWrite(board.id, pin, v / 255);
    _notifyPinChange(pin);
  }

  function analogRead(pin) {
    if (!pinStates[pin]) return 0;
    // nilai 0-1023, set via slider sensor di UI
    return Math.floor((pinStates[pin].inputValue ?? 0) * 1023);
  }

  function setPinInputValue(pin, value) {
    // Dipanggil dari luar (sensor slider atau GPIO wire dari board lain)
    if (!pinStates[pin]) pinStates[pin] = { mode: 'INPUT', value: 0, pwm: 0, inputValue: 0 };
    pinStates[pin].inputValue = value;
    if (value > 0.5) pinStates[pin].value = 1;
    else pinStates[pin].value = 0;
    _notifyPinChange(pin);
  }

  function _notifyPinChange(pin) {
    // Kirim event ke UI agar breadboard re-render
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('cf:pin-changed', {
        detail: { boardId: board.id, pin, state: pinStates[pin] }
      }));
    }
  }

  // ─── Time API ─────────────────────────────────────────────────────────────────

  async function delay(ms) {
    loopDelay = ms;
    await new Promise(r => setTimeout(r, Math.min(ms, 50))); // cap 50ms untuk responsivitas UI
  }

  function delayMicroseconds(us) { /* best effort — browser tidak bisa microseconds */ }

  function millis() { return simTime; }
  function micros() { return simTime * 1000; }

  // ─── Serial API ──────────────────────────────────────────────────────────────

  function makeSerial(label = 'Serial', injectKey = 'serial', txPin = null) {
    let baud = 9600;
    const outBuffer = [];

    return {
      begin(b) { baud = b; serialOut(`[${label}] begin(${b})`); },
      print(v)   { const s = String(v); outBuffer.push(s); _flush(s); },
      println(v) { const s = String(v) + '\n'; outBuffer.push(s); _flush(s); },
      write(b)   { _flush(String.fromCharCode(b)); },
      available() { return injectBuffers[injectKey].length; },
      read() {
        if (!injectBuffers[injectKey].length) return -1;
        return injectBuffers[injectKey].shift().charCodeAt(0);
      },
      readString() {
        const s = injectBuffers[injectKey].join('');
        injectBuffers[injectKey] = [];
        return s;
      },
      readStringUntil(delim) {
        const buf = injectBuffers[injectKey];
        const idx = buf.indexOf(delim);
        if (idx === -1) { const s = buf.join(''); injectBuffers[injectKey] = []; return s; }
        const s = buf.slice(0, idx + 1).join('');
        injectBuffers[injectKey] = buf.slice(idx + 1);
        return s;
      },
      parseInt() {
        const s = this.readString();
        return parseInt(s) || 0;
      },
      parseFloat() {
        const s = this.readString();
        return parseFloat(s) || 0.0;
      },
      flush() { outBuffer.length = 0; },
    };

    function _flush(data) {
      // Tampilkan di Serial Monitor UI
      serialOut(data.replace(/\n$/, ''));
      // Kirim ke board lain via UART jika ada koneksi
      if (txPin) busRouter.uartSend(board.id, txPin, data);
    }
  }

  const Serial  = makeSerial('Serial',  'serial',  boardDef.pins.uart?.[0]?.tx ?? 1);
  const Serial1 = makeSerial('Serial1', 'serial1', boardDef.pins.uart?.[1]?.tx ?? null);
  const Serial2 = makeSerial('Serial2', 'serial2', boardDef.pins.uart?.[2]?.tx ?? null);

  // SoftwareSerial — bisa pakai pin custom
  class SoftwareSerial {
    constructor(rxPin, txPin) {
      this._rx = rxPin; this._tx = txPin;
      this._buf = [];
      this._inner = makeSerial(`SwSerial(${rxPin},${txPin})`, 'serial', txPin);
    }
    begin(b)      { this._inner.begin(b); }
    print(v)      { this._inner.print(v); }
    println(v)    { this._inner.println(v); }
    available()   { return this._inner.available(); }
    read()        { return this._inner.read(); }
    readString()  { return this._inner.readString(); }
  }

  // ─── Wire (I2C) API ──────────────────────────────────────────────────────────

  let i2cTxBuffer = [];
  let i2cAddress  = 0;
  const Wire = {
    begin(addr) {
      if (addr !== undefined) {
        // Slave mode
        i2cAddress = addr;
        serialOut(`[I2C] Slave mode, addr: 0x${addr.toString(16).toUpperCase()}`);
      } else {
        serialOut('[I2C] Master mode');
      }
    },
    onRequest(fn)  { i2cRequestHandler = fn; },
    onReceive(fn)  { i2cReceiveHandler = fn; },
    beginTransmission(addr) { i2cAddress = addr; i2cTxBuffer = []; },
    write(val) {
      if (Array.isArray(val)) i2cTxBuffer.push(...val);
      else i2cTxBuffer.push(val);
    },
    async endTransmission() {
      await busRouter.i2cBeginTransmission(board.id, i2cAddress, [...i2cTxBuffer]);
      i2cTxBuffer = [];
      return 0;
    },
    async requestFrom(addr, numBytes) {
      const data = await busRouter.i2cRequestFrom(board.id, addr, numBytes);
      injectBuffers.i2cReceive = Array.from(data);
      return data.length;
    },
    available() { return injectBuffers.i2cReceive.length; },
    read() {
      if (!injectBuffers.i2cReceive.length) return -1;
      return injectBuffers.i2cReceive.shift();
    },
  };

  // ─── Tone API ─────────────────────────────────────────────────────────────────

  function tone(pin, frequency, duration) {
    toneFreq = frequency;
    pinStates[pin] = { ...pinStates[pin], tone: frequency };
    _notifyPinChange(pin);
    if (duration) setTimeout(() => noTone(pin), duration);
    serialOut(`[tone] pin ${pin}: ${frequency}Hz`);
  }
  function noTone(pin) {
    toneFreq = 0;
    if (pinStates[pin]) pinStates[pin].tone = 0;
    _notifyPinChange(pin);
  }

  // ─── Math & Utility API ──────────────────────────────────────────────────────

  function map(value, fromLow, fromHigh, toLow, toHigh) {
    return (value - fromLow) * (toHigh - toLow) / (fromHigh - fromLow) + toLow;
  }
  function constrain(x, a, b) { return Math.min(Math.max(x, a), b); }
  function random(min, max)    { if (max === undefined) { max = min; min = 0; } return Math.floor(Math.random() * (max - min)) + min; }
  function randomSeed(seed)    { /* tidak diimplementasikan */ }
  function abs(x)    { return Math.abs(x); }
  function sq(x)     { return x * x; }
  function sqrt(x)   { return Math.sqrt(x); }
  function pow(b, e) { return Math.pow(b, e); }
  function max(a, b) { return Math.max(a, b); }
  function min(a, b) { return Math.min(a, b); }
  function sin(x)    { return Math.sin(x); }
  function cos(x)    { return Math.cos(x); }
  function tan(x)    { return Math.tan(x); }
  function radians(deg) { return deg * Math.PI / 180; }
  function degrees(rad) { return rad * 180 / Math.PI; }
  const PI = Math.PI;
  const HIGH = 1, LOW = 0, INPUT = 'INPUT', OUTPUT = 'OUTPUT', INPUT_PULLUP = 'INPUT_PULLUP';

  function pulseIn(pin, state, timeout = 1000000) {
    // Simulasi: kembalikan nilai dari pin state (untuk HC-SR04)
    const ps = pinStates[pin];
    if (!ps) return 0;
    // HC-SR04: nilai jarak (cm) → waktu (µs) = jarak * 58.2
    return (ps.inputValue ?? 50) * 58.2;
  }

  // ─── Inject dari luar (board lain / sensor UI) ────────────────────────────────

  function injectSerial(data)     { data.split('').forEach(c => injectBuffers.serial.push(c)); }
  function injectSerial1(data)    { data.split('').forEach(c => injectBuffers.serial1.push(c)); }
  function injectSerial2(data)    { data.split('').forEach(c => injectBuffers.serial2.push(c)); }
  function injectBluetooth(data)  { data.split('').forEach(c => injectBuffers.bluetooth.push(c)); }
  function injectNRF24(data)      { injectBuffers.nrf24 = data; }

  function handleI2CRequest(address, numBytes) {
    // Board lain minta data → panggil onRequest handler
    const arr = new Uint8Array(numBytes);
    if (i2cRequestHandler) {
      // Set Wire.write buffer, kemudian panggil handler
      i2cTxBuffer = [];
      i2cRequestHandler();
      for (let i = 0; i < numBytes && i < i2cTxBuffer.length; i++) arr[i] = i2cTxBuffer[i];
    }
    return arr;
  }

  function handleI2CReceive(address, data) {
    if (i2cReceiveHandler) {
      injectBuffers.i2cReceive = [...data];
      i2cReceiveHandler(data.length);
    }
  }

  function handleSPITransfer(byte) { return 0xFF; }

  // ─── Sandbox Executor ─────────────────────────────────────────────────────────

  let _setupFn = null, _loopFn = null;

  function _buildContext() {
    return {
      // Pin
      pinMode, digitalWrite, digitalRead, analogWrite, analogRead,
      // Time
      delay, delayMicroseconds, millis, micros,
      // Serial
      Serial, Serial1, Serial2, SoftwareSerial,
      // Wire (I2C)
      Wire,
      // Tone
      tone, noTone,
      // Math
      map, constrain, random, randomSeed,
      abs, sq, sqrt, pow, max, min, sin, cos, tan, radians, degrees, PI,
      pulseIn,
      // Constants
      HIGH, LOW, INPUT, OUTPUT, INPUT_PULLUP,
      // String constructor
      String: (v) => String(v),
      parseInt, parseFloat,
    };
  }

  function _parseCode(code) {
    // Transpile minimal C++ → JavaScript
    let js = code
      // Remove includes (library classes diimplementasikan sebagai modul terpisah)
      .replace(/#include\s*<[^>]+>/g, '')
      .replace(/#define\s+(\w+)\s+(.+)/g, 'const $1 = $2;')
      .replace(/\/\/[^\n]*/g, m => m)        // pertahankan komentar //
      .replace(/\/\*[\s\S]*?\*\//g, '')       // hapus /* */
      // Tipe data C++ → JavaScript
      .replace(/\b(int|long|float|double|byte|unsigned int|unsigned long|char|bool|boolean|uint8_t|uint16_t|uint32_t|int8_t|int16_t|int32_t)\s+/g, 'let ')
      .replace(/\bString\s+/g, 'let ')
      .replace(/\bvoid\s+(setup|loop)\s*\(\s*\)/g, 'async function $1()')
      .replace(/\bvoid\s+(\w+)\s*\(/g, 'async function $1(')
      .replace(/\bint\s+(\w+)\s*\(/g, 'async function $1(')
      .replace(/\bfloat\s+(\w+)\s*\(/g, 'async function $1(')
      .replace(/\bdelay\s*\(/g, 'await delay(')
      .replace(/\.endTransmission\s*\(/g, 'await (Wire.endTransmission)(')
      .replace(/\.requestFrom\s*\(/g, 'await (Wire.requestFrom)(')
      // String methods
      .replace(/\.length\(\)/g, '.length')
      .replace(/String\((\w+)\)/g, 'String($1)');

    return js;
  }

  async function setup() {
    const ctx = _buildContext();
    const code = _parseCode(board.code);
    try {
      const AsyncFunction = Object.getPrototypeOf(async function(){}).constructor;
      const contextArgs   = Object.keys(ctx);
      const contextVals   = Object.values(ctx);
      const fn = new AsyncFunction(...contextArgs, `${code}\nawait setup();`);
      await fn(...contextVals);
      // Extract loop function dari closure
      const loopFn = new AsyncFunction(...contextArgs, `${code}\nawait loop();`);
      _loopFn = async () => loopFn(...contextVals);
    } catch (e) {
      throw new Error(`Setup error: ${e.message}`);
    }
  }

  async function loop() {
    simTime += loopDelay || 10;
    if (_loopFn) await _loopFn();
  }

  return {
    setup, loop, loopDelay,
    // Inject API untuk board lain / sensor UI
    injectSerial, injectSerial1, injectSerial2, injectBluetooth, injectNRF24,
    handleI2CRequest, handleI2CReceive, handleSPITransfer,
    setPinInputValue,
    cleanup() { _setupFn = null; _loopFn = null; },
  };
}

module.exports = { createRuntime };
