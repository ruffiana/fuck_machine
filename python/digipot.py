# coding: utf-8
#!/usr/bin/env python
import RPi.GPIO as GPIO



class Speed_Control():
    def __init__(self):
        # Rasberry Pi 3 pins
        # GPIO.BCM mode uses Broadcom SOC channel
        # GPIO## not pin#
        self.SPI_CS_PIN = 8 #SPI_CE0_N
        self.SPI_CLK_PIN = 11 # SPI_CLK
        self.SPI_SDISDO_PIN = 10 # SPI_MOSI

        # define GPIO settings
        GPIO.setwarnings(False)         # do not show any warnings
        GPIO.setmode(GPIO.BCM)
        GPIO.setup(self.SPI_CS_PIN, GPIO.OUT)
        GPIO.setup(self.SPI_CLK_PIN, GPIO.OUT)
        GPIO.setup(self.SPI_SDISDO_PIN, GPIO.OUT)


    def set_speed(speed=0):
        GPIO.output(self.SPI_CS_PIN, True)

        GPIO.output(self.SPI_CLK_PIN, False)
        GPIO.output(self.SPI_CS_PIN, False)

        b = '{0:016b}'.format(speed)
        for x in range(0, 16):
            #print('x:' + str(x) + ' -> ' + str(b[x]))
            GPIO.output(self.SPI_SDISDO_PIN, int(b[x]))

            GPIO.output(self.SPI_CLK_PIN, True)
            GPIO.output(self.SPI_CLK_PIN, False)

        GPIO.output(self.SPI_CS_PIN, True)


    def cleanup(self):
        GPIO.cleanup() # this ensures a clean exitterst
