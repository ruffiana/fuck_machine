// import { delayedDraw } from './speedometer.js'
import './speedometer.js'

// Get html elementsjob
var canvas = document.getElementById('speedometer')
var speedSlider = document.getElementById('speedSlider')
var freqSlider = document.getElementById('freqSlider')
var patterList = document.getElementById("patternList")
var connection = document.getElementById("connection")

// Get the root 175
var root = document.querySelector(':root')
var rs = getComputedStyle(root)
// get properties from froot element
var color_pink = rs.getPropertyValue('--color-pink')
var color_pink_muted = rs.getPropertyValue('--color-pink-muted')

var job = null
var options = null

var currentMode = "constant"
var currentSpeed = 0
var currentSpeedometer = 0
var currentFreq = 50
var currentConnectinon = false

// Event handlers
function syncData() {
	$.ajax({
		type: 'POST',
		url: "receiver",
		dataType: "json",
		data:
		{
			action: 'statusCheck',
		},
		success: function (data) {
			refreshDisplay(data)
		}
	})
}

function sendSpeed(value) {
	$.ajax({
		type: 'POST',
		url: "receiver",
		dataType: "json",
		data:
		{
			action: 'sendSpeed',
			speed: value
		},
		success: function (data) {
			refreshDisplay(data)
		}
	})
}

function sendFreq(value) {
	$.ajax({
		type: 'POST',
		url: "receiver",
		dataType: "json",
		data:
		{
			action: 'sendFreq',
			freq: value
		},
		success: function (data) {
			refreshDisplay(data)
		}
	})
}

function sendMode(value) {
	$.ajax({
		type: 'POST',
		url: "receiver",
		dataType: "json",
		data:
		{
			action: 'sendMode',
			mode: value
		},
		success: function (data) {
			refreshDisplay(data)
		}
	})
}

function setSpeed(value) {
	speedSlider.value = value
	currentSpeed = value
}

function setSpeedometer(value) {
	// update speedometer
	currentSpeedometer = value
	speedometer.delayedDraw(currentSpeed, currentSpeedometer)
}

function setFreq(value) {
	// update slider to reflect current freq
	freqSlider.value = value
	currentSpeed = value
}

function setMode(value) {
	// update mode dropdown list to reflect current mode
	patternList.value = value
	currentMode = value
}

function refreshDisplay(data) {
	// Update UI widgets with current values
	if (data.speed != currentSpeed) {
		setSpeed(data.speed)
	}

	if (data.speedometer != currentSpeed) {
		setSpeedometer(data.speed)
	}

	if (data.mode != currentMode) {
		setMode(data.mode)
	}

	if (data.freq != currentFreq) {
		setFreq(data.freq)
	}

	if (data.online == currentConnectinon) {
		setConnection(data.online)
	}
}

function setConnection(value) {
	if (value == true) {
		console.log("Connection on")
		connection.innerHTML = "link"
		root.style.setProperty('--connection-color', color_pink)
	}
	else {
		console.log("Connection off")
		connection.innerHTML = "link_off"
		root.style.setProperty('--connection-color', color_pink_muted)
	}
}

function changePattern(value) {
	if (value !== currentMode) {
		currentMode = value
		sendMode(value)
	}
}

// Initializtion
window.onload = function () {
	// change handler for speed slider
	$('#speedSlider').on('input', function () {
		sendSpeed($(this).val())
	})
	$('#speedSlider').on('change', function () {
		sendSpeed($(this).val())
	})
	// change handler for frequency slider
	$('#freqSlider').on('input', function () {
		sendFreq($(this).val())
	})
	$('#freqSlider').on('change', function () {
		sendFreq($(this).val())
	})
	// change handler for patternList
	$('#patternList').on('change', function () {
		changePattern($(this).val())
	})

	delayedDraw(currentSpeed, currentSpeedometer)

	// Window will sync every 2 seconds and update every 2 seconds
	window.setInterval(function () {
		syncData()
	}, 2000)

	// window.setInterval(function () {
	// 	refreshDisplay()
	// }, 40)
}