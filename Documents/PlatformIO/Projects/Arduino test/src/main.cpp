
#include <Arduino.h>
#include "avr8-stub.h"
#include "app_api.h"  

__attribute__((noinline)) void tickOn()  { digitalWrite(LED_BUILTIN, HIGH); }
__attribute__((noinline)) void tickOff() { digitalWrite(LED_BUILTIN, LOW);  }

void setup() {
  debug_init();
  pinMode(LED_BUILTIN, OUTPUT);
}

void loop() {
  tickOn();   // <-- set a breakpoint here
  delay(100);
  tickOff();  // <-- or here
  delay(100);
}