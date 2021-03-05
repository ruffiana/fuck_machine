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
    
    def __init__(self, speed_limit=50, invert=True, res_max=127):
        # define GPIO settings
        GPIO.setwarnings(False)         # do not show any warnings
        GPIO.setmode(GPIO.BCM)
        GPIO.setup(self.SPI_CS_PIN, GPIO.OUT)
        GPIO.setup(self.SPI_CLK_PIN, GPIO.OUT)
        GPIO.setup(self.SPI_SDISDO_PIN, GPIO.OUT)
        
        # parameters
        self.INVERT = invert
        self.RES_MAX = res_max
        self.SPEED_LIMIT = speed_limit

        # num of steps in speed control widget's range
        self.SPEED_MIN = 0
        self.SPEED_MAX = 100
        # scalar for speed control to speed limit
        self.SPEED_SCALAR = self.SPEED_MAX / self.SPEED_LIMIT

        # scalar for mapping speed value to resistance value
        self.RES_STEP = self.RES_MAX / self.SPEED_MAX

        # class variables
        self._speed = 0

        print(self.__str__())

    def __str__(self):
        return f"Speed Control initialized: Speed limiter:{self.SPEED_LIMIT} iNVERT:{self.INVERT}"

    @staticmethod
    def to_cubic(value):
        return (value ** 2) * 0.01

    @property
    def speed(self):
        # print(f'Current Speed is {self._speed}')
        return self._speed

    @speed.setter
    def speed(self, speed):
        # send scaled speed value through GPIO to digipot
        GPIO.output(self.SPI_CS_PIN, True)
        GPIO.output(self.SPI_CLK_PIN, False)
        GPIO.output(self.SPI_CS_PIN, False)

        # make sure speed is clamped between min and max speed values
        self._speed = min(self.SPEED_MAX, max(self.SPEED_MIN, speed))
        
        # convert speed to resistance value
        resistance = self.resistance
        b = '{0:016b}'.format(resistance)
        for x in range(0, 16):
            #print('x:' + str(x) + ' -> ' + str(b[x]))
            GPIO.output(self.SPI_SDISDO_PIN, int(b[x]))
            GPIO.output(self.SPI_CLK_PIN, True)
            GPIO.output(self.SPI_CLK_PIN, False)

        GPIO.output(self.SPI_CS_PIN, True)
        
        print(f'Speed changed to {self._speed} : {resistance}')
    
    @property
    def resistance(self):
        # apply speed scale
        speed = self.speed / self.SPEED_SCALAR

        # invert speed value if needed
        if self.INVERT:
            speed = self.SPEED_MAX - speed

        # Take current speed value between 0 and 100 and divide by speed scaler
        # derived from max speed and speed steps, then multiply by resistance
        # steps to get final clamped resistance value
        return int(speed * self.RES_STEP)

    def cleanup(self):
        self.speed = 0
        GPIO.cleanup() # this ensures a clean exit


def test():
    speed_control = Speed_Control()
    for i in range(101):
        print(f"{i} = {speed_control.to_cubic(i)}")

if __name__ == '__main__':
    test()