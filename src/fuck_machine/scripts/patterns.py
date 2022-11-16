import logging
from pprint import pprint
from random import randint, random, uniform
from time import sleep
from typing import Union

import numpy as np

try:
    from . import config_parser, graphs
    from .common import *
except ImportError:
    import config_parser
    import graphs
    from common import *

# import attributes from config.ini file using config_parser
config = config_parser.get_config()
DEBUG = config.getboolean("DEFAULT", "debug", fallback=False)
SAMPLES = config.getint("graph", "samples", fallback=300)

# used by sin/cos functions
DOUBLE_PI = np.pi * 2
# default numpy array for x_data. 1 'time' unit from 0.0 - 1.0
X_DATA = np.linspace(0, 1, SAMPLES)


class Pattern:

    def __init__(
            self,
            name,
            fps=(1, SAMPLES),
            test=False,
            *args,
            **kwargs,
    ) -> None:

        # Logging
        self._log_level = logging.DEBUG if DEBUG else logging.INFO
        self.logger = logging.getLogger(self.__class__.__name__)
        self.logger.setLevel(self._log_level)

        self.name = name
        # min/max fps value for this patter
        self.fps = fps
        # include this pattern for debugging/testing
        self.test = test

        self.args = args
        self.kwargs = kwargs

        # get graph generator function from this module by name
        self._generator = globals().get(self.name)
        if not self._generator:
            self.logger.error(f"No function named {self.name}")
        self.graph = self.create_graph()

    def create_graph(self):
        return self._generator()

    def get_speed(self):
        return self.graph[0] * 100

    def advance(self):
        self.graph = np.roll(self.graph, -1)

    def reverse(self):
        self.graph = np.roll(self.graph, 1)


class Patterns:
    PATTERNS = {
        "constant": {
            "test": False
        },
        "random": {
            "fps": (0.25, 2),
            "test": False,
        },
        "wave": {
            "fps": (1, 30),
            "test": True
        },
        "ripple": {
            "fps": (0.25, 15),
            "test": True
        },
    }

    def __init__(self, *args, **kwargs) -> None:
        self.patterns = self.init_patterns()
        self._current = self.default

    def init_patterns(self):
        patterns = list()
        for name, kwargs in self.PATTERNS.items():
            p = Pattern(name, **kwargs)
            patterns.append(p)
        return patterns

    @property
    def default(self):
        return self.patterns[0]

    @property
    def current(self):
        return self._current

    def set_current(self, arg):
        if isinstance(arg, int):
            self._current = self.patterns[i]
        elif isinstance(arg, str):
            for pattern in self.patterns:
                if pattern.name == arg:
                    self._current = pattern
                    # self.logger.debug(f'Mode changed to "{self._cur_pattern.name}"')


def constant() -> np.array:
    y = np.ones(SAMPLES)
    return y


def random() -> np.array:
    y = np.random.standard_normal(SAMPLES)
    return normalize(y)


def wave() -> np.array:
    offset = 0.25
    y = 0.5 * np.sin(DOUBLE_PI * (X_DATA - offset)) + 0.5
    return y


def ripple() -> np.array:
    f1 = 1
    f2 = 5
    f3 = 32

    offset1 = 0.25
    offset2 = offset1 / f2
    offset3 = offset1 / f3

    s1 = 0.5
    s2 = 0.25
    s3 = 0.25

    y1 = 0.5 * np.sin(DOUBLE_PI * (f1 * (X_DATA - offset1))) + 0.5
    y2 = 0.5 * np.sin(DOUBLE_PI * (f2 * (X_DATA - offset2))) + 0.5
    y3 = 0.5 * np.sin(DOUBLE_PI * (f3 * (X_DATA - offset3))) + 0.5

    y_data = (y1 * s1) + (y2 * s2) + (y3 * s3)
    return normalize(y_data)


def test():
    patterns = Patterns()
    print(patterns.current.name)

    # control inputs sliders are speed and frequency
    speed = 100
    freq = 100

    # test_print_graph(speed, freq, time, fps)
    anim = False
    for pattern in patterns.patterns:
        if not pattern.test:
            continue

        y_data = pattern.graph

        title = f"{pattern.name.capitalize()} [speed:{speed}, freq:{freq}]"
        if anim:
            graphs.anim((X_DATA, y_data), title=title)
        else:
            graphs.static((X_DATA, y_data), title=title)


if __name__ == "__main__":
    test()

    #
    # .graph = graph_wave()
    # graphs.plot_graph(graph, TIME_LENGTH)
