/**
 * CircuitForge — editor.js
 * CodeMirror-based C++ code editor with Arduino API autocomplete
 */

class CFEditor {
  constructor(containerEl) {
    this.containerEl = containerEl;
    this.boards = {};       // boardId -> {code, errorMarks}
    this.activeBoardId = null;
    this.onChange = null;   // callback(boardId, code)
    this._cm = null;
    this._init();
  }

  _init() {
    const starterCode = `// CircuitForge — Kode Arduino
// Pilih board di atas untuk mulai coding

void setup() {
  Serial.begin(115200);
  Serial.println("CircuitForge siap!");
  pinMode(LED_BUILTIN, OUTPUT);
}

void loop() {
  digitalWrite(LED_BUILTIN, HIGH);
  delay(500);
  digitalWrite(LED_BUILTIN, LOW);
  delay(500);
}
`;
    this._cm = CodeMirror(this.containerEl, {
      value: starterCode,
      mode: 'text/x-c++src',
      theme: 'dracula',
      lineNumbers: true,
      matchBrackets: true,
      autoCloseBrackets: true,
      indentUnit: 2, tabSize: 2, indentWithTabs: false,
      lineWrapping: false,
      extraKeys: {
        'Ctrl-/': cm => cm.execCommand('toggleComment'),
        'Ctrl-Space': 'autocomplete',
        'Alt-Shift-F': () => this.format(),
      },
      hintOptions: { hint: this._arduinoHint.bind(this), completeSingle: false },
    });

    this._cm.on('change', () => {
      if (this.activeBoardId) {
        if (!this.boards[this.activeBoardId]) this.boards[this.activeBoardId] = {};
        this.boards[this.activeBoardId].code = this._cm.getValue();
        const dot = document.getElementById('unsavedDot');
        if (dot) dot.style.display = 'inline';
      }
      if (this.onChange && this.activeBoardId) {
        this.onChange(this.activeBoardId, this._cm.getValue());
      }
    });

    this._cm.on('inputRead', (cm, change) => {
      if (change.origin !== '+input') return;
      const tok = cm.getTokenAt(cm.getCursor());
      if (tok.string.length >= 2 && /\w/.test(tok.string)) {
        CodeMirror.commands.autocomplete(cm, null, { completeSingle: false });
      }
    });

    console.log('[Editor] CodeMirror initialized');
  }

  _arduinoHint(cm) {
    const cur = cm.getCursor();
    const token = cm.getTokenAt(cur);
    const word = token.string.toLowerCase();
    const keywords = [
      'setup','loop','delay','millis','micros','delayMicroseconds',
      'pinMode','digitalWrite','digitalRead','analogWrite','analogRead','analogReadResolution',
      'attachInterrupt','detachInterrupt','interrupts','noInterrupts',
      'pulseIn','shiftIn','shiftOut','tone','noTone',
      'random','randomSeed','map','constrain','abs','min','max','pow','sqrt',
      'lowByte','highByte','bitRead','bitWrite','bitSet','bitClear','bit',
      'Serial','Serial1','Serial2','Serial.begin','Serial.print','Serial.println',
      'Serial.read','Serial.available','Serial.write','Serial.flush','Serial.end',
      'Serial.parseInt','Serial.parseFloat','Serial.readString','Serial.readStringUntil',
      'Wire','Wire.begin','Wire.beginTransmission','Wire.endTransmission',
      'Wire.requestFrom','Wire.write','Wire.read','Wire.available','Wire.setClock',
      'SPI','SPI.begin','SPI.beginTransaction','SPI.endTransaction','SPI.transfer',
      'Servo','servo.attach','servo.write','servo.read','servo.detach','servo.writeMicroseconds',
      'EEPROM','EEPROM.read','EEPROM.write','EEPROM.update','EEPROM.get','EEPROM.put',
      'int','float','double','char','byte','bool','boolean','long','unsigned int',
      'String','const','void','return','if','else','for','while','do','switch','case','break',
      'HIGH','LOW','INPUT','OUTPUT','INPUT_PULLUP','LED_BUILTIN',
      'A0','A1','A2','A3','A4','A5','true','false','NULL','PI',
      'CHANGE','RISING','FALLING','LSBFIRST','MSBFIRST',
      'WiFi','WiFi.begin','WiFi.status','WiFi.localIP','WiFi.RSSI','WL_CONNECTED',
      'Blynk','Blynk.begin','Blynk.run','Blynk.virtualWrite','Blynk.syncVirtual',
      'BLYNK_WRITE','BLYNK_READ','BLYNK_CONNECTED',
      'PubSubClient','client.connect','client.publish','client.subscribe','client.loop',
      'DHT','dht.begin','dht.readTemperature','dht.readHumidity','DHT22','DHT11',
      'Adafruit_SSD1306','display.begin','display.clearDisplay','display.setCursor',
      'display.print','display.display','display.setTextSize','display.setTextColor',
      'LiquidCrystal_I2C','lcd.begin','lcd.backlight','lcd.clear','lcd.setCursor','lcd.print',
      'NewPing','sonar.ping_cm','sonar.ping_median',
      'MPU6050','mpu.initialize','mpu.getMotion6','mpu.getTemperature',
      'Adafruit_NeoPixel','strip.begin','strip.show','strip.setPixelColor',
      'strip.Color','strip.fill','strip.setBrightness',
      'AccelStepper','stepper.moveTo','stepper.move','stepper.run','stepper.runToPosition',
      'stepper.setMaxSpeed','stepper.setAcceleration','stepper.currentPosition','stepper.stop',
    ];
    const matches = keywords.filter(k => k.toLowerCase().startsWith(word) && k !== word);
    return {
      list: matches,
      from: CodeMirror.Pos(cur.line, token.start),
      to: CodeMirror.Pos(cur.line, cur.ch)
    };
  }

  setActiveBoard(boardId, label) {
    if (this.activeBoardId && this._cm) {
      if (!this.boards[this.activeBoardId]) this.boards[this.activeBoardId] = {};
      this.boards[this.activeBoardId].code = this._cm.getValue();
    }
    this.activeBoardId = boardId;
    if (!this.boards[boardId]) {
      this.boards[boardId] = {
        code: `// CircuitForge — ${label || boardId}\n\nvoid setup() {\n  Serial.begin(115200);\n  Serial.println("${label || boardId} ready!");\n}\n\nvoid loop() {\n  // Write code here\n  delay(1000);\n}\n`,
        errorMarks: []
      };
    }
    this._cm.setValue(this.boards[boardId].code);
    this._cm.clearHistory();
    setTimeout(() => this._cm.focus(), 50);
  }

  getCode(boardId) {
    const id = boardId || this.activeBoardId;
    if (!id) return '';
    if (id === this.activeBoardId && this._cm) return this._cm.getValue();
    return (this.boards[id] || {}).code || '';
  }

  setValue(code, boardId) {
    const id = boardId || this.activeBoardId;
    if (id && this.boards[id]) this.boards[id].code = code;
    if (!boardId || boardId === this.activeBoardId) this._cm.setValue(code);
  }

  markError(line, msg) {
    if (!this._cm || !this.activeBoardId) return;
    const lineIdx = parseInt(line) - 1;
    if (isNaN(lineIdx) || lineIdx < 0 || lineIdx >= this._cm.lineCount()) return;
    const mark = this._cm.markText(
      { line: lineIdx, ch: 0 },
      { line: lineIdx, ch: this._cm.getLine(lineIdx).length },
      { className: 'cm-error-line', title: msg }
    );
    if (!this.boards[this.activeBoardId].errorMarks) this.boards[this.activeBoardId].errorMarks = [];
    this.boards[this.activeBoardId].errorMarks.push(mark);
    const marker = document.createElement('div');
    marker.style.cssText = 'color:#ef4444;font-size:12px;line-height:1;margin-top:3px;';
    marker.title = msg; marker.textContent = '⬤';
    this._cm.setGutterMarker(lineIdx, 'CodeMirror-linenumbers', marker);
  }

  clearErrors() {
    if (!this.activeBoardId) return;
    const board = this.boards[this.activeBoardId];
    if (!board) return;
    (board.errorMarks || []).forEach(m => m.clear());
    board.errorMarks = [];
    this._cm.clearGutter('CodeMirror-linenumbers');
  }

  format() {
    if (!this._cm) return;
    for (let i = 0; i < this._cm.lineCount(); i++) this._cm.indentLine(i, 'smart');
  }

  resize() { if (this._cm) setTimeout(() => this._cm.refresh(), 50); }
}

window.CFEditor = CFEditor;
console.log('[Editor] Module loaded');
