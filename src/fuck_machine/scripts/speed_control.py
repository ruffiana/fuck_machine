# coding: utf-8
#!/usr/bin/env python
import importlib.util
import logging
from inspect import getmodule
from typing import Union

try:
    importlib.util.find_spec("RPi.GPIO")
    import RPi.GPIO as GPIO
except ImportError:
    # import FakeRPi.RPiO as RPiO
    import FakeRPi.GPIO as GPIO

try:
    from . import config_parser, graphs
    from .common import *
except ImportError:
    import config_parser
    import graphs
    from common import *


class Speed_Control:
    """Handles digipot resistance values through MCP4131 chip via GPIO on
    raspberry pi 3

    Attributes:
        SPI_CS_PIN: An integer representing GPIO# for SPI_CE0_N.
        SPI_CLK_PIN: An integer representing GPIO# for SPI_CLK.
        SPI_SDISDO_PIN: An integer representing GPIO# for SPI_MOSI.
        SPEED_MIN = An integer representing minimum speed value.
        SPEED_MAX = An integer represeting maximum speed value.
        INVERT = A bool indicating whether speed values need to be inverted.
        RES_MAX = An integer representing max resistance steps of digipot.
        SPEED_LIMIT = An integer representing
        SPEED_SCALAR: A float scalar for speed control to speed limit.
        RES_STEP: A float scalar for mapping speed value to resistance value.
    """

    # Rasberry Pi 3 pins
    # GPIO.BCM mode uses Broadcom SOC channel
    # This is GPIO# not pin#
    SPI_CS_PIN = 8  # SPI_CE0_N
    SPI_CLK_PIN = 11  # SPI_CLK
    SPI_SDISDO_PIN = 10  # SPI_MOSI

    def __init__(
        self,
        config=None,
    ) -> None:

        self.logger = logging.getLogger(self.__class__.__name__)

        # define GPIO settings
        GPIO.setwarnings(False)  # do not show any warnings
        GPIO.setmode(GPIO.BCM)
        GPIO.setup(self.SPI_CS_PIN, GPIO.OUT)
        GPIO.setup(self.SPI_CLK_PIN, GPIO.OUT)
        GPIO.setup(self.SPI_SDISDO_PIN, GPIO.OUT)

        # import parameters from config file using config_parser
        if not config:
            config = config_parser.get_config()

        self.invert = config.getboolean('controller', 'invert', fallback=True)
        self.res_max = config.getint('controller', 'resmax', fallback=127)
        self.speed_min = config.getint('speed', 'min', fallback=0)
        self.speed_max = config.getint('speed', 'max', fallback=100)
        self.speed_limit = config.getint('speed', 'limit', fallback=100)
        self.speed_scalar = self.speed_max / self.speed_limit
        self.res_step = self.res_max / self.speed_max
        self.log = config.getboolean('controller', 'log', fallback=False)

        self._speed = 0

        print(self.__str__())

    def __str__(self) -> str:
        return f"Speed Control initialized: Speed limiter:{self.speed_limit} Invert:{self.invert}"

    def __repr__(self) -> str:
        return f"Speed_Control(speed_limit={self.speed_limit}, invert={self.invert}, res_max={self.res_max})"

    @property
    def speed(self) -> float:
        # print(f'Current Speed is {self._speed}')
        return self._speed

    @speed.setter
    def speed(self, speed: Union[int, float]) -> bool:
        # send scaled speed value through GPIO to digipot
        GPIO.output(self.SPI_CS_PIN, True)
        GPIO.output(self.SPI_CLK_PIN, False)
        GPIO.output(self.SPI_CS_PIN, False)

        # make sure speed is clamped between min and max speed values
        self._speed = min(self.speed_max, max(self.speed_min, speed))

        # convert speed to resistance value
        resistance = self.resistance
        b = "{0:016b}".format(resistance)
        for x in range(0, 16):
            # print('x:' + str(x) + ' -> ' + str(b[x]))
            GPIO.output(self.SPI_SDISDO_PIN, int(b[x]))
            GPIO.output(self.SPI_CLK_PIN, True)
            GPIO.output(self.SPI_CLK_PIN, False)

        # self.logger.debug(f"Speed changed to {self._speed} : {resistance}")
        if self.log:
            graphs.output(0.0, self._speed)

        return True

    @property
    def resistance(self) -> int:
        # apply speed scale
        speed = self.speed / self.speed_scalar

        # invert speed value if needed
        if self.invert:
            speed = self.speed_max - speed

        # Take current speed value between 0 and 100 and divide by speed scaler
        # derived from max speed and speed steps, then multiply by resistance
        # steps to get final clamped resistance value
        return int(speed * self.res_step)

    def cleanup(self) -> bool:
        self.speed = 0
        GPIO.cleanup()  # this ensures a clean exit

        return True


def test():
    sc = Speed_Control()
    for i in range(101):
        speed = to_cubic(i)
        graphs.output(i, speed)


if __name__ == "__main__":
    test()
