/**
 * CircuitForge — canvas3d/sketch-material.js
 * Shared materials and color palette for 3D sketch-style rendering
 */

window._cf_SketchMaterial = {

  COLORS: {
    // Boards
    board_uno:    0x1a6b3c,
    board_mega:   0x1a3c7a,
    board_nano:   0x1a6b3c,
    board_esp32:  0x2040a0,
    board_esp8266:0x0d6e7a,
    board_stm32:  0x8a1a1a,
    board_pico:   0x2a6010,
    // Components
    pcb_dark:     0x1a1a1a,
    pcb_green:    0x1a4a2a,
    pcb_blue:     0x1a2a4a,
    sensor_body:  0x2a2a2a,
    sensor_alt:   0x1e3a1e,
    // LEDs
    led_off:      0x333344,
    led_red:      0xff2244,
    led_green:    0x22ff44,
    led_blue:     0x2244ff,
    led_yellow:   0xffcc00,
    led_white:    0xffffff,
    // Wires
    wire_red:     0xff3333,
    wire_black:   0x222222,
    wire_yellow:  0xffcc00,
    wire_green:   0x33ff33,
    wire_blue:    0x3366ff,
    wire_orange:  0xff8800,
    wire_white:   0xffffff,
    wire_cyan:    0x00ffcc,
    wire_purple:  0x8844ff,
    // UI
    highlight:    0x6366f1,
    selected:     0xf59e0b,
    hover:        0x818cf8,
    grid_main:    0x1e293b,
    grid_sub:     0x111827,
    // Metals
    pin_gold:     0xd4a017,
    pin_silver:   0xaaaaaa,
    pcb_trace:    0xd4a017,
  },

  /** Toon material for PCB/board */
  board(colorHex) {
    return new THREE.MeshToonMaterial({
      color: colorHex,
      gradientMap: this._gradientMap(),
    });
  },

  /** Toon material for components */
  component(colorHex, emissiveHex, emissiveIntensity) {
    return new THREE.MeshToonMaterial({
      color: colorHex,
      emissive: emissiveHex || 0x000000,
      emissiveIntensity: emissiveIntensity || 0,
    });
  },

  /** Emissive material for LEDs (glowing) */
  led(colorHex, intensity) {
    return new THREE.MeshBasicMaterial({
      color: colorHex,
      transparent: true,
      opacity: 0.9,
    });
  },

  /** Wire/tube material */
  wire(colorHex) {
    return new THREE.MeshBasicMaterial({ color: colorHex });
  },

  /** Flat shaded for simple shapes */
  flat(colorHex) {
    return new THREE.MeshLambertMaterial({ color: colorHex });
  },

  /** Glass/transparent */
  glass(colorHex, opacity) {
    return new THREE.MeshBasicMaterial({
      color: colorHex, transparent: true, opacity: opacity || 0.3,
    });
  },

  /** Create 3-step gradient map for toon shading */
  _gradientMap() {
    if (this._gmap) return this._gmap;
    const canvas = document.createElement('canvas');
    canvas.width = 4; canvas.height = 1;
    const ctx = canvas.getContext('2d');
    const grd = ctx.createLinearGradient(0, 0, 4, 0);
    grd.addColorStop(0, '#333');
    grd.addColorStop(0.5, '#888');
    grd.addColorStop(1, '#fff');
    ctx.fillStyle = grd; ctx.fillRect(0, 0, 4, 1);
    const tex = new THREE.CanvasTexture(canvas);
    tex.magFilter = THREE.NearestFilter;
    tex.minFilter = THREE.NearestFilter;
    this._gmap = tex;
    return tex;
  },

  /** Canvas text sprite for labels */
  textSprite(text, opts) {
    opts = opts || {};
    const canvas  = document.createElement('canvas');
    canvas.width  = 256; canvas.height = 64;
    const ctx     = canvas.getContext('2d');
    ctx.fillStyle = 'rgba(0,0,0,0)';
    ctx.clearRect(0, 0, 256, 64);
    ctx.fillStyle = opts.color || '#ffffff';
    ctx.font      = `bold ${opts.fontSize || 24}px "JetBrains Mono", monospace`;
    ctx.textAlign = 'center';
    ctx.fillText(text, 128, 40);

    const texture = new THREE.CanvasTexture(canvas);
    const mat = new THREE.SpriteMaterial({ map: texture, transparent: true, depthWrite: false });
    const sprite = new THREE.Sprite(mat);
    sprite.scale.set(opts.width || 1.5, opts.height || 0.4, 1);
    return sprite;
  },

  /** Wire color by type */
  wireColor(type) {
    const map = {
      vcc:    this.COLORS.wire_red,
      gnd:    this.COLORS.wire_black,
      signal: this.COLORS.wire_yellow,
      i2c:    this.COLORS.wire_blue,
      spi:    this.COLORS.wire_orange,
      uart:   this.COLORS.wire_yellow,
      nrf24:  this.COLORS.wire_cyan,
      bt:     this.COLORS.wire_purple,
      default:this.COLORS.wire_white,
    };
    return map[type] || map.default;
  },
};

console.log('[SketchMaterial] Loaded');
