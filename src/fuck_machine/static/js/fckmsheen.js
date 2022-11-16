// Get the root element and CSS style
var root = document.querySelector(':root')
var rs = getComputedStyle(root)

// Get html elements by id
var canvas = document.getElementById('speedometer')
var speedSlider = document.getElementById('speedSlider')
var freqSlider = document.getElementById('freqSlider')
var patterList = document.getElementById("patternList")
var connection = document.getElementById("connection")
// var vid = document.getElementById('vid');

// get properties from root element by name
var color_pink = rs.getPropertyValue('--color_pink')
var color_pink_muted = rs.getPropertyValue('--color_pink_muted')
var color_grey = rs.getPropertyValue('--color_gray')
var color_dark_grey = rs.getPropertyValue('--color_gray_dark')
var color_warning = rs.getPropertyValue('--color_warning')
var color_danger = rs.getPropertyValue('--color_danger')

// globals
var connected = false
var currentPattern = "constant"
var currentSpeed = 0
var currentMotorSpeed = 0
var currentFreq = 50
var currentConnectinon = false
var job = null
var options = null


function degToRad(angle) {
	// Degrees to radians
	return ((angle * Math.PI) / 180)
}

function radToDeg(angle) {
	// Radians to degree
	return ((angle * 180) / Math.PI)
}

function degrees_to_radians(degrees) {
	return (degrees - 180) * (Math.PI / 180)
}

function buildOptionsAsJSON(canvas) {
	/* Setting for the speedometer 
	* Alter these to modify its look and feel
	*/

	// Create a speedometer object using Javascript object notation
	return {
		ctx: canvas.getContext('2d'),
		center: {
			X: canvas.width / 2,
			Y: (canvas.height / 2) + (canvas.height * 0.1875)
		},
		color: "rgb(0,0,0)",
		radius: canvas.width,
		dial: {
			color: 'rgb(255, 255, 255)',
			radius: canvas.width,
			// start and end of dial arc
			start: -30,
			end: 210,
			// min max speed values to display
			min: 0,
			max: 250
		},
		gauge: {
			radius: canvas.width * 0.45, //200px / 440px
			width: canvas.width * 0.027, //12px / 440px
			color: color_pink,
			font: '128px sans-serif',
			warning: {
				start: 0.4,
				color: color_warning
			},
			danger: {
				start: 0.75,
				color: color_danger
			},
		},
		label: {
			text: "thrust/m",
			color: color_grey,
			font: '24px sans-serif',
			offset: canvas.width * 0.145, //64px * canvas.widght
		},
		ticks: {
			// font: 'italic 14px monospace',
			radius: canvas.width * 0.42, //184px / 440px
			width: 2, //2 pixels
			length: canvas.width * 0.045, //20 pixels / 440px,
			color: color_grey,
			alpha: 0.5,
		}
	}
}

function clearCanvas() {
	options.ctx.clearRect(0, 0, canvas.width, canvas.height)
	applyDefaultContextSettings()
}

function resizeCanvas() {
	canvas.width = window.innerWidth
	canvas.height = window.innerHeight
}

function applyDefaultContextSettings() {
	/* Helper function to revert to gauges
	 * default settings
	 */

	options.ctx.lineWidth = 1
	options.ctx.globalAlpha = 1.0
	options.ctx.strokeStyle = "rgb(255, 255, 255)"
	options.ctx.fillStyle = 'rgb(255,255,255)'
}

function drawLine(line) {
	// Draw a line using the line object passed in
	options.ctx.beginPath()

	// Set attributes of open
	options.ctx.globalAlpha = line.alpha
	options.ctx.lineWidth = line.lineWidth
	options.ctx.fillStyle = line.fillStyle
	options.ctx.strokeStyle = line.fillStyle
	options.ctx.moveTo(line.from.X,
		line.from.Y)

	// Plot the line
	options.ctx.lineTo(
		line.to.X,
		line.to.Y
	)

	options.ctx.stroke()
}

function createLine(fromX, fromY, toX, toY, fillStyle, lineWidth, alpha) {
	// Create a line object using Javascript object notation
	return {
		from: {
			X: fromX,
			Y: fromY
		},
		to: {
			X: toX,
			Y: toY
		},
		fillStyle: fillStyle,
		lineWidth: lineWidth,
		alpha: alpha
	}
}

function drawBackground() {
	/* Black background with alpha transparency to
	 * blend the edges of the metallic edge and
	 * black background
	 */
	options.ctx.beginPath()

	options.ctx.globalAlpha = 0.25
	options.ctx.fillStyle = options.color

	// Outer circle (subtle edge in the grey)
	options.ctx.arc(
		options.center.X,
		options.center.Y,
		options.dial.radius,
		degrees_to_radians(options.dial.start),
		degrees_to_radians(options.dial.end),
		false
	)

	options.ctx.fill()
}

function drawTicks(num, length) {
	/* The large tick marks against the coloured
	 * arc drawn every 10 mph from 10 degrees to
	 * 170 degrees.
	 */

	var radius = options.ticks.radius,
		innerRadius = options.ticks.radius - length,
		width = options.ticks.width,
		color = options.ticks.color,
		alpha = options.ticks.alpha,
		iTick = 0,
		iTickRad = 0,
		innerTickY,
		innerTickX,
		onArchX,
		onArchY,
		fromX,
		fromY,
		toX,
		toY,
		line

	applyDefaultContextSettings()

	// var tickvalue = options.levelRadius - 2
	var steps = (options.dial.end - options.dial.start) / num

	// 10 units (major ticks)
	for (iTick = options.dial.start; iTick < options.dial.end + 1; iTick += steps) {
		iTickRad = degToRad(iTick);

		/* Calculate the X and Y of both ends of the
		 * line I need to draw at angle represented at Tick.
		 * The aim is to draw the a line starting on the 
		 * coloured arc and continueing towards the outer edge
		 * in the direction from the center of the gauge. 
		 */

		onArchX = radius - (Math.cos(iTickRad) * radius)
		onArchY = radius - (Math.sin(iTickRad) * radius)
		innerTickX = radius - (Math.cos(iTickRad) * innerRadius)
		innerTickY = radius - (Math.sin(iTickRad) * innerRadius)

		fromX = (options.center.X - radius) + onArchX
		fromY = (options.center.Y - radius) + onArchY
		toX = (options.center.X - radius) + innerTickX
		toY = (options.center.Y - radius) + innerTickY

		// Create a line expressed in JSON
		line = createLine(fromX, fromY, toX, toY, color, width, alpha)

		// Draw the line
		drawLine(line)
	}
}

function drawTickMarks() {
	/* Two tick in the coloured arc!
	 * Small ticks every 5
	 * Large ticks every 10
	 */
	drawTicksBase()
	drawTicks(10, options.ticks.length)
}

function drawArc(radius, start, end, width, strokeStyle, alphaValue) {
	/* Draw part of the arc that represents
	* the colour speedometer arc
	*/

	options.ctx.beginPath()

	options.ctx.globalAlpha = alphaValue
	options.ctx.lineWidth = width
	options.ctx.strokeStyle = strokeStyle

	options.ctx.arc(
		options.center.X,
		options.center.Y,
		radius,
		degrees_to_radians(start),
		degrees_to_radians(end),
		false)

	options.ctx.stroke()
}

function drawTicksBase() {
	/* Draws base arc for tick gague */

	drawArc(
		options.ticks.radius,
		options.dial.start,
		options.dial.end,
		options.ticks.width,
		options.ticks.color,
		options.ticks.alpha,
	)
}

function drawChannel() {
	/* Draws the speedometer arc channel */
	drawArc(
		options.gauge.radius,
		options.dial.start,
		options.dial.end,
		options.gauge.width,
		options.ticks.color,
		options.ticks.alpha
	)
}

function drawSpeed() {
	/* Draw colored set speed arc */

	// Determine color based on current speed
	// var color = options.gauge.color
	// if (currentSpeed > (100 * options.gauge.danger.start)) {
	// 	color = options.gauge.danger.color
	// }
	// else if (currentSpeed > (100 * options.gauge.warning.start)) {
	// 	color = options.gauge.warning.color
	// }

	// TODO: This is a bit of a hack
	// to deal with the start angle of the dial being negative 
	var end = (options.dial.end - options.dial.start) * (currentSpeed / 100) + options.dial.start

	drawArc(
		options.gauge.radius,
		options.dial.start,
		end,
		options.gauge.width,
		options.gauge.color, //color,
		0.33, //Alpha of 0.33 so set speed and motor speed combined = 1.0
	)
}

function drawMotorSpeed() {
	/* Draw colored speedometer arc */

	// Determine color based on current speed
	// var color = options.gauge.color
	// if (currentMotorSpeed > (100 * options.gauge.danger.start)) {
	// 	color = options.gauge.danger.color
	// }
	// else if (currentMotorSpeed > (100 * options.gauge.warning.start)) {
	// 	color = options.gauge.warning.color
	// }

	// TODO: This is a bit of a hack
	// to deal with the start angle of the dial being negative 
	var end = (options.dial.end - options.dial.start) * (currentMotorSpeed / 100) + options.dial.start

	drawArc(
		options.gauge.radius,
		options.dial.start,
		end,
		(options.gauge.width - 2),
		options.gauge.color, //color
		0.67, //Alpha of 0.67 so set speed and motor speed combined = 1.0
	)
}

function drawSpeedDisplay() {
	/* Display current speed as plain text near center of dial */

	applyDefaultContextSettings()

	// Font styling
	options.ctx.font = options.gauge.font
	options.ctx.textAlign = 'center'
	options.ctx.textBaseline = 'middle'

	// determine color based on threasholds
	if (currentMotorSpeed > (100 * options.gauge.danger.start)) {
		options.ctx.fillStyle = options.gauge.danger.color
	} else if (currentMotorSpeed > (100 * options.gauge.warning.start)) {
		options.ctx.fillStyle = options.gauge.warning.color
	} else {
		options.ctx.fillStyle = options.gauge.color
	}

	// Write Text
	options.ctx.fillText(
		Math.round(currentMotorSpeed * (options.dial.max / 100)),
		options.center.X,
		options.center.Y
	)
}

function drawSpeedLabel() {
	/* Display current speed as plain text near center of dial */
	applyDefaultContextSettings()

	// Font styling
	options.ctx.font = options.label.font
	options.ctx.textAlign = 'center'
	options.ctx.textBaseline = 'middle'
	options.ctx.fillStyle = options.label.color

	// Write Text
	options.ctx.fillText(
		options.label.text,
		options.center.X,
		options.center.Y + options.label.offset
	)
}

function draw() {
	/* Main entry point for drawing the speedometer
	* If canvas is not support alert the user.
	*/

	// Canvas good?
	if (canvas !== null && canvas.getContext) {
		// Clear canvas
		clearCanvas()

		// Draw thw background
		// drawBackground()

		// Draw speed channel arc and tick marks
		drawChannel()
		drawTickMarks()

		// Draw Set Speed
		drawSpeed()

		// Draw Motor Speed
		drawMotorSpeed()

		// // Draw numerical speed display
		drawSpeedDisplay()
		drawSpeedLabel()

		clearTimeout(job)

	} else {
		alert("Canvas not supported by your browser!")
	}
}


function delayedDraw(speed, speedometer) {
	job = setTimeout("draw()", 5)
}

// Communication with main app
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

function sendPattern(value) {
	$.ajax({
		type: 'POST',
		url: "receiver",
		dataType: "json",
		data:
		{
			action: 'sendPattern',
			pattern: value
		},
		success: function (data) {
			refreshDisplay(data)
		}
	})
}

// update current globals and set state of UI widgets
function setSpeed(value) {
	if (value == currentSpeed) {
		return;
	}

	currentSpeed = value
	if (speedSlider.value != currentSpeed) {
		speedSlider.value = currentSpeed
		// console.log('Speed set to ' + value)
	}

}

function setMotorSpeed(value) {
	// update speedometer
	currentMotorSpeed = value
	// console.log('Motor Speed set to ' + value)

	// set playback speed of video
	// vid.playbackRate = 5.0 * (value / 100.0);

}

function setFreq(value) {
	// update slider to reflect current freq
	if (value == currentFreq) {
		return;
	}

	currentFreq = value
	if (freqSlider.value != currentFreq) {
		freqSlider.value = currentFreq
		// console.log('Frequency set to ' + value)
	}
}

function setPattern(value) {
	// update pattern dropdown list to reflect current pattern
	if (value == currentPattern) {
		return;
	}
	currentPattern = value
	if (patternList.value != currentPattern) {
		patternList.value = currentPattern
		// console.log('Pattern set to ' + value)
	}
	patternList.value = value
}

function setConnection(value) {
	if (value == connected) {
		return;
	}
	if (value == true) {
		// console.log("Connection on")
		connection.innerHTML = "link"
		connection.style.color = color_pink
		// root.style.setProperty('--connection-color', color_pink)
	}
	else {
		// console.log("Connection off")
		connection.innerHTML = "link_off"
		connection.style.color = color_pink_muted
		// root.style.setProperty('--connection-color', color_pink_muted)
	}
}

// Update globals, UI widgets, and redraw speedometer
function refreshDisplay(data) {
	// Update UI widgets with current values
	setSpeed(data.speed)
	setMotorSpeed(data.motor)
	setPattern(data.pattern)
	setFreq(data.freq)
	setConnection(data.online)

	draw()
}

// Initializtion and event handlers
window.onload = function () {
	// vid.playbackRate = 0.0;

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
		sendPattern($(this).val())
	})

	options = buildOptionsAsJSON(canvas)
	draw()
	// delayedDraw(currentSpeed, currentMotorSpeed)

	// Window will sync every 2 seconds and update every 2 seconds
	window.setInterval(function () {
		syncData()
	}, 100)

	// window.setInterval(function () {
	// 	refreshDispCOlay()
	// }, 40)
}
