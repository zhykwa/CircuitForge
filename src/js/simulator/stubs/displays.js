/**
 * CircuitForge — stubs/displays.js + stubs/actuators.js + stubs/comms.js + stubs/utils.js
 * All remaining library stubs in one file
 */

// ══════════════════════════════════════════════════════════════════
//  DISPLAYS
// ══════════════════════════════════════════════════════════════════

// LCD I2C
class LiquidCrystal_I2C {
  constructor(addr, cols, rows) {
    this._addr = addr; this._cols = cols || 16; this._rows = rows || 2;
    this._canvas = null;
    console.log(`[LCD_I2C] 0x${addr.toString(16)} ${cols}x${rows}`);
  }
  init()        { _lcdClear(this._addr); }
  begin(c, r)   { this._cols = c || this._cols; this._rows = r || this._rows; _lcdClear(this._addr); }
  clear()       { _lcdClear(this._addr); }
  backlight()   {}
  noBacklight() {}
  setCursor(col, row) { _lcdSetCursor(this._addr, col, row); }
  print(val)    { _lcdPrint(this._addr, val); }
  println(val)  { _lcdPrint(this._addr, val + ''); }
  home()        { _lcdSetCursor(this._addr, 0, 0); }
  createChar(num, data) {}
  leftToRight()  {}
  rightToLeft()  {}
  autoscroll()   {}
  noAutoscroll() {}
  display()   {}
  noDisplay() {}
  cursor()    {}
  noCursor()  {}
  blink()     {}
  noBlink()   {}
  scrollDisplayLeft()  {}
  scrollDisplayRight() {}
}

class LiquidCrystal extends LiquidCrystal_I2C {
  constructor(rs, en, d4, d5, d6, d7) {
    super(0x00, 16, 2);
    this._pins = { rs, en, d4, d5, d6, d7 };
  }
}

window.AVAILABLE_STUBS['LiquidCrystal_I2C'] = { LiquidCrystal_I2C };
window.AVAILABLE_STUBS['LiquidCrystal'] = { LiquidCrystal };

// OLED SSD1306
class Adafruit_SSD1306 {
  constructor(w, h, wire, rst) {
    this._w = w || 128; this._h = h || 64; this._addr = 0x3C;
    this._canvas = null;
    console.log(`[SSD1306] ${w}x${h}`);
  }
  begin(vccstate, i2caddr, reset) {
    this._addr = i2caddr || 0x3C;
    this._canvas = _createOLEDCanvas(this._addr, this._w, this._h);
    return true;
  }
  clearDisplay()    { if (this._canvas) _oledClear(this._canvas); }
  display()         { if (this._canvas) _oledFlush(this._canvas, this._addr); }
  setCursor(x, y)   { this._cx = x; this._cy = y; }
  setTextSize(s)    { this._textSize = s; }
  setTextColor(c)   { this._textColor = c; }
  print(val)        { if (this._canvas) _oledPrint(this._canvas, val, this._cx || 0, this._cy || 0, this._textSize || 1); }
  println(val)      { this.print(val); this._cy = (this._cy || 0) + 9 * (this._textSize || 1); }
  drawPixel(x,y,c) { if (this._canvas) _oledDrawPixel(this._canvas, x, y, c); }
  drawLine(x0,y0,x1,y1,c) { if (this._canvas) _oledDrawLine(this._canvas, x0,y0,x1,y1,c); }
  drawRect(x,y,w,h,c)     { if (this._canvas) _oledDrawRect(this._canvas, x,y,w,h,c); }
  fillRect(x,y,w,h,c)     { if (this._canvas) _oledFillRect(this._canvas, x,y,w,h,c); }
  drawCircle(x,y,r,c)     { if (this._canvas) _oledDrawCircle(this._canvas, x,y,r,c); }
  fillCircle(x,y,r,c) {
    if (!this._canvas) return;
    const ctx = this._canvas.getContext('2d');
    ctx.fillStyle = c ? '#fff' : '#000'; ctx.beginPath(); ctx.arc(x,y,r,0,Math.PI*2); ctx.fill();
  }
  drawBitmap(x,y,bitmap,w,h,c) {}
  getWidth()  { return this._w; }
  getHeight() { return this._h; }
  dim(d) {}
  invertDisplay(i) {}
  WHITE = 1; BLACK = 0; INVERSE = 2;
  SSD1306_SWITCHCAPVCC = 0x02;
}
class Adafruit_SH110X extends Adafruit_SSD1306 {}

window.AVAILABLE_STUBS['Adafruit_SSD1306'] = { Adafruit_SSD1306, SSD1306_SWITCHCAPVCC: 2, WHITE:1, BLACK:0, INVERSE:2 };
window.AVAILABLE_STUBS['Adafruit_SH110X'] = { Adafruit_SH110X };

// TM1637 7-Segment
class TM1637Display {
  constructor(clkPin, dioPin) { this._clk = clkPin; this._dio = dioPin; this._brightness = 7; }
  begin()  {}
  setBrightness(b, on) { this._brightness = b; }
  showNumberDec(num, leading, len, pos) { _update7Seg(this._clk, num); }
  showNumberDecEx(num, dots, leading, len, pos) { _update7Seg(this._clk, num); }
  clear() { _update7Seg(this._clk, '    '); }
  setSegments(seg, len, pos) {}
  encodeDigit(d) { return d; }
}
window.AVAILABLE_STUBS['TM1637Display'] = { TM1637Display };

// MAX7219 LED Matrix
class LedControl {
  constructor(dataPin, clkPin, csPin, numDevices) {
    this._data = dataPin; this._clk = clkPin; this._cs = csPin; this._n = numDevices || 1;
    this._matrix = Array.from({length: this._n}, () => new Uint8Array(8));
  }
  begin()  {}
  shutdown(addr, status)  {}
  setIntensity(addr, intensity) {}
  clearDisplay(addr) { if (this._matrix[addr]) this._matrix[addr].fill(0); }
  setLed(addr, row, col, state) {
    if (!this._matrix[addr]) return;
    if (state) this._matrix[addr][row] |= (1 << (7 - col));
    else this._matrix[addr][row] &= ~(1 << (7 - col));
    if (window._cf_scene) window._cf_scene.updateLEDMatrix(this._data, this._matrix);
  }
  setRow(addr, row, value) {
    if (!this._matrix[addr]) return;
    this._matrix[addr][row] = value;
    if (window._cf_scene) window._cf_scene.updateLEDMatrix(this._data, this._matrix);
  }
  setColumn(addr, col, value) {
    for (let r = 0; r < 8; r++) this.setLed(addr, r, col, !!(value & (1 << (7-r))));
  }
}
window.AVAILABLE_STUBS['LedControl'] = { LedControl };

// Adafruit NeoPixel
class Adafruit_NeoPixel {
  constructor(numLeds, pin, type) {
    this._n = numLeds; this._pin = pin; this._type = type;
    this._pixels = new Uint32Array(numLeds);
    console.log(`[NeoPixel] ${numLeds} LEDs on pin ${pin}`);
  }
  begin() {}
  show() { _updateNeoPixel3D(this._pin, Array.from(this._pixels).map(c => ({r:(c>>16)&0xff, g:(c>>8)&0xff, b:c&0xff}))); }
  setPixelColor(n, r, g, b) {
    if (typeof r === 'number' && g === undefined) { this._pixels[n] = r; return; }
    this._pixels[n] = ((r&0xff)<<16)|((g&0xff)<<8)|(b&0xff);
  }
  Color(r, g, b) { return ((r&0xff)<<16)|((g&0xff)<<8)|(b&0xff); }
  ColorHSV(hue, sat, val) {
    hue = (hue % 65536 + 65536) % 65536;
    const h = hue / 65536 * 6;
    const i = Math.floor(h); const f = h - i;
    const p = val*(1-sat/255); const q = val*(1-f*sat/255); const t = val*(1-(1-f)*sat/255);
    let r,g,b;
    switch(i%6){ case 0: r=val;g=t;b=p;break; case 1: r=q;g=val;b=p;break;
      case 2: r=p;g=val;b=t;break; case 3: r=p;g=q;b=val;break;
      case 4: r=t;g=p;b=val;break; default: r=val;g=p;b=q; }
    return this.Color(r,g,b);
  }
  fill(color, first, count) {
    first = first || 0; count = count || this._n;
    for (let i = first; i < first + count; i++) this._pixels[i] = color;
  }
  setBrightness(b) {}
  clear() { this._pixels.fill(0); }
  numPixels() { return this._n; }
  getPixelColor(n) { return this._pixels[n] || 0; }
  NEO_GRB = 0x52; NEO_RGB = 0x06; NEO_KHZ800 = 0x0000;
}
window.AVAILABLE_STUBS['Adafruit_NeoPixel'] = { Adafruit_NeoPixel };

// ══════════════════════════════════════════════════════════════════
//  ACTUATORS
// ══════════════════════════════════════════════════════════════════

class Servo {
  constructor() { this._pin = -1; this._angle = 90; this._us = 1500; }
  attach(pin, min, max) {
    this._pin = pin;
    _registerServo(pin, this);
    console.log(`[Servo] Attached to pin ${pin}`);
  }
  detach() { this._pin = -1; }
  write(angle) {
    this._angle = Math.max(0, Math.min(180, angle));
    _updateServo3D(this._pin, this._angle);
  }
  writeMicroseconds(us) {
    this._us = us;
    this._angle = (us - 1000) / 1000 * 180;
    _updateServo3D(this._pin, this._angle);
  }
  read() { return this._angle; }
  readMicroseconds() { return this._us; }
  attached() { return this._pin >= 0; }
}
window.AVAILABLE_STUBS['Servo'] = { Servo };
window.AVAILABLE_STUBS['ESP32Servo'] = { Servo };  // ESP32Servo has same API

class Stepper {
  constructor(steps, pin1, pin2, pin3, pin4) {
    this._steps = steps; this._pins = [pin1, pin2, pin3, pin4];
    this._speed = 10; this._pos = 0;
  }
  setSpeed(rpm) { this._speed = rpm; }
  step(steps) {
    this._pos += steps;
    _updateStepper3D(this._pins[0], this._pos, this._speed);
  }
}

class AccelStepper {
  constructor(iface, pin1, pin2, pin3, pin4) {
    this._pos = 0; this._target = 0; this._maxSpeed = 1000; this._accel = 100; this._speed = 0;
    this._pin = pin1;
  }
  setMaxSpeed(speed)    { this._maxSpeed = speed; }
  setAcceleration(accel){ this._accel = accel; }
  setSpeed(speed)       { this._speed = speed; }
  moveTo(pos)           { this._target = pos; }
  move(dist)            { this._target = this._pos + dist; }
  run()                 { if (this._pos !== this._target) { this._pos += Math.sign(this._target-this._pos); _updateStepper3D(this._pin, this._pos, this._speed); return true; } return false; }
  runToPosition()       { this._pos = this._target; _updateStepper3D(this._pin, this._pos, 0); }
  runSpeedToPosition()  { return this.run(); }
  runSpeed()            { this._pos++; return true; }
  stop()                { this._target = this._pos; }
  currentPosition()     { return this._pos; }
  distanceToGo()        { return this._target - this._pos; }
  targetPosition()      { return this._target; }
  speed()               { return this._speed; }
  setCurrentPosition(p) { this._pos = p; }
  enableOutputs()       {}
  disableOutputs()      {}
  DRIVER = 1; FULL2WIRE = 2; FULL4WIRE = 4; HALF4WIRE = 8;
}
window.AVAILABLE_STUBS['Stepper']     = { Stepper };
window.AVAILABLE_STUBS['AccelStepper']= { AccelStepper };

// ══════════════════════════════════════════════════════════════════
//  COMMUNICATIONS
// ══════════════════════════════════════════════════════════════════

// MQTT PubSubClient
class PubSubClient {
  constructor(client) { this._client = client; this._connected = false; this._cb = null; }
  setServer(host, port) { this._host = host; this._port = port; }
  setCallback(cb)       { this._cb = cb; if (window._cf_mqttBridge) window._cf_mqttBridge.onMessage = cb; }
  connect(id, user, pass, willTopic, willQos, willRetain, willMsg) {
    window._cf_mqttBridge.connect(this._host, this._port, id, () => { this._connected = true; });
    return true;
  }
  connected()           { return window._cf_mqttBridge.connected; }
  loop()                { return true; }
  publish(topic, payload, retained, qos) {
    window._cf_mqttBridge.publish(topic, payload);
    return true;
  }
  subscribe(topic, qos) { window._cf_mqttBridge.subscribe(topic, (t,p) => { if (this._cb) this._cb(t, p, p.length); }); return true; }
  unsubscribe(topic)    { return true; }
  disconnect()          { this._connected = false; }
}
window.AVAILABLE_STUBS['PubSubClient'] = { PubSubClient };

// Blynk
const _BlynkObject = {
  begin(token, ...args) { window._cf_blynkBridge.connect(token); },
  run()           {},
  connected()     { return window._cf_blynkBridge.connected; },
  virtualWrite(vpin, val) { window._cf_blynkBridge.virtualWrite(vpin, val); },
  syncVirtual(vpin) {},
  setProperty(vpin, prop, val) {},
  notify(msg)     { console.log('[Blynk] Notify:', msg); },
  email(to, subj, body) { console.log('[Blynk] Email:', to, subj); },
};
window.Blynk = _BlynkObject;
window.AVAILABLE_STUBS['Blynk'] = { Blynk: _BlynkObject };

// WiFi (ESP32/ESP8266)
const _WiFiObject = {
  mode(m) {},
  begin(ssid, pass) { window._cf_wifiState.connect(ssid, pass); },
  status() { return window._cf_wifiState.connected ? 3 : 0; }, // 3=WL_CONNECTED
  localIP()   { return { toString() { return window._cf_wifiState.ip; } }; },
  RSSI()      { return -55 + (_gaussianRandom(0, 5) | 0); },
  SSID()      { return window._cf_wifiState.ssid; },
  disconnect() { window._cf_wifiState.disconnect(); },
  setHostname(h) {},
  macAddress() { return '24:6F:28:AB:CD:EF'; },
  AP: 2, STA: 1, AP_STA: 3,
};
window.WiFi = _WiFiObject;
window.AVAILABLE_STUBS['WiFi'] = { WiFi: _WiFiObject };

// HTTPClient
class HTTPClient {
  begin(url, cert) { this._url = url; }
  GET() {
    console.log('[HTTP] GET', this._url);
    // Simulate via fetch in background
    if (this._url) fetch(this._url).then(r => r.text()).then(t => {
      this._response = t; this._code = 200;
    }).catch(e => { this._code = -1; });
    return 200;
  }
  POST(payload) { console.log('[HTTP] POST', this._url, payload); return 200; }
  getString() { return this._response || '{"status":"ok"}'; }
  getResponseCode() { return this._code || 200; }
  end() {}
  addHeader(name, val) {}
  setTimeout(ms) {}
}
window.AVAILABLE_STUBS['HTTPClient'] = { HTTPClient };

// ArduinoJson
class StaticJsonDocument {
  constructor(capacity) { this._data = {}; this._capacity = capacity; }
  operator() { return this._data; }
}
class DynamicJsonDocument extends StaticJsonDocument {}

function serializeJson(doc, output) {
  const str = JSON.stringify(doc._data || doc);
  if (output && output.print) output.print(str);
  return str;
}
function deserializeJson(doc, json) {
  try { doc._data = JSON.parse(json); doc._error = null; }
  catch(e) { doc._error = e.message; }
  return { type: () => 0, c_str: () => '' };
}
function serializeJsonPretty(doc, output) { return serializeJson(doc, output); }

window.AVAILABLE_STUBS['ArduinoJson'] = {
  StaticJsonDocument, DynamicJsonDocument, serializeJson, deserializeJson, serializeJsonPretty
};

// RF24
class RF24 {
  constructor(cePin, csnPin) { this._ce = cePin; this._csn = csnPin; }
  begin()   { return true; }
  openReadingPipe(n, addr)  {}
  openWritingPipe(addr)     {}
  startListening() {}
  stopListening()  {}
  available()      { return false; }
  read(buf, len)   {}
  write(buf, len)  {
    if (window._cf_busRouter) window._cf_busRouter.routeNRF24(this._ce, buf, len);
    return true;
  }
  setPALevel(level)    {}
  setDataRate(rate)    {}
  setChannel(ch)       {}
  printDetails()       {}
  RF24_PA_LOW = 0; RF24_PA_HIGH = 2; RF24_PA_MAX = 3;
  RF24_250KBPS = 0; RF24_1MBPS = 1; RF24_2MBPS = 2;
}
window.AVAILABLE_STUBS['RF24'] = { RF24 };

// MFRC522 RFID
class MFRC522 {
  constructor(ssPin, rstPin) { this.SS_PIN = ssPin; this.RST_PIN = rstPin; }
  PCD_Init()          {}
  PICC_IsNewCardPresent() { return _getSimValue('RFID','cardPresent') ? true : false; }
  PICC_ReadCardSerial()   { return true; }
  uid = { uidByte: new Uint8Array([0xDE, 0xAD, 0xBE, 0xEF]), size: 4 };
  PCD_Halt()          {}
  PCD_StopCrypto1()   {}
  PCD_DumpVersionToSerial() {}
  MIFARE_Read(blockAddr, buf, size) { return 0; }
  MIFARE_Write(blockAddr, data, len) { return 0; }
  PICC_HaltA() {}
  STATUS_OK = 1;
}
window.AVAILABLE_STUBS['MFRC522'] = { MFRC522 };

// ══════════════════════════════════════════════════════════════════
//  UTILITIES
// ══════════════════════════════════════════════════════════════════

// EEPROM
const _EEPROM_OBJ = {
  read(addr)       { return window._cf_eeprom[addr] || 0; },
  write(addr, val) { window._cf_eeprom[addr] = val & 0xFF; },
  update(addr, val){ if (this.read(addr) !== (val & 0xFF)) this.write(addr, val); },
  get(addr, obj)   { /* simplified: read first byte */ return this.read(addr); },
  put(addr, obj)   { this.write(addr, typeof obj === 'number' ? obj : 0); },
  begin(size)      {},
  commit()         {},
  length()         { return window._cf_eeprom.length; },
};
window.EEPROM = _EEPROM_OBJ;
window.AVAILABLE_STUBS['EEPROM'] = { EEPROM: _EEPROM_OBJ };

// SD Card (virtual filesystem)
const _SD_OBJ = {
  begin(csPin) { return true; },
  exists(path) { return window._cf_sdFiles.hasOwnProperty(path); },
  mkdir(path)  { return true; },
  remove(path) { delete window._cf_sdFiles[path]; return true; },
  open(path, mode) {
    return {
      _path: path, _mode: mode || 'r',
      _pos: 0, _buf: window._cf_sdFiles[path] || '',
      print(v)   { window._cf_sdFiles[this._path] = (window._cf_sdFiles[this._path]||'') + v; },
      println(v) { this.print(v + '\n'); },
      write(v)   { this.print(v); },
      read()     { return this._buf.charCodeAt(this._pos++) || -1; },
      readString() { const s = this._buf; this._pos = this._buf.length; return s; },
      available(){ return this._buf.length - this._pos; },
      size()     { return (window._cf_sdFiles[this._path]||'').length; },
      close()    {},
      seek(n)    { this._pos = n; },
      position() { return this._pos; },
    };
  },
  FILE_READ: 'r', FILE_WRITE: 'w', FILE_APPEND: 'a',
};
window.SD = _SD_OBJ;
window.AVAILABLE_STUBS['SD'] = { SD: _SD_OBJ };

// Keypad
class Keypad {
  constructor(keymap, rowPins, colPins, rows, cols) {
    this._keymap = keymap; this._rowPins = rowPins; this._colPins = colPins;
    this._rows = rows; this._cols = cols;
    this._pressed = null;
    _registerKeypad(rowPins[0], this);
  }
  getKey() { return window._cf_pinSimValues['KEYPAD_PRESSED'] || null; }
  isPressed(key) { return this.getKey() === key; }
  waitForKey() { return this.getKey() || '#'; }
  NO_KEY = '\0';
}
function makeKeymap(arr) { return arr; }
window.AVAILABLE_STUBS['Keypad'] = { Keypad, makeKeymap };

// Rotary Encoder
class Encoder {
  constructor(pin1, pin2) { this._pin1 = pin1; this._pin2 = pin2; this._pos = 0; _registerEncoder(pin1, this); }
  read()          { return _getSimValue(this._pin1,'position') || this._pos; }
  write(pos)      { this._pos = pos; }
  readAndReset()  { const p = this.read(); this._pos = 0; return p; }
}
window.AVAILABLE_STUBS['Encoder'] = { Encoder };

// TimerOne
const Timer1 = {
  initialize(period) { this._period = period; },
  attachInterrupt(cb) { if (this._period) this._interval = setInterval(cb, this._period / 1000); },
  detachInterrupt()   { if (this._interval) clearInterval(this._interval); },
  setPeriod(p)        { this._period = p; },
  start()             {},
  stop()              { this.detachInterrupt(); },
  restart()           {},
};
window.Timer1 = Timer1;
window.AVAILABLE_STUBS['TimerOne'] = { Timer1 };

// SoftwareSerial
class SoftwareSerial {
  constructor(rx, tx) { this._rx = rx; this._tx = tx; }
  begin(baud) { console.log(`[SoftwareSerial] RX=${this._rx} TX=${this._tx} baud=${baud}`); }
  available()  { return 0; }
  read()       { return -1; }
  print(v)     { console.log(`[SoftSerial TX${this._tx}] ${v}`); }
  println(v)   { this.print(v); }
  write(b)     {}
  listen()     {}
  isListening(){ return true; }
  flush()      {}
  end()        {}
  readString() { return ''; }
}
window.AVAILABLE_STUBS['SoftwareSerial'] = { SoftwareSerial };

// INA219 Power Monitor
class Adafruit_INA219 {
  constructor(addr) { this._addr = addr || 0x40; }
  begin()               { return true; }
  getBusVoltage_V()     { return _getSimValue('INA219','voltage') || 5.0; }
  getCurrent_mA()       { return _getSimValue('INA219','current') || 100; }
  getPower_mW()         { return this.getBusVoltage_V() * this.getCurrent_mA(); }
  getShuntVoltage_mV()  { return this.getCurrent_mA() * 0.1; }
}
window.AVAILABLE_STUBS['Adafruit_INA219'] = { Adafruit_INA219 };

// Preferences (ESP32 NVS)
class Preferences {
  constructor() { this._ns = ''; this._data = {}; }
  begin(ns, readOnly) { this._ns = ns; const saved = localStorage.getItem(`cf_prefs_${ns}`); if(saved) this._data = JSON.parse(saved); return true; }
  end()   { localStorage.setItem(`cf_prefs_${this._ns}`, JSON.stringify(this._data)); }
  putInt(key, val)    { this._data[key] = val; }
  putFloat(key, val)  { this._data[key] = val; }
  putString(key, val) { this._data[key] = val; }
  putBool(key, val)   { this._data[key] = val; }
  getInt(key, def)    { return this._data[key] !== undefined ? this._data[key] : (def||0); }
  getFloat(key, def)  { return this._data[key] !== undefined ? this._data[key] : (def||0.0); }
  getString(key, def) { return this._data[key] !== undefined ? this._data[key] : (def||''); }
  getBool(key, def)   { return this._data[key] !== undefined ? this._data[key] : (def||false); }
  remove(key)         { delete this._data[key]; }
  clear()             { this._data = {}; }
}
window.AVAILABLE_STUBS['Preferences'] = { Preferences };

console.log('[Stubs] All display/actuator/comm/util stubs loaded');
