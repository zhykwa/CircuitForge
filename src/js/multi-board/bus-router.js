// bus-router.js — Router virtual untuk semua protokol komunikasi antar board
// Mendukung: UART, I2C, SPI, GPIO Wire, NRF24L01, Bluetooth HC-05

class BusRouter {
  constructor(boardManager) {
    this.bm = boardManager;
    this.connections = new Map();  // connId → connection
    this.uartLinks   = new Map();  // 'boardA:txPin' → { boardId, rxPin }
    this.i2cBuses    = new Map();  // busId → { master, slaves: {addr → boardId} }
    this.gpioLinks   = new Map();  // 'boardA:pin' → [{ boardId, pin }]
    this.nrfLinks    = new Map();  // channel → [boardId]
    this.btLinks     = new Map();  // btDeviceId → pairedBoardId
    this.i2cRxBuffers = new Map(); // 'boardId:addr' → Buffer
  }

  registerConnection(conn) {
    this.connections.set(conn.id, conn);
    switch (conn.type) {
      case 'uart':   this._registerUART(conn);   break;
      case 'i2c':    this._registerI2C(conn);    break;
      case 'spi':    this._registerSPI(conn);    break;
      case 'gpio':   this._registerGPIO(conn);   break;
      case 'nrf24':  this._registerNRF24(conn);  break;
      case 'bt':     this._registerBT(conn);     break;
    }
  }

  unregisterConnection(connId) {
    this.connections.delete(connId);
    this._rebuildRoutes();
  }

  // ── UART ──────────────────────────────────────────────────────────────────────
  _registerUART(conn) {
    // from: { boardId, pin: 'TX' | 'TX2' | custom }
    // to:   { boardId, pin: 'RX' | 'RX2' | custom }
    const key = `${conn.from.boardId}:${conn.from.pin}`;
    this.uartLinks.set(key, { boardId: conn.to.boardId, pin: conn.to.pin, baud: conn.config?.baud || 9600 });
  }

  /**
   * Board A kirim data via UART → board B menerimanya di buffer
   */
  uartSend(fromBoardId, txPin, data) {
    const key = `${fromBoardId}:${txPin}`;
    const dest = this.uartLinks.get(key);
    if (!dest) return;
    const destBoard = this.bm.getBoard(dest.boardId);
    if (!destBoard || !destBoard.runtime) return;
    // Kirim karakter satu per satu ke buffer serial board tujuan
    destBoard.runtime.injectSerial(data);
  }

  // ── I2C ──────────────────────────────────────────────────────────────────────
  _registerI2C(conn) {
    // conn.config: { busId, masterBoardId, slaves: [{boardId, address}] }
    const { busId = 'default', masterBoardId, slaves = [] } = conn.config || {};
    if (!this.i2cBuses.has(busId)) {
      this.i2cBuses.set(busId, { masterBoardId, slaves: new Map() });
    }
    const bus = this.i2cBuses.get(busId);
    slaves.forEach(s => bus.slaves.set(s.address, s.boardId));
  }

  /**
   * I2C Master minta data dari slave (address)
   * Mengembalikan Uint8Array dari slave runtime
   */
  async i2cRequestFrom(masterBoardId, address, numBytes, busId = 'default') {
    const bus = this.i2cBuses.get(busId);
    if (!bus) return new Uint8Array(numBytes);
    const slaveBoardId = bus.slaves.get(address);
    const slaveBoard = this.bm.getBoard(slaveBoardId);
    if (!slaveBoard?.runtime) return new Uint8Array(numBytes);
    return slaveBoard.runtime.handleI2CRequest(address, numBytes);
  }

  /**
   * I2C Master kirim data ke slave
   */
  async i2cBeginTransmission(masterBoardId, address, data, busId = 'default') {
    const bus = this.i2cBuses.get(busId);
    if (!bus) return;
    const slaveBoardId = bus.slaves.get(address);
    const slaveBoard = this.bm.getBoard(slaveBoardId);
    if (!slaveBoard?.runtime) return;
    slaveBoard.runtime.handleI2CReceive(address, data);
  }

  // ── GPIO Wire ─────────────────────────────────────────────────────────────────
  _registerGPIO(conn) {
    // conn.from: { boardId, pin }  conn.to: { boardId, pin }
    const key = `${conn.from.boardId}:${conn.from.pin}`;
    if (!this.gpioLinks.has(key)) this.gpioLinks.set(key, []);
    this.gpioLinks.get(key).push({ boardId: conn.to.boardId, pin: conn.to.pin });
  }

  /**
   * Saat board A menulis ke pin → propagasi ke board lain yang terhubung
   */
  gpioWrite(fromBoardId, pin, value) {
    const key = `${fromBoardId}:${pin}`;
    const dests = this.gpioLinks.get(key) || [];
    dests.forEach(dest => {
      const destBoard = this.bm.getBoard(dest.boardId);
      if (destBoard?.runtime) {
        destBoard.runtime.setPinInputValue(dest.pin, value);
      }
    });
  }

  // ── NRF24L01 ─────────────────────────────────────────────────────────────────
  _registerNRF24(conn) {
    // conn.config: { channel, pipe }
    const ch = conn.config?.channel || 1;
    if (!this.nrfLinks.has(ch)) this.nrfLinks.set(ch, []);
    [conn.from.boardId, conn.to.boardId].forEach(bid => {
      if (!this.nrfLinks.get(ch).includes(bid)) this.nrfLinks.get(ch).push(bid);
    });
  }

  nrfSend(fromBoardId, channel, data) {
    const boards = this.nrfLinks.get(channel) || [];
    boards.forEach(bid => {
      if (bid === fromBoardId) return;
      const board = this.bm.getBoard(bid);
      if (board?.runtime) board.runtime.injectNRF24(data);
    });
  }

  // ── Bluetooth HC-05 ───────────────────────────────────────────────────────────
  _registerBT(conn) {
    this.btLinks.set(conn.from.boardId, conn.to.boardId);
    this.btLinks.set(conn.to.boardId, conn.from.boardId);
  }

  btSend(fromBoardId, data) {
    const destId = this.btLinks.get(fromBoardId);
    const dest = this.bm.getBoard(destId);
    if (dest?.runtime) dest.runtime.injectBluetooth(data);
  }

  // ── SPI ───────────────────────────────────────────────────────────────────────
  _registerSPI(conn) {
    // Untuk now, SPI logging
    console.log('[BusRouter] SPI connection registered:', conn.id);
  }

  spiTransfer(masterBoardId, csPin, byte) {
    // Find slave by CS pin connection
    for (const [id, conn] of this.connections) {
      if (conn.type === 'spi' && conn.from.boardId === masterBoardId && conn.from.csPin === csPin) {
        const slave = this.bm.getBoard(conn.to.boardId);
        if (slave?.runtime) return slave.runtime.handleSPITransfer(byte);
      }
    }
    return 0xFF;
  }

  _rebuildRoutes() {
    this.uartLinks.clear(); this.i2cBuses.clear();
    this.gpioLinks.clear(); this.nrfLinks.clear(); this.btLinks.clear();
    for (const [, conn] of this.connections) this.registerConnection(conn);
  }
}

module.exports = { BusRouter };
