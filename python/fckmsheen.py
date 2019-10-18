#!flask/bin/python

import sys

from flask import Flask, render_template, request, redirect, Response
import random, json, atexit

from flask_sqlalchemy import SQLAlchemy

from digipot import Speed_Control

speed = 0
online = True
MAX_SPEED = 10
publicAccess = True
port = 5000
showVideo = False


speed_control = Speed_Control()

app = Flask(__name__, template_folder='templates')

# Setup Database
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///database.sqlite3'
db = SQLAlchemy(app)

class User(db.Model):
    """An admin user capable of viewing reports.

    :param str email: email address of user
    :param str password: encrypted password for the user

    """
    __tablename__ = 'user'

    email = db.Column(db.String, primary_key=True)
    password = db.Column(db.String)
    authenticated = db.Column(db.Boolean, default=False)

    def is_active(self):
        """True, as all users are active."""
        return True

    def get_id(self):
        """Return the email address to satisfy Flask-Login's requirements."""
        return self.email

    def is_authenticated(self):
        """Return True if the user is authenticated."""
        return self.authenticated

    def is_anonymous(self):
        """False, as anonymous users aren't supported."""
        return False




# serve index template
@app.route('/css/style.css')
def output_style():
	return render_template('/css/style.css')

@app.route('/')
def output():
	
	if showVideo == False:
		hide_video = "none"
	else:
		hide_video = "show"

	return render_template('index.html', hide_video=hide_video)

# API callback path
@app.route('/receiver', methods = ['POST'])
def worker():
	# # get user cookies
	# userid = request.cookies.get('userid')
	# passhash = request.cookies.get('passhash')

	# # check permissions




	data = request.form
	if data == None:
		return sendStatus()
		
	if data['action'] == "statusChk":
		return sendStatus()

	if data['action'] == "sendSpeed":
		print("Setting Speed to " + data['speed'])
		if online == True:
			setSpeed(int(data['speed']))

		return sendStatus()

	return "Invalid Request";

# returns a json string with status values
def sendStatus():
	global online, speed
	# speed = speed_control.speed;

	status = {
		'status' : 'OK',
		'online' : online,
		'speed' : speed,
	}

	return json.dumps(status)

def setSpeed(inputSpeed):
	global speed
	speed = inputSpeed

def cleanUp():
	speed_control.cleanup()



# start the app and ensure cleanup when closed
if __name__ == '__main__':
	atexit.register(cleanUp)
	app.run("0.0.0.0", port, debug=True)