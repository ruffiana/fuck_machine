from flask import render_template, flash, redirect, url_for, request, current_app
from flask_login import login_user, logout_user, current_user, login_required
from werkzeug.urls import url_parse
from app import app, db
from app.forms import LoginForm, RegistrationForm
from app.models import User

from app.digipot import Speed_Control

import atexit, json

speed_control = Speed_Control()

@app.route('/')
@app.route('/index')
def index():
	if current_app.config['SHOW_VIDEO'] == False:
		hide_video = "none"
	else:
		hide_video = "show"

	return render_template('index.html', hide_video=hide_video)

@app.route('/receiver', methods = ['POST'])
def worker():
	data = request.form
	if data == None:
		return sendStatus()

	if data['action'] == "statusChk":
		return sendStatus()

	if data['action'] == "sendSpeed":
		print("Setting Speed to " + data['speed'])
		if current_app.config['ONLINE'] == True:
			setSpeed(int(data['speed']))

		return sendStatus()

	return "Invalid Request";

@app.route('/login', methods=['GET', 'POST'])
def login():
    if current_user.is_authenticated:
        return redirect(url_for('index'))
    form = LoginForm()
    if form.validate_on_submit():
        user = User.query.filter_by(username=form.username.data).first()
        if user is None or not user.check_password(form.password.data):
            flash('Invalid username or password')
            return redirect(url_for('login'))
        login_user(user, remember=form.remember_me.data)
        next_page = request.args.get('next')
        if not next_page or url_parse(next_page).netloc != '':
            next_page = url_for('index')
        return redirect(next_page)
    return render_template('login.html', title='Sign In', form=form)


@app.route('/logout')
def logout():
    logout_user()
    return redirect(url_for('index'))

@app.route('/register.html', methods=['GET', 'POST'])
def register():
    if current_user.is_authenticated:
        return redirect(url_for('index'))
    form = RegistrationForm()
    if form.validate_on_submit():
        user = User(username=form.username.data, email=form.email.data)
        user.set_password(form.password.data)
        db.session.add(user)
        db.session.commit()
        flash('Congratulations, you are now a registered user!')
        return redirect(url_for('login'))
    return render_template('register.html', title='Register', form=form)








# returns a json string with status values
def sendStatus():
	# speed = speed_control.speed;

	status = {
		'status' : 'OK',
		'online' : current_app.config['ONLINE'],
		'speed' : current_app.config['SPEED'],
	}

	return json.dumps(status)

def setSpeed(inputSpeed):
	global current_app
	current_app.config['SPEED'] = inputSpeed
	speed_control.speed = inputSpeed

def cleanUp():
	speed_control.cleanup()


atexit.register(cleanUp)
