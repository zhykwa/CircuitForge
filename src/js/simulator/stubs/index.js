/**
 * CircuitForge — simulator/stubs/index.js
 * Registry + shared helpers for all library simulation stubs
 */

// ── Global Stub Registry ─────────────────────────────────────────────
window.AVAILABLE_STUBS = {};

// ── Gaussian Random (Box-Muller) ─────────────────────────────────────
window._gaussianRandom = function(mean, std) {
  if (std <= 0) return mean;
  let u = 0, v = 0;
  while (u === 0) u = Math.random();
  while (v === 0) v = Math.random();
  return mean + std * Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v);
};

// ── Simulated Sensor Values (editable via UI sliders) ────────────────
window._cf_pinSimValues = {};  // { "pinId": { value, channel1, channel2, ... } }

window._getSimValue = function(pinOrId, channel) {
  const state = window._cf_pinSimValues[String(pinOrId)];
  if (!state) return null;
  return state[channel] !== undefined ? state[channel] : (state.value !== undefined ? state.value : null);
};

window._setSimValue = function(pinOrId, value, channel) {
  if (!window._cf_pinSimValues[String(pinOrId)]) window._cf_pinSimValues[String(pinOrId)] = {};
  if (channel) window._cf_pinSimValues[String(pinOrId)][channel] = value;
  else window._cf_pinSimValues[String(pinOrId)].value = value;
};

// ── Display Helpers ──────────────────────────────────────────────────
window._updateDisplay = function(i2cAddr, lines) {
  if (window._cf_scene && window._cf_scene.updateDisplayContent) {
    window._cf_scene.updateDisplayContent(String(i2cAddr), lines);
  }
};

// ── Servo Helpers ────────────────────────────────────────────────────
window._cf_servos = {};
window._updateServo3D = function(pin, angle) {
  if (window._cf_scene && window._cf_scene.updateServoAngle) {
    window._cf_scene.updateServoAngle(pin, angle);
  }
};
window._registerServo = function(pin, obj) { window._cf_servos[pin] = obj; };

// ── Stepper Helpers ──────────────────────────────────────────────────
window._updateStepper3D = function(pin, position, speed) {
  if (window._cf_scene && window._cf_scene.updateStepperPosition) {
    window._cf_scene.updateStepperPosition(pin, position, speed);
  }
};

// ── NeoPixel Helpers ─────────────────────────────────────────────────
window._neoPixelData = {};  // pin -> [{r,g,b}]
window._updateNeoPixel3D = function(pin, pixelArray) {
  window._neoPixelData[pin] = pixelArray;
  if (window._cf_scene && window._cf_scene.updateNeoPixel) {
    window._cf_scene.updateNeoPixel(pin, pixelArray);
  }
};

// ── OLED Canvas Helpers ──────────────────────────────────────────────
window._oledCanvases = {};

window._createOLEDCanvas = function(addr, w, h) {
  const c = document.createElement('canvas');
  c.width = w || 128; c.height = h || 64;
  const ctx = c.getContext('2d');
  ctx.fillStyle = '#000'; ctx.fillRect(0, 0, c.width, c.height);
  window._oledCanvases[String(addr)] = c;
  return c;
};

window._oledClear = function(canvas) {
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  ctx.fillStyle = '#000'; ctx.fillRect(0, 0, canvas.width, canvas.height);
};

window._oledPrint = function(canvas, text, x, y, size) {
  if (!canvas) return;
  size = size || 1;
  const ctx = canvas.getContext('2d');
  ctx.fillStyle = '#fff';
  ctx.font = `${7 * size}px monospace`;
  ctx.fillText(String(text), x, y + 7 * size);
};

window._oledDrawPixel = function(canvas, x, y, color) {
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  ctx.fillStyle = color ? '#fff' : '#000';
  ctx.fillRect(x, y, 1, 1);
};

window._oledDrawLine = function(canvas, x0, y0, x1, y1, color) {
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  ctx.strokeStyle = color ? '#fff' : '#000'; ctx.lineWidth = 1;
  ctx.beginPath(); ctx.moveTo(x0, y0); ctx.lineTo(x1, y1); ctx.stroke();
};

window._oledDrawRect = function(canvas, x, y, w, h, color) {
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  ctx.strokeStyle = color ? '#fff' : '#000'; ctx.lineWidth = 1;
  ctx.strokeRect(x, y, w, h);
};

window._oledFillRect = function(canvas, x, y, w, h, color) {
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  ctx.fillStyle = color ? '#fff' : '#000';
  ctx.fillRect(x, y, w, h);
};

window._oledDrawCircle = function(canvas, x, y, r, color) {
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  ctx.strokeStyle = color ? '#fff' : '#000'; ctx.lineWidth = 1;
  ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2); ctx.stroke();
};

window._oledFlush = function(canvas, addr) {
  if (!canvas) return;
  if (window._cf_scene && window._cf_scene.updateOLED) {
    window._cf_scene.updateOLED(String(addr || '0x3C'), canvas);
  }
};

// ── LCD Helpers ──────────────────────────────────────────────────────
window._cf_lcdContents = {};  // addr -> [[row0chars], [row1chars]]

window._lcdSetCursor = function(addr, col, row) {
  if (!window._cf_lcdContents[addr]) window._cf_lcdContents[addr] = { col:0, row:0, lines:['','','',''] };
  window._cf_lcdContents[addr].col = col;
  window._cf_lcdContents[addr].row = row;
};

window._lcdPrint = function(addr, text) {
  if (!window._cf_lcdContents[addr]) window._cf_lcdContents[addr] = { col:0, row:0, lines:['','','',''] };
  const lcd = window._cf_lcdContents[addr];
  let line  = lcd.lines[lcd.row] || '';
  const arr = line.split('');
  for (let i = 0; i < String(text).length; i++) {
    arr[lcd.col + i] = String(text)[i];
  }
  lcd.lines[lcd.row] = arr.join('');
  window._updateDisplay(addr, lcd.lines);
};

window._lcdClear = function(addr) {
  if (!window._cf_lcdContents[addr]) return;
  window._cf_lcdContents[addr].lines = ['','','',''];
  window._cf_lcdContents[addr].col = 0;
  window._cf_lcdContents[addr].row = 0;
  window._updateDisplay(addr, ['','','','']);
};

// ── 7-Segment Helper ─────────────────────────────────────────────────
window._update7Seg = function(pin, value) {
  if (window._cf_scene && window._cf_scene.update7Seg) {
    window._cf_scene.update7Seg(pin, String(value));
  }
};

// ── Virtual SD Filesystem ─────────────────────────────────────────────
window._cf_sdFiles = {};  // path -> content string

// ── Virtual EEPROM ────────────────────────────────────────────────────
window._cf_eeprom = new Uint8Array(4096);

// ── Encoder/Keypad registry ───────────────────────────────────────────
window._cf_encoders = {};
window._cf_keypads  = {};
window._registerEncoder = function(pin, obj) { window._cf_encoders[pin] = obj; };
window._registerKeypad  = function(pin, obj) { window._cf_keypads[pin]  = obj; };

// ── WiFi simulator state ──────────────────────────────────────────────
window._cf_wifiState = {
  connected: false, ssid: '', ip: '192.168.1.100',
  connect(ssid, pass) {
    this.ssid = ssid;
    setTimeout(() => {
      this.connected = true;
      console.log(`[WiFi] Connected to "${ssid}" IP: ${this.ip}`);
      if (window._cf_serial) window._cf_serial.log(`WiFi connected to "${ssid}" → ${this.ip}`, 'success');
    }, 1500);
  },
  disconnect() { this.connected = false; }
};

// ── MQTT Bridge ────────────────────────────────────────────────────────
window._cf_mqttBridge = {
  connected: false,
  subscriptions: {},
  connect(host, port, clientId, cb) {
    const mqttClient = window._cf_mqttClient;
    if (mqttClient) {
      mqttClient.connect(host, port, clientId);
      setTimeout(() => { this.connected = true; if (cb) cb(); }, 500);
    }
  },
  publish(topic, payload) {
    if (window._cf_mqttClient) window._cf_mqttClient.publish(topic, payload);
  },
  subscribe(topic, cb) {
    this.subscriptions[topic] = cb;
    if (window._cf_mqttClient) window._cf_mqttClient.subscribe(topic);
  },
  receive(topic, payload) {
    const cb = this.subscriptions[topic];
    if (cb) cb(topic, payload);
    Object.keys(this.subscriptions).forEach(t => {
      if (t.endsWith('#') && topic.startsWith(t.slice(0,-1))) {
        this.subscriptions[t](topic, payload);
      }
    });
  }
};

// ── Blynk Bridge ──────────────────────────────────────────────────────
window._cf_blynkBridge = {
  connected: false,
  virtualWriteHandlers: {},  // V-pin -> callback
  virtualReadHandlers: {},
  connect(token, cb) {
    console.log('[Blynk] Connecting with token:', token && token.slice(0,8) + '...');
    setTimeout(() => { this.connected = true; if (cb) cb(); }, 800);
  },
  virtualWrite(vpin, value) {
    if (window._cf_iotConsole) {
      window._cf_iotConsole.log(`[Blynk] V${vpin} → ${value}`, 'info');
    }
    // Update Blynk dashboard widgets
    if (window._cf_blynkDashboard) window._cf_blynkDashboard.update(vpin, value);
  },
  onVirtualWrite(vpin, cb) { this.virtualWriteHandlers[vpin] = cb; },
  triggerVirtualWrite(vpin, value) {
    const cb = this.virtualWriteHandlers[vpin];
    if (cb) cb(value);
  }
};

console.log('[Stubs/index] Helpers loaded');
