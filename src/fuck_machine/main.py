# coding: utf-8
#!/usr/bin/env python
import atexit
import configparser
import inspect
import json
import logging

from flask import Flask, render_template, request

try:
    from .scripts import config_parser
    # from .scripts.const import *
    from .scripts.controller import Animation_Controller
except ImportError:
    from scripts import config_parser
    # from scripts.const import *
    from scripts.controller import Animation_Controller

__version__ = 1.0
__author__ = "Ruffiana"
__doc__ = """Fuck Machine control app"""

# import attributes from config.ini file using config_parser
config = config_parser.get_config()
DEV_DEBUG = config.getboolean("DEFAULT", "debug", fallback=False)
SPEED_LIMIT = config.getint("speed", "limit", fallback=100)
DEFAULT_SPEED = config.getint("speed", "default", fallback=0)
DEFAULT_FREQUENCY = config.getint("freq", "default", fallback=50)
FLASK_DEBUG = config.getboolean("flask", "debug", fallback=False)
FLASK_PORT = config.getint("flask", "port", fallback=80)

# Logging
LOG_LEVEL = logging.DEBUG if DEV_DEBUG else logging.INFO
logging.basicConfig(level=LOG_LEVEL)
# this sets the log level for the 'werkzeug' and keeps the console from being
# filled with log messages ever time a request gets sent
logging.getLogger('werkzeug').setLevel(logging.WARNING)
logger = logging.getLogger()
logger.info(f"Logging level set to {LOG_LEVEL}")


def main():
    """ Main app function

    Args:
        dev (bool, optional): _description_. Defaults to DEV_DEBUG.

    Returns:
        _type_: _description_
    """

    app = Flask(__name__)

    controller = Animation_Controller(config,
                                      # no_timer_reset=False,
                                      )

    # base html page
    @app.route("/")
    @app.route("/index")
    def index():
        return render_template("index.html")

    # @app.before_request
    # def before_request():
    #     'Log post request json for testing'
    #     if dev and request.method == 'POST':
    #         print(request.endpoint)
    #         print(request.json)

    # @app.get('/getsettings')
    # def get_settings():
    #     'Get settings'
    #     return jsonify(controller.get_settings())

    # @app.post('/updatesettings')
    # def update_settings():
    #     'Update settings'
    #     new_settings = request.json
    #     controller.update_settings(new_settings)
    #     return jsonify(result='')

    # @app.post('/compilefunction')
    # def compile_function():
    #     'Compiles a function, returns errors and warnings in JSON array form'
    #     key = request.json['key']
    #     errors, warnings = controller.set_pattern_function(key, functions[key]['source'])
    #     return jsonify(errors=errors, warnings=warnings)

    # @app.get('/getfps')
    # def get_fps():
    #     'Returns latest animation frames per second'
    #     return jsonify(fps=controller.get_frame_rate())

    # @app.get('/resettimer')
    # def reset_timer():
    #     'Resets animation timer'
    #     controller.reset_timer()
    #     return jsonify(result='')

    # this is the route to the receiver which is where javascript updates events
    # from the various HTML widgets
    """ json keys and values
    action: [statusChk|sendSpeed],
    """

    @app.route("/receiver", methods=["POST"])
    def worker():
        data = request.form

        action = data.get('action', None)
        if not action:
            return None

        if action == "sendSpeed":
            set_speed(data.get("speed", 0))

        if action == "sendFreq":
            set_freq(data.get("freq", 0))

        if action == "sendPattern":
            set_pattern(data["pattern"])

        # for now, all actions received require a status update. This might
        # need to change in the future
        return send_status()

    # returns a json string with status values
    def send_status():
        status = {
            "online": True,
            "speed": controller.speed,
            "motor": controller.speed_control.speed,
            "freq": controller.freq,
            "pattern": controller.pattern,
        }

        return json.dumps(status)

    def set_speed(inputSpeed):
        controller.speed = int(inputSpeed)
        logger.debug(
            f"{inspect.currentframe().f_code.co_name} - Setting Speed to {inputSpeed}"
        )

        return int(inputSpeed)

    def set_freq(inputFreq):
        controller.freq = int(inputFreq)
        logger.debug(
            f"{inspect.currentframe().f_code.co_name} - Setting Frequency to {inputFreq}"
        )

        return int(inputFreq)

    def set_pattern(pattern):
        controller.pattern = pattern
        logger.debug(
            f"{inspect.currentframe().f_code.co_name} - Setting pattern to {pattern}"
        )

    def cleanup():
        controller.cleanup()
        # controller.clear_leds()
        controller.end_animation()
        logger.debug(f"{inspect.currentframe().f_code.co_name} called")

    atexit.register(cleanup)

    # instantiate the flask app
    app.run(host="0.0.0.0", port=FLASK_PORT, debug=FLASK_DEBUG)

    # begin animation controller animation thread
    controller.begin_animation()


if __name__ == "__main__":
    main()
