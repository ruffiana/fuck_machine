import logging
import time
import traceback
from itertools import product
from typing import Union

try:
    from . import config_parser, patterns
    from .common import *
    from .intervaltimer import IntervalTimer
    from .speed_control import Speed_Control
except ImportError:
    import config_parser
    import patterns
    from common import *
    from intervaltimer import IntervalTimer
    from speed_control import Speed_Control


class Animation_Controller:

    def __init__(
        self,
        config=None,
        # no_timer_reset: bool = False,
    ) -> None:

        # get attributes from config file using config_parser
        if not config:
            config = config_parser.get_config()
        self._debug = config.getboolean("DEFAULT", "debug", fallback=False)
        self._refresh_rate = config.getint('graph', 'refresh', fallback=30)
        # self._no_timer_reset = no_timer_reset
        # min/max range for input widgets
        self._inp_min = config.getint('DEFAULT', 'min', fallback=0)
        self._inp_max = config.getint('DEFAULT', 'max', fallback=100)
        # default speed and freq
        self._speed = config.getint('speed', 'default', fallback=0)
        self._freq = config.getint('freq', 'default', fallback=50)

        # Logging
        self._log_level = logging.DEBUG if self._debug else logging.INFO
        self.logger = logging.getLogger(self.__class__.__name__)
        self.logger.setLevel(self._log_level)

        # TODO: Currently unused, but should be basis for determining if
        # things need to be updated during the animation loop
        self._prev_speed = self._speed
        # Is the speed going to change this frame?
        self._update_needed = True

        # Prepare to start
        self.reset_timer()
        self._time = 0

        # Dictionary for mode/pattern functions
        self.patterns = patterns.Patterns()

        # object to control physical speed of machine
        self.speed_control = Speed_Control(config)

        # Begin animation interval timer thread
        self.begin_animation()

    @property
    def speed(self) -> float:
        """Animation Controller speed is the desired speed. This actual speed
        value passed to the speed control object depends on factors such as the
        pattern and frequency

        Returns:
            float: _description_
        """
        # self.logger.debug(f'Current Speed is {self._speed}')
        return self._speed

    @speed.setter
    def speed(self, speed: Union[int, float]) -> bool:
        """Animation Controller speed is the desired speed. This actual speed
        value passed to the speed control object depends on factors such as the
        pattern and frequency

        Args:
            speed (Union[int, float]): _description_

        Returns:
            bool: _description_
        """
        self._speed = speed
        # self.logger.debug(f'Speed changed to {speed}')

        return self._speed

    def update_speed(self):
        """Caculate a speed value to send to the speed controller"""
        # get current speed value from current frame of pattern
        speed = self.patterns.current.get_speed()

        # scale speed by current anim controller speed slider value
        speed *= self.speed / 100

        # calculate final speed value using lerp function
        # bias = self.freq / 100
        # speed = lerp(self.speed, speed, bias)

        # send speed value to speed constrol
        self.speed_control.speed = speed

        # advance the current pattern graph 1 frame
        self.patterns.current.advance()

    @property
    def freq(self) -> float:
        """Frequency affects the 'intensity' of speed changes or patterns

        Returns:
            float: Float that represents frequencey
        """
        return self._freq

    @freq.setter
    def freq(self, freq: Union[int, float]) -> bool:
        """Frequency affects the 'intensity' of speed changes or patterns

        Args:
            freq (Union[int, float]): _description_

        Returns:
            float: Float that represents frequencey
        """
        if freq == self._freq:
            return None

        self._freq = freq
        refresh_rate = self.set_refresh_rate()
        self.logger.debug(
            f"Frequency changed to {self._freq} : {refresh_rate}")

        return self._freq

    @property
    def pattern(self) -> str:
        """Pattern this controller follows

        Returns:
            str: Name of current pattern as a string
        """
        return self.patterns.current.name

    @pattern.setter
    def pattern(self, name: str) -> bool:
        """Pattern this controller follows

        Args:
            pattern (str): Name of a pattern

        Returns:
            str: Name of pattern if changed. None otherwise.
        """
        if name == self.patterns.current.name:
            return None

        self.patterns.set_current(name)
        self.logger.debug(f"Pattern changed to {name}")

        refresh_rate = self.set_refresh_rate()

        self.reset_timer()
        self._update_needed = True

        return self.patterns.current.name

    def set_refresh_rate(self):
        """Update animation controller's referesh rate when the pattern or
        frequency is changed.
        """

        # calculate timer refresh rate based on current pattern's freq scaler
        cur_pattern = self.patterns.current
        fps_min, fps_max = cur_pattern.fps
        refresh_rate = convert_frequency(
            self._freq,
            self._inp_min,
            self._inp_max,
            fps_min,
            fps_max,
        )

        self._timer.refresh_rate = refresh_rate

        return refresh_rate

    # Animation and timer
    def update(self):
        "Determine time, render frame, and display"
        # self.logger.debug('Tick...')
        last_t = self._time
        self._time = self._timer._last_start - self._start
        delta_t = self._time - last_t

        # if self._timer.get_count() % 100 == 0:
        #     self.logger.debug(
        #         f"Execution time: {self._timer.get_perf_avg():0.5f}s, {self._timer.get_rate():05.1f} FPS"
        #     )

        if not self._update_needed:
            return

        try:
            # update prev_state
            # self._prev_speed = self.speed

            self.update_speed()

            # self.speed = self._cur_function.func(
            #     self._time, delta_t, self.speed, self.freq, self._prev_speed
            # )

            # graphs.output(self._time, self.speed)

        except Exception as e:
            msg = traceback.format_exception(type(e), e, e.__traceback__)
            print(f"Animation execution: {msg}")
            self.speed = 0
            return

        # If displaying a static pattern or speed is 0:
        # no update is needed the next frame
        # if not self._update_needed and self.speed is not 0:
        #     self._update_needed = True

    def get_frame_rate(self):
        "Get frame rate"
        return self._timer.get_rate()

    # def _check_reset_animation_state(self):
    #     'Reset animation timer if allowed by configuration flag'
    #     if not self._no_timer_reset:
    #         self.reset_timer()

    def reset_timer(self):
        "Reset animation timer"
        self._start = time.perf_counter()

    def begin_animation(self):
        "Start animating"
        self._timer = IntervalTimer(self._refresh_rate, self.update)
        self._timer.start()

    def end_animation(self):
        "Stop rendering in the animation thread and stop sACN receiver"
        self._timer.stop()

    def cleanup(self) -> bool:
        self.speed = 0
        self.end_animation()

        # call cleanup on speed control
        self.speed_control.speed = 0
        self.speed_control.cleanup()

        return True


def test_patterns():
    logger = logging.basicConfig()

    ac = Animation_Controller()

    # sets up array of speedn and frequency test conditions
    cycle_time = 1
    speed_tests = [1, 25, 50, 75, 100]
    freq_tests = [1, 25, 50, 75, 100]
    tests = list(product(freq_tests, speed_tests))

    # test patterns
    for pattern in ac.patterns.patterns:
        if not pattern.test:
            continue

        for (
                freq,
                speed,
        ) in tests:
            logging.info(
                f'Testing pattern "{pattern.name}" - (speed:{speed}, freq:{freq})\n{"=" * 80}'
            )
            ac.pattern = pattern.name
            ac.speed = speed
            ac.freq = freq

            # pause and let animation thread do its thing
            time.sleep(cycle_time)

    # ac.modes
    # for i in range(10):
    #     logging.info(f'Set speed to {i}')
    #     ac.speed = i
    #     time.sleep(2)


if __name__ == "__main__":
    test_patterns()
