/**
 * CircuitForge — serial.js
 * Serial Monitor — multi-board, colored, timestamp, filter, hex mode
 */

class SerialMonitor {
  constructor() {
    this.outputEl = document.getElementById('serialOutput');
    this.inputEl  = document.getElementById('serialInput');
    this.sendBtn  = document.getElementById('btnSerialSend');
    this.clearBtn = document.getElementById('btnSerialClear');
    this.saveBtn  = document.getElementById('btnSerialSave');
    this.baudSel  = document.getElementById('serialBaud');
    this.boardSel = document.getElementById('serialBoardSelect');
    this.lineEndSel = document.getElementById('serialLineEnd');
    this.scrollBtn  = document.getElementById('btnSerialScroll');

    this.autoScroll = true;
    this.lines = [];         // { boardId, boardLabel, color, msg, ts }
    this.filterBoard = 'all';
    this.maxLines = 2000;
    this.hexMode = false;

    this._bind();
    console.log('[Serial] Monitor initialized');
  }

  _bind() {
    if (this.sendBtn) this.sendBtn.addEventListener('click', () => this._sendInput());
    if (this.inputEl) {
      this.inputEl.addEventListener('keydown', e => {
        if (e.key === 'Enter') this._sendInput();
      });
    }
    if (this.clearBtn) this.clearBtn.addEventListener('click', () => this.clear());
    if (this.saveBtn)  this.saveBtn.addEventListener('click', () => this.saveLog());
    if (this.scrollBtn) this.scrollBtn.addEventListener('click', () => {
      this.autoScroll = !this.autoScroll;
      this.scrollBtn.textContent = this.autoScroll ? '↓ Auto-scroll' : '↕ Manual';
      this.scrollBtn.style.color = this.autoScroll ? '' : 'var(--accent)';
    });
    if (this.boardSel) {
      this.boardSel.addEventListener('change', () => {
        this.filterBoard = this.boardSel.value;
        this._rerender();
      });
    }
  }

  /** Append a line from a board */
  appendLine(boardId, boardLabel, color, msg) {
    const entry = {
      boardId, boardLabel, color,
      msg: String(msg),
      ts: new Date().toLocaleTimeString('id-ID', { hour12: false })
    };
    this.lines.push(entry);
    if (this.lines.length > this.maxLines) this.lines.shift();

    if (this.filterBoard === 'all' || this.filterBoard === boardId) {
      this._appendDOM(entry);
    }
  }

  _appendDOM(entry) {
    if (!this.outputEl) return;
    const line = document.createElement('div');
    line.className = 'serial-line';
    line.dataset.boardId = entry.boardId;

    const board = document.createElement('span');
    board.className = 'serial-line-board';
    board.textContent = `[${entry.boardLabel || entry.boardId}]`;
    board.style.color = entry.color || '#6366f1';

    const ts = document.createElement('span');
    ts.className = 'serial-line-ts';
    ts.textContent = entry.ts;

    const msg = document.createElement('span');
    msg.className = 'serial-line-msg';
    if (this.hexMode) {
      msg.textContent = Array.from(entry.msg).map(c => c.charCodeAt(0).toString(16).padStart(2,'0').toUpperCase()).join(' ');
      msg.style.color = '#94a3b8';
    } else {
      msg.textContent = entry.msg;
    }

    line.appendChild(board);
    line.appendChild(ts);
    line.appendChild(msg);
    this.outputEl.appendChild(line);

    if (this.autoScroll) {
      this.outputEl.scrollTop = this.outputEl.scrollHeight;
    }
  }

  _rerender() {
    if (!this.outputEl) return;
    this.outputEl.innerHTML = '';
    const filtered = this.filterBoard === 'all'
      ? this.lines
      : this.lines.filter(l => l.boardId === this.filterBoard);
    filtered.forEach(e => this._appendDOM(e));
  }

  /** Add board option to board filter dropdown */
  addBoard(boardId, boardLabel, color) {
    if (!this.boardSel) return;
    const existing = this.boardSel.querySelector(`option[value="${boardId}"]`);
    if (existing) return;
    const opt = document.createElement('option');
    opt.value = boardId; opt.textContent = `🔲 ${boardLabel}`;
    opt.style.color = color;
    this.boardSel.appendChild(opt);
  }

  removeBoard(boardId) {
    if (!this.boardSel) return;
    const opt = this.boardSel.querySelector(`option[value="${boardId}"]`);
    if (opt) opt.remove();
  }

  _sendInput() {
    if (!this.inputEl) return;
    const raw = this.inputEl.value;
    if (!raw.trim()) return;
    const lineEnd = (this.lineEndSel && this.lineEndSel.value) || '\n';
    const data = raw + lineEnd;
    this.inputEl.value = '';

    // Send to simulator runtime
    if (window._cf_boardManager) {
      window._cf_boardManager.sendSerial(data);
    }
    // Echo in monitor
    this.appendLine('host', 'HOST', '#f59e0b', '> ' + raw);
  }

  clear() {
    this.lines = [];
    if (this.outputEl) this.outputEl.innerHTML = '';
  }

  saveLog() {
    const text = this.lines.map(l => `[${l.ts}][${l.boardLabel}] ${l.msg}`).join('\n');
    const blob = new Blob([text], { type: 'text/plain' });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement('a');
    a.href = url; a.download = 'serial_log.txt'; a.click();
    URL.revokeObjectURL(url);
  }

  /** Log system message */
  log(msg, type = 'info') {
    const colors = { info: '#6366f1', success: '#10b981', warning: '#f59e0b', error: '#ef4444' };
    this.appendLine('system', 'SYS', colors[type] || '#6366f1', msg);
  }
}

window.SerialMonitor = SerialMonitor;
console.log('[Serial] Module loaded');
