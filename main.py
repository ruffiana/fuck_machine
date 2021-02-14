# coding: utf-8
#!/usr/bin/env python
# sudo python3 Python/fuck_machine/main.py
import atexit
from flask import Flask, render_template, url_for, request
import json
import config
from speed_control import Speed_Control

# Logging
import logging
log = logging.getLogger('werkzeug')
log.setLevel(logging.ERROR)


# globals
app = Flask(__name__)
speed_control = Speed_Control(max_speed=config.MAX_SPEED)


# base html page
@app.route('/')
@app.route('/index')
def index():
	if config.SHOW_VIDEO == False:
		hide_video = "none"
	else:
		hide_video = "show"
	return render_template('index.html', hide_video=hide_video)


# this is the route to the receiver which is where javascript updates events
# from the various HTML widgets
""" json keys and values
action: [statusChk|sendSpeed],
"""
@app.route('/receiver', methods = ['POST'])
def worker():
	data = request.form
	if data == None:
		return sendStatus()
	if data['action'] == "statusChk":
		return sendStatus()
	if data['action'] == "sendSpeed":
		print("Setting Speed to " + data['speed'])
		setSpeed(int(data['speed']))
		return sendStatus()
	return "Invalid Request"


# returns a json string with status values
def sendStatus():
	status = {
		'status' : 'OK',
		'online' : True,
		'speed' : speed_control.speed
	}
	return json.dumps(status)


def setSpeed(inputSpeed):
	speed_control.speed = inputSpeed


def cleanUp():
	speed_control.cleanup()


if __name__ == "__main__":
    app.run(host='0.0.0.0', port=config.PORT, debug=False)
    atexit.register(cleanUp)
