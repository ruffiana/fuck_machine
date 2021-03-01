var slider = document.getElementById('speedSlider');
var canvas = document.getElementById('speedometer');
var iCurrentSpeed = 0;
var	iTargetSpeed = 0;
var options = null;
var	job = null;


function buildOptionsAsJSON(canvas, iSpeed) {
	/* Setting for the speedometer 
	* Alter these to modify its look and feel
	*/

	
	// Create a speedometer object using Javascript object notation
	return {
		ctx: canvas.getContext('2d'),
		center:	{
			X: canvas.height / 2,
			Y: canvas.width / 2 + 32
		},
		color: "rgb(0,0,0)",
		radius: canvas.height,
		dial: {
			color: 'rgb(255, 255, 255)',
			radius: canvas.height,
			// start and end of dial arc
			start: -30,
			end: 210,
			// min max speed values to display
			min: 0,
			max: 250
		},
		gauge: {
			radius: 200,
			width: 12,
			color: "rgb(255, 127, 255)",
			font: '128px sans-serif',
			warning: {
				start: 0.4,
				color: "rgb(255, 191, 0)"
			},
			danger: {
				start: 0.75,
				color: "rgb(255, 0, 0)"
			}
		},
		label : {
			text: "thrust/m",
			color: "rgb(191 191 191)",
			font: '24px sans-serif',
		},
		ticks: {
			font: 'italic 14px monospace',
			radius: 184,
			width: 2,
			length: 20,
			color: "rgb(127,127,127)",
			alpha: 0.25,
		}
	};
}

function clearCanvas(options) {
	options.ctx.clearRect(0, 0, canvas.height, canvas.width);
	applyDefaultContextSettings(options);
}

function refreshDisplay() {
	$.ajax({
		type: 'POST',
		url: "receiver",
		dataType: "json",
		data: 
		{
			action: 'statusChk',
		},
		
		
		success: function(data)
		{
			console.log(data);
			if(data.status == "OK")
			{
				setLabel(data.online);
				setSpeed(data.speed);
			}
		}
	});
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
		success: function(data)
		{
			console.log(data);
			if(data.status == "OK")
			{
				setLabel(data.online);
				setSpeed(data.speed);
			}
		}
	});
}

function setLabel(value) {
	if(value == true)
		$("#label").html("Connected.");
	else
		$("#label").html("Syncing...");
}

function setSpeed(value) {
	// update slider to reflect current speed
	slider.value = value;

	// update speedometer
	drawWithInputValue(value);
}

function degToRad(angle) {
	// Degrees to radians
	return ((angle * Math.PI) / 180);
}

function radToDeg(angle) {
	// Radians to degree
	return ((angle * 180) / Math.PI);
}

function applyDefaultContextSettings(options) {
	/* Helper function to revert to gauges
	 * default settings
	 */

	options.ctx.lineWidth = 1;
	options.ctx.globalAlpha = 1.0;
	options.ctx.strokeStyle = "rgb(255, 255, 255)";
	options.ctx.fillStyle = 'rgb(255,255,255)';
}

function drawLine(options, line) {
	// Draw a line using the line object passed in
	options.ctx.beginPath();

	// Set attributes of open
	options.ctx.globalAlpha = line.alpha;
	options.ctx.lineWidth = line.lineWidth;
	options.ctx.fillStyle = line.fillStyle;
	options.ctx.strokeStyle = line.fillStyle;
	options.ctx.moveTo(line.from.X,
		line.from.Y);

	// Plot the line
	options.ctx.lineTo(
		line.to.X,
		line.to.Y
	);

	options.ctx.stroke();
}

function createLine(fromX, fromY, toX, toY, fillStyle, lineWidth, alpha) {
	// Create a line object using Javascript object notation
	return {
		from: {
			X: fromX,
			Y: fromY
		},
		to:	{
			X: toX,
			Y: toY
		},
		fillStyle: fillStyle,
		lineWidth: lineWidth,
		alpha: alpha
	};
}

function drawBackground(options) {
	/* Black background with alpha transparency to
	 * blend the edges of the metallic edge and
	 * black background
	 */
    options.ctx.beginPath();

	options.ctx.globalAlpha = 0.25;
	options.ctx.fillStyle = options.color;

	// Outer circle (subtle edge in the grey)
	options.ctx.arc(
		options.center.X,
		options.center.Y,
		options.dial.radius,
		degrees_to_radians(options.dial.start),
		degrees_to_radians(options.dial.end),
		false
		);

	options.ctx.fill();
}


function drawTicks(options, num, length) {
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
        line;

	applyDefaultContextSettings(options);

	tickvalue = options.levelRadius - 2;
	steps = (options.dial.end - options.dial.start) / num

	// 10 units (major ticks)
	for (iTick = options.dial.start; iTick < options.dial.end + 1; iTick += steps) {
		iTickRad = degToRad(iTick);

		/* Calculate the X and Y of both ends of the
		 * line I need to draw at angle represented at Tick.
		 * The aim is to draw the a line starting on the 
		 * coloured arc and continueing towards the outer edge
		 * in the direction from the center of the gauge. 
		 */

		onArchX = radius - (Math.cos(iTickRad) * radius);
		onArchY = radius - (Math.sin(iTickRad) * radius);
		innerTickX = radius - (Math.cos(iTickRad) * innerRadius);
		innerTickY = radius - (Math.sin(iTickRad) * innerRadius);

		fromX = (options.center.X - radius) + onArchX;
		fromY = (options.center.Y - radius) + onArchY;
		toX = (options.center.X - radius) + innerTickX;
		toY = (options.center.Y - radius) + innerTickY;

		// Create a line expressed in JSON
		line = createLine(fromX, fromY, toX, toY, color, width, alpha);

		// Draw the line
		drawLine(options, line);
	}
}

function drawTickMarks(options) {
	/* Two tick in the coloured arc!
	 * Small ticks every 5
	 * Large ticks every 10
	 */
	drawTicksBase(options);
	drawTicks(options, 10, options.ticks.length)
}

function degrees_to_radians(degrees) {
	return (degrees- 180) * (Math.PI / 180);
}

function drawArc(options, radius, start, end, width, strokeStyle, alphaValue) {
	/* Draw part of the arc that represents
	* the colour speedometer arc
	*/

	options.ctx.beginPath();

	options.ctx.globalAlpha = alphaValue;
	options.ctx.lineWidth = width;
	options.ctx.strokeStyle = strokeStyle;

	options.ctx.arc(
		options.center.X,
		options.center.Y,
		radius,
		degrees_to_radians(start),
		degrees_to_radians(end),
		false);

	options.ctx.stroke(); 
}

function drawTicksBase(options) {
	/* Draws base arc for tick gague */

	drawArc(
		options,
		options.ticks.radius,
		options.dial.start,
		options.dial.end,
		options.ticks.width,
		options.ticks.color,
		options.ticks.alpha,
		);
}

function drawSpeedometerChannel(options) {
	/* Draws the speedometer arc channel */

	drawArc(
		options,
		options.gauge.radius,
		options.dial.start,
		options.dial.end,
		options.gauge.width,
		options.ticks.color,
		options.ticks.alpha
	);
}

function drawSpeedometer(options) {
	/* Draw colored speedometer arc */

	// Determine color based on current speed
	var color = options.gauge.color
	if (iCurrentSpeed > (100 * options.gauge.danger.start)) {
		color = options.gauge.danger.color;
	}
	else if (iCurrentSpeed > (100 * options.gauge.warning.start)) {
		color = options.gauge.warning.color;
	}

	// TODO: This is a bit of a hack
	// to deal with the start angle of the dial being negative 
	var end = (options.dial.end - options.dial.start) * (iCurrentSpeed / 100) + options.dial.start
	
	drawArc(
		options,
		options.gauge.radius,
		options.dial.start,
		end,
		options.gauge.width,
		color,
		1.0
	);	
}

function drawSpeedDisplay(options) {
	/* Display current speed as plain text near center of dial */

	applyDefaultContextSettings(options);

	// Font styling
	options.ctx.font = options.gauge.font;
	options.ctx.textAlign = 'center';
	options.ctx.textBaseline = 'middle';

	// determine color based on threasholds
	if (iCurrentSpeed > (100 * options.gauge.danger.start)) {
        options.ctx.fillStyle = options.gauge.danger.color;
    } else if (iCurrentSpeed > (100 * options.gauge.warning.start)) {
        options.ctx.fillStyle = options.gauge.warning.color;
    } else {
		options.ctx.fillStyle = options.gauge.color;
	}

	// Write Text
	options.ctx.fillText(
		Math.round(iCurrentSpeed * (options.dial.max / 100)),
		options.center.X,
		options.center.Y
	);
}

function drawSpeedLabel(options) {
	/* Display current speed as plain text near center of dial */

	applyDefaultContextSettings(options);

	// Font styling
	options.ctx.font = options.label.font;
	options.ctx.textAlign = 'center';
	options.ctx.textBaseline = 'middle';
	options.ctx.fillStyle = options.label.color;

	// Write Text
	options.ctx.fillText(
		options.label.text,
		options.center.X,
		options.center.Y + 64
	);
};

function draw() {
	/* Main entry point for drawing the speedometer
	* If canvas is not support alert the user.
	*/

	// Canvas good?
	if (canvas !== null && canvas.getContext) {
		options = buildOptionsAsJSON(canvas, iCurrentSpeed);

	    // Clear canvas
	    clearCanvas(options);

		// Draw thw background
		// drawBackground(options);

		// Draw tick marks
		drawTickMarks(options);

		// // Draw speeometer colour arc
		drawSpeedometerChannel(options);

		drawSpeedLabel(options);

		// Draw Speedometer
		drawSpeedometer(options)

		// // Draw numerical speed display
		drawSpeedDisplay(options);

	} else {
		alert("Canvas not supported by your browser!");
	}
	
	if (iTargetSpeed == iCurrentSpeed) {
		clearTimeout(job);
		return;
	} else {
		iCurrentSpeed = iTargetSpeed;
		job = setTimeout("draw()", 5);
	}
}

function drawWithInputValue(value) {
	iTargetSpeed = value;
	job = setTimeout("draw()", 5);
}

function resizeCanvas() {
	canvas.width = window.innerWidth;
	canvas.height = window.innerHeight;
}

window.onload = function()
{
	$('#speedSlider').on('input', function() { 
		sendSpeed($(this).val())
	});

	$('#speedSlider').on('change', function() { 
		sendSpeed($(this).val())
	});

	draw();

	// Window will sync and update every 2 seconds
	window.setInterval(function()
	{
		refreshDisplay();
	}, 2000);
}