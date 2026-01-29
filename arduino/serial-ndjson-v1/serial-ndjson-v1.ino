#include <Wire.h>
#include <Adafruit_BMP280.h>
#include <DHT.h>

#define DHTPIN 2
#define DHTTYPE DHT11

const int MQ_AO = A0;
const int BUZZ_PIN = 8;

DHT dht(DHTPIN, DHTTYPE);
Adafruit_BMP280 bmp;
bool bmpOk = false;

void printFloatOrNull(float v, int decimals) {
  if (isnan(v)) Serial.print("null");
  else Serial.print(v, decimals);
}

void setup() {
  Serial.begin(115200);
  while (!Serial) delay(10);

  Wire.begin();
  dht.begin();

  pinMode(BUZZ_PIN, OUTPUT);
  digitalWrite(BUZZ_PIN, HIGH); // OFF for low-level trigger

  bmpOk = bmp.begin(0x76);

  Serial.print("{\"boot\":\"ok\",\"bmp280\":");
  Serial.print(bmpOk ? "true" : "false");
  Serial.println("}");
}

void loop() {
  float tC = dht.readTemperature();
  float rh = dht.readHumidity();

  float pHpa = NAN;
  float tBmp = NAN;
  if (bmpOk) {
    pHpa = bmp.readPressure() / 100.0F;
    tBmp = bmp.readTemperature();
  }

  int gasRaw = analogRead(MQ_AO);

  const int GAS_BEEP_THRESHOLD = 120;
  if (gasRaw > GAS_BEEP_THRESHOLD) {
    digitalWrite(BUZZ_PIN, LOW);  // ON
    delay(120);
    digitalWrite(BUZZ_PIN, HIGH); // OFF
  }

  Serial.print("{\"v\":1,");
  Serial.print("\"tC\":");
  printFloatOrNull(tC, 1);
  Serial.print(",\"rh\":");
  printFloatOrNull(rh, 1);
  Serial.print(",\"pHpa\":");
  printFloatOrNull(pHpa, 1);
  Serial.print(",\"tBmp\":");
  printFloatOrNull(tBmp, 1);
  Serial.print(",\"gasRaw\":");
  Serial.print(gasRaw);
  Serial.println("}");

  delay(2000);
}
