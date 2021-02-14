# coding: utf-8
#!/usr/bin/env python
import importlib.util
try:
    importlib.util.find_spec('RPi.GPIO')
    import RPi.GPIO as GPIO
except ImportError:
    """
    import FakeRPi.GPIO as GPIO
    OR
    import FakeRPi.RPiO as RPiO
    """
    
    import FakeRPi.GPIO as GPIO



class Speed_Control():
    """
    Class to handle PWM through MCP4131 chip via GPIO on raspberry pi 3

    ``:Examples:``

        # instantiate a Speed_Control object
        speed_control = Speed_Control()

        # set speed via 
        speed_control.set_speed(5)

        # sets speed to 0 and resets GPIO before quitting
        speed_control.cleanup()

    ``ToDo``
        implement @property for speed

    """
    # Rasberry Pi 3 pins
    # GPIO.BCM mode uses Broadcom SOC channel
    # GPIO## not pin#
    SPI_CS_PIN = 8 #SPI_CE0_N
    SPI_CLK_PIN = 11 # SPI_CLK
    SPI_SDISDO_PIN = 10 # SPI_MOSI
    
    def __init__(self, max_speed=5):
        # define GPIO settings
        GPIO.setwarnings(False)         # do not show any warnings
        GPIO.setmode(GPIO.BCM)
        GPIO.setup(self.SPI_CS_PIN, GPIO.OUT)
        GPIO.setup(self.SPI_CLK_PIN, GPIO.OUT)
        GPIO.setup(self.SPI_SDISDO_PIN, GPIO.OUT)
        
        self._speed = 0
        self.min_speed =0
        self.max_speed = max_speed
        self.max_out = 127
        self.res_step = self.max_out / 10

        print(f"Speed Control initialized: max_speed = {self.max_speed}")

    @property
    def speed(self):
        # print(f'Current Speed is {self._speed}')
        return self._speed

    @staticmethod
    def to_cubic(value):
        return (value ** 2) * 0.01

    @speed.setter
    def speed(self, speed):
        # send scaled speed value through GPIO to digipot
        GPIO.output(self.SPI_CS_PIN, True)
        GPIO.output(self.SPI_CLK_PIN, False)
        GPIO.output(self.SPI_CS_PIN, False)

        # make sure given speed is between 0 and max_speed
        speed = min(self.max_speed, max(self.min_speed, speed))
        self._speed = speed
        
        # speed control works inverse to increased resistance, so need to
        # invert the speed value
        speed = 10 - self.speed
        # Scale speed to a range of 0-127 using
        speed = int(speed * self.res_step)

        b = '{0:016b}'.format(speed)
        for x in range(0, 16):
            #print('x:' + str(x) + ' -> ' + str(b[x]))
            GPIO.output(self.SPI_SDISDO_PIN, int(b[x]))
            GPIO.output(self.SPI_CLK_PIN, True)
            GPIO.output(self.SPI_CLK_PIN, False)

        GPIO.output(self.SPI_CS_PIN, True)
        
        print(f'Speed changed to {self._speed} : {speed}')

    def cleanup(self):
        self.speed = 0
        GPIO.cleanup() # this ensures a clean exit


def test():
    for i in range(11):
        print(f"{i} = {Speed_Control.to_cubic(i)}")

if __name__ == '__main__':
    test()