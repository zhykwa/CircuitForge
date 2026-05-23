/**
 * CircuitForge — simulator/core.js
 * Simulation core: manages start/stop per board, updates UI and 3D canvas
 */

class SimulatorCore {
  constructor() {
    this.running   = false;
    this.startTime = null;
    this.tickInterval = null;
    this.boardStatus = {};  // boardId -> 'running'|'stopped'|'error'
    this._fpsFrame = 0;
    this._fpsLast  = Date.now();
    this._simTime  = 0; // ms elapsed in simulation
    console.log('[SimCore] Initialized');
  }

  /** Start all boards */
  startAll() {
    if (this.running) return;
    this.running = true;
    this.startTime = Date.now();
    this._simTime  = 0;

    const bm = window._cf_boardManager;
    if (!bm) { console.warn('[SimCore] No BoardManager'); return; }

    bm.runAll();

    // Update all board statuses
    bm.boards.forEach((b, id) => this._setStatus(id, 'running'));

    // Periodic tick: update 3D canvas + instruments
    this.tickInterval = setInterval(() => this._tick(), 50); // 20 FPS update rate

    // Update UI
    this._updateSimUI(true);
    console.log('[SimCore] Simulation started');
  }

  /** Stop all boards */
  stopAll() {
    if (!this.running) return;
    this.running = false;

    const bm = window._cf_boardManager;
    if (bm) bm.stopAll();

    if (this.tickInterval) { clearInterval(this.tickInterval); this.tickInterval = null; }

    // Update statuses
    Object.keys(this.boardStatus).forEach(id => this._setStatus(id, 'stopped'));

    this._updateSimUI(false);
    console.log('[SimCore] Simulation stopped');
  }

  /** Start a single board */
  startBoard(boardId) {
    const bm = window._cf_boardManager;
    if (!bm) return;
    bm.runBoard(boardId);
    this._setStatus(boardId, 'running');
    this._ensureTickRunning();
  }

  /** Stop a single board */
  stopBoard(boardId) {
    const bm = window._cf_boardManager;
    if (!bm) return;
    bm.stopBoard(boardId);
    this._setStatus(boardId, 'stopped');
  }

  /** Called every ~50ms */
  _tick() {
    this._simTime += 50;
    const bm = window._cf_boardManager;
    if (!bm) return;

    // Collect pin states from all running boards
    const allPinStates = {};
    bm.boards.forEach((board, boardId) => {
      if (board.runtime && board.runtime.pinState) {
        allPinStates[boardId] = board.runtime.pinState;
      }
    });

    // Update 3D scene with pin states
    if (window._cf_scene && window._cf_scene.updateSimulation) {
      window._cf_scene.updateSimulation(allPinStates);
    }

    // Feed oscilloscope
    if (window._cf_oscilloscope && window._cf_oscilloscope.running) {
      // Push samples from board pin states
      const osc = window._cf_oscilloscope;
      [0,1,2,3].forEach(chIdx => {
        const ch = osc.channels[chIdx];
        if (!ch.enabled || !ch.pin) return;
        const [boardId, pinName] = (ch.pin || '').split(':');
        const ps = allPinStates[boardId] || {};
        const v  = (ps[pinName] || ps[String(pinName)]) || 0;
        osc.pushSample(chIdx, typeof v === 'boolean' ? (v ? 3.3 : 0) : Number(v));
      });
    }

    // Feed logic analyzer
    if (window._cf_logicAnalyzer && window._cf_logicAnalyzer.running) {
      const la = window._cf_logicAnalyzer;
      la.channels.forEach((ch, idx) => {
        if (!ch.pin) return;
        const [boardId, pinName] = (ch.pin || '').split(':');
        const ps = allPinStates[boardId] || {};
        const v  = ps[pinName] || 0;
        la.pushSample(idx, v ? 1 : 0);
      });
    }

    // Update multimeters
    [1,2].forEach(i => {
      const mm = window[`_cf_multimeter${i}`];
      if (mm) mm.measure(allPinStates);
    });

    // Update signal generator → inject into pin
    if (window._cf_signalGen && window._cf_signalGen.running && window._cf_signalGen.outputPin) {
      const v = window._cf_signalGen.getValue(this._simTime);
      const [boardId, pinName] = window._cf_signalGen.outputPin.split(':');
      const brd = bm.boards.get(boardId);
      if (brd && brd.runtime) {
        brd.runtime.injectPin(pinName, v);
      }
    }
  }

  _ensureTickRunning() {
    if (!this.tickInterval) {
      this.running = true;
      this.tickInterval = setInterval(() => this._tick(), 50);
    }
  }

  _setStatus(boardId, status) {
    this.boardStatus[boardId] = status;
    this._updateStatusBadge(boardId, status);
  }

  _updateStatusBadge(boardId, status) {
    const bar = document.getElementById('simStatusBar');
    if (!bar) return;
    let badge = bar.querySelector(`[data-board="${boardId}"]`);
    if (!badge) {
      badge = document.createElement('div');
      badge.className = 'sim-status-badge';
      badge.dataset.board = boardId;
      const dot  = document.createElement('span'); dot.className = 'sim-status-dot';
      const name = document.createElement('span');
      badge.appendChild(dot); badge.appendChild(name);
      bar.appendChild(badge);
    }
    badge.className = `sim-status-badge sim-status-${status}`;
    const bm = window._cf_boardManager;
    const board = bm && bm.boards.get(boardId);
    badge.querySelector('span:last-child').textContent =
      (board && board.label) ? board.label : boardId;
    if (status === 'stopped') badge.style.display = 'none';
    else badge.style.display = '';
  }

  _updateSimUI(running) {
    const btnRun  = document.getElementById('btnRunAll');
    const btnStop = document.getElementById('btnStopAll');
    const modeLabel = document.getElementById('modeLabel');

    if (btnRun)  btnRun.disabled = running;
    if (btnStop) btnStop.disabled = !running;

    if (modeLabel) {
      if (running) {
        modeLabel.textContent = 'MODE: SIMULASI BERJALAN';
        modeLabel.className = 'mode-label-sim';
      } else {
        modeLabel.textContent = 'MODE: DESAIN';
        modeLabel.className = 'mode-label-design';
      }
    }

    document.getElementById('statusMode').textContent = running ? 'Mode: Simulasi' : 'Mode: Desain';

    // Start/stop FPS counter
    if (running) this._startFPSCounter();
    else this._stopFPSCounter();
  }

  _startFPSCounter() {
    this._fpsLast = Date.now();
    this._fpsFrame = 0;
    this._fpsInterval = setInterval(() => {
      const now = Date.now();
      const el  = document.getElementById('statusFPS');
      if (el) el.textContent = `${this._fpsFrame} FPS`;
      this._fpsFrame = 0;
      this._fpsLast  = now;
    }, 1000);
    // Tick 3D renderer fps
    const tick = () => {
      if (!this.running) return;
      this._fpsFrame++;
      requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }

  _stopFPSCounter() {
    if (this._fpsInterval) { clearInterval(this._fpsInterval); this._fpsInterval = null; }
    const el = document.getElementById('statusFPS');
    if (el) el.textContent = '— FPS';
  }

  setError(boardId, msg) {
    this._setStatus(boardId, 'error');
    if (window._cf_serial) window._cf_serial.log(`[${boardId}] ERROR: ${msg}`, 'error');
  }
}

window.SimulatorCore = SimulatorCore;
console.log('[SimCore] Module loaded');
