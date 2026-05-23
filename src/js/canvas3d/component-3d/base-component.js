/**
 * CircuitForge — canvas3d/component-3d/base-component.js
 * Base class for all 3D components on the canvas
 */

class CF3DComponent {
  constructor(compId, boardId, instanceId) {
    this.compId     = compId;       // e.g. "DHT22", "arduino:avr:uno"
    this.boardId    = boardId;      // parent board id
    this.id         = instanceId || `${compId}_${Date.now()}_${Math.random().toString(36).slice(2,6)}`;
    this.group      = new THREE.Group();
    this.group.userData.cfId     = this.id;
    this.group.userData.compId   = compId;
    this.group.userData.boardId  = boardId;
    this.selected   = false;
    this.hovered    = false;
    this.pinMeshes  = {};  // pinName -> THREE.Mesh (sphere at pin position)
    this._label     = null;
    this._originalMaterials = new Map();  // mesh -> original material
    this._simValues = {};  // current simulation values
  }

  /** Override in subclass to build geometry */
  build() {}

  /**
   * Called each simulation frame with pin states for this component
   * @param {Object} pinStates - { pinName: value }
   */
  update(pinStates) {}

  /** Select highlight */
  select() {
    if (this.selected) return;
    this.selected = true;
    this.group.traverse(obj => {
      if (obj.isMesh && obj.material) {
        if (!this._originalMaterials.has(obj)) {
          this._originalMaterials.set(obj, obj.material);
        }
        const mat = obj.material.clone();
        mat.emissive = new THREE.Color(0xf59e0b);
        mat.emissiveIntensity = 0.4;
        obj.material = mat;
      }
    });
  }

  /** Remove selection highlight */
  deselect() {
    if (!this.selected) return;
    this.selected = false;
    this.group.traverse(obj => {
      if (obj.isMesh && this._originalMaterials.has(obj)) {
        obj.material = this._originalMaterials.get(obj);
      }
    });
    this._originalMaterials.clear();
  }

  /** Hover highlight */
  setHover(on) {
    if (this.hovered === on) return;
    this.hovered = on;
    if (this.selected) return;
    this.group.traverse(obj => {
      if (obj.isMesh && obj.material && !obj.userData.isPin) {
        if (on) {
          if (!this._originalMaterials.has(obj)) {
            this._originalMaterials.set(obj, obj.material);
          }
          const mat = obj.material.clone();
          mat.emissive = new THREE.Color(0x818cf8);
          mat.emissiveIntensity = 0.2;
          obj.material = mat;
        } else {
          if (this._originalMaterials.has(obj)) {
            obj.material = this._originalMaterials.get(obj);
            this._originalMaterials.delete(obj);
          }
        }
      }
    });
  }

  /** Get world position of a pin */
  getPinWorldPosition(pinName) {
    const mesh = this.pinMeshes[pinName];
    if (!mesh) return this.group.position.clone();
    const pos = new THREE.Vector3();
    mesh.getWorldPosition(pos);
    return pos;
  }

  /** Add a pin sphere (small dot at pin location) */
  _addPin(name, localX, localY, localZ, color) {
    const geo = new THREE.SphereGeometry(0.04, 6, 6);
    const mat = new THREE.MeshBasicMaterial({ color: color || 0xd4a017 });
    const mesh = new THREE.Mesh(geo, mat);
    mesh.position.set(localX, localY, localZ);
    mesh.userData.isPinMarker = true;
    mesh.userData.pinName = name;
    mesh.visible = false;  // only show when selected
    this.group.add(mesh);
    this.pinMeshes[name] = mesh;
    return mesh;
  }

  /** Show/hide pin markers */
  showPins(show) {
    Object.values(this.pinMeshes).forEach(m => m.visible = show);
  }

  /** Add component label sprite */
  _addLabel(text, offsetY) {
    if (window._cf_SketchMaterial) {
      const sprite = window._cf_SketchMaterial.textSprite(text, { fontSize: 20, width: 1.2, height: 0.3 });
      sprite.position.set(0, offsetY || 0.5, 0);
      sprite.userData.isLabel = true;
      this.group.add(sprite);
      this._label = sprite;
    }
  }

  /** Set label text */
  setLabel(text) {
    if (this._label && this._label.material && this._label.material.map) {
      const canvas = this._label.material.map.image;
      const ctx = canvas.getContext('2d');
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = '#ffffff'; ctx.font = 'bold 20px monospace'; ctx.textAlign = 'center';
      ctx.fillText(text, 128, 40);
      this._label.material.map.needsUpdate = true;
    }
  }

  /** Set LED glow (changes emissive on LED mesh) */
  _setLEDState(meshName, on, color) {
    const mesh = this.group.getObjectByName(meshName);
    if (!mesh) return;
    if (on) {
      mesh.material.color.setHex(color || 0x00ff00);
      mesh.material.emissive = new THREE.Color(color || 0x00ff00);
      mesh.material.emissiveIntensity = 0.8;
    } else {
      mesh.material.color.setHex(0x333344);
      mesh.material.emissive = new THREE.Color(0x000000);
      mesh.material.emissiveIntensity = 0;
    }
  }

  /** Serialize component state to JSON */
  toJSON() {
    return {
      id:      this.id,
      compId:  this.compId,
      boardId: this.boardId,
      position: {
        x: this.group.position.x,
        y: this.group.position.y,
        z: this.group.position.z,
      },
      rotation: {
        x: this.group.rotation.x,
        y: this.group.rotation.y,
        z: this.group.rotation.z,
      },
      simValues: this._simValues,
    };
  }

  /** Restore from JSON */
  fromJSON(data) {
    if (data.position) this.group.position.set(data.position.x, data.position.y, data.position.z);
    if (data.rotation) this.group.rotation.set(data.rotation.x, data.rotation.y, data.rotation.z);
    if (data.simValues) Object.assign(this._simValues, data.simValues);
  }

  /** Clean up Three.js resources */
  dispose() {
    this.group.traverse(obj => {
      if (obj.isMesh) {
        if (obj.geometry) obj.geometry.dispose();
        if (obj.material) {
          if (Array.isArray(obj.material)) obj.material.forEach(m => m.dispose());
          else obj.material.dispose();
        }
      }
    });
  }
}

window.CF3DComponent = CF3DComponent;
console.log('[Base3D] CF3DComponent loaded');
