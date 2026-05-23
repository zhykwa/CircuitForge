// component-registry.js — Daftar master semua 50+ komponen CircuitForge
// Setiap komponen memiliki kode part asli, pinout, library, dan perilaku simulasi

const COMPONENT_REGISTRY = {

  // ════════════════════════════════════════════
  // 🖥️  DISPLAY
  // ════════════════════════════════════════════

  'HD44780-I2C': {
    id: 'HD44780-I2C', partCode: 'HD44780 + PCF8574', category: 'display',
    name: 'LCD 16x2 (I2C)', shortName: 'LCD 16x2',
    description: 'Liquid Crystal Display 16 karakter x 2 baris via I2C backpack PCF8574.',
    color: '#1a6b3a', icon: '🖥️',
    pins: [
      { name: 'VCC',  type: 'power',  voltage: 5   },
      { name: 'GND',  type: 'ground'                },
      { name: 'SDA',  type: 'i2c',    note: 'Data'  },
      { name: 'SCL',  type: 'i2c',    note: 'Clock' },
    ],
    defaultAddress: '0x27',
    library: 'LiquidCrystal_I2C',
    simulate: { type: 'lcd', cols: 16, rows: 2 },
    datasheet: 'https://www.sparkfun.com/datasheets/LCD/HD44780.pdf',
    exampleCode: `#include <LiquidCrystal_I2C.h>\nLiquidCrystal_I2C lcd(0x27, 16, 2);\nvoid setup() { lcd.init(); lcd.backlight(); lcd.print("CircuitForge!"); }\nvoid loop() {}`,
    width: 120, height: 50,
  },

  'HD44780-20x4': {
    id: 'HD44780-20x4', partCode: 'HD44780 + PCF8574', category: 'display',
    name: 'LCD 20x4 (I2C)', shortName: 'LCD 20x4',
    description: 'Liquid Crystal Display 20 karakter x 4 baris via I2C.',
    color: '#1a6b3a', icon: '🖥️',
    pins: [
      { name: 'VCC', type: 'power', voltage: 5 }, { name: 'GND', type: 'ground' },
      { name: 'SDA', type: 'i2c' }, { name: 'SCL', type: 'i2c' },
    ],
    defaultAddress: '0x27',
    library: 'LiquidCrystal_I2C',
    simulate: { type: 'lcd', cols: 20, rows: 4 },
    datasheet: 'https://www.sparkfun.com/datasheets/LCD/HD44780.pdf',
    exampleCode: `#include <LiquidCrystal_I2C.h>\nLiquidCrystal_I2C lcd(0x27, 20, 4);\nvoid setup() { lcd.init(); lcd.backlight(); lcd.setCursor(0,0); lcd.print("CircuitForge"); }\nvoid loop() {}`,
    width: 150, height: 65,
  },

  'SSD1306': {
    id: 'SSD1306', partCode: 'SSD1306', category: 'display',
    name: 'OLED 0.96" 128x64 (I2C)', shortName: 'OLED 128x64',
    description: 'Display OLED monokrom 0.96 inci resolusi 128x64 piksel.',
    color: '#0a0a0a', icon: '📺',
    pins: [
      { name: 'VCC', type: 'power', voltage: 3.3 }, { name: 'GND', type: 'ground' },
      { name: 'SDA', type: 'i2c' }, { name: 'SCL', type: 'i2c' },
    ],
    defaultAddress: '0x3C',
    library: 'Adafruit_SSD1306',
    simulate: { type: 'oled', width: 128, height: 64 },
    datasheet: 'https://cdn-shop.adafruit.com/datasheets/SSD1306.pdf',
    exampleCode: `#include <Adafruit_SSD1306.h>\nAdafruit_SSD1306 display(128, 64, &Wire, -1);\nvoid setup() { display.begin(SSD1306_SWITCHCAPVCC, 0x3C); display.clearDisplay(); display.setTextSize(1); display.setTextColor(WHITE); display.setCursor(0,0); display.println("CircuitForge!"); display.display(); }\nvoid loop() {}`,
    width: 80, height: 55,
  },

  'MAX7219': {
    id: 'MAX7219', partCode: 'MAX7219', category: 'display',
    name: '8x8 LED Matrix (MAX7219)', shortName: 'LED Matrix',
    description: 'Matriks LED 8x8 dengan driver MAX7219 via SPI.',
    color: '#222', icon: '⬛',
    pins: [
      { name: 'VCC', type: 'power', voltage: 5 }, { name: 'GND', type: 'ground' },
      { name: 'DIN', type: 'spi', note: 'MOSI' },
      { name: 'CS',  type: 'spi', note: 'Chip Select' },
      { name: 'CLK', type: 'spi', note: 'Clock' },
    ],
    library: 'LedControl',
    simulate: { type: 'led-matrix', rows: 8, cols: 8 },
    datasheet: 'https://datasheets.maximintegrated.com/en/ds/MAX7219-MAX7221.pdf',
    exampleCode: `#include <LedControl.h>\nLedControl lc = LedControl(11, 13, 10, 1);\nvoid setup() { lc.shutdown(0, false); lc.setIntensity(0, 8); lc.clearDisplay(0); }\nvoid loop() { lc.setLed(0, 3, 3, true); delay(500); lc.setLed(0, 3, 3, false); delay(500); }`,
    width: 90, height: 90,
  },

  'TM1637': {
    id: 'TM1637', partCode: 'TM1637', category: 'display',
    name: '7-Segment 4-Digit (TM1637)', shortName: '7-Seg TM1637',
    description: 'Display 7-segment 4 digit dengan driver TM1637.',
    color: '#c0392b', icon: '🔢',
    pins: [
      { name: 'VCC', type: 'power', voltage: 5 }, { name: 'GND', type: 'ground' },
      { name: 'CLK', type: 'digital' }, { name: 'DIO', type: 'digital' },
    ],
    library: 'TM1637Display',
    simulate: { type: 'seven-segment', digits: 4 },
    datasheet: 'https://www.mcielectronics.cl/website_MCI/static/documents/Datasheet_TM1637.pdf',
    exampleCode: `#include <TM1637Display.h>\nTM1637Display display(2, 3);\nvoid setup() { display.setBrightness(0x0f); display.showNumberDec(1234); }\nvoid loop() {}`,
    width: 100, height: 40,
  },

  // ════════════════════════════════════════════
  // 🌡️  SENSOR SUHU & KELEMBABAN
  // ════════════════════════════════════════════

  'DHT11': {
    id: 'DHT11', partCode: 'DHT11', category: 'sensor-env',
    name: 'DHT11 — Suhu & Kelembaban', shortName: 'DHT11',
    description: 'Sensor suhu (0-50°C ±2°C) dan kelembaban (20-80% ±5%) 1-wire.',
    color: '#3498db', icon: '🌡️',
    pins: [
      { name: 'VCC', type: 'power', voltage: 5 }, { name: 'GND', type: 'ground' },
      { name: 'DATA', type: 'digital', note: '1-Wire Signal' },
    ],
    library: 'DHT sensor library',
    simulate: {
      type: 'dht', variant: 'DHT11',
      controls: [
        { id: 'temp', label: 'Suhu (°C)', min: 0,  max: 50,  step: 0.5, default: 28 },
        { id: 'hum',  label: 'Kelembaban (%)', min: 20, max: 80, step: 1, default: 65 },
      ],
    },
    datasheet: 'https://www.mouser.com/datasheet/2/758/DHT11-Technical-Data-Sheet-Translated-Version-1143054.pdf',
    exampleCode: `#include <DHT.h>\n#define DHTPIN 2\n#define DHTTYPE DHT11\nDHT dht(DHTPIN, DHTTYPE);\nvoid setup() { Serial.begin(9600); dht.begin(); }\nvoid loop() { float h = dht.readHumidity(); float t = dht.readTemperature(); Serial.print("Temp: "); Serial.print(t); Serial.print("C  Hum: "); Serial.print(h); Serial.println("%"); delay(2000); }`,
    width: 40, height: 55,
  },

  'DHT22': {
    id: 'DHT22', partCode: 'DHT22 / AM2302', category: 'sensor-env',
    name: 'DHT22 — Suhu & Kelembaban (Presisi)', shortName: 'DHT22',
    description: 'Sensor suhu (-40 to 80°C ±0.5°C) dan kelembaban (0-100% ±2%) 1-wire.',
    color: '#2980b9', icon: '🌡️',
    pins: [
      { name: 'VCC', type: 'power', voltage: 3.3 }, { name: 'GND', type: 'ground' },
      { name: 'DATA', type: 'digital', note: '1-Wire Signal' },
    ],
    library: 'DHT sensor library',
    simulate: {
      type: 'dht', variant: 'DHT22',
      controls: [
        { id: 'temp', label: 'Suhu (°C)', min: -40, max: 80,  step: 0.1, default: 28 },
        { id: 'hum',  label: 'Kelembaban (%)', min: 0,  max: 100, step: 0.5, default: 65 },
      ],
    },
    datasheet: 'https://www.sparkfun.com/datasheets/Sensors/Temperature/DHT22.pdf',
    exampleCode: `#include <DHT.h>\n#define DHTPIN 2\n#define DHTTYPE DHT22\nDHT dht(DHTPIN, DHTTYPE);\nvoid setup() { Serial.begin(9600); dht.begin(); }\nvoid loop() { float h = dht.readHumidity(); float t = dht.readTemperature(); Serial.print("Temp: "); Serial.print(t); Serial.print("C  Hum: "); Serial.print(h); Serial.println("%"); delay(2000); }`,
    width: 40, height: 55,
  },

  'DS18B20': {
    id: 'DS18B20', partCode: 'DS18B20', category: 'sensor-env',
    name: 'DS18B20 — Suhu Waterproof', shortName: 'DS18B20',
    description: 'Sensor suhu digital waterproof (-55 to 125°C ±0.5°C) via protokol 1-Wire.',
    color: '#16a085', icon: '🌡️',
    pins: [
      { name: 'VCC', type: 'power', voltage: 5 }, { name: 'GND', type: 'ground' },
      { name: 'DATA', type: 'digital', note: '1-Wire (pullup 4.7kΩ ke VCC)' },
    ],
    library: 'DallasTemperature',
    simulate: {
      type: 'analog-sensor', unit: '°C',
      controls: [{ id: 'temp', label: 'Suhu (°C)', min: -55, max: 125, step: 0.1, default: 25 }],
    },
    datasheet: 'https://datasheets.maximintegrated.com/en/ds/DS18B20.pdf',
    exampleCode: `#include <OneWire.h>\n#include <DallasTemperature.h>\n#define ONE_WIRE_BUS 2\nOneWire oneWire(ONE_WIRE_BUS);\nDallasTemperature sensors(&oneWire);\nvoid setup() { Serial.begin(9600); sensors.begin(); }\nvoid loop() { sensors.requestTemperatures(); Serial.print("Temp: "); Serial.print(sensors.getTempCByIndex(0)); Serial.println("C"); delay(1000); }`,
    width: 30, height: 70,
  },

  'LM35': {
    id: 'LM35', partCode: 'LM35DZ', category: 'sensor-env',
    name: 'LM35 — Sensor Suhu Analog', shortName: 'LM35',
    description: 'Sensor suhu analog 10mV/°C output. Range 0-100°C, tidak butuh kalibrasi.',
    color: '#8e44ad', icon: '🌡️',
    pins: [
      { name: 'VCC', type: 'power', voltage: 5 }, { name: 'GND', type: 'ground' },
      { name: 'VOUT', type: 'analog', note: '10mV/°C → analogRead → suhu = val*500/1023' },
    ],
    library: null,
    simulate: {
      type: 'analog-sensor', analogPin: true, unit: '°C',
      controls: [{ id: 'temp', label: 'Suhu (°C)', min: 0, max: 100, step: 0.5, default: 30 }],
      readFormula: 'analogRead(pin) * 500.0 / 1023.0',
    },
    datasheet: 'https://www.ti.com/lit/ds/symlink/lm35.pdf',
    exampleCode: `void setup() { Serial.begin(9600); }\nvoid loop() { int raw = analogRead(A0); float tempC = raw * 500.0 / 1023.0; Serial.print("Temp: "); Serial.print(tempC); Serial.println(" C"); delay(1000); }`,
    width: 35, height: 50,
  },

  'BME280': {
    id: 'BME280', partCode: 'BME280', category: 'sensor-env',
    name: 'BME280 — Suhu + Kelembaban + Tekanan', shortName: 'BME280',
    description: 'Sensor lingkungan presisi tinggi: suhu, kelembaban, tekanan udara (altitude).',
    color: '#e67e22', icon: '🌤️',
    pins: [
      { name: 'VCC', type: 'power', voltage: 3.3 }, { name: 'GND', type: 'ground' },
      { name: 'SDA', type: 'i2c' }, { name: 'SCL', type: 'i2c' },
    ],
    defaultAddress: '0x76',
    library: 'Adafruit_BME280',
    simulate: {
      type: 'multi-sensor', unit: '',
      controls: [
        { id: 'temp',     label: 'Suhu (°C)',           min: -40, max: 85,   step: 0.1, default: 28 },
        { id: 'hum',      label: 'Kelembaban (%)',       min: 0,   max: 100,  step: 0.5, default: 65 },
        { id: 'pressure', label: 'Tekanan Udara (hPa)', min: 300, max: 1100, step: 0.1, default: 1013 },
      ],
    },
    datasheet: 'https://www.bosch-sensortec.com/media/boschsensortec/downloads/datasheets/bst-bme280-ds002.pdf',
    exampleCode: `#include <Adafruit_BME280.h>\nAdafruit_BME280 bme;\nvoid setup() { Serial.begin(9600); bme.begin(0x76); }\nvoid loop() { Serial.print("T="); Serial.print(bme.readTemperature()); Serial.print("C  H="); Serial.print(bme.readHumidity()); Serial.print("%  P="); Serial.print(bme.readPressure() / 100.0); Serial.println("hPa"); delay(2000); }`,
    width: 50, height: 40,
  },

  // ════════════════════════════════════════════
  // 👁️  SENSOR GERAK & JARAK
  // ════════════════════════════════════════════

  'HC-SR501': {
    id: 'HC-SR501', partCode: 'HC-SR501', category: 'sensor-motion',
    name: 'PIR Motion Sensor (HC-SR501)', shortName: 'HC-SR501',
    description: 'Sensor gerak Passive Infrared. Deteksi gerakan manusia/hewan hingga 7 meter, sudut 110°.',
    color: '#c0392b', icon: '🚶',
    pins: [
      { name: 'VCC',  type: 'power',   voltage: 5, note: '5-12V DC' },
      { name: 'GND',  type: 'ground'                                 },
      { name: 'OUT',  type: 'digital', note: 'HIGH saat gerak terdeteksi' },
    ],
    library: null,
    simulate: {
      type: 'digital-trigger',
      controls: [{ id: 'motion', label: 'Trigger Gerak', type: 'button' }],
      outputHigh: 3000, // ms HIGH setelah trigger
    },
    datasheet: 'https://www.mpja.com/download/31227sc.pdf',
    exampleCode: `#define PIR_PIN 2\nvoid setup() { Serial.begin(9600); pinMode(PIR_PIN, INPUT); }\nvoid loop() { if (digitalRead(PIR_PIN) == HIGH) { Serial.println("Gerak Terdeteksi!"); delay(1000); } }`,
    width: 50, height: 55,
  },

  'HC-SR04': {
    id: 'HC-SR04', partCode: 'HC-SR04', category: 'sensor-motion',
    name: 'Ultrasonic Sensor (HC-SR04)', shortName: 'HC-SR04',
    description: 'Sensor jarak ultrasonik. Range 2-400 cm dengan akurasi ±3mm.',
    color: '#2c3e50', icon: '📡',
    pins: [
      { name: 'VCC',  type: 'power',   voltage: 5 },
      { name: 'GND',  type: 'ground'              },
      { name: 'TRIG', type: 'digital', note: 'Kirim pulse 10µs HIGH untuk trigger' },
      { name: 'ECHO', type: 'digital', note: 'Pulse lebar = jarak (durasi × 0.034 / 2)' },
    ],
    library: 'NewPing',
    simulate: {
      type: 'distance-sensor',
      controls: [{ id: 'distance', label: 'Jarak (cm)', min: 2, max: 400, step: 1, default: 50 }],
    },
    datasheet: 'https://cdn.sparkfun.com/datasheets/Sensors/Proximity/HCSR04.pdf',
    exampleCode: `#define TRIG 9\n#define ECHO 10\nvoid setup() { Serial.begin(9600); pinMode(TRIG, OUTPUT); pinMode(ECHO, INPUT); }\nvoid loop() { digitalWrite(TRIG, LOW); delayMicroseconds(2); digitalWrite(TRIG, HIGH); delayMicroseconds(10); digitalWrite(TRIG, LOW); long d = pulseIn(ECHO, HIGH); float cm = d * 0.034 / 2; Serial.print("Jarak: "); Serial.print(cm); Serial.println(" cm"); delay(500); }`,
    width: 65, height: 35,
  },

  'TCRT5000': {
    id: 'TCRT5000', partCode: 'TCRT5000', category: 'sensor-motion',
    name: 'IR Line Sensor (TCRT5000)', shortName: 'TCRT5000',
    description: 'Sensor reflektif IR untuk line follower robot atau deteksi objek dekat (0-25mm).',
    color: '#1a1a2e', icon: '🤖',
    pins: [
      { name: 'VCC', type: 'power',   voltage: 5 }, { name: 'GND', type: 'ground' },
      { name: 'A0',  type: 'analog',  note: 'Output analog (0-1023)' },
      { name: 'D0',  type: 'digital', note: 'Output digital (threshold via trimpot)' },
    ],
    library: null,
    simulate: {
      type: 'analog-digital-sensor',
      controls: [{ id: 'reflectance', label: 'Reflektansi (%)', min: 0, max: 100, step: 1, default: 50 }],
    },
    datasheet: 'https://www.vishay.com/docs/83760/tcrt5000.pdf',
    exampleCode: `#define SENSOR_A A0\n#define SENSOR_D 2\nvoid setup() { Serial.begin(9600); pinMode(SENSOR_D, INPUT); }\nvoid loop() { int analog = analogRead(SENSOR_A); int digital = digitalRead(SENSOR_D); Serial.print("Analog: "); Serial.print(analog); Serial.print("  Digital: "); Serial.println(digital ? "DETEKSI" : "CLEAR"); delay(100); }`,
    width: 45, height: 35,
  },

  // ════════════════════════════════════════════
  // 💡 SENSOR CAHAYA
  // ════════════════════════════════════════════

  'LDR-GL5516': {
    id: 'LDR-GL5516', partCode: 'GL5516 LDR', category: 'sensor-light',
    name: 'LDR (Fotoresistor GL5516)', shortName: 'LDR GL5516',
    description: 'Light Dependent Resistor. Resistansi turun saat cahaya bertambah (5kΩ terang - 1MΩ gelap).',
    color: '#f39c12', icon: '☀️',
    pins: [
      { name: 'PIN1', type: 'analog', note: 'Pakai pembagi tegangan dengan resistor 10kΩ ke GND' },
      { name: 'PIN2', type: 'ground' },
    ],
    library: null,
    simulate: {
      type: 'analog-sensor', analogPin: true, unit: 'lux',
      controls: [{ id: 'light', label: 'Intensitas Cahaya (%)', min: 0, max: 100, step: 1, default: 50 }],
      readFormula: '1023 - analogRead(pin)',
    },
    datasheet: 'https://cdn.sparkfun.com/datasheets/Sensors/LightImaging/SEN-09088.pdf',
    exampleCode: `void setup() { Serial.begin(9600); }\nvoid loop() { int nilai = analogRead(A0); Serial.print("Cahaya: "); Serial.println(nilai); delay(500); }`,
    width: 30, height: 30,
  },

  'BH1750': {
    id: 'BH1750', partCode: 'BH1750FVI', category: 'sensor-light',
    name: 'Light Sensor (BH1750)', shortName: 'BH1750',
    description: 'Sensor cahaya digital akurasi tinggi. Output langsung dalam Lux (1-65535 lux).',
    color: '#f1c40f', icon: '💡',
    pins: [
      { name: 'VCC', type: 'power', voltage: 3.3 }, { name: 'GND', type: 'ground' },
      { name: 'SDA', type: 'i2c' }, { name: 'SCL', type: 'i2c' },
      { name: 'ADDR', type: 'digital', note: 'GND→0x23, VCC→0x5C' },
    ],
    defaultAddress: '0x23',
    library: 'BH1750',
    simulate: {
      type: 'analog-sensor', unit: 'lux',
      controls: [{ id: 'lux', label: 'Cahaya (lux)', min: 1, max: 65535, step: 10, default: 500 }],
    },
    datasheet: 'https://www.mouser.com/datasheet/2/348/bh1750fvi-e-186247.pdf',
    exampleCode: `#include <BH1750.h>\nBH1750 lightMeter;\nvoid setup() { Wire.begin(); Serial.begin(9600); lightMeter.begin(); }\nvoid loop() { float lux = lightMeter.readLightLevel(); Serial.print("Cahaya: "); Serial.print(lux); Serial.println(" lux"); delay(1000); }`,
    width: 40, height: 35,
  },

  // ════════════════════════════════════════════
  // 🌫️  SENSOR GAS
  // ════════════════════════════════════════════

  'MQ-2': {
    id: 'MQ-2', partCode: 'MQ-2', category: 'sensor-gas',
    name: 'MQ-2 — Gas LPG, Asap, Hidrogen', shortName: 'MQ-2',
    description: 'Sensor gas sensitif terhadap LPG, propana, metana, asap, hidrogen, dan alkohol.',
    color: '#e74c3c', icon: '🔥',
    pins: [
      { name: 'VCC', type: 'power',   voltage: 5 }, { name: 'GND', type: 'ground' },
      { name: 'A0',  type: 'analog',  note: 'Nilai 0-1023 (makin tinggi = makin banyak gas)' },
      { name: 'D0',  type: 'digital', note: 'HIGH saat gas melebihi threshold (atur via trimpot)' },
    ],
    library: null,
    simulate: {
      type: 'analog-digital-sensor',
      controls: [{ id: 'gas', label: 'Konsentrasi Gas (ppm)', min: 0, max: 10000, step: 50, default: 200 }],
      dangerThreshold: 5000,
      warningBadge: '⚠️ Gas Terdeteksi!',
    },
    datasheet: 'https://www.pololu.com/file/0J309/MQ2.pdf',
    exampleCode: `#define MQ2_A A0\n#define MQ2_D 2\nvoid setup() { Serial.begin(9600); pinMode(MQ2_D, INPUT); }\nvoid loop() { int raw = analogRead(MQ2_A); if (digitalRead(MQ2_D) == HIGH) { Serial.println("BAHAYA: Gas terdeteksi!"); } else { Serial.print("Gas Level: "); Serial.println(raw); } delay(500); }`,
    width: 50, height: 50,
  },

  'MQ-135': {
    id: 'MQ-135', partCode: 'MQ-135', category: 'sensor-gas',
    name: 'MQ-135 — Kualitas Udara (CO2, NH3)', shortName: 'MQ-135',
    description: 'Sensor kualitas udara: karbon dioksida, amonia, benzena, alkohol, asap.',
    color: '#c0392b', icon: '🌫️',
    pins: [
      { name: 'VCC', type: 'power', voltage: 5 }, { name: 'GND', type: 'ground' },
      { name: 'A0', type: 'analog' }, { name: 'D0', type: 'digital' },
    ],
    library: 'MQUnifiedsensor',
    simulate: {
      type: 'analog-digital-sensor',
      controls: [{ id: 'ppm', label: 'PPM Udara Kotor', min: 0, max: 1000, step: 5, default: 50 }],
    },
    datasheet: 'https://www.electronicwings.com/public/images/user_images/images/Sensor%20&%20Modules/MQ-135/MQ-135-datasheet.pdf',
    exampleCode: `void setup() { Serial.begin(9600); }\nvoid loop() { int raw = analogRead(A0); Serial.print("Kualitas Udara (raw): "); Serial.println(raw); delay(1000); }`,
    width: 50, height: 50,
  },

  'MQ-7': {
    id: 'MQ-7', partCode: 'MQ-7', category: 'sensor-gas',
    name: 'MQ-7 — Sensor Karbon Monoksida (CO)', shortName: 'MQ-7',
    description: 'Sensor gas CO (Karbon Monoksida) 10-10000 ppm. Bahaya bagi manusia di atas 200 ppm.',
    color: '#7f8c8d', icon: '💀',
    pins: [
      { name: 'VCC', type: 'power', voltage: 5 }, { name: 'GND', type: 'ground' },
      { name: 'A0', type: 'analog' }, { name: 'D0', type: 'digital' },
    ],
    library: 'MQUnifiedsensor',
    simulate: {
      type: 'analog-digital-sensor',
      controls: [{ id: 'co', label: 'CO (ppm)', min: 0, max: 10000, step: 10, default: 50 }],
      dangerThreshold: 200,
      warningBadge: '☠️ CO Berbahaya!',
    },
    datasheet: 'https://www.pololu.com/file/0J313/MQ7.pdf',
    exampleCode: `void setup() { Serial.begin(9600); }\nvoid loop() { int raw = analogRead(A0); float ppm = raw * (10000.0 / 1023.0); Serial.print("CO: "); Serial.print(ppm); Serial.println(" ppm"); delay(1000); }`,
    width: 50, height: 50,
  },

  'YL-83': {
    id: 'YL-83', partCode: 'YL-83', category: 'sensor-gas',
    name: 'Rain Sensor (YL-83)', shortName: 'YL-83',
    description: 'Sensor hujan / deteksi tetesan air. Output analog dan digital.',
    color: '#2980b9', icon: '🌧️',
    pins: [
      { name: 'VCC', type: 'power', voltage: 5 }, { name: 'GND', type: 'ground' },
      { name: 'A0', type: 'analog', note: '0=basah, 1023=kering' },
      { name: 'D0', type: 'digital', note: 'LOW saat hujan terdeteksi' },
    ],
    library: null,
    simulate: {
      type: 'analog-digital-sensor',
      controls: [{ id: 'rain', label: 'Intensitas Hujan (%)', min: 0, max: 100, step: 1, default: 0 }],
    },
    datasheet: '#',
    exampleCode: `#define RAIN_A A0\n#define RAIN_D 2\nvoid setup() { Serial.begin(9600); pinMode(RAIN_D, INPUT); }\nvoid loop() { int raw = analogRead(RAIN_A); if (digitalRead(RAIN_D) == LOW) { Serial.println("Hujan terdeteksi!"); } Serial.print("Level: "); Serial.println(1023 - raw); delay(500); }`,
    width: 60, height: 40,
  },

  'YL-69': {
    id: 'YL-69', partCode: 'YL-69', category: 'sensor-gas',
    name: 'Soil Moisture Sensor (YL-69)', shortName: 'YL-69',
    description: 'Sensor kelembaban tanah untuk pertanian/hidroponik. Output analog dan digital.',
    color: '#795548', icon: '🌱',
    pins: [
      { name: 'VCC', type: 'power', voltage: 3.3 }, { name: 'GND', type: 'ground' },
      { name: 'A0',  type: 'analog',  note: '0=basah, 1023=kering' },
      { name: 'D0',  type: 'digital', note: 'LOW saat lembab' },
    ],
    library: null,
    simulate: {
      type: 'analog-digital-sensor',
      controls: [{ id: 'moisture', label: 'Kelembaban Tanah (%)', min: 0, max: 100, step: 1, default: 40 }],
    },
    datasheet: '#',
    exampleCode: `void setup() { Serial.begin(9600); }\nvoid loop() { int val = analogRead(A0); int persen = map(val, 0, 1023, 100, 0); Serial.print("Kelembaban Tanah: "); Serial.print(persen); Serial.println("%"); delay(1000); }`,
    width: 50, height: 45,
  },

  // ════════════════════════════════════════════
  // 🔥 SENSOR KESELAMATAN
  // ════════════════════════════════════════════

  'KY-026': {
    id: 'KY-026', partCode: 'KY-026', category: 'sensor-safety',
    name: 'Flame Sensor (KY-026)', shortName: 'KY-026',
    description: 'Sensor api/nyala menggunakan IR photodiode, sensitif terhadap cahaya 760-1100nm.',
    color: '#e74c3c', icon: '🔥',
    pins: [
      { name: 'VCC', type: 'power', voltage: 5 }, { name: 'GND', type: 'ground' },
      { name: 'A0', type: 'analog' }, { name: 'D0', type: 'digital', note: 'LOW saat api terdeteksi' },
    ],
    library: null,
    simulate: {
      type: 'digital-trigger',
      controls: [{ id: 'flame', label: 'Deteksi Api', type: 'button' }],
    },
    datasheet: '#',
    exampleCode: `#define FLAME_D 2\nvoid setup() { Serial.begin(9600); pinMode(FLAME_D, INPUT); }\nvoid loop() { if (digitalRead(FLAME_D) == LOW) { Serial.println("⚠️ API TERDETEKSI!"); } delay(200); }`,
    width: 45, height: 40,
  },

  'KY-038': {
    id: 'KY-038', partCode: 'KY-038', category: 'sensor-safety',
    name: 'Sound Sensor (KY-038)', shortName: 'KY-038',
    description: 'Modul sensor suara/mikrofon. Deteksi suara keras (tepuk tangan, alarm).',
    color: '#9b59b6', icon: '🎤',
    pins: [
      { name: 'VCC', type: 'power', voltage: 5 }, { name: 'GND', type: 'ground' },
      { name: 'A0', type: 'analog', note: 'Amplitudo suara (0-1023)' },
      { name: 'D0', type: 'digital', note: 'HIGH saat suara keras terdeteksi' },
    ],
    library: null,
    simulate: {
      type: 'analog-digital-sensor',
      controls: [
        { id: 'volume', label: 'Volume Suara (%)', min: 0, max: 100, step: 1, default: 10 },
        { id: 'clap', label: 'Tepuk/Ketuk', type: 'button' },
      ],
    },
    datasheet: '#',
    exampleCode: `#define SOUND_D 2\nvoid setup() { Serial.begin(9600); pinMode(SOUND_D, INPUT); }\nvoid loop() { if (digitalRead(SOUND_D) == HIGH) { Serial.println("Suara keras terdeteksi!"); delay(200); } }`,
    width: 45, height: 40,
  },

  // ════════════════════════════════════════════
  // 🧭 SENSOR IMU / GERAK
  // ════════════════════════════════════════════

  'MPU-6050': {
    id: 'MPU-6050', partCode: 'MPU-6050 / GY-521', category: 'sensor-imu',
    name: 'MPU-6050 — Accelerometer + Gyroscope', shortName: 'MPU-6050',
    description: 'Sensor 6-DOF: Akselerometer 3-axis (±2/4/8/16g) + Giroskop 3-axis (±250/500/1000/2000°/s).',
    color: '#1abc9c', icon: '🧭',
    pins: [
      { name: 'VCC', type: 'power', voltage: 3.3 }, { name: 'GND', type: 'ground' },
      { name: 'SDA', type: 'i2c' }, { name: 'SCL', type: 'i2c' },
      { name: 'INT', type: 'digital', note: 'Interrupt output (opsional)' },
      { name: 'AD0', type: 'digital', note: 'GND→0x68, VCC→0x69' },
    ],
    defaultAddress: '0x68',
    library: 'MPU6050',
    simulate: {
      type: 'imu',
      controls: [
        { id: 'ax', label: 'Accel X (g)', min: -16, max: 16, step: 0.1, default: 0 },
        { id: 'ay', label: 'Accel Y (g)', min: -16, max: 16, step: 0.1, default: 0 },
        { id: 'az', label: 'Accel Z (g)', min: -16, max: 16, step: 0.1, default: 1 },
        { id: 'gx', label: 'Gyro X (°/s)', min: -2000, max: 2000, step: 1, default: 0 },
        { id: 'gy', label: 'Gyro Y (°/s)', min: -2000, max: 2000, step: 1, default: 0 },
        { id: 'gz', label: 'Gyro Z (°/s)', min: -2000, max: 2000, step: 1, default: 0 },
      ],
    },
    datasheet: 'https://invensense.tdk.com/wp-content/uploads/2015/02/MPU-6000-Datasheet1.pdf',
    exampleCode: `#include <MPU6050.h>\nMPU6050 mpu;\nvoid setup() { Wire.begin(); Serial.begin(9600); mpu.initialize(); }\nvoid loop() { int16_t ax, ay, az, gx, gy, gz; mpu.getMotion6(&ax, &ay, &az, &gx, &gy, &gz); Serial.print("aX="); Serial.print(ax/16384.0); Serial.print("g  gX="); Serial.print(gx/131.0); Serial.println("°/s"); delay(100); }`,
    width: 45, height: 35,
  },

  // ════════════════════════════════════════════
  // ⚡ SENSOR LISTRIK
  // ════════════════════════════════════════════

  'ACS712-5A': {
    id: 'ACS712-5A', partCode: 'ACS712ELCTR-05B', category: 'sensor-power',
    name: 'ACS712 — Sensor Arus 5A', shortName: 'ACS712 5A',
    description: 'Sensor arus Hall-effect. Range ±5A, sensitivitas 185mV/A, offset 2.5V.',
    color: '#f39c12', icon: '⚡',
    pins: [
      { name: 'VCC', type: 'power', voltage: 5 }, { name: 'GND', type: 'ground' },
      { name: 'OUT', type: 'analog', note: '2.5V = 0A; 185mV per Ampere' },
      { name: 'IP+', type: 'power', note: 'Jalur arus masuk' },
      { name: 'IP-', type: 'ground', note: 'Jalur arus keluar' },
    ],
    library: null,
    simulate: {
      type: 'analog-sensor', unit: 'A',
      controls: [{ id: 'current', label: 'Arus (A)', min: -5, max: 5, step: 0.1, default: 0 }],
      readFormula: '(analogRead(pin) * (5.0/1023.0) - 2.5) / 0.185',
    },
    datasheet: 'https://www.allegromicro.com/~/media/Files/Datasheets/ACS712-Datasheet.ashx',
    exampleCode: `#define SENSOR_PIN A0\nvoid setup() { Serial.begin(9600); }\nvoid loop() { int raw = analogRead(SENSOR_PIN); float voltage = raw * (5.0 / 1023.0); float current = (voltage - 2.5) / 0.185; Serial.print("Arus: "); Serial.print(current); Serial.println(" A"); delay(500); }`,
    width: 50, height: 40,
  },

  // ════════════════════════════════════════════
  // 🎮 INPUT / KONTROL
  // ════════════════════════════════════════════

  'PUSH-BUTTON': {
    id: 'PUSH-BUTTON', partCode: 'Tactile Switch / Push Button', category: 'input',
    name: 'Push Button', shortName: 'Button',
    description: 'Tombol tekan momentary SPST. Saat ditekan menghubungkan dua terminal.',
    color: '#2c3e50', icon: '🔘',
    pins: [
      { name: 'PIN1', type: 'digital', note: 'Ke pin Arduino (dengan INPUT_PULLUP atau resistor 10kΩ ke VCC)' },
      { name: 'PIN2', type: 'ground'  },
    ],
    library: null,
    simulate: {
      type: 'momentary-button',
      controls: [{ id: 'press', label: 'Tekan Tombol', type: 'button' }],
    },
    datasheet: '#',
    exampleCode: `#define BTN_PIN 2\nvoid setup() { Serial.begin(9600); pinMode(BTN_PIN, INPUT_PULLUP); }\nvoid loop() { if (digitalRead(BTN_PIN) == LOW) { Serial.println("Tombol ditekan!"); delay(200); } }`,
    width: 30, height: 30,
  },

  'KY-040': {
    id: 'KY-040', partCode: 'KY-040', category: 'input',
    name: 'Rotary Encoder (KY-040)', shortName: 'KY-040',
    description: 'Rotary encoder incremental 20 pulsa per putaran, dengan tombol tekan (SW).',
    color: '#95a5a6', icon: '🎛️',
    pins: [
      { name: 'VCC', type: 'power', voltage: 5 }, { name: 'GND', type: 'ground' },
      { name: 'CLK', type: 'digital', note: 'Phase A — interrupt pin' },
      { name: 'DT',  type: 'digital', note: 'Phase B — arah putar' },
      { name: 'SW',  type: 'digital', note: 'Tombol tekan encoder' },
    ],
    library: 'Encoder',
    simulate: {
      type: 'rotary-encoder',
      controls: [
        { id: 'rotate_cw',  label: 'Putar Kanan (CW)',  type: 'button' },
        { id: 'rotate_ccw', label: 'Putar Kiri (CCW)',  type: 'button' },
        { id: 'press',      label: 'Tekan SW',          type: 'button' },
      ],
    },
    datasheet: '#',
    exampleCode: `#include <Encoder.h>\nEncoder myEnc(2, 3);\nvoid setup() { Serial.begin(9600); }\nvoid loop() { long pos = myEnc.read(); Serial.print("Posisi: "); Serial.println(pos); delay(100); }`,
    width: 45, height: 45,
  },

  'KY-023': {
    id: 'KY-023', partCode: 'KY-023', category: 'input',
    name: 'Joystick Analog (KY-023)', shortName: 'KY-023',
    description: 'Joystick 2-axis analog (X, Y) dengan tombol tekan SW. Nilai tengah ~512.',
    color: '#34495e', icon: '🕹️',
    pins: [
      { name: 'VCC', type: 'power', voltage: 5 }, { name: 'GND', type: 'ground' },
      { name: 'VRX', type: 'analog',  note: 'Sumbu X (0-1023)' },
      { name: 'VRY', type: 'analog',  note: 'Sumbu Y (0-1023)' },
      { name: 'SW',  type: 'digital', note: 'Tombol (LOW saat ditekan)' },
    ],
    library: null,
    simulate: {
      type: 'joystick',
      controls: [
        { id: 'x', label: 'Sumbu X', min: 0, max: 1023, step: 1, default: 512, visual: 'joystick-x' },
        { id: 'y', label: 'Sumbu Y', min: 0, max: 1023, step: 1, default: 512, visual: 'joystick-y' },
      ],
    },
    datasheet: '#',
    exampleCode: `#define VRX A0\n#define VRY A1\n#define SW  2\nvoid setup() { Serial.begin(9600); pinMode(SW, INPUT_PULLUP); }\nvoid loop() { int x = analogRead(VRX); int y = analogRead(VRY); Serial.print("X="); Serial.print(x); Serial.print("  Y="); Serial.print(y); if (!digitalRead(SW)) Serial.print("  [TEKAN]"); Serial.println(); delay(100); }`,
    width: 55, height: 55,
  },

  'POT-10K': {
    id: 'POT-10K', partCode: 'Potentiometer 10kΩ', category: 'input',
    name: 'Potentiometer 10kΩ', shortName: 'Pot 10K',
    description: 'Potensiometer putar 10kΩ untuk kontrol analog (0-1023).',
    color: '#7f8c8d', icon: '🎚️',
    pins: [
      { name: 'VCC',  type: 'power', voltage: 5 }, { name: 'GND', type: 'ground' },
      { name: 'WIPER', type: 'analog', note: 'Output 0V–5V tergantung posisi' },
    ],
    library: null,
    simulate: {
      type: 'potentiometer',
      controls: [{ id: 'value', label: 'Posisi Putar', min: 0, max: 1023, step: 1, default: 512, visual: 'knob' }],
    },
    datasheet: '#',
    exampleCode: `void setup() { Serial.begin(9600); }\nvoid loop() { int val = analogRead(A0); Serial.print("Pot: "); Serial.println(val); delay(100); }`,
    width: 40, height: 40,
  },

  'KEYPAD-4X4': {
    id: 'KEYPAD-4X4', partCode: 'Keypad Matrix 4×4', category: 'input',
    name: 'Keypad 4×4 Matrix', shortName: 'Keypad 4x4',
    description: 'Keypad matriks 16 tombol (0-9, A-D, *, #). Membutuhkan 8 pin digital.',
    color: '#2c3e50', icon: '⌨️',
    pins: [
      { name: 'R1-R4', type: 'digital', note: '4 pin baris (Row)' },
      { name: 'C1-C4', type: 'digital', note: '4 pin kolom (Column)' },
    ],
    library: 'Keypad',
    simulate: {
      type: 'keypad', rows: 4, cols: 4,
      keys: [['1','2','3','A'],['4','5','6','B'],['7','8','9','C'],['*','0','#','D']],
    },
    datasheet: '#',
    exampleCode: `#include <Keypad.h>\nconst byte ROWS=4, COLS=4;\nchar keys[4][4]={{'1','2','3','A'},{'4','5','6','B'},{'7','8','9','C'},{'*','0','#','D'}};\nbyte rPins[4]={9,8,7,6}, cPins[4]={5,4,3,2};\nKeypad kpd=Keypad(makeKeymap(keys),rPins,cPins,ROWS,COLS);\nvoid setup(){Serial.begin(9600);}\nvoid loop(){char k=kpd.getKey();if(k){Serial.println(k);}}`,
    width: 80, height: 80,
  },

  // ════════════════════════════════════════════
  // ⚙️ AKTUATOR GERAK
  // ════════════════════════════════════════════

  'SG90': {
    id: 'SG90', partCode: 'Tower Pro SG90', category: 'actuator',
    name: 'Servo Motor Micro (SG90)', shortName: 'SG90',
    description: 'Servo micro 9g, sudut 0-180°. Torque 1.8 kg·cm, kecepatan 0.1s/60°.',
    color: '#3498db', icon: '⚙️',
    pins: [
      { name: 'VCC',    type: 'power',  voltage: 5, color: 'red',    note: 'Merah' },
      { name: 'GND',    type: 'ground',             color: 'brown',  note: 'Cokelat' },
      { name: 'SIGNAL', type: 'pwm',                color: 'orange', note: 'Oranye — PWM 50Hz' },
    ],
    library: 'Servo',
    simulate: {
      type: 'servo',
      controls: [{ id: 'angle', label: 'Sudut (°)', min: 0, max: 180, step: 1, default: 90, visual: 'servo-arm' }],
    },
    datasheet: 'http://www.ee.ic.ac.uk/pcheung/teaching/DE1_EE/stores/sg90_datasheet.pdf',
    exampleCode: `#include <Servo.h>\nServo myServo;\nvoid setup() { myServo.attach(9); }\nvoid loop() { myServo.write(0); delay(1000); myServo.write(90); delay(1000); myServo.write(180); delay(1000); }`,
    width: 55, height: 45,
  },

  'MG996R': {
    id: 'MG996R', partCode: 'Tower Pro MG996R', category: 'actuator',
    name: 'Servo Motor Metal Gear (MG996R)', shortName: 'MG996R',
    description: 'Servo metal gear 55g, sudut 0-180°. Torque 9.4 kg·cm. Cocok untuk lengan robot.',
    color: '#2c3e50', icon: '⚙️',
    pins: [
      { name: 'VCC',    type: 'power',  voltage: 5, note: '4.8-7.2V DC' },
      { name: 'GND',    type: 'ground' },
      { name: 'SIGNAL', type: 'pwm',   note: 'PWM 50Hz' },
    ],
    library: 'Servo',
    simulate: {
      type: 'servo',
      controls: [{ id: 'angle', label: 'Sudut (°)', min: 0, max: 180, step: 1, default: 90, visual: 'servo-arm' }],
    },
    datasheet: 'https://www.electronicoscaldas.com/datasheet/MG996R_Tower-Pro.pdf',
    exampleCode: `#include <Servo.h>\nServo myServo;\nvoid setup() { myServo.attach(9); myServo.write(90); }\nvoid loop() { for(int i=0;i<=180;i+=5){myServo.write(i);delay(50);} for(int i=180;i>=0;i-=5){myServo.write(i);delay(50);} }`,
    width: 60, height: 55,
  },

  '28BYJ-48': {
    id: '28BYJ-48', partCode: '28BYJ-48 + ULN2003', category: 'actuator',
    name: 'Stepper Motor (28BYJ-48 + ULN2003)', shortName: '28BYJ-48',
    description: 'Stepper motor 5V unipolar 64 langkah/putaran (gear ratio 1:64 → 4096 langkah/putaran output).',
    color: '#16a085', icon: '🔄',
    pins: [
      { name: 'VCC', type: 'power', voltage: 5 }, { name: 'GND', type: 'ground' },
      { name: 'IN1', type: 'digital' }, { name: 'IN2', type: 'digital' },
      { name: 'IN3', type: 'digital' }, { name: 'IN4', type: 'digital' },
    ],
    library: 'Stepper',
    simulate: {
      type: 'stepper',
      controls: [
        { id: 'steps_cw',  label: 'Putar Kanan (CW) 512 step',  type: 'button' },
        { id: 'steps_ccw', label: 'Putar Kiri (CCW) 512 step', type: 'button' },
        { id: 'speed', label: 'Kecepatan (RPM)', min: 1, max: 15, step: 1, default: 10 },
      ],
    },
    datasheet: 'https://components101.com/sites/default/files/component_datasheet/28byj48-step-motor-datasheet.pdf',
    exampleCode: `#include <Stepper.h>\n#define STEPS 2048\nStepper stepper(STEPS, 8, 10, 9, 11);\nvoid setup() { stepper.setSpeed(10); }\nvoid loop() { stepper.step(2048); delay(1000); stepper.step(-2048); delay(1000); }`,
    width: 80, height: 65,
  },

  'L298N': {
    id: 'L298N', partCode: 'L298N', category: 'actuator',
    name: 'DC Motor Driver (L298N)', shortName: 'L298N',
    description: 'Driver H-Bridge dual channel untuk 2 motor DC. Max 2A/channel, 5-35V.',
    color: '#e74c3c', icon: '🔋',
    pins: [
      { name: 'VCC', type: 'power', voltage: 12, note: 'Motor power (5-35V)' },
      { name: 'GND', type: 'ground' }, { name: '5V OUT', type: 'power', voltage: 5, note: 'Untuk board Arduino' },
      { name: 'ENA', type: 'pwm',     note: 'Enable Channel A (PWM untuk kecepatan)' },
      { name: 'IN1', type: 'digital', note: 'Arah motor A' }, { name: 'IN2', type: 'digital', note: 'Arah motor A' },
      { name: 'IN3', type: 'digital', note: 'Arah motor B' }, { name: 'IN4', type: 'digital', note: 'Arah motor B' },
      { name: 'ENB', type: 'pwm',     note: 'Enable Channel B (PWM untuk kecepatan)' },
    ],
    library: null,
    simulate: {
      type: 'motor-driver',
      channels: [
        { id: 'motorA', label: 'Motor A', controls: [
          { id: 'speedA', label: 'Kecepatan A (0-255)', min: 0, max: 255, step: 1, default: 0 },
          { id: 'dirA', label: 'Arah A', type: 'toggle', options: ['Maju', 'Mundur'] },
        ]},
        { id: 'motorB', label: 'Motor B', controls: [
          { id: 'speedB', label: 'Kecepatan B (0-255)', min: 0, max: 255, step: 1, default: 0 },
          { id: 'dirB', label: 'Arah B', type: 'toggle', options: ['Maju', 'Mundur'] },
        ]},
      ],
    },
    datasheet: 'https://www.st.com/resource/en/datasheet/l298.pdf',
    exampleCode: `#define ENA 5\n#define IN1 6\n#define IN2 7\nvoid setup() { pinMode(ENA,OUTPUT); pinMode(IN1,OUTPUT); pinMode(IN2,OUTPUT); }\nvoid loop() { digitalWrite(IN1,HIGH); digitalWrite(IN2,LOW); analogWrite(ENA,200); delay(2000); digitalWrite(IN1,LOW); digitalWrite(IN2,HIGH); delay(2000); }`,
    width: 70, height: 55,
  },

  // ════════════════════════════════════════════
  // 💡 OUTPUT CAHAYA
  // ════════════════════════════════════════════

  'LED': {
    id: 'LED', partCode: 'LED 5mm / 3mm', category: 'output-light',
    name: 'LED (5mm)', shortName: 'LED',
    description: 'Light Emitting Diode 5mm. Butuh resistor seri 220Ω (5V) atau 68Ω (3.3V) untuk proteksi.',
    color: '#e74c3c', icon: '💡',
    variants: ['Merah','Hijau','Biru','Kuning','Putih','Oranye'],
    pins: [
      { name: 'ANODE (+)',   type: 'digital', note: 'Kaki panjang — ke pin melalui resistor 220Ω' },
      { name: 'KATODE (-)',  type: 'ground',  note: 'Kaki pendek — ke GND' },
    ],
    library: null,
    simulate: {
      type: 'led',
      controls: [],
      behavior: 'follows-pin', // nyala/mati ikut digitalRead pin
    },
    datasheet: '#',
    exampleCode: `#define LED_PIN 13\nvoid setup() { pinMode(LED_PIN, OUTPUT); }\nvoid loop() { digitalWrite(LED_PIN, HIGH); delay(1000); digitalWrite(LED_PIN, LOW); delay(1000); }`,
    width: 25, height: 35,
  },

  'RGB-LED': {
    id: 'RGB-LED', partCode: 'RGB LED Common Cathode', category: 'output-light',
    name: 'RGB LED (Common Cathode)', shortName: 'RGB LED',
    description: 'LED RGB 4 kaki common cathode. Kontrol 3 PWM pin untuk warna penuh.',
    color: '#9b59b6', icon: '🌈',
    pins: [
      { name: 'R',   type: 'pwm',    note: 'Pin merah (PWM)' },
      { name: 'GND', type: 'ground', note: 'Common Cathode' },
      { name: 'G',   type: 'pwm',    note: 'Pin hijau (PWM)' },
      { name: 'B',   type: 'pwm',    note: 'Pin biru (PWM)' },
    ],
    library: null,
    simulate: {
      type: 'rgb-led',
      behavior: 'follows-pwm-pins',
    },
    datasheet: '#',
    exampleCode: `#define R 9\n#define G 10\n#define B 11\nvoid setup() { pinMode(R,OUTPUT); pinMode(G,OUTPUT); pinMode(B,OUTPUT); }\nvoid setColor(int r,int g,int b){analogWrite(R,r);analogWrite(G,g);analogWrite(B,b);}\nvoid loop() { setColor(255,0,0); delay(1000); setColor(0,255,0); delay(1000); setColor(0,0,255); delay(1000); }`,
    width: 25, height: 35,
  },

  'WS2812B': {
    id: 'WS2812B', partCode: 'WS2812B / NeoPixel', category: 'output-light',
    name: 'NeoPixel WS2812B', shortName: 'WS2812B',
    description: 'LED RGB addressable (WS2812B). Kontrol banyak LED warna-warni dengan 1 pin data.',
    color: '#1abc9c', icon: '✨',
    pins: [
      { name: 'VCC', type: 'power', voltage: 5, note: '+5V (100mA per LED!) + kapasitor 1000µF' },
      { name: 'GND', type: 'ground' },
      { name: 'DIN', type: 'digital', note: 'Data In — 1 kabel ke semua LED chained' },
    ],
    library: 'Adafruit NeoPixel',
    simulate: {
      type: 'neopixel',
      controls: [{ id: 'num_leds', label: 'Jumlah LED', min: 1, max: 64, step: 1, default: 8 }],
    },
    datasheet: 'https://cdn-shop.adafruit.com/datasheets/WS2812B.pdf',
    exampleCode: `#include <Adafruit_NeoPixel.h>\n#define PIN 6\n#define NUMPIXELS 8\nAdafruit_NeoPixel pixels(NUMPIXELS, PIN, NEO_GRB + NEO_KHZ800);\nvoid setup() { pixels.begin(); }\nvoid loop() { for(int i=0;i<NUMPIXELS;i++) { pixels.setPixelColor(i, pixels.Color(255, 0, 150)); } pixels.show(); delay(500); }`,
    width: 120, height: 25,
  },

  'RELAY-5V': {
    id: 'RELAY-5V', partCode: 'Relay Module 5V (SRD-05VDC-SL-C)', category: 'output-light',
    name: 'Relay 5V SPDT', shortName: 'Relay 5V',
    description: 'Modul relay SPDT 5V untuk mengontrol beban AC 220V/10A atau DC 30V/10A.',
    color: '#1a252f', icon: '🔌',
    pins: [
      { name: 'VCC', type: 'power',   voltage: 5 }, { name: 'GND', type: 'ground' },
      { name: 'IN',  type: 'digital', note: 'LOW = relay aktif (active low)' },
      { name: 'COM', type: 'power',   note: 'Terminal Common' },
      { name: 'NO',  type: 'power',   note: 'Normally Open — terhubung ke COM saat aktif' },
      { name: 'NC',  type: 'power',   note: 'Normally Closed — putus dari COM saat aktif' },
    ],
    library: null,
    simulate: {
      type: 'relay',
      behavior: 'follows-pin-active-low',
      controls: [],
    },
    datasheet: '#',
    exampleCode: `#define RELAY_PIN 8\nvoid setup() { pinMode(RELAY_PIN, OUTPUT); digitalWrite(RELAY_PIN, HIGH); }\nvoid loop() { digitalWrite(RELAY_PIN, LOW);  delay(3000); // Aktifkan relay\n digitalWrite(RELAY_PIN, HIGH); delay(3000); // Matikan relay }`,
    width: 65, height: 45,
  },

  // ════════════════════════════════════════════
  // 🔊 SUARA
  // ════════════════════════════════════════════

  'BUZZER-ACTIVE': {
    id: 'BUZZER-ACTIVE', partCode: 'Active Buzzer 5V', category: 'sound',
    name: 'Buzzer Aktif', shortName: 'Buzzer Aktif',
    description: 'Buzzer aktif — berbunyi saat pin HIGH, tidak butuh frekuensi. Frekuensi tetap bawaan.',
    color: '#2c3e50', icon: '🔔',
    pins: [
      { name: 'VCC (+)', type: 'digital', note: 'HIGH = berbunyi' },
      { name: 'GND (-)', type: 'ground'   },
    ],
    library: null,
    simulate: { type: 'buzzer', mode: 'active' },
    datasheet: '#',
    exampleCode: `#define BUZZER 8\nvoid setup() { pinMode(BUZZER, OUTPUT); }\nvoid loop() { digitalWrite(BUZZER, HIGH); delay(1000); digitalWrite(BUZZER, LOW); delay(1000); }`,
    width: 30, height: 30,
  },

  'BUZZER-PASSIVE': {
    id: 'BUZZER-PASSIVE', partCode: 'Passive Buzzer', category: 'sound',
    name: 'Buzzer Pasif (PWM)', shortName: 'Buzzer Pasif',
    description: 'Buzzer pasif — butuh sinyal PWM/frekuensi via fungsi tone(). Bisa menghasilkan melodi.',
    color: '#34495e', icon: '🎵',
    pins: [
      { name: 'SIGNAL', type: 'pwm',    note: 'Sinyal tone() / PWM' },
      { name: 'GND',    type: 'ground' },
    ],
    library: null,
    simulate: { type: 'buzzer', mode: 'passive' },
    datasheet: '#',
    exampleCode: `#define BUZZER 9\nvoid setup() { }\nvoid loop() { tone(BUZZER, 440, 500); delay(600); tone(BUZZER, 880, 500); delay(600); noTone(BUZZER); delay(1000); }`,
    width: 30, height: 30,
  },

  // ════════════════════════════════════════════
  // 📡 KOMUNIKASI
  // ════════════════════════════════════════════

  'HC-05': {
    id: 'HC-05', partCode: 'HC-05', category: 'comms',
    name: 'Bluetooth Classic (HC-05)', shortName: 'HC-05',
    description: 'Modul Bluetooth 2.0 EDR. Master/Slave. Berkomunikasi via UART. Range ~10 meter.',
    color: '#2980b9', icon: '📶',
    pins: [
      { name: 'VCC',  type: 'power',   voltage: 5  }, { name: 'GND',  type: 'ground' },
      { name: 'TXD',  type: 'uart',    note: 'Ke RX Arduino'  },
      { name: 'RXD',  type: 'uart',    note: 'Ke TX Arduino (level shifter 3.3V!)' },
      { name: 'STATE', type: 'digital', note: 'HIGH saat terhubung' },
      { name: 'EN',   type: 'digital', note: 'HIGH untuk masuk mode AT command' },
    ],
    library: 'SoftwareSerial',
    simulate: {
      type: 'serial-bridge',
      controls: [
        { id: 'connect', label: 'Simulasi Koneksi BT', type: 'toggle' },
        { id: 'send',    label: 'Kirim Data dari BT', type: 'text-input' },
      ],
    },
    datasheet: 'https://www.elecrow.com/download/HC-05%20AT%20Command.pdf',
    exampleCode: `#include <SoftwareSerial.h>\nSoftwareSerial BT(10, 11); // RX, TX\nvoid setup() { Serial.begin(9600); BT.begin(9600); }\nvoid loop() { if (BT.available()) { char c = BT.read(); Serial.print("BT: "); Serial.println(c); if (c == '1') digitalWrite(13, HIGH); if (c == '0') digitalWrite(13, LOW); } }`,
    width: 60, height: 45,
  },

  'NRF24L01': {
    id: 'NRF24L01', partCode: 'nRF24L01+', category: 'comms',
    name: 'NRF24L01 — Wireless 2.4GHz', shortName: 'NRF24L01',
    description: 'Modul RF 2.4GHz, range 100m (outdoor). SPI interface. Konsumsi daya sangat rendah.',
    color: '#27ae60', icon: '📡',
    pins: [
      { name: 'VCC', type: 'power',   voltage: 3.3 }, { name: 'GND',  type: 'ground'              },
      { name: 'CSN', type: 'spi',     note: 'Chip Select Not'  }, { name: 'CE',   type: 'digital', note: 'Chip Enable'      },
      { name: 'MOSI',type: 'spi'      }, { name: 'MISO',type: 'spi'                               },
      { name: 'SCK', type: 'spi'      }, { name: 'IRQ', type: 'digital', note: 'Interrupt (opsional)' },
    ],
    library: 'RF24',
    simulate: {
      type: 'wireless',
      controls: [{ id: 'receive', label: 'Simulasi Terima Paket', type: 'text-input' }],
    },
    datasheet: 'https://www.nordicsemi.com/products/nrf24l01',
    exampleCode: `#include <RF24.h>\nRF24 radio(7, 8); // CE, CSN\nbyte addr[6]="00001";\nvoid setup() { radio.begin(); radio.openWritingPipe(addr); radio.setPALevel(RF24_PA_MIN); radio.stopListening(); }\nvoid loop() { const char msg[] = "Hello"; radio.write(&msg, sizeof(msg)); delay(1000); }`,
    width: 55, height: 45,
  },

  // ════════════════════════════════════════════
  // 🕒 RTC & MEMORI
  // ════════════════════════════════════════════

  'DS3231': {
    id: 'DS3231', partCode: 'DS3231', category: 'rtc-memory',
    name: 'RTC DS3231 (Presisi Tinggi)', shortName: 'DS3231',
    description: 'Real Time Clock presisi tinggi dengan kompensasi suhu otomatis (±2ppm). Terdapat battery backup CR2032.',
    color: '#8e44ad', icon: '🕐',
    pins: [
      { name: 'VCC', type: 'power', voltage: 3.3 }, { name: 'GND', type: 'ground' },
      { name: 'SDA', type: 'i2c' }, { name: 'SCL', type: 'i2c' },
      { name: 'SQW', type: 'digital', note: 'Square wave output / Alarm' },
    ],
    defaultAddress: '0x68',
    library: 'RTClib',
    simulate: {
      type: 'rtc',
      controls: [{ id: 'datetime', label: 'Set Tanggal/Waktu', type: 'datetime' }],
    },
    datasheet: 'https://datasheets.maximintegrated.com/en/ds/DS3231.pdf',
    exampleCode: `#include <RTClib.h>\nRTC_DS3231 rtc;\nvoid setup() { Serial.begin(9600); rtc.begin(); if (rtc.lostPower()) rtc.adjust(DateTime(F(__DATE__), F(__TIME__))); }\nvoid loop() { DateTime now = rtc.now(); Serial.print(now.year()); Serial.print('/'); Serial.print(now.month()); Serial.print('/'); Serial.print(now.day()); Serial.print(" "); Serial.print(now.hour()); Serial.print(':'); Serial.print(now.minute()); Serial.print(':'); Serial.println(now.second()); delay(1000); }`,
    width: 55, height: 40,
  },

  'SD-MODULE': {
    id: 'SD-MODULE', partCode: 'MicroSD Card Module', category: 'rtc-memory',
    name: 'MicroSD Card Reader', shortName: 'MicroSD',
    description: 'Modul pembaca kartu MicroSD via SPI. Mendukung FAT16/FAT32. Max 32GB.',
    color: '#95a5a6', icon: '💾',
    pins: [
      { name: 'VCC',  type: 'power',   voltage: 5 }, { name: 'GND',  type: 'ground'              },
      { name: 'MISO', type: 'spi'      }, { name: 'MOSI', type: 'spi'                             },
      { name: 'SCK',  type: 'spi'      }, { name: 'CS',   type: 'spi',     note: 'Chip Select'    },
    ],
    library: 'SD',
    simulate: {
      type: 'sd-card',
      controls: [
        { id: 'insert',  label: 'Insert SD Card', type: 'toggle' },
        { id: 'read_file', label: 'Read data.txt', type: 'button' },
      ],
    },
    datasheet: '#',
    exampleCode: `#include <SD.h>\n#define CS_PIN 10\nvoid setup() { Serial.begin(9600); if (!SD.begin(CS_PIN)) { Serial.println("SD gagal!"); return; } File f = SD.open("data.txt", FILE_WRITE); if (f) { f.println("CircuitForge Data Log"); f.close(); } }\nvoid loop() {}`,
    width: 45, height: 35,
  },

  // ════════════════════════════════════════════
  // 🔌 KOMPONEN PASIF & DISKRIT
  // ════════════════════════════════════════════

  'RESISTOR': {
    id: 'RESISTOR', partCode: 'Resistor Carbon Film', category: 'passive',
    name: 'Resistor', shortName: 'Resistor',
    description: 'Resistor karbon/metal film. Kode warna untuk membaca nilai hambatan.',
    color: '#c8a46e', icon: '⚡',
    variants: ['220Ω','330Ω','470Ω','1kΩ','2.2kΩ','4.7kΩ','10kΩ','47kΩ','100kΩ'],
    pins: [{ name: 'A', type: 'signal' }, { name: 'B', type: 'signal' }],
    library: null,
    simulate: { type: 'passive-resistor' },
    datasheet: '#',
    width: 40, height: 15,
  },

  'CAPACITOR': {
    id: 'CAPACITOR', partCode: 'Electrolytic / Ceramic Capacitor', category: 'passive',
    name: 'Kapasitor', shortName: 'Kapasitor',
    description: 'Kapasitor elektrolit (polar) atau keramik (non-polar) untuk filtering dan decoupling.',
    color: '#c0392b', icon: '🔋',
    variants: ['100nF','1µF','10µF','100µF','470µF','1000µF'],
    pins: [{ name: '+', type: 'power', note: 'Kutub positif (elektrolit)' }, { name: '-', type: 'ground' }],
    library: null,
    simulate: { type: 'passive-capacitor' },
    datasheet: '#',
    width: 20, height: 30,
  },

  'BC547': {
    id: 'BC547', partCode: 'BC547 NPN', category: 'passive',
    name: 'Transistor NPN BC547', shortName: 'BC547',
    description: 'Transistor NPN general purpose. Ic max 100mA. Cocok untuk switch LED, relay, buzzer kecil.',
    color: '#2c3e50', icon: '📐',
    pins: [
      { name: 'B', type: 'digital', note: 'Base — dari pin Arduino via resistor 1kΩ' },
      { name: 'C', type: 'power',   note: 'Collector — ke beban (+)' },
      { name: 'E', type: 'ground',  note: 'Emitter — ke GND' },
    ],
    library: null,
    simulate: { type: 'transistor-npn', gainHFE: 110 },
    datasheet: 'https://www.onsemi.com/pdf/datasheet/bc547-d.pdf',
    exampleCode: `// Switch LED dengan BC547\n// Arduino Pin 7 → R 1kΩ → Base BC547\n// Collector BC547 → LED → R 220Ω → +5V\n// Emitter BC547 → GND\nvoid setup() { pinMode(7, OUTPUT); }\nvoid loop() { digitalWrite(7, HIGH); delay(500); digitalWrite(7, LOW); delay(500); }`,
    width: 30, height: 45,
  },

  'TIP120': {
    id: 'TIP120', partCode: 'TIP120 Darlington NPN', category: 'passive',
    name: 'Transistor Darlington TIP120', shortName: 'TIP120',
    description: 'Transistor Darlington NPN. Ic max 5A. Cocok untuk motor DC, solenoid, beban besar.',
    color: '#1a252f', icon: '📐',
    pins: [
      { name: 'B', type: 'digital', note: 'Base — dari pin Arduino via resistor 1kΩ' },
      { name: 'C', type: 'power',   note: 'Collector — ke beban (+)' },
      { name: 'E', type: 'ground',  note: 'Emitter — ke GND' },
    ],
    library: null,
    simulate: { type: 'transistor-npn', gainHFE: 1000 },
    datasheet: 'https://www.st.com/resource/en/datasheet/tip120.pdf',
    width: 35, height: 50,
  },

  'DIODE-1N4007': {
    id: 'DIODE-1N4007', partCode: '1N4007', category: 'passive',
    name: 'Dioda Rectifier 1N4007', shortName: '1N4007',
    description: 'Dioda rectifier 1A 1000V. Digunakan sebagai flyback dioda pada relay/motor dan penyearah.',
    color: '#c0392b', icon: '➡️',
    pins: [
      { name: 'Anode (+)',  type: 'power'  },
      { name: 'Katode (-)', type: 'ground', note: 'Tanda gelang/strip' },
    ],
    library: null,
    simulate: { type: 'diode', vf: 0.7 },
    datasheet: 'https://www.vishay.com/docs/88503/1n4001.pdf',
    width: 35, height: 15,
  },

  'PC817': {
    id: 'PC817', partCode: 'PC817', category: 'passive',
    name: 'Optocoupler PC817', shortName: 'PC817',
    description: 'Optocoupler 4-pin. Isolasi galvanik 1500V antara rangkaian input dan output.',
    color: '#1a1a2e', icon: '🔗',
    pins: [
      { name: 'ANODE LED',    type: 'power',   note: 'Sisi input (+)' },
      { name: 'KATODE LED',   type: 'ground',  note: 'Sisi input (-)' },
      { name: 'COLLECTOR',    type: 'power',   note: 'Sisi output' },
      { name: 'EMITTER',      type: 'ground',  note: 'Sisi output' },
    ],
    library: null,
    simulate: { type: 'optocoupler' },
    datasheet: 'https://www.farnell.com/datasheets/73758.pdf',
    width: 30, height: 35,
  },
};

// Daftar kategori komponen untuk sidebar library
const COMPONENT_CATEGORIES = [
  { id: 'display',        label: '🖥️  Display',               color: '#1a6b3a' },
  { id: 'sensor-env',     label: '🌡️  Sensor Suhu & Kelembaban', color: '#2980b9' },
  { id: 'sensor-motion',  label: '👁️  Sensor Gerak & Jarak',    color: '#c0392b' },
  { id: 'sensor-light',   label: '💡 Sensor Cahaya',            color: '#f39c12' },
  { id: 'sensor-gas',     label: '🌫️  Sensor Gas & Lingkungan', color: '#e74c3c' },
  { id: 'sensor-safety',  label: '🔥 Sensor Keselamatan',       color: '#922b21' },
  { id: 'sensor-imu',     label: '🧭 Sensor IMU / Orientasi',   color: '#1abc9c' },
  { id: 'sensor-power',   label: '⚡ Sensor Listrik',           color: '#f39c12' },
  { id: 'input',          label: '🎮 Input / Kontrol',          color: '#34495e' },
  { id: 'actuator',       label: '⚙️  Aktuator Gerak',          color: '#3498db' },
  { id: 'output-light',   label: '💡 Output Cahaya',            color: '#e74c3c' },
  { id: 'sound',          label: '🔊 Suara',                    color: '#2c3e50' },
  { id: 'comms',          label: '📡 Komunikasi Wireless',      color: '#27ae60' },
  { id: 'rtc-memory',     label: '🕒 RTC & Memori',             color: '#8e44ad' },
  { id: 'passive',        label: '🔌 Komponen Pasif & Diskrit', color: '#7f8c8d' },
];

// Buat lookup: kategori → daftar komponen
const COMPONENTS_BY_CATEGORY = {};
COMPONENT_CATEGORIES.forEach(cat => {
  COMPONENTS_BY_CATEGORY[cat.id] = Object.values(COMPONENT_REGISTRY).filter(c => c.category === cat.id);
});

module.exports = { COMPONENT_REGISTRY, COMPONENT_CATEGORIES, COMPONENTS_BY_CATEGORY };
