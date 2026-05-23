/**
 * CircuitForge — app.js
 * Main Application Controller connecting UI, Editor, Simulator, and 3D Canvas
 */

class AppController {
  constructor() {
    console.log('[App] Starting CircuitForge Initialization...');
    
    this.mode = 'design'; // 'design', 'simulate', 'schematic'
    
    // Core Managers
    this.sceneManager = null;
    this.boardManager = null;
    this.simCore = null;
    this.serialMonitor = null;
    this.editor = null;

    window.addEventListener('DOMContentLoaded', () => {
      this.init();
    });
  }

  init() {
    // 1. Initialize UI layouts and tabs
    this.initUI();

    // 2. Initialize 3D Canvas
    if (window.SceneManager) {
      this.sceneManager = new SceneManager('threeCanvas');
      window._cf_scene = this.sceneManager; // Expose globally for stubs
    } else {
      console.error('[App] SceneManager class not found');
    }

    // 3. Initialize Board Manager & Simulator Core
    if (window.BoardManager) {
      this.boardManager = new BoardManager();
      window._cf_boardManager = this.boardManager;
    }
    if (window.SimulatorCore) {
      this.simCore = new SimulatorCore();
      window._cf_simCore = this.simCore;
    }

    // 4. Initialize Editor
    if (window.CodeEditor) {
      this.editor = new CodeEditor('editorContainer');
    }

    // 5. Initialize Serial Monitor
    if (window.SerialMonitor) {
      this.serialMonitor = new SerialMonitor();
      window._cf_serial = this.serialMonitor;
    }

    // Bind global toolbar buttons
    this.bindToolbar();

    // Initial dummy board for testing
    this._createDemoScene();

    console.log('[App] Initialization complete');
  }

  initUI() {
    // Mode Buttons
    document.querySelectorAll('.mode-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        document.querySelectorAll('.mode-btn').forEach(b => b.classList.remove('active'));
        e.currentTarget.classList.add('active');
        this.setMode(e.currentTarget.dataset.mode);
      });
    });

    // Right Panel Tabs
    document.querySelectorAll('#panelRight .panel-tab').forEach(tab => {
      tab.addEventListener('click', (e) => {
        const targetId = 'panel-' + e.currentTarget.dataset.panel;
        document.querySelectorAll('#panelRight .panel-tab').forEach(t => t.classList.remove('active'));
        document.querySelectorAll('#panelRight .panel-body').forEach(b => b.classList.remove('active'));
        e.currentTarget.classList.add('active');
        const targetBody = document.getElementById(targetId);
        if (targetBody) targetBody.classList.add('active');
        
        // Refresh editor if switching to code tab
        if (targetId === 'panel-editor' && this.editor) {
          setTimeout(() => this.editor.refresh(), 10);
        }
      });
    });

    // Bottom Panel Tabs
    document.querySelectorAll('#bottomTabs .bottom-tab').forEach(tab => {
      tab.addEventListener('click', (e) => {
        const targetId = 'panel-' + e.currentTarget.dataset.panel;
        document.querySelectorAll('#bottomTabs .bottom-tab').forEach(t => t.classList.remove('active'));
        document.querySelectorAll('.bottom-panel').forEach(b => b.classList.remove('active'));
        e.currentTarget.classList.add('active');
        const targetBody = document.getElementById(targetId);
        if (targetBody) targetBody.classList.add('active');
      });
    });

    // Component Sections Toggle
    document.querySelectorAll('.comp-section-header').forEach(header => {
      header.addEventListener('click', (e) => {
        const section = e.currentTarget.parentElement;
        section.classList.toggle('collapsed');
      });
    });

    // Component Drag/Click Setup
    document.querySelectorAll('.comp-item').forEach(item => {
      // Ensure draggable
      item.setAttribute('draggable', 'true');
      
      item.addEventListener('click', (e) => {
        const compId = e.currentTarget.dataset.comp;
        this.onComponentSelected(compId, null);
      });

      // HTML5 Drag Start
      item.addEventListener('dragstart', (e) => {
        e.dataTransfer.setData('text/plain', e.currentTarget.dataset.comp);
        e.dataTransfer.effectAllowed = 'copy';
      });
    });

    // 3D Canvas Drop Zone
    const canvasContainer = document.getElementById('canvas3d'); // Changed to wrapper
    if (canvasContainer) {
      canvasContainer.addEventListener('dragover', (e) => {
        e.preventDefault(); // Necessary to allow dropping
        e.dataTransfer.dropEffect = 'copy';
      });

      canvasContainer.addEventListener('drop', (e) => {
        e.preventDefault();
        const compId = e.dataTransfer.getData('text/plain');
        if (compId) {
          // Get drop position in 3D space
          let pos = null;
          if (this.sceneManager && this.sceneManager.getDropPosition) {
            pos = this.sceneManager.getDropPosition(e.clientX, e.clientY);
          }
          this.onComponentSelected(compId, pos);
        }
      });
    }
  }

  bindToolbar() {
    const btnRun = document.getElementById('btnRunAll');
    const btnStop = document.getElementById('btnStopAll');

    if (btnRun) {
      btnRun.addEventListener('click', () => {
        if (this.simCore) this.simCore.startAll();
      });
    }

    if (btnStop) {
      btnStop.addEventListener('click', () => {
        if (this.simCore) this.simCore.stopAll();
      });
    }
  }

  setMode(newMode) {
    this.mode = newMode;
    console.log(`[App] Switched to mode: ${newMode}`);
    if (newMode === 'simulate' && this.simCore && !this.simCore.running) {
      this.simCore.startAll();
    } else if (newMode === 'design' && this.simCore && this.simCore.running) {
      this.simCore.stopAll();
    }
  }

  onComponentSelected(compId, position3D = null) {
    if (!this.sceneManager) return;
    
    console.log(`[App] Placing component: ${compId}`);
    
    // Default position if not provided by drop
    const pos = position3D || new THREE.Vector3(0, 0, 2);

    // Add board logic
    if (compId.startsWith('arduino') || compId.startsWith('esp')) {
      const boardId = `board_${Date.now()}`;
      if (this.boardManager) {
        this.boardManager.addBoard(boardId, compId);
      }
      if (window._cf_Component3DFactory) {
        const board3D = window._cf_Component3DFactory(compId, boardId);
        if (position3D) {
          board3D.group.position.copy(pos);
        } else {
          // Place slightly offset if multiple boards
          const boardCount = this.boardManager ? this.boardManager.boards.size : 1;
          board3D.group.position.set((boardCount-1) * 4, 0, 0);
        }
        this.sceneManager.addComponent(board3D);
      }
      return;
    }

    // Add general component (sensor, actuator, etc)
    // Assume attaching to the first board for now if none selected
    const boardId = this.boardManager && this.boardManager.boards.size > 0 
                    ? Array.from(this.boardManager.boards.keys())[0] 
                    : 'dummy_board';
                    
    if (window._cf_Component3DFactory) {
      const comp3D = window._cf_Component3DFactory(compId, boardId);
      comp3D.group.position.copy(pos);
      this.sceneManager.addComponent(comp3D);
    }
  }

  _createDemoScene() {
    // Automatically place an Uno and an LED for visual feedback on startup
    setTimeout(() => {
      if (this.boardManager && this.sceneManager && window._cf_Component3DFactory) {
        const boardId = 'board_demo_1';
        this.boardManager.addBoard(boardId, 'arduino:avr:uno');
        
        const uno = window._cf_Component3DFactory('arduino:avr:uno', boardId);
        this.sceneManager.addComponent(uno);

        const led = window._cf_Component3DFactory('LED-RED', boardId);
        led.group.position.set(2, 0, 1.5);
        this.sceneManager.addComponent(led);

        // Add dummy code to editor
        if (this.editor) {
          this.editor.setValue(`void setup() {\n  pinMode(13, OUTPUT);\n  Serial.begin(115200);\n  Serial.println("CircuitForge Ready!");\n}\n\nvoid loop() {\n  digitalWrite(13, HIGH);\n  delay(1000);\n  digitalWrite(13, LOW);\n  delay(1000);\n}`);
        }
      }
    }, 500);
  }
}

// Start app
const app = new AppController();
window._cf_app = app;
