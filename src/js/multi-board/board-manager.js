// board-manager.js — Mengelola semua board dalam satu proyek
// Setiap board adalah entitas mandiri dengan kode, pin state, dan runtime sendiri

const { BOARDS } = require('../simulator/boards');
const { createRuntime } = require('../simulator/runtime');
const { BusRouter } = require('./bus-router');

let _boardCounter = 0;

/**
 * Buat instance board baru
 */
function createBoard(boardId, options = {}) {
  _boardCounter++;
  const boardDef = BOARDS[boardId] || BOARDS['esp32:esp32:esp32'];
  const id = options.id || `board_${_boardCounter}`;

  return {
    id,
    boardId,
    boardDef,
    label: options.label || `${boardDef.shortName} #${_boardCounter}`,
    color: options.color || BOARD_COLORS[(_boardCounter - 1) % BOARD_COLORS.length],
    position: options.position || { x: 100 + (_boardCounter - 1) * 350, y: 80 },

    // State
    status: 'stopped',   // 'stopped' | 'running' | 'compiling' | 'error'
    code: options.code || getDefaultCode(boardDef),
    pinStates: initPinStates(boardDef),
    components: [],      // komponen yang terpasang di board ini

    // Runtime (dibuat saat run)
    runtime: null,
    loopInterval: null,

    // Serial output log
    serialLog: [],
    serialBuffer: '',    // buffer untuk koneksi serial antar board

    // Compile info
    lastBuildOutput: '',
    lastBuildSuccess: false,
    uploadPort: null,
  };
}

const BOARD_COLORS = [
  '#6366f1', '#10b981', '#f59e0b', '#ef4444',
  '#8b5cf6', '#06b6d4', '#84cc16', '#f97316',
];

function initPinStates(boardDef) {
  const states = {};
  const allPins = [
    ...(boardDef.pins.digital || []),
    ...(boardDef.pins.analog  || []),
  ];
  allPins.forEach(pin => {
    states[pin] = { mode: 'INPUT', value: 0, pwm: 0 };
  });
  return states;
}

function getDefaultCode(boardDef) {
  const ledPin = boardDef.pins.builtinLed ?? 13;
  return `// CircuitForge — ${boardDef.name}
// Board: ${boardDef.cpu}

void setup() {
  Serial.begin(115200);
  pinMode(${ledPin}, OUTPUT);
  Serial.println("${boardDef.shortName} siap!");
}

void loop() {
  digitalWrite(${ledPin}, HIGH);
  delay(500);
  digitalWrite(${ledPin}, LOW);
  delay(500);
}
`;
}

// ─── BoardManager Class ────────────────────────────────────────────────────────
class BoardManager extends EventTarget {
  constructor() {
    super();
    this.boards = new Map();      // id → board object
    this.busRouter = new BusRouter(this);
    this.connections = [];        // koneksi antar board
  }

  /** Tambah board baru ke proyek */
  addBoard(boardId, options = {}) {
    const board = createBoard(boardId, options);
    this.boards.set(board.id, board);
    this.dispatchEvent(new CustomEvent('board-added', { detail: board }));
    return board;
  }

  /** Hapus board dari proyek */
  removeBoard(boardId) {
    const board = this.boards.get(boardId);
    if (!board) return;
    this.stopBoard(boardId);
    // Hapus semua koneksi yang melibatkan board ini
    this.connections = this.connections.filter(
      c => c.from.boardId !== boardId && c.to.boardId !== boardId
    );
    this.boards.delete(boardId);
    this.dispatchEvent(new CustomEvent('board-removed', { detail: { id: boardId } }));
  }

  /** Tambah koneksi antar board */
  addConnection(connection) {
    // connection = { id, type: 'uart'|'i2c'|'spi'|'gpio'|'nrf24'|'bt', from: {...}, to: {...}, config: {...} }
    const id = connection.id || `conn_${Date.now()}`;
    const conn = { ...connection, id };
    this.connections.push(conn);
    this.busRouter.registerConnection(conn);
    this.dispatchEvent(new CustomEvent('connection-added', { detail: conn }));
    return conn;
  }

  /** Hapus koneksi */
  removeConnection(connId) {
    const conn = this.connections.find(c => c.id === connId);
    if (!conn) return;
    this.connections = this.connections.filter(c => c.id !== connId);
    this.busRouter.unregisterConnection(connId);
    this.dispatchEvent(new CustomEvent('connection-removed', { detail: { id: connId } }));
  }

  /** Jalankan semua board */
  async runAll() {
    for (const [id] of this.boards) {
      await this.runBoard(id);
    }
  }

  /** Hentikan semua board */
  stopAll() {
    for (const [id] of this.boards) {
      this.stopBoard(id);
    }
  }

  /** Jalankan satu board */
  async runBoard(boardId) {
    const board = this.boards.get(boardId);
    if (!board || board.status === 'running') return;

    board.status = 'running';
    board.serialLog = [];
    board.runtime = createRuntime(board, this.busRouter, (msg) => this._serialOut(board, msg));

    try {
      await board.runtime.setup();
      board.loopInterval = setInterval(async () => {
        if (board.status !== 'running') return;
        try { await board.runtime.loop(); } catch (e) {
          this._serialOut(board, `[ERROR] ${e.message}`);
          this.stopBoard(boardId);
        }
      }, board.runtime.loopDelay || 10);
    } catch (e) {
      board.status = 'error';
      this._serialOut(board, `[SETUP ERROR] ${e.message}`);
    }

    this.dispatchEvent(new CustomEvent('board-status', { detail: { id: boardId, status: board.status } }));
  }

  /** Hentikan satu board */
  stopBoard(boardId) {
    const board = this.boards.get(boardId);
    if (!board) return;
    board.status = 'stopped';
    if (board.loopInterval) { clearInterval(board.loopInterval); board.loopInterval = null; }
    if (board.runtime) { board.runtime.cleanup?.(); board.runtime = null; }
    this.dispatchEvent(new CustomEvent('board-status', { detail: { id: boardId, status: 'stopped' } }));
  }

  /** Update kode board */
  setCode(boardId, code) {
    const board = this.boards.get(boardId);
    if (board) { board.code = code; }
  }

  /** Update posisi board di canvas */
  setPosition(boardId, position) {
    const board = this.boards.get(boardId);
    if (board) { board.position = position; }
  }

  /** Rename board */
  renameBoard(boardId, label) {
    const board = this.boards.get(boardId);
    if (board) { board.label = label; }
  }

  /** Serialize seluruh proyek ke JSON */
  toJSON() {
    return {
      version: '1.0',
      boards: Array.from(this.boards.values()).map(b => ({
        id: b.id, boardId: b.boardId, label: b.label, color: b.color,
        position: b.position, code: b.code, components: b.components,
        uploadPort: b.uploadPort,
      })),
      connections: this.connections,
    };
  }

  /** Load proyek dari JSON */
  fromJSON(data) {
    this.boards.clear();
    this.connections = [];
    _boardCounter = 0;

    (data.boards || []).forEach(b => {
      const board = createBoard(b.boardId, { id: b.id, label: b.label, color: b.color, position: b.position, code: b.code });
      board.components = b.components || [];
      board.uploadPort = b.uploadPort || null;
      this.boards.set(board.id, board);
    });
    (data.connections || []).forEach(c => this.addConnection(c));
    _boardCounter = this.boards.size;
  }

  _serialOut(board, msg) {
    const entry = { boardId: board.id, boardLabel: board.label, boardColor: board.color, msg, ts: Date.now() };
    board.serialLog.push(entry);
    this.dispatchEvent(new CustomEvent('serial-output', { detail: entry }));
  }

  getAllBoards() { return Array.from(this.boards.values()); }
  getBoard(id) { return this.boards.get(id); }
}

module.exports = { BoardManager };
