/**
 * CircuitForge — canvas3d/component-3d/boards-3d.js + sensors-3d.js + actuators-3d.js + displays-3d.js + robotics-3d.js
 * All 3D component models (unified for simplicity)
 */

// ── Helper function to create board PCB base ──────────────────────
function _makePCB(w, d, h, color) {
  const geo = new THREE.BoxGeometry(w, h || 0.15, d);
  const mat = window._cf_SketchMaterial ? window._cf_SketchMaterial.board(color) : new THREE.MeshLambertMaterial({ color });
  return new THREE.Mesh(geo, mat);
}

function _makeBox(w, d, h, color) {
  const geo = new THREE.BoxGeometry(w, h, d);
  const mat = window._cf_SketchMaterial ? window._cf_SketchMaterial.flat(color) : new THREE.MeshLambertMaterial({ color });
  return new THREE.Mesh(geo, mat);
}

function _makeCyl(r, h, color, segs) {
  const geo = new THREE.CylinderGeometry(r, r, h, segs || 12);
  const mat = window._cf_SketchMaterial ? window._cf_SketchMaterial.flat(color) : new THREE.MeshLambertMaterial({ color });
  return new THREE.Mesh(geo, mat);
}

// ══════════════════════════════════════════════════════════════════
//  BOARDS
// ══════════════════════════════════════════════════════════════════

class ArduinoUno3D extends CF3DComponent {
  constructor(boardId) { super('arduino:avr:uno', boardId); this.build(); }
  build() {
    const SM = window._cf_SketchMaterial;
    const C  = SM ? SM.COLORS : {};
    // PCB: 68.6 × 53.3mm → scale to 3D units (/20)
    const pcb = _makePCB(3.43, 2.665, 0.15, C.board_uno || 0x1a6b3c);
    pcb.name = 'pcb';
    this.group.add(pcb);

    // USB type-B port
    const usb = _makeBox(0.45, 0.35, 0.28, 0xaaaaaa);
    usb.position.set(-1.3, 0.2, 0); usb.name = 'usb';
    this.group.add(usb);

    // Power jack
    const jack = _makeCyl(0.15, 0.35, 0x888888, 8);
    jack.rotation.z = Math.PI / 2;
    jack.position.set(-1.3, 0.2, 0.7); jack.name = 'power_jack';
    this.group.add(jack);

    // Reset button
    const reset = _makeBox(0.15, 0.15, 0.1, 0xcc3333);
    reset.position.set(0.9, 0.15, 1.1); reset.name = 'reset_btn';
    this.group.add(reset);

    // Built-in LED (pin 13)
    const led = new THREE.Mesh(
      new THREE.SphereGeometry(0.06, 8, 8),
      new THREE.MeshBasicMaterial({ color: 0x333344 })
    );
    led.position.set(1.2, 0.13, 0.7); led.name = 'led_builtin';
    this.group.add(led);

    // ATmega328P chip
    const chip = _makeBox(0.7, 0.6, 0.15, 0x111111);
    chip.position.set(0, 0.15, 0); chip.name = 'mcu';
    this.group.add(chip);

    // Pin headers - digital (top row)
    for (let i = 0; i < 14; i++) {
      const pin = _makeCyl(0.03, 0.25, 0xd4a017, 6);
      pin.position.set(-1.4 + i * 0.2, 0.2, -1.1);
      this.group.add(pin);
      this._addPin(`D${i}`, -1.4 + i * 0.2, 0.2, -1.2);
    }
    // Analog pins
    for (let i = 0; i < 6; i++) {
      const pin = _makeCyl(0.03, 0.25, 0xd4a017, 6);
      pin.position.set(-1.0 + i * 0.2, 0.2, 1.1);
      this.group.add(pin);
      this._addPin(`A${i}`, -1.0 + i * 0.2, 0.2, 1.2);
    }
    // Power pins
    ['VCC', 'GND', '5V', '3V3'].forEach((n, i) => {
      this._addPin(n, -1.5 + i * 0.2, 0.2, 0.8);
    });

    this._addLabel('Arduino Uno', 0.5);
    console.log('[ArduinoUno3D] Built');
  }

  update(pinStates) {
    if (!pinStates) return;
    const led = this.group.getObjectByName('led_builtin');
    if (led) {
      const pin13 = pinStates['13'] || pinStates['D13'];
      const on = pin13 && pin13 !== 0 && pin13 !== false;
      led.material.color.setHex(on ? 0xffcc00 : 0x333344);
    }
  }
}

class ESP32_3D extends CF3DComponent {
  constructor(boardId) { super('esp32:esp32:esp32', boardId); this.build(); }
  build() {
    const SM = window._cf_SketchMaterial;
    const C  = SM ? SM.COLORS : {};
    // ESP32 38-pin DevKit: 51.4×28.2mm
    const pcb = _makePCB(2.57, 1.41, 0.12, C.board_esp32 || 0x2040a0);
    pcb.name = 'pcb';
    this.group.add(pcb);

    // WiFi antenna stub
    const ant = _makeBox(0.6, 0.1, 0.08, 0xcccccc);
    ant.position.set(1.0, 0.1, 0); ant.name = 'antenna';
    this.group.add(ant);

    // ESP32 chip
    const chip = _makeBox(0.55, 0.55, 0.1, 0x333333);
    chip.position.set(0, 0.1, 0); chip.name = 'esp32_chip';
    this.group.add(chip);

    // USB micro port
    const usb = _makeBox(0.3, 0.25, 0.18, 0xaaaaaa);
    usb.position.set(-1.15, 0.15, 0); usb.name = 'usb';
    this.group.add(usb);

    // Built-in LED
    const led = new THREE.Mesh(new THREE.SphereGeometry(0.05, 8, 8), new THREE.MeshBasicMaterial({ color: 0x002244 }));
    led.position.set(-0.8, 0.12, 0.5); led.name = 'led_builtin';
    this.group.add(led);

    // 19 pins each side
    for (let i = 0; i < 19; i++) {
      [0.78, -0.78].forEach((z, zi) => {
        const pin = _makeCyl(0.025, 0.2, 0xd4a017, 6);
        pin.position.set(-1.1 + i * 0.12, 0.15, z);
        this.group.add(pin);
        const names = zi === 0 ?
          ['GND','D23','D22','TX0','RX0','D21','D19','D18','D5','D17','D16','D4','D0','D2','D15','SD1','SD0','CLK','SD3'] :
          ['3V3','EN','VP','VN','D34','D35','D32','D33','D25','D26','D27','D14','D12','GND','D13','SD2','CMD','5V','GND'];
        if (names[i]) this._addPin(names[i], -1.1 + i * 0.12, 0.15, z + (zi ? -0.1 : 0.1));
      });
    }

    this._addLabel('ESP32', 0.45);
    console.log('[ESP32_3D] Built');
  }

  update(pinStates) {
    if (!pinStates) return;
    const led = this.group.getObjectByName('led_builtin');
    if (led) {
      const v = pinStates['2'] || pinStates['D2'];
      led.material.color.setHex(v ? 0x0088ff : 0x002244);
    }
  }
}

// Generic small sensor board
class GenericSensor3D extends CF3DComponent {
  constructor(compId, boardId, opts) {
    super(compId, boardId);
    this._opts = opts || {};
    this.build();
  }
  build() {
    const o = this._opts;
    const pcb = _makePCB(o.w || 1.2, o.d || 0.8, 0.1, o.pcbColor || 0x1a3020);
    pcb.name = 'pcb';
    this.group.add(pcb);

    // Main chip/sensor body
    const body = _makeBox(o.bodyW || 0.5, o.bodyD || 0.4, o.bodyH || 0.15, o.bodyColor || 0x111111);
    body.position.y = 0.12;
    body.name = 'body';
    this.group.add(body);

    // LED indicator
    if (o.hasLED !== false) {
      const led = new THREE.Mesh(new THREE.SphereGeometry(0.04, 8, 8), new THREE.MeshBasicMaterial({ color: 0x333344 }));
      led.position.set(0.4, 0.12, 0.25); led.name = 'led_status';
      this.group.add(led);
    }

    // Extra geometry
    if (o.extraBuild) o.extraBuild(this);

    // Default pins
    const pins = o.pins || [['VCC',0,'l'],['GND',1,'l'],['DATA',2,'l'],['SCL',3,'l']];
    const spacing = 0.18;
    pins.forEach(([name, idx, side], i) => {
      const x = side === 'l' ? -(o.w || 1.2) / 2 - 0.1 : (o.w || 1.2) / 2 + 0.1;
      const z = -spacing * (pins.length / 2 - i - 0.5);
      this._addPin(name, x, 0, z);
    });

    this._addLabel(o.label || this.compId, 0.3);
  }
}

// DHT22
class DHT22_3D extends GenericSensor3D {
  constructor(boardId) {
    super('DHT22', boardId, {
      w: 0.8, d: 1.2, bodyW: 0.6, bodyD: 0.8, bodyH: 0.4,
      pcbColor: 0xdddddd, bodyColor: 0xfafafa,
      pins: [['VCC',0,'l'],['DATA',1,'l'],['NC',2,'l'],['GND',3,'l']],
      label: 'DHT22', hasLED: false,
    });
  }
}

// HC-SR04 Ultrasonic
class HCSR04_3D extends CF3DComponent {
  constructor(boardId) { super('HC-SR04', boardId); this.build(); }
  build() {
    const pcb = _makePCB(2.2, 0.9, 0.12, 0x2233aa);
    pcb.name = 'pcb'; this.group.add(pcb);
    // Two transducer cylinders
    [-0.5, 0.5].forEach((z, i) => {
      const cyl = _makeCyl(0.28, 0.35, 0xaaaaaa);
      cyl.position.set(0.6, 0.25, z); cyl.name = `trans${i}`;
      const front = _makeCyl(0.2, 0.02, 0x111111);
      front.position.set(0, 0.18, 0);
      cyl.add(front);
      this.group.add(cyl);
    });
    ['VCC','TRIG','ECHO','GND'].forEach((n,i) => this._addPin(n, -0.8 + i * 0.2, 0.2, -0.55));
    this._addLabel('HC-SR04', 0.4);
  }
}

// PIR HC-SR501
class PIR_3D extends CF3DComponent {
  constructor(boardId) { super('HC-SR501', boardId); this.build(); }
  build() {
    const pcb = _makePCB(1.0, 1.0, 0.1, 0x224400);
    this.group.add(pcb);
    // Dome
    const dome = new THREE.Mesh(
      new THREE.SphereGeometry(0.4, 16, 8, 0, Math.PI * 2, 0, Math.PI / 2),
      new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.6 })
    );
    dome.position.y = 0.1; dome.name = 'dome'; this.group.add(dome);
    ['GND','OUT','VCC'].forEach((n,i) => this._addPin(n, -0.2 + i * 0.2, 0, -0.6));
    this._addLabel('PIR', 0.55);
  }
  update(pinStates) {
    const led = this.group.getObjectByName('led_status');
    if (led) { const v = pinStates && pinStates['OUT']; led.material.color.setHex(v ? 0xff2244 : 0x333344); }
  }
}

// ══════════════════════════════════════════════════════════════════
//  ACTUATORS
// ══════════════════════════════════════════════════════════════════

class Servo3D extends CF3DComponent {
  constructor(compId, boardId, opts) {
    super(compId || 'SG90', boardId);
    this._opts = opts || { w: 1.2, d: 0.55, h: 0.4, color: 0x1144aa, label: 'SG90' };
    this._hornMesh = null;
    this._angle = 90;
    this.build();
  }
  build() {
    const o = this._opts;
    const body = _makeBox(o.w, o.d, o.h, o.color || 0x1144aa);
    body.name = 'servo_body'; this.group.add(body);
    // Mount tabs
    const tab1 = _makeBox(o.w + 0.3, 0.15, 0.05, o.color || 0x1144aa);
    tab1.position.set(0, o.h / 2 + 0.025, 0); this.group.add(tab1);
    // Output shaft
    const shaft = _makeCyl(0.1, 0.2, 0xaaaaaa);
    shaft.position.set(0.3, o.h / 2 + 0.1, 0); this.group.add(shaft);
    // Horn (cross-shaped disc)
    const horn = _makeBox(0.5, 0.08, 0.08, 0xffffff);
    horn.position.set(0.3, o.h / 2 + 0.22, 0); horn.name = 'horn';
    this._hornMesh = horn;
    this.group.add(horn);
    // Wires
    ['GND','5V','SIGNAL'].forEach((n,i) => this._addPin(n, -(o.w / 2) - 0.1, 0.1, -0.15 + i * 0.15));
    this._addLabel(o.label || 'Servo', 0.5);
  }
  update(pinStates) {
    if (!this._hornMesh) return;
    const angle = pinStates && (pinStates['angle'] || pinStates['SIGNAL']);
    if (angle !== undefined) {
      this._angle = parseFloat(angle) || 90;
      this._hornMesh.rotation.y = (this._angle - 90) * Math.PI / 180;
    }
  }
}

class LED3D extends CF3DComponent {
  constructor(compId, boardId, color) {
    super(compId || 'LED', boardId);
    this._offColor  = 0x333344;
    this._onColor   = color || 0x22ff44;
    this._ledMesh   = null;
    this.build();
  }
  build() {
    // Lead (legs)
    [-0.06, 0.06].forEach((x, i) => {
      const leg = _makeCyl(0.015, 0.5, 0xaaaaaa); leg.position.set(x, -0.3, 0); this.group.add(leg);
    });
    // LED body (dome + cylinder)
    const body = _makeCyl(0.1, 0.15, this._offColor, 12);
    body.position.y = 0; body.name = 'led_body'; this._ledMesh = body; this.group.add(body);
    const dome = new THREE.Mesh(
      new THREE.SphereGeometry(0.1, 12, 8, 0, Math.PI * 2, 0, Math.PI / 2),
      new THREE.MeshBasicMaterial({ color: this._offColor, transparent: true, opacity: 0.85 })
    );
    dome.position.y = 0.075; dome.name = 'led_dome'; this.group.add(dome);
    this._domeMesh = dome;
    this._addPin('A', 0.06, -0.55, 0);
    this._addPin('K', -0.06, -0.55, 0);
  }
  update(pinStates) {
    const v   = pinStates && (pinStates['A'] || pinStates['anode'] || pinStates['pin']);
    const on  = v !== undefined && v !== 0 && v !== false && v !== '0';
    const col = on ? this._onColor : this._offColor;
    if (this._ledMesh) {
      this._ledMesh.material.color.setHex(col);
      this._ledMesh.material.emissive = new THREE.Color(on ? col : 0);
      this._ledMesh.material.emissiveIntensity = on ? 0.8 : 0;
    }
    if (this._domeMesh) this._domeMesh.material.color.setHex(col);
  }
}

class Relay3D extends CF3DComponent {
  constructor(boardId) { super('RELAY-5V', boardId); this._state = false; this.build(); }
  build() {
    const pcb = _makePCB(1.8, 1.2, 0.1, 0x1a4a2a); this.group.add(pcb);
    const body = _makeBox(0.9, 0.7, 0.55, 0x111111);
    body.position.set(-0.1, 0.35, 0); body.name = 'relay_body'; this.group.add(body);
    const coil = _makeBox(0.5, 0.5, 0.45, 0xcc7700);
    coil.position.set(0.55, 0.3, 0); this.group.add(coil);
    const led = new THREE.Mesh(new THREE.SphereGeometry(0.05, 8, 8), new THREE.MeshBasicMaterial({ color: 0x333344 }));
    led.position.set(-0.5, 0.15, 0.5); led.name = 'led_status'; this.group.add(led);
    ['VCC','IN','GND','COM','NO','NC'].forEach((n,i) => this._addPin(n, -0.5 + (i%3)*0.35, 0, i < 3 ? -0.7 : 0.7));
    this._addLabel('Relay 5V', 0.55);
  }
  update(pinStates) {
    const v = pinStates && pinStates['IN'];
    const on = v && v !== 0;
    const led = this.group.getObjectByName('led_status');
    if (led) led.material.color.setHex(on ? 0x22ff00 : 0x333344);
    this._state = !!on;
  }
}

// Buzzer
class Buzzer3D extends CF3DComponent {
  constructor(boardId) { super('BUZZER', boardId); this.build(); }
  build() {
    const base = _makeCyl(0.35, 0.05, 0x222222); base.position.y = -0.025; this.group.add(base);
    const body = _makeCyl(0.3, 0.25, 0x111111); body.position.y = 0.1; body.name = 'body'; this.group.add(body);
    const top  = new THREE.Mesh(new THREE.SphereGeometry(0.3, 16, 8, 0, Math.PI * 2, 0, Math.PI / 2),
      new THREE.MeshLambertMaterial({ color: 0x000000 }));
    top.position.y = 0.225; this.group.add(top);
    ['+','-'].forEach((n,i) => this._addPin(n, i === 0 ? 0.1 : -0.1, -0.1, 0));
    this._addLabel('Buzzer', 0.5);
  }
  update(pinStates) {
    const v = pinStates && (pinStates['+'] || pinStates['pin']);
    const body = this.group.getObjectByName('body');
    if (body) { body.material.color.setHex(v ? 0x333333 : 0x111111); }
  }
}

// DC Motor
class DCMotor3D extends CF3DComponent {
  constructor(boardId) { super('DC-MOTOR', boardId); this._rotation = 0; this.build(); }
  build() {
    const body = _makeCyl(0.4, 0.8, 0x555555); body.rotation.z = Math.PI / 2; body.name = 'motor_body'; this.group.add(body);
    const shaft = _makeCyl(0.05, 0.5, 0xaaaaaa); shaft.rotation.z = Math.PI / 2; shaft.position.x = 0.65; shaft.name = 'shaft'; this.group.add(shaft);
    // Speed indicator disc
    const disc = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, 0.02, 8), new THREE.MeshBasicMaterial({ color: 0xff4400 }));
    disc.position.set(0.9, 0, 0); disc.rotation.z = Math.PI / 2; disc.name = 'speed_disc'; this.group.add(disc);
    ['+','-'].forEach((n,i) => this._addPin(n, -0.4 + i * 0.1, 0, 0.3));
    this._addLabel('DC Motor', 0.55);
  }
  update(pinStates) {
    const speed = pinStates && (pinStates.speed || pinStates['+'] || 0);
    this._rotation += parseFloat(speed) * 0.01;
    const shaft = this.group.getObjectByName('shaft');
    if (shaft) shaft.rotation.x = this._rotation;
  }
}

// ══════════════════════════════════════════════════════════════════
//  DISPLAYS
// ══════════════════════════════════════════════════════════════════

class LCD16x2_3D extends CF3DComponent {
  constructor(boardId) { super('LCD-16x2-I2C', boardId); this._lines = ['','']; this.build(); }
  build() {
    const pcb = _makePCB(3.2, 1.2, 0.1, 0x003366); this.group.add(pcb);
    // Screen area
    const screen = _makeBox(2.8, 0.9, 0.05, 0x001a00);
    screen.position.y = 0.08; screen.name = 'screen'; this.group.add(screen);
    // Create canvas texture for LCD content
    this._lcdCanvas = document.createElement('canvas');
    this._lcdCanvas.width = 320; this._lcdCanvas.height = 80;
    this._drawLCD();
    const texture = new THREE.CanvasTexture(this._lcdCanvas);
    const textPlane = new THREE.Mesh(
      new THREE.PlaneGeometry(2.6, 0.75),
      new THREE.MeshBasicMaterial({ map: texture, transparent: false })
    );
    textPlane.position.set(0, 0.115, 0); textPlane.name = 'text_plane';
    this._textTexture = texture;
    this._textMesh = textPlane;
    this.group.add(textPlane);
    // Backlight chip
    const bl = _makeBox(0.35, 0.35, 0.15, 0x111111); bl.position.set(-1.3, 0.15, 0); this.group.add(bl);
    ['GND','VCC','SDA','SCL'].forEach((n,i) => this._addPin(n, -1.4, 0, -0.4 + i * 0.25));
    this._addLabel('LCD 16×2', 0.4);
  }
  _drawLCD() {
    const ctx = this._lcdCanvas.getContext('2d');
    ctx.fillStyle = '#001a00'; ctx.fillRect(0, 0, 320, 80);
    ctx.fillStyle = '#40c050'; ctx.font = 'bold 20px monospace';
    ctx.fillText((this._lines[0] || '').padEnd(16).slice(0, 16), 8, 30);
    ctx.fillText((this._lines[1] || '').padEnd(16).slice(0, 16), 8, 62);
  }
  update(pinStates) {
    const lines = pinStates && (pinStates.lcdContent || pinStates.lines);
    if (lines && JSON.stringify(lines) !== JSON.stringify(this._lines)) {
      this._lines = Array.isArray(lines) ? lines.slice(0, 2) : [String(lines), ''];
      this._drawLCD();
      if (this._textTexture) this._textTexture.needsUpdate = true;
    }
  }
}

class OLED_3D extends CF3DComponent {
  constructor(boardId) { super('SSD1306-128x64', boardId); this.build(); }
  build() {
    const pcb = _makePCB(1.5, 1.5, 0.1, 0x111111); this.group.add(pcb);
    const screen = _makeBox(1.2, 1.0, 0.04, 0x000000);
    screen.position.y = 0.08; screen.name = 'screen'; this.group.add(screen);
    this._oledCanvas = document.createElement('canvas');
    this._oledCanvas.width = 128; this._oledCanvas.height = 64;
    const ctx = this._oledCanvas.getContext('2d');
    ctx.fillStyle = '#000'; ctx.fillRect(0, 0, 128, 64);
    ctx.fillStyle = '#fff'; ctx.font = '8px monospace';
    ctx.fillText('CircuitForge', 10, 20);
    ctx.fillText('OLED Ready', 20, 40);
    const tex = new THREE.CanvasTexture(this._oledCanvas);
    const plane = new THREE.Mesh(new THREE.PlaneGeometry(1.1, 0.85), new THREE.MeshBasicMaterial({ map: tex }));
    plane.position.set(0, 0.11, 0); plane.name = 'display_plane';
    this._tex = tex; this._plane = plane;
    this.group.add(plane);
    ['GND','VCC','SCL','SDA'].forEach((n,i) => this._addPin(n, -0.55 + i * 0.35, 0, -0.85));
    this._addLabel('OLED 0.96"', 0.9);
  }
  update(pinStates) {
    if (pinStates && pinStates.oledCanvas) {
      // Sync from OLED canvas
      if (this._oledCanvas && this._tex) {
        const src = pinStates.oledCanvas;
        const ctx = this._oledCanvas.getContext('2d');
        ctx.drawImage(src, 0, 0);
        this._tex.needsUpdate = true;
      }
    }
  }
  updateFromCanvas(srcCanvas) {
    if (!this._oledCanvas || !this._tex) return;
    const ctx = this._oledCanvas.getContext('2d');
    ctx.drawImage(srcCanvas, 0, 0);
    this._tex.needsUpdate = true;
  }
}

// ══════════════════════════════════════════════════════════════════
//  ROBOTICS
// ══════════════════════════════════════════════════════════════════

class RobotArmSegment3D extends CF3DComponent {
  constructor(boardId, len) {
    super('ROBOT-ARM-SEGMENT', boardId);
    this._len = len || 1.5;
    this._angle = 0;
    this._joint = null;
    this.build();
  }
  build() {
    // Arm bar
    const bar = _makeBox(this._len, 0.15, 0.2, 0x444455);
    bar.position.x = this._len / 2; bar.name = 'arm_bar'; this.group.add(bar);
    // Joint sphere at origin
    const joint = new THREE.Mesh(new THREE.SphereGeometry(0.12, 12, 12), window._cf_SketchMaterial ? window._cf_SketchMaterial.flat(0x888888) : new THREE.MeshLambertMaterial({ color: 0x888888 }));
    joint.name = 'joint'; this._joint = joint; this.group.add(joint);
    // Joint at end
    const endJoint = joint.clone(); endJoint.position.x = this._len; this.group.add(endJoint);
    this._addLabel('Arm Seg', this._len / 2 + 0.2);
  }
  update(pinStates) {
    const angle = pinStates && pinStates.angle;
    if (angle !== undefined) {
      this._angle = parseFloat(angle) || 0;
      this.group.rotation.z = this._angle * Math.PI / 180;
    }
  }
}

class DiffDriveBase3D extends CF3DComponent {
  constructor(boardId) { super('DIFF-DRIVE-BASE', boardId); this._leftAngle = 0; this._rightAngle = 0; this.build(); }
  build() {
    const chassis = _makeBox(1.8, 1.0, 0.2, 0x334455); chassis.position.y = 0.35; this.group.add(chassis);
    // Wheels
    [[-0.6, 0, 0.6],[-0.6, 0, -0.6],[0.7, 0, 0]].forEach(([x, y, z], i) => {
      const wheel = _makeCyl(0.3, 0.15, i < 2 ? 0x111111 : 0x555555);
      wheel.rotation.x = Math.PI / 2;
      wheel.position.set(x, 0.3, z);
      wheel.name = i < 2 ? `wheel${i}` : 'caster';
      this.group.add(wheel);
    });
    this._addLabel('Diff Drive', 0.7);
  }
  update(pinStates) {
    const ls = parseFloat((pinStates && pinStates.leftSpeed) || 0);
    const rs = parseFloat((pinStates && pinStates.rightSpeed) || 0);
    this._leftAngle  += ls * 0.05;
    this._rightAngle += rs * 0.05;
    const w0 = this.group.getObjectByName('wheel0');
    const w1 = this.group.getObjectByName('wheel1');
    if (w0) w0.rotation.z = this._leftAngle;
    if (w1) w1.rotation.z = this._rightAngle;
  }
}

class DroneFrame3D extends CF3DComponent {
  constructor(boardId) { super('DRONE-FRAME', boardId); this._propAngle = 0; this.build(); }
  build() {
    // Center body
    const body = _makeBox(0.4, 0.4, 0.15, 0x222222); this.group.add(body);
    // 4 arms at 45°
    [45, 135, 225, 315].forEach((deg, i) => {
      const arm = _makeBox(0.9, 0.08, 0.06, 0x333333);
      arm.rotation.y = deg * Math.PI / 180;
      arm.position.set(Math.cos(deg * Math.PI/180) * 0.45, 0, Math.sin(deg * Math.PI/180) * 0.45);
      this.group.add(arm);
      // Motor + propeller
      const motor = _makeCyl(0.07, 0.12, 0x444444);
      motor.position.set(Math.cos(deg * Math.PI/180) * 0.9, 0.1, Math.sin(deg * Math.PI/180) * 0.9);
      this.group.add(motor);
      const prop = _makeBox(0.5, 0.06, 0.025, i < 2 ? 0x333399 : 0x993333);
      prop.position.copy(motor.position); prop.position.y += 0.1;
      prop.name = `prop${i}`; this.group.add(prop);
    });
    this._addLabel('Drone', 0.35);
  }
  update(pinStates) {
    const throttle = parseFloat((pinStates && pinStates.throttle) || 0);
    this._propAngle += throttle * 0.3;
    for (let i = 0; i < 4; i++) {
      const prop = this.group.getObjectByName(`prop${i}`);
      if (prop) prop.rotation.y = this._propAngle * (i < 2 ? 1 : -1);
    }
  }
}

// ══════════════════════════════════════════════════════════════════
//  FACTORY
// ══════════════════════════════════════════════════════════════════

window._cf_Component3DFactory = function(compId, boardId) {
  const map = {
    'arduino:avr:uno':       () => new ArduinoUno3D(boardId),
    'arduino:avr:mega':      () => new ArduinoUno3D(boardId),  // use Uno model placeholder
    'arduino:avr:nano':      () => new ArduinoUno3D(boardId),
    'esp32:esp32:esp32':     () => new ESP32_3D(boardId),
    'esp32:esp32:esp32s3':   () => new ESP32_3D(boardId),
    'esp8266:esp8266:nodemcuv2': () => new ESP32_3D(boardId),
    'DHT22':    () => new DHT22_3D(boardId),
    'DHT11':    () => new DHT22_3D(boardId),
    'HC-SR04':  () => new HCSR04_3D(boardId),
    'HC-SR501': () => new PIR_3D(boardId),
    'SG90':     () => new Servo3D('SG90', boardId, { w:1.2, d:0.55, h:0.4, color:0x1144aa, label:'SG90' }),
    'MG996R':   () => new Servo3D('MG996R', boardId, { w:1.5, d:0.7, h:0.55, color:0x111111, label:'MG996R' }),
    'RELAY-5V': () => new Relay3D(boardId),
    'BUZZER':   () => new Buzzer3D(boardId),
    'DC-MOTOR': () => new DCMotor3D(boardId),
    'LED-RED':  () => new LED3D('LED-RED',   boardId, 0xff2244),
    'LED-GREEN':() => new LED3D('LED-GREEN', boardId, 0x22ff44),
    'LED-BLUE': () => new LED3D('LED-BLUE',  boardId, 0x2244ff),
    'LCD-16x2-I2C': () => new LCD16x2_3D(boardId),
    'SSD1306-128x64': () => new OLED_3D(boardId),
    'ROBOT-ARM-SEGMENT': () => new RobotArmSegment3D(boardId),
    'DIFF-DRIVE-BASE': () => new DiffDriveBase3D(boardId),
    'DRONE-FRAME': () => new DroneFrame3D(boardId),
  };
  const factory = map[compId];
  if (factory) return factory();
  // Generic fallback
  return new GenericSensor3D(compId, boardId, { label: compId.split(':').pop() });
};

console.log('[Component3D] All models loaded');
