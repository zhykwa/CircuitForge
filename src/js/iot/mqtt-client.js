// mqtt-client.js — MQTT bridge: hubungkan pin simulator ke broker MQTT nyata

class MQTTClient {
  constructor() {
    this.client      = null;
    this.isConnected = false;
    this.mappings    = [];  // { boardId, pin, direction, topic, transform }
    this.onStatusChange = null;
    this.onMessage      = null;
    this.onLog          = null;
  }

  async connect(config) {
    const { host, port, username, password, clientId, useTLS } = config;
    const mqtt = await import('https://unpkg.com/mqtt/dist/mqtt.min.js').catch(() => null);
    if (!mqtt) {
      this._log('MQTT library tidak ditemukan. Pastikan koneksi internet tersedia.');
      return false;
    }
    const protocol = useTLS ? 'wss' : 'ws';
    const url = `${protocol}://${host}:${port || (useTLS ? 8883 : 1883)}/mqtt`;
    const options = { clientId: clientId || `circuitforge_${Date.now()}`, clean: true };
    if (username) { options.username = username; options.password = password; }

    this._log(`Menghubungkan ke ${url}...`);
    this.client = mqtt.default.connect(url, options);

    return new Promise((resolve) => {
      this.client.on('connect', () => {
        this.isConnected = true;
        this._log('✅ MQTT Terhubung!');
        this.onStatusChange?.('connected');
        this._resubscribeAll();
        resolve(true);
      });
      this.client.on('error', (e) => {
        this._log(`❌ MQTT Error: ${e.message}`);
        this.onStatusChange?.('error');
        resolve(false);
      });
      this.client.on('close', () => {
        this.isConnected = false;
        this._log('⚠️ MQTT Terputus.');
        this.onStatusChange?.('disconnected');
      });
      this.client.on('message', (topic, payload) => {
        const data = payload.toString();
        this._log(`📥 [${topic}] ${data}`);
        this._routeIncoming(topic, data);
        this.onMessage?.(topic, data);
      });
    });
  }

  disconnect() {
    if (this.client) { this.client.end(); this.client = null; }
    this.isConnected = false;
  }

  publish(topic, payload, qos = 0, retain = false) {
    if (!this.isConnected) return;
    this.client.publish(topic, String(payload), { qos, retain });
    this._log(`📤 [${topic}] ${payload}`);
  }

  subscribe(topic, qos = 0) {
    if (!this.isConnected) return;
    this.client.subscribe(topic, { qos });
    this._log(`📌 Subscribed: ${topic}`);
  }

  /**
   * Tambah mapping: pin board → topic MQTT (atau sebaliknya)
   * direction: 'publish' | 'subscribe'
   * transform: fungsi string → value atau value → string
   */
  addMapping(mapping) {
    this.mappings.push(mapping);
    if (mapping.direction === 'subscribe' && this.isConnected) {
      this.subscribe(mapping.topic);
    }
  }

  removeMapping(id) {
    this.mappings = this.mappings.filter(m => m.id !== id);
  }

  /**
   * Dipanggil saat pin simulator berubah → publish jika ada mapping
   */
  onPinChanged(boardId, pin, value) {
    const mapping = this.mappings.find(m =>
      m.direction === 'publish' && m.boardId === boardId && m.pin == pin
    );
    if (!mapping) return;
    const payload = mapping.transform ? mapping.transform(value) : String(value);
    this.publish(mapping.topic, payload, mapping.qos);
  }

  _routeIncoming(topic, data) {
    this.mappings.filter(m => m.direction === 'subscribe' && m.topic === topic).forEach(m => {
      const value = m.transform ? m.transform(data) : parseFloat(data) || 0;
      // Update pin di board simulator
      window.dispatchEvent(new CustomEvent('cf:mqtt-pin-update', {
        detail: { boardId: m.boardId, pin: m.pin, value }
      }));
    });
  }

  _resubscribeAll() {
    this.mappings.filter(m => m.direction === 'subscribe').forEach(m => this.subscribe(m.topic));
  }

  _log(msg) {
    console.log('[MQTT]', msg);
    this.onLog?.(`[MQTT] ${msg}`);
  }

  toJSON() { return { mappings: this.mappings }; }
  fromJSON(data) { this.mappings = data.mappings || []; }
}

module.exports = { MQTTClient };
