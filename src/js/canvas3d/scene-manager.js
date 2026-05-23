/**
 * CircuitForge — canvas3d/scene-manager.js
 * Manages the Three.js 3D environment, camera, lighting, and rendering loop
 */

class SceneManager {
  constructor(containerId) {
    this.container = document.getElementById(containerId);
    if (!this.container) {
      console.warn(`[SceneManager] Container #${containerId} not found`);
      return;
    }

    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x0a0a0f); // Match app dark theme

    this.camera = new THREE.PerspectiveCamera(45, this.container.clientWidth / this.container.clientHeight, 0.1, 1000);
    this.camera.position.set(0, 15, 20);

    this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    this.renderer.setSize(this.container.clientWidth, this.container.clientHeight);
    this.renderer.setPixelRatio(window.devicePixelRatio);
    this.container.appendChild(this.renderer.domElement);

    // Controls
    // Note: Assuming OrbitControls is loaded globally or we implement basic mouse controls
    if (typeof THREE.OrbitControls !== 'undefined') {
      this.controls = new THREE.OrbitControls(this.camera, this.renderer.domElement);
      this.controls.enableDamping = true;
      this.controls.dampingFactor = 0.05;
      this.controls.maxPolarAngle = Math.PI / 2 - 0.05; // Don't go below ground
    } else {
      console.warn('[SceneManager] THREE.OrbitControls not found. Mouse rotation will be limited.');
    }

    // Components and instances
    this.components = new Map(); // id -> CF3DComponent

    // Interaction variables
    this.raycaster = new THREE.Raycaster();
    this.mouse = new THREE.Vector2();
    this.dragPlane = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0); // Flat on ground
    this.dragOffset = new THREE.Vector3();
    this.selectedComponent = null;
    this.hoveredComponent = null;
    this.isDragging = false;

    this._setupLighting();
    this._setupGrid();
    this._initInteraction();

    // Resize handler
    window.addEventListener('resize', () => this.resize());

    // Start render loop
    this.animate = this.animate.bind(this);
    requestAnimationFrame(this.animate);

    console.log('[SceneManager] Initialized');
  }

  _setupLighting() {
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    this.scene.add(ambientLight);

    const dirLight = new THREE.DirectionalLight(0xffffff, 0.8);
    dirLight.position.set(10, 20, 10);
    this.scene.add(dirLight);

    const fillLight = new THREE.DirectionalLight(0xaabbff, 0.3);
    fillLight.position.set(-10, 10, -10);
    this.scene.add(fillLight);
  }

  _setupGrid() {
    const grid = new THREE.GridHelper(40, 40, 0x334155, 0x1e293b);
    grid.position.y = -0.01;
    this.scene.add(grid);
  }

  resize() {
    if (!this.container) return;
    const w = this.container.clientWidth;
    const h = this.container.clientHeight;
    this.camera.aspect = w / h;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(w, h);
  }

  addComponent(component3d) {
    this.components.set(component3d.id, component3d);
    this.scene.add(component3d.group);
  }

  removeComponent(id) {
    const comp = this.components.get(id);
    if (comp) {
      this.scene.remove(comp.group);
      comp.dispose();
      this.components.delete(id);
    }
  }

  clear() {
    this.components.forEach(c => c.dispose());
    this.components.clear();
    // Remove all children except lights and grid
    const toRemove = [];
    this.scene.traverse(child => {
      if (child.userData && child.userData.cfId) {
        toRemove.push(child);
      }
    });
    toRemove.forEach(child => this.scene.remove(child));
  }

  updateSimulation(allPinStates) {
    // allPinStates is { boardId: { pinName: value } }
    this.components.forEach(comp => {
      const boardStates = allPinStates[comp.boardId];
      if (boardStates) {
        comp.update(boardStates);
      }
    });
  }

  // --- Interaction Logic ---
  
  _initInteraction() {
    const dom = this.renderer.domElement;
    dom.addEventListener('pointerdown', this._onPointerDown.bind(this));
    dom.addEventListener('pointermove', this._onPointerMove.bind(this));
    dom.addEventListener('pointerup', this._onPointerUp.bind(this));
  }

  _updateMousePos(event) {
    const rect = this.renderer.domElement.getBoundingClientRect();
    this.mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
    this.mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
  }

  _getIntersectedComponent() {
    this.raycaster.setFromCamera(this.mouse, this.camera);
    // Find all meshes in the scene
    const intersects = this.raycaster.intersectObjects(this.scene.children, true);
    
    for (const hit of intersects) {
      // Traverse up to find the root group of the CF3DComponent
      let obj = hit.object;
      while (obj) {
        if (obj.userData && obj.userData.cfId) {
          return this.components.get(obj.userData.cfId);
        }
        obj = obj.parent;
      }
    }
    return null;
  }

  _onPointerDown(event) {
    if (event.button !== 0) return; // Only left click
    this._updateMousePos(event);
    
    const comp = this._getIntersectedComponent();
    if (comp) {
      // Select component
      if (this.selectedComponent && this.selectedComponent !== comp) {
        this.selectedComponent.deselect();
      }
      this.selectedComponent = comp;
      comp.select();

      // Start drag
      this.isDragging = true;
      if (this.controls) this.controls.enabled = false; // Disable camera orbit while dragging
      
      // Calculate offset
      this.raycaster.setFromCamera(this.mouse, this.camera);
      const hit = new THREE.Vector3();
      this.raycaster.ray.intersectPlane(this.dragPlane, hit);
      if (hit) {
        this.dragOffset.copy(comp.group.position).sub(hit);
      }
    } else {
      // Clicked on empty space
      if (this.selectedComponent) {
        this.selectedComponent.deselect();
        this.selectedComponent = null;
      }
    }
  }

  _onPointerMove(event) {
    this._updateMousePos(event);

    if (this.isDragging && this.selectedComponent) {
      // Move component
      this.raycaster.setFromCamera(this.mouse, this.camera);
      const hit = new THREE.Vector3();
      this.raycaster.ray.intersectPlane(this.dragPlane, hit);
      if (hit) {
        // Snap to grid (0.5 units)
        const snap = 0.5;
        const targetX = hit.x + this.dragOffset.x;
        const targetZ = hit.z + this.dragOffset.z;
        this.selectedComponent.group.position.x = Math.round(targetX / snap) * snap;
        this.selectedComponent.group.position.z = Math.round(targetZ / snap) * snap;
      }
    } else {
      // Hover effect
      const comp = this._getIntersectedComponent();
      if (comp !== this.hoveredComponent) {
        if (this.hoveredComponent) this.hoveredComponent.setHover(false);
        this.hoveredComponent = comp;
        if (this.hoveredComponent) this.hoveredComponent.setHover(true);
      }
      // Change cursor
      this.renderer.domElement.style.cursor = comp ? 'grab' : 'default';
    }
  }

  _onPointerUp(event) {
    this.isDragging = false;
    if (this.controls) this.controls.enabled = true; // Re-enable camera orbit
    this.renderer.domElement.style.cursor = this.hoveredComponent ? 'grab' : 'default';
  }

  // Calculate 3D position from screen drop coordinates
  getDropPosition(clientX, clientY) {
    const rect = this.renderer.domElement.getBoundingClientRect();
    const mouseX = ((clientX - rect.left) / rect.width) * 2 - 1;
    const mouseY = -((clientY - rect.top) / rect.height) * 2 + 1;
    
    this.raycaster.setFromCamera(new THREE.Vector2(mouseX, mouseY), this.camera);
    const hit = new THREE.Vector3();
    this.raycaster.ray.intersectPlane(this.dragPlane, hit);
    
    if (hit) {
      const snap = 0.5;
      hit.x = Math.round(hit.x / snap) * snap;
      hit.z = Math.round(hit.z / snap) * snap;
      return hit;
    }
    return new THREE.Vector3(0, 0, 0);
  }

  animate() {
    requestAnimationFrame(this.animate);
    if (this.controls) this.controls.update();
    if (window.TWEEN) window.TWEEN.update();
    this.renderer.render(this.scene, this.camera);
  }
}

window.SceneManager = SceneManager;
