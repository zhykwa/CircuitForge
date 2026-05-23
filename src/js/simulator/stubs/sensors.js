/**
 * CircuitForge — simulator/stubs/sensors.js
 * Sensor library simulation stubs with calibration support
 */

// ══════════════════════════════════════════════════════════════════
//  DHT11 / DHT22 / DHT21
// ══════════════════════════════════════════════════════════════════
class DHT {
  constructor(pin, type) {
    this.pin  = pin;
    this.type = type; // 11, 22, 21
    this._lastRead = 0;
    console.log(`[DHT${type}] Created on pin ${pin}`);
  }
  begin() {}
  readTemperature(isFahrenheit) {
    let raw = _getSimValue(this.pin, 'temperature');
    if (raw === null) raw = 27.5 + _gaussianRandom(0, 0.3);
    if (window.CalibrationEngine) raw = CalibrationEngine.apply(`DHT_${this.pin}`, raw, 'temperature');
    return isFahrenheit ? raw * 9/5 + 32 : raw;
  }
  readHumidity() {
    let raw = _getSimValue(this.pin, 'humidity');
    if (raw === null) raw = 65 + _gaussianRandom(0, 0.5);
    if (window.CalibrationEngine) raw = CalibrationEngine.apply(`DHT_${this.pin}`, raw, 'humidity');
    return raw;
  }
  computeHeatIndex(temp, hum, isFahr) {
    const t = isFahr ? temp : temp * 9/5 + 32;
    const hi = -42.379 + 2.04901523*t + 10.14333127*hum - 0.22475541*t*hum
               - 0.00683783*t*t - 0.05481717*hum*hum + 0.00122874*t*t*hum
               + 0.00085282*t*hum*hum - 0.00000199*t*t*hum*hum;
    return isFahr ? hi : (hi - 32) * 5/9;
  }
  isnan(v) { return isNaN(v); }
}
window.AVAILABLE_STUBS['DHT'] = { DHT, DHT11: 11, DHT22: 22, DHT21: 21 };

// ══════════════════════════════════════════════════════════════════
//  OneWire + DallasTemperature (DS18B20)
// ══════════════════════════════════════════════════════════════════
class OneWire {
  constructor(pin) { this.pin = pin; }
  reset() { return true; }
  skip() {}
  select(addr) {}
  write(b, p) {}
  read() { return 0; }
  search(addr) { return false; }
  reset_search() {}
}

class DallasTemperature {
  constructor(oneWireRef) { this._ow = oneWireRef; this._resolution = 12; }
  begin() {}
  getDeviceCount() { return 1; }
  requestTemperatures() {}
  requestTemperaturesByIndex(idx) {}
  getTempCByIndex(idx) {
    let raw = _getSimValue(this._ow && this._ow.pin, 'temperature');
    if (raw === null) raw = 25.0 + _gaussianRandom(0, 0.1);
    if (window.CalibrationEngine) raw = CalibrationEngine.apply(`DS18B20_${this._ow && this._ow.pin}`, raw, 'temperature');
    return raw;
  }
  getTempFByIndex(idx) { return this.getTempCByIndex(idx) * 9/5 + 32; }
  setResolution(r) { this._resolution = r; }
  isConnected(addr) { return true; }
  DEVICE_DISCONNECTED_C = -127;
}
window.AVAILABLE_STUBS['OneWire'] = { OneWire };
window.AVAILABLE_STUBS['DallasTemperature'] = { DallasTemperature };

// ══════════════════════════════════════════════════════════════════
//  BME280 / BMP280
// ══════════════════════════════════════════════════════════════════
class Adafruit_BME280 {
  constructor() { this._addr = 0x76; }
  begin(addr, wire) { this._addr = addr || 0x76; return true; }
  readTemperature() {
    let v = _getSimValue('BME280', 'temperature'); return v !== null ? v : 25.0 + _gaussianRandom(0, 0.2);
  }
  readHumidity() {
    let v = _getSimValue('BME280', 'humidity'); return v !== null ? v : 60 + _gaussianRandom(0, 0.5);
  }
  readPressure() {
    let v = _getSimValue('BME280', 'pressure'); return v !== null ? v : 101325 + _gaussianRandom(0, 50);
  }
  readAltitude(seaLevel) {
    const p = this.readPressure() / 100; // hPa
    return 44330.0 * (1.0 - Math.pow(p / (seaLevel || 1013.25), 0.1903));
  }
}

class Adafruit_BMP280 extends Adafruit_BME280 {
  readHumidity() { return 0; }
}

class Adafruit_BME680 extends Adafruit_BME280 {
  readGas() { return _getSimValue('BME680','gas') || 50000 + _gaussianRandom(0,1000); }
}

window.AVAILABLE_STUBS['Adafruit_BME280'] = { Adafruit_BME280 };
window.AVAILABLE_STUBS['Adafruit_BMP280'] = { Adafruit_BMP280 };
window.AVAILABLE_STUBS['Adafruit_BME680'] = { Adafruit_BME680 };

// ══════════════════════════════════════════════════════════════════
//  SHT31-D / AHT20
// ══════════════════════════════════════════════════════════════════
class Adafruit_SHT31 {
  begin(addr) { return true; }
  readTemperature() { return _getSimValue('SHT31','temperature') || 24 + _gaussianRandom(0,0.15); }
  readHumidity()    { return _getSimValue('SHT31','humidity') || 55 + _gaussianRandom(0,0.4); }
}
class Adafruit_AHTX0 {
  begin() { return true; }
  getEvent(humidity, temp) {
    if (temp) temp.temperature = _getSimValue('AHT','temperature') || 26;
    if (humidity) humidity.relative_humidity = _getSimValue('AHT','humidity') || 60;
  }
}
window.AVAILABLE_STUBS['Adafruit_SHT31'] = { Adafruit_SHT31 };
window.AVAILABLE_STUBS['Adafruit_AHTX0'] = { Adafruit_AHTX0 };

// ══════════════════════════════════════════════════════════════════
//  HC-SR04 Ultrasonic (NewPing)
// ══════════════════════════════════════════════════════════════════
class NewPing {
  constructor(trigPin, echoPin, maxDist) {
    this.trigPin = trigPin; this.echoPin = echoPin; this.maxDist = maxDist || 200;
    console.log(`[NewPing] trig=${trigPin} echo=${echoPin} maxDist=${maxDist}`);
  }
  ping_cm() {
    let v = _getSimValue(this.trigPin, 'distance');
    if (v === null) v = 50 + _gaussianRandom(0, 0.5);
    if (window.CalibrationEngine) v = CalibrationEngine.apply(`HCSR04_${this.trigPin}`, v, 'distance');
    return v;
  }
  ping_median(iter) { return this.ping_cm(); }
  ping()           { return this.ping_cm() / 0.0343; } // microseconds
  ping_in()        { return this.ping_cm() / 2.54; }
  convert_cm(t)    { return t / 2.0 * 0.0343; }
  convert_in(t)    { return this.convert_cm(t) / 2.54; }
}
window.AVAILABLE_STUBS['NewPing'] = { NewPing };

// ══════════════════════════════════════════════════════════════════
//  VL53L0X (Time of Flight)
// ══════════════════════════════════════════════════════════════════
class VL53L0X {
  init()    { return true; }
  begin()   {}
  setTimeout(t) {}
  setMeasurementTimingBudget(us) {}
  readRangeSingleMillimeters() { return (_getSimValue('VL53L0X','distance') || 300) * 10; }
  readRangeContinuousMillimeters() { return this.readRangeSingleMillimeters(); }
  startContinuous(period) {}
  stopContinuous() {}
  timeoutOccurred() { return false; }
}
window.AVAILABLE_STUBS['VL53L0X'] = { VL53L0X };

// ══════════════════════════════════════════════════════════════════
//  MPU-6050 IMU
// ══════════════════════════════════════════════════════════════════
class MPU6050 {
  constructor() {}
  initialize() { console.log('[MPU6050] Initialized'); }
  testConnection() { return true; }
  getMotion6(ax, ay, az, gx, gy, gz) {}
  getAcceleration(ax, ay, az) {}
  getRotation(gx, gy, gz) {}
  getAccelerationX() { return (_getSimValue('MPU6050','ax') || _gaussianRandom(0,200)) | 0; }
  getAccelerationY() { return (_getSimValue('MPU6050','ay') || _gaussianRandom(0,200)) | 0; }
  getAccelerationZ() { return (_getSimValue('MPU6050','az') || 16384 + _gaussianRandom(0,200)) | 0; }
  getRotationX()     { return (_getSimValue('MPU6050','gx') || _gaussianRandom(0,50)) | 0; }
  getRotationY()     { return (_getSimValue('MPU6050','gy') || _gaussianRandom(0,50)) | 0; }
  getRotationZ()     { return (_getSimValue('MPU6050','gz') || _gaussianRandom(0,50)) | 0; }
  getTemperature()   { return (_getSimValue('MPU6050','temperature') || 25) * 340 + 521 | 0; }
}
window.AVAILABLE_STUBS['MPU6050'] = { MPU6050 };

// ══════════════════════════════════════════════════════════════════
//  HX711 Load Cell Amplifier
// ══════════════════════════════════════════════════════════════════
class HX711 {
  constructor() { this._scale = 1; this._offset = 0; }
  begin(dataPin, clockPin) { this.dataPin = dataPin; this.clockPin = clockPin; }
  is_ready() { return true; }
  tare(times) { this._offset = this._readRaw(); }
  set_scale(scale) { this._scale = scale; }
  get_units(times) { return (this._readRaw() - this._offset) / this._scale; }
  get_value(times) { return this._readRaw() - this._offset; }
  _readRaw() {
    let v = _getSimValue(this.dataPin, 'weight');
    if (v === null) v = _gaussianRandom(0, 10);
    return v * 1000; // simulate raw ADC value
  }
  power_down() {} power_up() {}
}
window.AVAILABLE_STUBS['HX711'] = { HX711 };

// ══════════════════════════════════════════════════════════════════
//  MQ Gas Sensors (MQUnifiedsensor compatible)
// ══════════════════════════════════════════════════════════════════
class MQSensor {
  constructor(board, voltRes, adcBit, pin, type) {
    this.pin = pin; this.type = type;
    this._RLOAD  = 10; this._RL_VALUE = 5; this._RO_CLEAN = 9.83;
    console.log(`[${type}] Created on pin ${pin}`);
  }
  init()  {}
  setRegressionMethod(m) {}
  setA(a) { this._a = a; } setB(b) { this._b = b; }
  calibrate() { console.log(`[${this.type}] Calibrated`); }
  readSensor() {
    const defaults = {
      'MQ-2': 200, 'MQ-7': 5, 'MQ-135': 50, 'MQ-3': 0.1,
      'MQ-4': 200, 'MQ-9': 50, 'MQ-131': 50,
    };
    let v = _getSimValue(this.pin, 'ppm');
    if (v === null) v = (defaults[this.type] || 100) + _gaussianRandom(0, 5);
    if (window.CalibrationEngine) v = CalibrationEngine.apply(`${this.type}_${this.pin}`, v, 'ppm');
    return v;
  }
  readSensorR0Rs() { return this._RO_CLEAN; }
}
window.AVAILABLE_STUBS['MQUnifiedsensor'] = { MQUnifiedsensor: MQSensor };

// ══════════════════════════════════════════════════════════════════
//  PIR (HC-SR501)
// ══════════════════════════════════════════════════════════════════
// PIR is a simple digital pin read — handled by digitalRead in runtime
// But we add a helper class for consistency
class PIRSensor {
  constructor(pin) { this.pin = pin; }
  read() { return _getSimValue(this.pin, 'motion') ? 1 : 0; }
}
window.AVAILABLE_STUBS['PIR'] = { PIRSensor };

// ══════════════════════════════════════════════════════════════════
//  Light Sensors (BH1750, TSL2561, APDS9960)
// ══════════════════════════════════════════════════════════════════
class BH1750 {
  begin(addr) { return true; }
  readLightLevel() {
    let v = _getSimValue('BH1750', 'lux');
    return v !== null ? v : 500 + _gaussianRandom(0, 20);
  }
}
class TSL2561 {
  begin()  { return true; }
  setGain(g) {} setTiming(t) {}
  getFullLuminosity() { return _getSimValue('TSL2561','full') || 5000; }
  getLuminosity(ch) { return _getSimValue('TSL2561',`ch${ch}`) || (ch === 0 ? 5000 : 100); }
  calculateLux(ch0, ch1) { return ch0 * 0.09; }
}
window.AVAILABLE_STUBS['BH1750']  = { BH1750 };
window.AVAILABLE_STUBS['TSL2561'] = { TSL2561 };

// ══════════════════════════════════════════════════════════════════
//  TCRT5000 (IR Line Sensor) — digital/analog pin read
// ══════════════════════════════════════════════════════════════════
// Handled via analogRead/digitalRead in runtime

// ══════════════════════════════════════════════════════════════════
//  DS3231 / DS1307 RTC
// ══════════════════════════════════════════════════════════════════
class DateTime {
  constructor(year, month, day, hour, min, sec) {
    const d = (year instanceof Date) ? year : new Date(year||2024, (month||1)-1, day||1, hour||0, min||0, sec||0);
    this._d = d;
  }
  year()    { return this._d.getFullYear(); }
  month()   { return this._d.getMonth() + 1; }
  day()     { return this._d.getDate(); }
  hour()    { return this._d.getHours(); }
  minute()  { return this._d.getMinutes(); }
  second()  { return this._d.getSeconds(); }
  dayOfTheWeek() { return this._d.getDay(); }
  unixtime() { return Math.floor(this._d.getTime() / 1000); }
}

class RTC_DS3231 {
  begin()   { return true; }
  adjust(dt) { this._offset = Date.now() - dt._d.getTime(); }
  now()     { return new DateTime(new Date(Date.now() - (this._offset || 0))); }
  isrunning() { return true; }
  lostPower() { return false; }
}
const RTC_DS1307 = RTC_DS3231;

window.AVAILABLE_STUBS['RTClib'] = { RTC_DS3231, RTC_DS1307, DateTime };

// ══════════════════════════════════════════════════════════════════
//  MAX30102 Heart Rate / SpO2 (returns simulated values)
// ══════════════════════════════════════════════════════════════════
class MAX30105 {
  begin(addr, i2cSpeed) { return true; }
  setup(led, samples, mode, sr, pw, gain) {}
  getIR()  { return 50000 + _gaussianRandom(0, 500) | 0; }
  getRed() { return 45000 + _gaussianRandom(0, 500) | 0; }
  check()  {}
  available() { return 1; }
  nextSample() {}
  getFIFOIR()  { return this.getIR(); }
  getFIFORed() { return this.getRed(); }
}
window.AVAILABLE_STUBS['MAX30105'] = { MAX30105 };

console.log('[Stubs/sensors] All sensor stubs loaded');
