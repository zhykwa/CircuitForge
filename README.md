<p align="center">
  <img src="https://img.shields.io/badge/CircuitForge-v0.1.0-6366f1?style=for-the-badge&labelColor=0a0a0f" />
  <img src="https://img.shields.io/badge/Platform-Electron-47848f?style=for-the-badge&labelColor=0a0a0f" />
  <img src="https://img.shields.io/badge/License-MIT-10b981?style=for-the-badge&labelColor=0a0a0f" />
  <img src="https://img.shields.io/badge/Status-Alpha-f59e0b?style=for-the-badge&labelColor=0a0a0f" />
</p>

<h1 align="center">⚡ CircuitForge</h1>
<p align="center"><b>Desktop IoT Simulator & IDE · Multi-board · 3D Canvas · Community Driven</b></p>

<p align="center">
  <em>Wokwi meets Tinkercad meets Proteus — as an offline desktop app, built for real engineers.</em>
</p>

---

## 🚀 Tentang CircuitForge

**CircuitForge** adalah aplikasi desktop (Electron) untuk:

- 🔌 **Simulasi mikrokontroler** — Arduino, ESP32, STM32, Raspberry Pi Pico
- 🌐 **IoT Integration** — MQTT, Blynk, HTTP langsung dari simulator
- 🧊 **3D Canvas** — Desain rangkaian secara 3D dengan gaya sketch
- 🤖 **Robotika** — Simulasi robot arm, differential drive, drone
- 📦 **Library Arduino** — Kompatibel dengan 30+ library populer (DHT, Servo, NeoPixel, dll)
- 🛠️ **Multi-board** — Beberapa mikrokontroler berkomunikasi dalam satu proyek
- 📟 **Instrumen Virtual** — Oscilloscope, Logic Analyzer, Multimeter, Signal Generator
- 🏪 **Community Marketplace** *(roadmap)* — Upload komponen & library buatan sendiri

---

## 🎯 Fitur Utama

| Fitur | Status |
|-------|--------|
| 3D Canvas (Three.js, Sketch-style) | 🚧 Alpha |
| Code Editor C++ (CodeMirror + Arduino hints) | ✅ Ready |
| Multi-board simulation | 🚧 Alpha |
| Serial Monitor (multi-board, colored) | ✅ Ready |
| Oscilloscope & Logic Analyzer | 🚧 Alpha |
| Multimeter & Signal Generator | 🚧 Alpha |
| MQTT / Blynk / HTTP Bridge | 🚧 Alpha |
| Library stubs (30+ libraries) | ✅ Ready |
| Sensor calibration engine | 🚧 Alpha |
| Blockly visual programming | 📋 Planned |
| Community Marketplace | 📋 Planned |
| arduino-cli compile & upload | 🚧 Alpha |

---

## 🛠️ Komponen yang Didukung

### Mikrokontroler
`Arduino Uno` `Arduino Mega` `Arduino Nano` `ESP32` `ESP32-S3` `ESP8266 NodeMCU` `STM32 Blue Pill` `Raspberry Pi Pico`

### Sensor
`DHT11/22` `HC-SR04` `HC-SR501 PIR` `BME280/680` `MPU-6050` `DS18B20` `HX711` `MQ-2/7/135` `BH1750` `TSL2561` `VL53L0X` `SHT31` `AHT20` `MAX30102` `DS3231 RTC` ...dan lebih banyak lagi

### Aktuator
`LED (semua warna)` `WS2812B NeoPixel` `SG90/MG996R Servo` `L298N` `Relay` `Buzzer` `DC Motor` `Stepper Motor`

### Display
`LCD 16×2 I2C` `OLED SSD1306` `TM1637` `MAX7219 LED Matrix`

### Komunikasi
`MQTT (PubSubClient)` `Blynk` `WiFi ESP32/8266` `HTTP Client` `RF24 nRF24L01` `MFRC522 RFID` `SoftwareSerial`

### Robotika
`Robot Arm Segment` `Differential Drive` `Pan-Tilt Mount` `Drone Frame`

---

## 💻 Instalasi

### Prasyarat
- [Node.js](https://nodejs.org) v18+
- [Git](https://git-scm.com)
- [arduino-cli](https://arduino.github.io/arduino-cli/latest/installation/) (untuk compile & upload nyata)

```bash
# Clone repo
git clone https://github.com/Naufal0106/CircuitForge.git
cd CircuitForge

# Install dependencies
npm install

# Jalankan aplikasi
npm start
```

---

## 📁 Struktur Proyek

```
CircuitForge/
├── main.js                    # Electron main process
├── preload.js                 # Context bridge
├── src/
│   ├── index.html             # UI utama (5-panel layout)
│   ├── styles/
│   │   ├── main.css           # Design system (dark glassmorphism)
│   │   ├── breadboard.css     # Component library panel
│   │   ├── panels.css         # Panel extras & tooltips
│   │   └── instruments.css    # Virtual instruments
│   └── js/
│       ├── app.js             # Main controller
│       ├── editor.js          # CodeMirror C++ editor
│       ├── serial.js          # Serial monitor
│       ├── simulator/
│       │   ├── core.js        # Simulation engine
│       │   ├── runtime.js     # Per-board runtime
│       │   ├── stub-loader.js # Library stub injection
│       │   └── stubs/         # 30+ library stubs
│       ├── canvas3d/
│       │   ├── scene-manager.js
│       │   ├── sketch-material.js
│       │   └── component-3d/  # All 3D models
│       ├── multi-board/
│       │   ├── board-manager.js
│       │   ├── bus-router.js
│       │   └── connection-editor.js
│       ├── instruments/       # Oscilloscope, Logic, Multimeter, SigGen
│       ├── calibration/       # Sensor calibration engine
│       └── iot/               # MQTT, Blynk, HTTP clients
└── package.json
```

---

## 🌐 IoT Integration

CircuitForge mendukung koneksi IoT langsung dari simulator:

```cpp
// MQTT — persis seperti di hardware nyata
#include <PubSubClient.h>
client.setServer("broker.hivemq.com", 1883);
client.publish("sensor/suhu", String(temperature).c_str());

// Blynk
#include <BlynkSimpleEsp32.h>
Blynk.begin(auth, ssid, pass);
Blynk.virtualWrite(V1, temperature);

// HTTP
#include <HTTPClient.h>
http.begin("http://api.thingspeak.com/update?api_key=...");
```

---

## 📡 Multi-Board Communication

Beberapa mikrokontroler bisa saling berkomunikasi dalam satu proyek:

```
[Arduino Uno]  ←— UART —→  [ESP32]  ←— MQTT —→  [Cloud]
      ↑                        ↑
    [DHT22]               [Relay Module]
```

---

## 🎨 Desain Filosofi

- **Sketch-style 3D** — Menggunakan Three.js dengan MeshToonMaterial agar ringan dan artistik
- **Offline-first** — Semua fitur inti berjalan tanpa internet
- **Real-world accurate** — Kalibrasi komponen (noise model Gaussian, drift, quantize)
- **Community-driven** *(roadmap)* — Plugin system seperti Unity Asset Store

---

## 🗺️ Roadmap

- **Phase 1** (saat ini): Core simulator desktop
- **Phase 2**: Marketplace komunitas + backend
- **Phase 3**: Cloud sync + collaborative editing
- **Phase 4**: Hardware-in-the-loop (HIL) testing

---

## 🤝 Berkontribusi

CircuitForge adalah proyek open-source yang sangat menyambut kontribusi!

1. Fork repo ini
2. Buat branch: `git checkout -b fitur/nama-fitur`
3. Commit: `git commit -m 'feat: tambah komponen X'`
4. Push: `git push origin fitur/nama-fitur`
5. Buat Pull Request

---

## 📄 Lisensi

MIT License — bebas digunakan, dimodifikasi, dan didistribusikan.

---

<p align="center">
  Dibuat dengan ❤️ untuk komunitas IoT & Teknik Elektro Indonesia<br>
  <b>CircuitForge</b> — <em>Forge your circuits, forge your future.</em>
</p>
