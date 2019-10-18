#!flask/bin/python

import sys

from flask import Flask, render_template, request, redirect, Response
import random, json, atexit

from digipot import Speed_Control

app = Flask(__name__)

speed_control = Speed_Control()

speed = 0
online = True
MAX_SPEED = 10

# serve index template
@app.route('/')
def output():
	return render_template('../index.html')

# API callback path
@app.route('/receiver', methods = ['POST'])
def worker():
	result = ""
	data = request.get_json()
	
	if data['action'] == "statusChk":
		return result = sendStatus()

	if data['action'] == "sendSpeed":
		if online == True:
			setSpeed(int(data['speed']))

		return sendStatus()

	return "Invalid Request";

# returns a json string with status values
def sendStatus():
	speed = speed_control.speed;

	status = {
		'online' : online,
		'speed' : speed
	}

	return json.dumps(status)

def setSpeed(inputSpeed):
	speed = inputSpeed
	speed_control.speed = inputSpeed

def cleanUp():
	speed_control.cleanup()



# start the app and ensure cleanup when closed
if __name__ == '__main__':
	atexit.register(cleanUp)
	app.run()