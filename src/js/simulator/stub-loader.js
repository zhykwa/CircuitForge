/**
 * CircuitForge — simulator/stub-loader.js
 * Scans #include directives and injects appropriate stubs into runtime context
 */

window.loadStubsForCode = function(code) {
  const includes = [...(code || '').matchAll(/#include\s*[<"]([^>"]+)[>"]/g)].map(m => m[1].split('/').pop());

  const includeMap = {
    'DHT.h':                'DHT',
    'DallasTemperature.h':  'DallasTemperature',
    'OneWire.h':            'OneWire',
    'Adafruit_BME280.h':    'Adafruit_BME280',
    'Adafruit_BMP280.h':    'Adafruit_BMP280',
    'Adafruit_BME680.h':    'Adafruit_BME680',
    'Adafruit_SHT31.h':     'Adafruit_SHT31',
    'Adafruit_AHTX0.h':     'Adafruit_AHTX0',
    'BH1750.h':             'BH1750',
    'TSL2561.h':            'TSL2561',
    'Adafruit_SSD1306.h':   'Adafruit_SSD1306',
    'Adafruit_SH110X.h':    'Adafruit_SH110X',
    'LiquidCrystal_I2C.h':  'LiquidCrystal_I2C',
    'LiquidCrystal.h':      'LiquidCrystal',
    'TM1637Display.h':      'TM1637Display',
    'LedControl.h':         'LedControl',
    'Adafruit_NeoPixel.h':  'Adafruit_NeoPixel',
    'Servo.h':              'Servo',
    'ESP32Servo.h':         'Servo',
    'Stepper.h':            'Stepper',
    'AccelStepper.h':       'AccelStepper',
    'PubSubClient.h':       'PubSubClient',
    'BlynkSimpleEsp32.h':   'Blynk',
    'BlynkSimpleEsp8266.h': 'Blynk',
    'BlynkSimpleSerial.h':  'Blynk',
    'WiFi.h':               'WiFi',
    'ESP8266WiFi.h':        'WiFi',
    'HTTPClient.h':         'HTTPClient',
    'ArduinoJson.h':        'ArduinoJson',
    'RF24.h':               'RF24',
    'MFRC522.h':            'MFRC522',
    'NewPing.h':            'NewPing',
    'MPU6050.h':            'MPU6050',
    'HX711.h':              'HX711',
    'RTClib.h':             'RTClib',
    'SD.h':                 'SD',
    'EEPROM.h':             'EEPROM',
    'Preferences.h':        'Preferences',
    'Keypad.h':             'Keypad',
    'Encoder.h':            'Encoder',
    'TimerOne.h':           'TimerOne',
    'SoftwareSerial.h':     'SoftwareSerial',
    'Adafruit_INA219.h':    'Adafruit_INA219',
    'MAX30105.h':           'MAX30105',
    'VL53L0X.h':            'VL53L0X',
    'MQUnifiedsensor.h':    'MQUnifiedsensor',
    'Wire.h':               null,  // built-in
    'SPI.h':                null,  // built-in
  };

  const context = {};
  const loaded  = [];

  includes.forEach(inc => {
    const stubKey = includeMap[inc];
    if (stubKey === null) return; // built-in, skip
    if (stubKey && window.AVAILABLE_STUBS && window.AVAILABLE_STUBS[stubKey]) {
      Object.assign(context, window.AVAILABLE_STUBS[stubKey]);
      loaded.push(stubKey);
    } else if (stubKey) {
      console.warn(`[StubLoader] No stub for library: ${inc}`);
    }
  });

  if (loaded.length > 0) {
    console.log('[StubLoader] Loaded stubs:', loaded.join(', '));
  }

  return context;
};

/**
 * Get list of detected libraries and their stub status for Library Manager UI
 */
window.getLibraryStubStatus = function(code) {
  const includes = [...(code || '').matchAll(/#include\s*[<"]([^>"]+)[>"]/g)].map(m => m[1]);
  return includes.map(inc => {
    const base = inc.split('/').pop();
    const stubKey = window._stubIncludeMap && window._stubIncludeMap[base];
    return {
      include: inc,
      name: base.replace('.h',''),
      hasStub: !!(stubKey && window.AVAILABLE_STUBS && window.AVAILABLE_STUBS[stubKey]),
      stubLevel: stubKey ? (window.AVAILABLE_STUBS[stubKey] ? 'full' : 'none') : 'builtin',
    };
  });
};

console.log('[StubLoader] Module loaded');
