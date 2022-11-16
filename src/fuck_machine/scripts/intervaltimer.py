import logging
import time
from threading import Event, Thread

try:
    from . import config_parser
except ImportError:
    import config_parser


class IntervalTimer:
    "Repeat function call at a regular interval"

    def __init__(self, refresh_rate, function, *args, **kwargs):
        # get attributes from config file using config_parser
        config = config_parser.get_config()
        self._debug = config.getboolean("DEFAULT", "debug", fallback=False)

        # Logging
        self._log_level = logging.DEBUG if self._debug else logging.INFO
        self.logger = logging.getLogger(self.__class__.__name__)
        self.logger.setLevel(self._log_level)

        self._refresh_rate = refresh_rate
        self._interval = 1.0 / refresh_rate
        self._function = function
        self._args = args
        self._kwargs = kwargs
        self._count = 0
        self._last_perf_avg_count = -1
        self._wait_time = 0
        self._last_start = time.perf_counter()
        self._last_measurement_c = 0
        self._last_measurement_t = 0
        self._perf_avg = 0
        self._event = Event()
        self._thread = Thread(target=self.target, daemon=True)

    @property
    def refresh_rate(self):
        return self._refresh_rate

    @refresh_rate.setter
    def refresh_rate(self, refresh_rate):
        self._refresh_rate = refresh_rate
        self._interval = 1.0 / refresh_rate
        return refresh_rate

    @property
    def interval(self):
        return self._interval

    @interval.setter
    def interval(self, interval):
        self._interval = interval
        self._refresh_rate = 1.0 / interval
        return interval

    @property
    def wait_time(self):
        return self._wait_time

    @wait_time.setter
    def wait_time(self, wait_time):
        self._wait_time = wait_time
        return wait_time

    def start(self):
        "Starts the timer thread"
        self._thread.start()

    def target(self):
        "Waits until ready and executes target function"
        while not self._event.wait(self.wait_time):
            self._last_start = time.perf_counter()
            self._function(*self._args, **self._kwargs)
            self._count += 1
            cycle_time = time.perf_counter() - self._last_start
            self._perf_avg += cycle_time

            # Calculate wait for next iteration
            self.wait_time = self.interval - cycle_time
            if self.wait_time < 0:
                self.wait_time = 0

    def get_count(self):
        "Returns cycle count"
        return self._count

    def get_perf_avg(self):
        "Returns average function execution time and clears accumulator"
        average = self._perf_avg / (self._count - self._last_perf_avg_count)
        self._perf_avg = 0
        self._last_perf_avg_count = self._count
        return average

    def get_rate(self):
        "Returns current rate in cycles per second"
        result = (self._count - self._last_measurement_c) / (
            self._last_start - self._last_measurement_t)
        self._last_measurement_c = self._count
        self._last_measurement_t = self._last_start
        return result

    def stop(self):
        "Stops the timer thread"
        self._event.set()
        self._thread.join()
