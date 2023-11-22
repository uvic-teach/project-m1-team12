//
// This file is part of the GNU ARM Eclipse distribution.
// Copyright (c) 2014 Liviu Ionescu.
//

// ----------------------------------------------------------------------------

#include <stdio.h>
#include "diag/Trace.h"
#include <string.h>

#include "cmsis/cmsis_device.h"

// ----------------------------------------------------------------------------
//
// STM32F0 led blink sample (trace via $(trace)).
//
// In debug configurations, demonstrate how to print a greeting message
// on the trace device. In release configurations the message is
// simply discarded.
//
// To demonstrate POSIX retargetting, reroute the STDOUT and STDERR to the
// trace device and display messages on both of them.
//
// Then demonstrates how to blink a led with 1Hz, using a
// continuous loop and SysTick delays.
//
// On DEBUG, the uptime in seconds is also displayed on the trace device.
//
// Trace support is enabled by adding the TRACE macro definition.
// By default the trace messages are forwarded to the $(trace) output,
// but can be rerouted to any device or completely suppressed, by
// changing the definitions required in system/src/diag/trace_impl.c
// (currently OS_USE_TRACE_ITM, OS_USE_TRACE_SEMIHOSTING_DEBUG/_STDOUT).
//
// The external clock frequency is specified as a preprocessor definition
// passed to the compiler via a command line option (see the 'C/C++ General' ->
// 'Paths and Symbols' -> the 'Symbols' tab, if you want to change it).
// The value selected during project creation was HSE_VALUE=48000000.
//
/// Note: The default clock settings take the user defined HSE_VALUE and try
// to reach the maximum possible system clock. For the default 8MHz input
// the result is guaranteed, but for other values it might not be possible,
// so please adjust the PLL settings in system/src/cmsis/system_stm32f0xx.c
//

// ----- main() ---------------------------------------------------------------

// Sample pragmas to cope with warnings. Please note the related line at
// the end of this function, used to pop the compiler diagnostics status.
#pragma GCC diagnostic push
#pragma GCC diagnostic ignored "-Wunused-parameter"
#pragma GCC diagnostic ignored "-Wmissing-declarations"
#pragma GCC diagnostic ignored "-Wreturn-type"

#define SPI_Mode_Master ((uint16_t)0x0104)
#define SPI_DataSize ((uint16_t)0x0700)
#define SPI_CPOL_Low ((uint16_t)0x0000)
#define SPI_CPHA_1Edge ((uint16_t)0x0000)
#define SPI_NSS_Soft SPI_CR1_SSM
#define SPI_FirstBit_MSB ((uint16_t)0x0000)

/*** This is partial code for accessing LED Display via SPI interface. ***/

unsigned int Freq = 0; // Example: measured frequency value (global variable)
unsigned int Res = 0;  // Example: measured resistance value (global variable)
int timVal = 0;
int timerTriggered = 0;
int swap = 0;

void GPIOA_init(void);
void GPIOB_init(void);
void ADC_init(void);
void DAC_init(void);
void SPI_init(void);
void TIM2_init(void);
void TIM2_IRQHandler(void);
void EXTI0_1_init(void);
void EXTI_2_init(void);
void EXTI0_1_IRQHandler(void);
void EXTI2_3_IRQHandler(void);

void oled_Write(unsigned char);
void oled_Write_Cmd(unsigned char);
void oled_Write_Data(unsigned char);

void oled_config(void);

void refresh_OLED(void);

SPI_HandleTypeDef SPI_Handle;

//
// LED Display initialization commands
//
unsigned char oled_init_cmds[] =
    {
        0xAE,
        0x20, 0x00,
        0x40,
        0xA0 | 0x01,
        0xA8, 0x40 - 1,
        0xC0 | 0x08,
        0xD3, 0x00,
        0xDA, 0x32,
        0xD5, 0x80,
        0xD9, 0x22,
        0xDB, 0x30,
        0x81, 0xFF,
        0xA4,
        0xA6,
        0xAD, 0x30,
        0x8D, 0x10,
        0xAE | 0x01,
        0xC0,
        0xA0};

//
// Character specifications for LED Display (1 row = 8 bytes = 1 ASCII character)
// Example: to display '4', retrieve 8 data bytes stored in Characters[52][X] row
//          (where X = 0, 1, ..., 7) and send them one by one to LED Display.
// Row number = character ASCII code (e.g., ASCII code of '4' is 0x34 = 52)
//
unsigned char Characters[][8] = {
    {0b00000000, 0b00000000, 0b00000000, 0b00000000, 0b00000000, 0b00000000, 0b00000000, 0b00000000}, // SPACE
    {0b00000000, 0b00000000, 0b00000000, 0b00000000, 0b00000000, 0b00000000, 0b00000000, 0b00000000}, // SPACE
    {0b00000000, 0b00000000, 0b00000000, 0b00000000, 0b00000000, 0b00000000, 0b00000000, 0b00000000}, // SPACE
    {0b00000000, 0b00000000, 0b00000000, 0b00000000, 0b00000000, 0b00000000, 0b00000000, 0b00000000}, // SPACE
    {0b00000000, 0b00000000, 0b00000000, 0b00000000, 0b00000000, 0b00000000, 0b00000000, 0b00000000}, // SPACE
    {0b00000000, 0b00000000, 0b00000000, 0b00000000, 0b00000000, 0b00000000, 0b00000000, 0b00000000}, // SPACE
    {0b00000000, 0b00000000, 0b00000000, 0b00000000, 0b00000000, 0b00000000, 0b00000000, 0b00000000}, // SPACE
    {0b00000000, 0b00000000, 0b00000000, 0b00000000, 0b00000000, 0b00000000, 0b00000000, 0b00000000}, // SPACE
    {0b00000000, 0b00000000, 0b00000000, 0b00000000, 0b00000000, 0b00000000, 0b00000000, 0b00000000}, // SPACE
    {0b00000000, 0b00000000, 0b00000000, 0b00000000, 0b00000000, 0b00000000, 0b00000000, 0b00000000}, // SPACE
    {0b00000000, 0b00000000, 0b00000000, 0b00000000, 0b00000000, 0b00000000, 0b00000000, 0b00000000}, // SPACE
    {0b00000000, 0b00000000, 0b00000000, 0b00000000, 0b00000000, 0b00000000, 0b00000000, 0b00000000}, // SPACE
    {0b00000000, 0b00000000, 0b00000000, 0b00000000, 0b00000000, 0b00000000, 0b00000000, 0b00000000}, // SPACE
    {0b00000000, 0b00000000, 0b00000000, 0b00000000, 0b00000000, 0b00000000, 0b00000000, 0b00000000}, // SPACE
    {0b00000000, 0b00000000, 0b00000000, 0b00000000, 0b00000000, 0b00000000, 0b00000000, 0b00000000}, // SPACE
    {0b00000000, 0b00000000, 0b00000000, 0b00000000, 0b00000000, 0b00000000, 0b00000000, 0b00000000}, // SPACE
    {0b00000000, 0b00000000, 0b00000000, 0b00000000, 0b00000000, 0b00000000, 0b00000000, 0b00000000}, // SPACE
    {0b00000000, 0b00000000, 0b00000000, 0b00000000, 0b00000000, 0b00000000, 0b00000000, 0b00000000}, // SPACE
    {0b00000000, 0b00000000, 0b00000000, 0b00000000, 0b00000000, 0b00000000, 0b00000000, 0b00000000}, // SPACE
    {0b00000000, 0b00000000, 0b00000000, 0b00000000, 0b00000000, 0b00000000, 0b00000000, 0b00000000}, // SPACE
    {0b00000000, 0b00000000, 0b00000000, 0b00000000, 0b00000000, 0b00000000, 0b00000000, 0b00000000}, // SPACE
    {0b00000000, 0b00000000, 0b00000000, 0b00000000, 0b00000000, 0b00000000, 0b00000000, 0b00000000}, // SPACE
    {0b00000000, 0b00000000, 0b00000000, 0b00000000, 0b00000000, 0b00000000, 0b00000000, 0b00000000}, // SPACE
    {0b00000000, 0b00000000, 0b00000000, 0b00000000, 0b00000000, 0b00000000, 0b00000000, 0b00000000}, // SPACE
    {0b00000000, 0b00000000, 0b00000000, 0b00000000, 0b00000000, 0b00000000, 0b00000000, 0b00000000}, // SPACE
    {0b00000000, 0b00000000, 0b00000000, 0b00000000, 0b00000000, 0b00000000, 0b00000000, 0b00000000}, // SPACE
    {0b00000000, 0b00000000, 0b00000000, 0b00000000, 0b00000000, 0b00000000, 0b00000000, 0b00000000}, // SPACE
    {0b00000000, 0b00000000, 0b00000000, 0b00000000, 0b00000000, 0b00000000, 0b00000000, 0b00000000}, // SPACE
    {0b00000000, 0b00000000, 0b00000000, 0b00000000, 0b00000000, 0b00000000, 0b00000000, 0b00000000}, // SPACE
    {0b00000000, 0b00000000, 0b00000000, 0b00000000, 0b00000000, 0b00000000, 0b00000000, 0b00000000}, // SPACE
    {0b00000000, 0b00000000, 0b00000000, 0b00000000, 0b00000000, 0b00000000, 0b00000000, 0b00000000}, // SPACE
    {0b00000000, 0b00000000, 0b00000000, 0b00000000, 0b00000000, 0b00000000, 0b00000000, 0b00000000}, // SPACE
    {0b00000000, 0b00000000, 0b00000000, 0b00000000, 0b00000000, 0b00000000, 0b00000000, 0b00000000}, // SPACE
    {0b00000000, 0b00000000, 0b01011111, 0b00000000, 0b00000000, 0b00000000, 0b00000000, 0b00000000}, // !
    {0b00000000, 0b00000111, 0b00000000, 0b00000111, 0b00000000, 0b00000000, 0b00000000, 0b00000000}, // "
    {0b00010100, 0b01111111, 0b00010100, 0b01111111, 0b00010100, 0b00000000, 0b00000000, 0b00000000}, // #
    {0b00100100, 0b00101010, 0b01111111, 0b00101010, 0b00010010, 0b00000000, 0b00000000, 0b00000000}, // $
    {0b00100011, 0b00010011, 0b00001000, 0b01100100, 0b01100010, 0b00000000, 0b00000000, 0b00000000}, // %
    {0b00110110, 0b01001001, 0b01010101, 0b00100010, 0b01010000, 0b00000000, 0b00000000, 0b00000000}, // &
    {0b00000000, 0b00000101, 0b00000011, 0b00000000, 0b00000000, 0b00000000, 0b00000000, 0b00000000}, // '
    {0b00000000, 0b00011100, 0b00100010, 0b01000001, 0b00000000, 0b00000000, 0b00000000, 0b00000000}, // (
    {0b00000000, 0b01000001, 0b00100010, 0b00011100, 0b00000000, 0b00000000, 0b00000000, 0b00000000}, // )
    {0b00010100, 0b00001000, 0b00111110, 0b00001000, 0b00010100, 0b00000000, 0b00000000, 0b00000000}, // *
    {0b00001000, 0b00001000, 0b00111110, 0b00001000, 0b00001000, 0b00000000, 0b00000000, 0b00000000}, // +
    {0b00000000, 0b01010000, 0b00110000, 0b00000000, 0b00000000, 0b00000000, 0b00000000, 0b00000000}, // ,
    {0b00001000, 0b00001000, 0b00001000, 0b00001000, 0b00001000, 0b00000000, 0b00000000, 0b00000000}, // -
    {0b00000000, 0b01100000, 0b01100000, 0b00000000, 0b00000000, 0b00000000, 0b00000000, 0b00000000}, // .
    {0b00100000, 0b00010000, 0b00001000, 0b00000100, 0b00000010, 0b00000000, 0b00000000, 0b00000000}, // /
    {0b00111110, 0b01010001, 0b01001001, 0b01000101, 0b00111110, 0b00000000, 0b00000000, 0b00000000}, // 0
    {0b00000000, 0b01000010, 0b01111111, 0b01000000, 0b00000000, 0b00000000, 0b00000000, 0b00000000}, // 1
    {0b01000010, 0b01100001, 0b01010001, 0b01001001, 0b01000110, 0b00000000, 0b00000000, 0b00000000}, // 2
    {0b00100001, 0b01000001, 0b01000101, 0b01001011, 0b00110001, 0b00000000, 0b00000000, 0b00000000}, // 3
    {0b00011000, 0b00010100, 0b00010010, 0b01111111, 0b00010000, 0b00000000, 0b00000000, 0b00000000}, // 4
    {0b00100111, 0b01000101, 0b01000101, 0b01000101, 0b00111001, 0b00000000, 0b00000000, 0b00000000}, // 5
    {0b00111100, 0b01001010, 0b01001001, 0b01001001, 0b00110000, 0b00000000, 0b00000000, 0b00000000}, // 6
    {0b00000011, 0b00000001, 0b01110001, 0b00001001, 0b00000111, 0b00000000, 0b00000000, 0b00000000}, // 7
    {0b00110110, 0b01001001, 0b01001001, 0b01001001, 0b00110110, 0b00000000, 0b00000000, 0b00000000}, // 8
    {0b00000110, 0b01001001, 0b01001001, 0b00101001, 0b00011110, 0b00000000, 0b00000000, 0b00000000}, // 9
    {0b00000000, 0b00110110, 0b00110110, 0b00000000, 0b00000000, 0b00000000, 0b00000000, 0b00000000}, // :
    {0b00000000, 0b01010110, 0b00110110, 0b00000000, 0b00000000, 0b00000000, 0b00000000, 0b00000000}, // ;
    {0b00001000, 0b00010100, 0b00100010, 0b01000001, 0b00000000, 0b00000000, 0b00000000, 0b00000000}, // <
    {0b00010100, 0b00010100, 0b00010100, 0b00010100, 0b00010100, 0b00000000, 0b00000000, 0b00000000}, // =
    {0b00000000, 0b01000001, 0b00100010, 0b00010100, 0b00001000, 0b00000000, 0b00000000, 0b00000000}, // >
    {0b00000010, 0b00000001, 0b01010001, 0b00001001, 0b00000110, 0b00000000, 0b00000000, 0b00000000}, // ?
    {0b00110010, 0b01001001, 0b01111001, 0b01000001, 0b00111110, 0b00000000, 0b00000000, 0b00000000}, // @
    {0b01111110, 0b00010001, 0b00010001, 0b00010001, 0b01111110, 0b00000000, 0b00000000, 0b00000000}, // A
    {0b01111111, 0b01001001, 0b01001001, 0b01001001, 0b00110110, 0b00000000, 0b00000000, 0b00000000}, // B
    {0b00111110, 0b01000001, 0b01000001, 0b01000001, 0b00100010, 0b00000000, 0b00000000, 0b00000000}, // C
    {0b01111111, 0b01000001, 0b01000001, 0b00100010, 0b00011100, 0b00000000, 0b00000000, 0b00000000}, // D
    {0b01111111, 0b01001001, 0b01001001, 0b01001001, 0b01000001, 0b00000000, 0b00000000, 0b00000000}, // E
    {0b01111111, 0b00001001, 0b00001001, 0b00001001, 0b00000001, 0b00000000, 0b00000000, 0b00000000}, // F
    {0b00111110, 0b01000001, 0b01001001, 0b01001001, 0b01111010, 0b00000000, 0b00000000, 0b00000000}, // G
    {0b01111111, 0b00001000, 0b00001000, 0b00001000, 0b01111111, 0b00000000, 0b00000000, 0b00000000}, // H
    {0b01000000, 0b01000001, 0b01111111, 0b01000001, 0b01000000, 0b00000000, 0b00000000, 0b00000000}, // I
    {0b00100000, 0b01000000, 0b01000001, 0b00111111, 0b00000001, 0b00000000, 0b00000000, 0b00000000}, // J
    {0b01111111, 0b00001000, 0b00010100, 0b00100010, 0b01000001, 0b00000000, 0b00000000, 0b00000000}, // K
    {0b01111111, 0b01000000, 0b01000000, 0b01000000, 0b01000000, 0b00000000, 0b00000000, 0b00000000}, // L
    {0b01111111, 0b00000010, 0b00001100, 0b00000010, 0b01111111, 0b00000000, 0b00000000, 0b00000000}, // M
    {0b01111111, 0b00000100, 0b00001000, 0b00010000, 0b01111111, 0b00000000, 0b00000000, 0b00000000}, // N
    {0b00111110, 0b01000001, 0b01000001, 0b01000001, 0b00111110, 0b00000000, 0b00000000, 0b00000000}, // O
    {0b01111111, 0b00001001, 0b00001001, 0b00001001, 0b00000110, 0b00000000, 0b00000000, 0b00000000}, // P
    {0b00111110, 0b01000001, 0b01010001, 0b00100001, 0b01011110, 0b00000000, 0b00000000, 0b00000000}, // Q
    {0b01111111, 0b00001001, 0b00011001, 0b00101001, 0b01000110, 0b00000000, 0b00000000, 0b00000000}, // R
    {0b01000110, 0b01001001, 0b01001001, 0b01001001, 0b00110001, 0b00000000, 0b00000000, 0b00000000}, // S
    {0b00000001, 0b00000001, 0b01111111, 0b00000001, 0b00000001, 0b00000000, 0b00000000, 0b00000000}, // T
    {0b00111111, 0b01000000, 0b01000000, 0b01000000, 0b00111111, 0b00000000, 0b00000000, 0b00000000}, // U
    {0b00011111, 0b00100000, 0b01000000, 0b00100000, 0b00011111, 0b00000000, 0b00000000, 0b00000000}, // V
    {0b00111111, 0b01000000, 0b00111000, 0b01000000, 0b00111111, 0b00000000, 0b00000000, 0b00000000}, // W
    {0b01100011, 0b00010100, 0b00001000, 0b00010100, 0b01100011, 0b00000000, 0b00000000, 0b00000000}, // X
    {0b00000111, 0b00001000, 0b01110000, 0b00001000, 0b00000111, 0b00000000, 0b00000000, 0b00000000}, // Y
    {0b01100001, 0b01010001, 0b01001001, 0b01000101, 0b01000011, 0b00000000, 0b00000000, 0b00000000}, // Z
    {0b01111111, 0b01000001, 0b00000000, 0b00000000, 0b00000000, 0b00000000, 0b00000000, 0b00000000}, // [
    {0b00010101, 0b00010110, 0b01111100, 0b00010110, 0b00010101, 0b00000000, 0b00000000, 0b00000000}, // back slash
    {0b00000000, 0b00000000, 0b00000000, 0b01000001, 0b01111111, 0b00000000, 0b00000000, 0b00000000}, // ]
    {0b00000100, 0b00000010, 0b00000001, 0b00000010, 0b00000100, 0b00000000, 0b00000000, 0b00000000}, // ^
    {0b01000000, 0b01000000, 0b01000000, 0b01000000, 0b01000000, 0b00000000, 0b00000000, 0b00000000}, // _
    {0b00000000, 0b00000001, 0b00000010, 0b00000100, 0b00000000, 0b00000000, 0b00000000, 0b00000000}, // `
    {0b00100000, 0b01010100, 0b01010100, 0b01010100, 0b01111000, 0b00000000, 0b00000000, 0b00000000}, // a
    {0b01111111, 0b01001000, 0b01000100, 0b01000100, 0b00111000, 0b00000000, 0b00000000, 0b00000000}, // b
    {0b00111000, 0b01000100, 0b01000100, 0b01000100, 0b00100000, 0b00000000, 0b00000000, 0b00000000}, // c
    {0b00111000, 0b01000100, 0b01000100, 0b01001000, 0b01111111, 0b00000000, 0b00000000, 0b00000000}, // d
    {0b00111000, 0b01010100, 0b01010100, 0b01010100, 0b00011000, 0b00000000, 0b00000000, 0b00000000}, // e
    {0b00001000, 0b01111110, 0b00001001, 0b00000001, 0b00000010, 0b00000000, 0b00000000, 0b00000000}, // f
    {0b00001100, 0b01010010, 0b01010010, 0b01010010, 0b00111110, 0b00000000, 0b00000000, 0b00000000}, // g
    {0b01111111, 0b00001000, 0b00000100, 0b00000100, 0b01111000, 0b00000000, 0b00000000, 0b00000000}, // h
    {0b00000000, 0b01000100, 0b01111101, 0b01000000, 0b00000000, 0b00000000, 0b00000000, 0b00000000}, // i
    {0b00100000, 0b01000000, 0b01000100, 0b00111101, 0b00000000, 0b00000000, 0b00000000, 0b00000000}, // j
    {0b01111111, 0b00010000, 0b00101000, 0b01000100, 0b00000000, 0b00000000, 0b00000000, 0b00000000}, // k
    {0b00000000, 0b01000001, 0b01111111, 0b01000000, 0b00000000, 0b00000000, 0b00000000, 0b00000000}, // l
    {0b01111100, 0b00000100, 0b00011000, 0b00000100, 0b01111000, 0b00000000, 0b00000000, 0b00000000}, // m
    {0b01111100, 0b00001000, 0b00000100, 0b00000100, 0b01111000, 0b00000000, 0b00000000, 0b00000000}, // n
    {0b00111000, 0b01000100, 0b01000100, 0b01000100, 0b00111000, 0b00000000, 0b00000000, 0b00000000}, // o
    {0b01111100, 0b00010100, 0b00010100, 0b00010100, 0b00001000, 0b00000000, 0b00000000, 0b00000000}, // p
    {0b00001000, 0b00010100, 0b00010100, 0b00011000, 0b01111100, 0b00000000, 0b00000000, 0b00000000}, // q
    {0b01111100, 0b00001000, 0b00000100, 0b00000100, 0b00001000, 0b00000000, 0b00000000, 0b00000000}, // r
    {0b01001000, 0b01010100, 0b01010100, 0b01010100, 0b00100000, 0b00000000, 0b00000000, 0b00000000}, // s
    {0b00000100, 0b00111111, 0b01000100, 0b01000000, 0b00100000, 0b00000000, 0b00000000, 0b00000000}, // t
    {0b00111100, 0b01000000, 0b01000000, 0b00100000, 0b01111100, 0b00000000, 0b00000000, 0b00000000}, // u
    {0b00011100, 0b00100000, 0b01000000, 0b00100000, 0b00011100, 0b00000000, 0b00000000, 0b00000000}, // v
    {0b00111100, 0b01000000, 0b00111000, 0b01000000, 0b00111100, 0b00000000, 0b00000000, 0b00000000}, // w
    {0b01000100, 0b00101000, 0b00010000, 0b00101000, 0b01000100, 0b00000000, 0b00000000, 0b00000000}, // x
    {0b00001100, 0b01010000, 0b01010000, 0b01010000, 0b00111100, 0b00000000, 0b00000000, 0b00000000}, // y
    {0b01000100, 0b01100100, 0b01010100, 0b01001100, 0b01000100, 0b00000000, 0b00000000, 0b00000000}, // z
    {0b00000000, 0b00001000, 0b00110110, 0b01000001, 0b00000000, 0b00000000, 0b00000000, 0b00000000}, // {
    {0b00000000, 0b00000000, 0b01111111, 0b00000000, 0b00000000, 0b00000000, 0b00000000, 0b00000000}, // |
    {0b00000000, 0b01000001, 0b00110110, 0b00001000, 0b00000000, 0b00000000, 0b00000000, 0b00000000}, // }
    {0b00001000, 0b00001000, 0b00101010, 0b00011100, 0b00001000, 0b00000000, 0b00000000, 0b00000000}, // ~
    {0b00001000, 0b00011100, 0b00101010, 0b00001000, 0b00001000, 0b00000000, 0b00000000, 0b00000000}  // <-
};

void SystemClock48MHz(void)
{
    //
    // Disable the PLL
    //
    RCC->CR &= ~(RCC_CR_PLLON);
    //
    // Wait for the PLL to unlock
    //
    while ((RCC->CR & RCC_CR_PLLRDY) != 0)
        ;
    //
    // Configure the PLL for a 48MHz system clock
    //
    RCC->CFGR = 0x00280000;

    //
    // Enable the PLL
    //
    RCC->CR |= RCC_CR_PLLON;

    //
    // Wait for the PLL to lock
    //
    while ((RCC->CR & RCC_CR_PLLRDY) != RCC_CR_PLLRDY)
        ;

    //
    // Switch the processor to the PLL clock source
    //
    RCC->CFGR = (RCC->CFGR & (~RCC_CFGR_SW_Msk)) | RCC_CFGR_SW_PLL;

    //
    // Update the system with the new clock frequency
    //
    SystemCoreClockUpdate();
}

int main(int argc, char *argv[])
{
    SystemClock48MHz();
    GPIOA_init();
    GPIOB_init();
    ADC_init();
    DAC_init();
    TIM2_init();
    EXTI0_1_init();
    EXTI_2_init();
    printf("Initialization finished");

    //	oled_config();
    while ((ADC1->ISR & ADC_ISR_ADRDY) == 0)
        ;

    while (1)
    {
        while ((ADC1->CR & ADC_ISR_EOC) == 0)
            ;

        uint32_t data = ADC1->DR;
        DAC->DHR12R1 = data;

        float voltage = (float)(data / 4095.0) * 3;
        float resistance = (voltage / 3) * 5000;
        Res = (int)resistance;

        trace_printf("resistance: %d, Freq: %d, swap: %d\n", Res, Freq, swap);
        //		if (swap == 1) {
        //			trace_printf("Frequency from PA2: %d\n", Freq);
        //		} else {
        //			trace_printf("Frequency from PA1: %d\n", Freq);
        //		}
        //		for(int i = 0; i < 65000; i++);
        //		refresh_OLED();
    }
}

//
// GPIO Initialization
//

void GPIOA_init()
{
    RCC->AHBENR |= RCC_AHBENR_GPIOAEN;

    // Set PA0 as input
    GPIOA->MODER &= ~(GPIO_MODER_MODER0);

    // Disable pull up / pull down
    GPIOA->PUPDR &= ~(GPIO_PUPDR_PUPDR0);

    // Set PA1 as input
    GPIOA->MODER &= ~(GPIO_MODER_MODER1);

    // Disable pull up / pull down
    GPIOA->PUPDR &= ~(GPIO_PUPDR_PUPDR1);
}

void GPIOB_init()
{

    // Enable clock for GPIOB peripheral
    RCC->AHBENR |= RCC_AHBENR_GPIOBEN;

    // Configure PB3 as AF
    GPIOB->MODER |= (GPIO_MODER_MODER3_1);

    // Ensure no pull-up/pull-down for PB3
    GPIOB->PUPDR &= ~(GPIO_PUPDR_PUPDR3);

    // Configure PB4 as output
    GPIOB->MODER |= (GPIO_MODER_MODER4_0);

    // Ensure no pull-up/pull-down for PB4
    GPIOB->PUPDR &= ~GPIO_PUPDR_PUPDR4;

    // Configure PB5 as AF
    GPIOB->MODER |= GPIO_MODER_MODER5_1;

    // Ensure no pull-up/pull-down for PB5
    GPIOB->PUPDR &= ~GPIO_PUPDR_PUPDR5;
}

//
// ADC Functions
//

void ADC_init()
{

    // Enable ADC1 clock
    RCC->APB2ENR |= RCC_APB2ENR_ADCEN;

    // Enable clock for GPIOA
    RCC->AHBENR |= RCC_AHBENR_GPIOAEN;

    // Set PA5 as ADC input
    GPIOA->MODER |= GPIO_MODER_MODER5;

    // Clear CR
    ADC1->CR &= 0x00000000;

    // Set Sampling Time Register
    ADC1->SMPR |= ((uint16_t)0b11);

    // Channel Select
    ADC1->CHSELR |= ((uint16_t)1 << 5);

    // Set Resolution
    ADC1->CFGR1 &= ~(ADC_CFGR1_RES);

    // Overrun Management Mode
    ADC1->CFGR1 |= ADC_CFGR1_OVRMOD;

    // Continuous conversion Mode
    ADC1->CFGR1 |= ADC_CFGR1_CONT;

    // Enable ADC
    ADC1->CR |= ADC_CR_ADEN;

    // START ADC
    ADC1->CR |= ADC_CR_ADSTART;
}

void DAC_init()
{

    // Enable DAC clock
    RCC->APB1ENR |= RCC_APB1ENR_DACEN;

    // Enable GPIOA Clock
    RCC->AHBENR |= RCC_AHBENR_GPIOAEN;

    // Configure PA4 as output
    GPIOA->MODER &= ~(GPIO_MODER_MODER4);

    // Stop pull-up/down
    GPIOA->PUPDR &= ~(GPIO_PUPDR_PUPDR4);

    DAC->CR |= DAC_CR_EN1;

    DAC->CR &= ~(DAC_CR_BOFF1);

    DAC->CR &= ~(DAC_CR_TEN1);
}

void SPI_init()
{
    // Enable Clock
    RCC->APB2ENR |= RCC_APB2ENR_SPI1EN;

    SPI_Handle.Instance = SPI1;

    SPI_Handle.Init.Direction = SPI_DIRECTION_1LINE;
    SPI_Handle.Init.Mode = SPI_Mode_Master;      // SPI Mode
    SPI_Handle.Init.DataSize = SPI_DataSize;     // SPI datasize
    SPI_Handle.Init.CLKPolarity = SPI_CPOL_Low;  // SPI clock polarity
    SPI_Handle.Init.CLKPhase = SPI_PHASE_1EDGE;  // SPI clock phase
    SPI_Handle.Init.NSS = SPI_NSS_SOFT;          // SPI NSS
    SPI_Handle.Init.BaudRatePrescaler = 56;      // Specify the baud rate prescaler value
    SPI_Handle.Init.FirstBit = SPI_FirstBit_MSB; // SPI init first bit to MSB
    SPI_Handle.Init.CRCPolynomial = 7;           // SPI CRC polynomial

    // Initialize Interface
    HAL_SPI_Init(&SPI_Handle);
    // Enable
    __HAL_SPI_ENABLE(&SPI_Handle);
}

void TIM2_init()
{
    RCC->APB1ENR |= RCC_APB1ENR_TIM2EN; // Enable clock for TIM2 peripheral

    TIM2->CR1 = ((uint16_t)0x008C); // Configure TIM2: buffer auto-reload, count up, stop on overflow,
                                    // enable update events, interrupt on overflow only

    TIM2->PSC = ((uint16_t)0x0000);     // Set clock prescaler value
    TIM2->ARR = ((uint32_t)0xFFFFFFFF); // Set auto-reloaded delay
    TIM2->EGR = ((uint16_t)0x0001);     // Update timer registers

    NVIC_SetPriority(TIM2_IRQn, 0); // Assign TIM2 interrupt priority = 0 in NVIC
    NVIC_EnableIRQ(TIM2_IRQn);      // Enable TIM2 interrupts in NVIC

    TIM2->DIER |= TIM_DIER_UIE; // Enable update interrupt generation
    TIM2->CR1 |= TIM_CR1_CEN;   // Start counting timer pulses
}

void EXTI0_1_init()
{
    //	RCC->APB2ENR |= RCC_APB2ENR_SYSCFGEN;

    // Map EXTI line 0 to PA0
    SYSCFG->EXTICR[0] |= SYSCFG_EXTICR1_EXTI0_PA;

    // Rising edge trigger
    EXTI->RTSR |= EXTI_RTSR_TR0;

    // Un-mask interrupts from EXTI1
    EXTI->IMR |= EXTI_IMR_MR0;

    // Map EXTI line 1 to PA1
    SYSCFG->EXTICR[0] |= SYSCFG_EXTICR1_EXTI1_PA;

    // Rising edge trigger
    EXTI->RTSR |= EXTI_RTSR_TR1;

    // Un-mask interrupts from EXTI1
    EXTI->IMR |= EXTI_IMR_MR1;

    // Assign EXTI1 interrupt priority = 0;
    NVIC_SetPriority(EXTI0_1_IRQn, 0);

    // Enable interrupts
    NVIC_EnableIRQ(EXTI0_1_IRQn);
}

void EXTI_2_init()
{
    SYSCFG->EXTICR[0] |= SYSCFG_EXTICR1_EXTI2_PA;
    EXTI->RTSR |= EXTI_RTSR_TR2;
    EXTI->IMR |= EXTI_IMR_MR2;

    NVIC_SetPriority(EXTI2_3_IRQn, 0);
    NVIC_EnableIRQ(EXTI2_3_IRQn);
}

void TIM2_IRQHandler()
{
    /* Check if update interrupt flag is indeed set */
    if ((TIM2->SR & TIM_SR_UIF) != 0)
    {
        trace_printf("\n*** Overflow! ***\n");

        /* Clear update interrupt flag */
        // Relevant register: TIM2->SR
        TIM2->SR &= ~(TIM_SR_UIF);

        /* Restart stopped timer */
        // Relevant register: TIM2->CR1
        TIM2->CR1 |= TIM_CR1_CEN;
    }
}

void EXTI0_1_IRQHandler()
{

    if ((EXTI->PR & EXTI_PR_PR0) != 0)
    {
        EXTI->PR = EXTI_PR_PR0;

        swap ^= 1;
    }

    /* Check if EXTI1 interrupt pending flag is indeed set */
    if ((EXTI->PR & EXTI_PR_PR1) != 0)
    {
        if (swap == 0)
        {
            // 1. If this is the first edge:
            if (timerTriggered == 0)
            {
                // - Clear count register (TIM2->CNT).
                TIM2->CNT = 0;
                // - Start timer (TIM2->CR1).
                TIM2->CR1 |= TIM_CR1_CEN;
                timerTriggered = 1;
            }
            else
            {
                // Else (this is the second edge):
                //  - Stop timer (TIM2->CR1).
                TIM2->CR1 &= ~TIM_CR1_CEN;
                ;
                uint32_t count_register = TIM2->CNT;
                double frequency = 48000000.0 / (count_register * 1.0);
                timerTriggered = 0;

                Freq = (int)frequency;
            }
        }
        // 2. Clear EXTI1 interrupt pending flag (EXTI->PR).
        // NOTE: A pending register (PR) bit is cleared
        // by writing 1 to it.
        EXTI->PR = EXTI_PR_PR1;
    }
}

void EXTI2_3_IRQHandler()
{
    /* Check if EXTI2 interrupt pending flag is indeed set */
    if ((EXTI->PR & EXTI_PR_PR2) != 0)
    {
        if (swap == 1)
        {
            //		// 1. If this is the first edge:
            if (timerTriggered == 0)
            {
                // - Clear count register (TIM2->CNT).
                TIM2->CNT = 0;
                // - Start timer (TIM2->CR1).
                TIM2->CR1 |= TIM_CR1_CEN;
                timerTriggered = 1;
            }
            else
            {
                // Else (this is the second edge):
                //  - Stop timer (TIM2->CR1).
                TIM2->CR1 &= ~TIM_CR1_CEN;
                ;
                uint32_t count_register = TIM2->CNT;
                double frequency = 48000000.0 / (count_register * 1.0);
                timerTriggered = 0;

                Freq = (int)frequency;
            }
        }
        //
        // 2. Clear EXTI2 interrupt pending flag (EXTI->PR).
        // NOTE: A pending register (PR) bit is cleared
        // by writing 1 to it.
        //
        EXTI->PR = EXTI_PR_PR2;
    }
}

void refresh_OLED(void)
{
    // Buffer size = at most 16 characters per PAGE + terminating '\0'
    unsigned char Buffer[17];

    //    snprintf( Buffer, sizeof( Buffer ), "R: %5u Ohms", Res );
    /* Buffer now contains your character ASCII codes for LED Display
       - select PAGE (LED Display line) and set starting SEG (column)
       - for each c = ASCII code = Buffer[0], Buffer[1], ...,
           send 8 bytes in Characters[c][0-7] to LED Display
    */

    //    snprintf( Buffer, sizeof( Buffer ), "F: %5u Hz", Freq );
    /* Buffer now contains your character ASCII codes for LED Display
       - select PAGE (LED Display line) and set starting SEG (column)
       - for each c = ASCII code = Buffer[0], Buffer[1], ...,
           send 8 bytes in Characters[c][0-7] to LED Display
    */

    /* Wait for ~100 ms (for example) to get ~10 frames/sec refresh rate
       - You should use TIM3 to implement this delay (e.g., via polling)
    */
}

void oled_Write_Cmd(unsigned char cmd)
{
    // make PB6 = CS# = 1
    // make PB7 = D/C# = 0
    // make PB6 = CS# = 0
    oled_Write(cmd);
    // make PB6 = CS# = 1
}

void oled_Write_Data(unsigned char data)
{
    // make PB6 = CS# = 1
    // make PB7 = D/C# = 1
    // make PB6 = CS# = 0
    oled_Write(data);
    // make PB6 = CS# = 1
}

void oled_Write(unsigned char Value)
{

    /* Wait until SPI1 is ready for writing (TXE = 1 in SPI1_SR) */

    /* Send one 8-bit character:
       - This function also sets BIDIOE = 1 in SPI1_CR1
    */
    //    HAL_SPI_Transmit( &SPI_Handle, &Value, 1, HAL_MAX_DELAY );

    /* Wait until transmission is complete (TXE = 1 in SPI1_SR) */
}

void oled_config(void)
{

    // Don't forget to enable GPIOB clock in RCC
    // Don't forget to configure PB3/PB5 as AF0
    // Don't forget to enable SPI1 clock in RCC

    SPI_Handle.Instance = SPI1;

    SPI_Handle.Init.Direction = SPI_DIRECTION_1LINE;
    SPI_Handle.Init.Mode = SPI_MODE_MASTER;
    SPI_Handle.Init.DataSize = SPI_DATASIZE_8BIT;
    SPI_Handle.Init.CLKPolarity = SPI_POLARITY_LOW;
    SPI_Handle.Init.CLKPhase = SPI_PHASE_1EDGE;
    SPI_Handle.Init.NSS = SPI_NSS_SOFT;
    SPI_Handle.Init.BaudRatePrescaler = SPI_BAUDRATEPRESCALER_256;
    SPI_Handle.Init.FirstBit = SPI_FIRSTBIT_MSB;
    SPI_Handle.Init.CRCPolynomial = 7;

    //
    // Initialize the SPI interface
    //
    //    HAL_SPI_Init( &SPI_Handle );

    //
    // Enable the SPI
    //
    __HAL_SPI_ENABLE(&SPI_Handle);

    /* Reset LED Display (RES# = PB4):
       - make pin PB4 = 0, wait for a few ms
       - make pin PB4 = 1, wait for a few ms
    */

    //
    // Send initialization commands to LED Display
    //
    for (unsigned int i = 0; i < sizeof(oled_init_cmds); i++)
    {
        oled_Write_Cmd(oled_init_cmds[i]);
    }

    /* Fill LED Display data memory (GDDRAM) with zeros:
       - for each PAGE = 0, 1, ..., 7
           set starting SEG = 0
           call oled_Write_Data( 0x00 ) 128 times
    */
}

#pragma GCC diagnostic pop

// ----------------------------------------------------------------------------
