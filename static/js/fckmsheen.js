// var vid = document.getElementById('vid');
var slider = document.getElementById('speedSlider');
var iCurrentSpeed = 0;
var	iTargetSpeed = 0;
var	bDecrement = null;
var	job = null;

var iMinSpeed = 0;
var iMaxSpeed = 250;
var iTickSteps = 20; // This should be a factor of 4
var dialStart = 10;
var dialEnd = 170;
var iTickIncrement = iMaxSpeed / ((dialEnd - dialStart) / iTickSteps);

var safeColor = "rgb(82, 240, 55)";
var warningColor = "rgb(255, 161, 0)";
var warningStart = 0.4;
var dangerColor = "rgb(255, 0, 0)";
var dangerStart = 0.75;


var dialFont = 'italic 14px monospace';
var dialFontColor = 'rgb(255, 255, 255)';
var dialFontOffset = 14;

var speedFont = 'bold 48px monospace';
var speedFontColor = 'rgb(191, 250, 255)';

var needleColor1 = "rgb(255, 255, 255)";
var needleColor2 = "rgb(127, 127, 127)";
var needleWidth = 3;

// /*jslint plusplus: true, sloppy: true, indent: 4 */
// (function () {
//     "use strict";
//     // this function is strict...
// }());

function buildOptionsAsJSON(canvas, iSpeed) {
	/* Setting for the speedometer 
	* Alter these to modify its look and feel
	*/

	var centerX = 210,
	    centerY = 210,
        radius = 140,
        outerRadius = 200;

	// Create a speedometer object using Javascript object notation
	return {
		ctx: canvas.getContext('2d'),
		speed: iSpeed,
		center:	{
			X: centerX,
			Y: centerY
		},
		levelRadius: radius - 10,
		gaugeOptions: {
			center:	{
				X: centerX,
				Y: centerY
			},
			radius: radius
		},
		radius: outerRadius
	};
}

function clearCanvas(options) {
	options.ctx.clearRect(0, 0, 800, 800);
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
		$("#label").html("Ruffiana is online");
	else
		$("#label").html("Ruffiana is offline");
}

function setSpeed(value)
{
	// update slider to reflect current speed
	slider.value = value;
	
	// set playback speed of video
	// vid.playbackRate = 5.0 * (value / 100.0);

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

function drawOuterMetallicArc(options) {
	/* Draw the metallic border of the speedometer 
	 * Outer grey area
	 */
	options.ctx.beginPath();

	// Nice shade of grey
	options.ctx.fillStyle = "rgb(127,127,127)";

	// Draw the outer circle
	options.ctx.arc(options.center.X,
		options.center.Y,
		options.radius,
		0,
		Math.PI,
		true);

	// Fill the last object
	options.ctx.fill();
}

function drawInnerMetallicArc(options) {
	/* Draw the metallic border of the speedometer 
	 * Inner white area
	 */

	options.ctx.beginPath();

	// White
	options.ctx.fillStyle = "rgb(255,255,255)";

	// Outer circle (subtle edge in the grey)
	options.ctx.arc(options.center.X,
					options.center.Y,
					(options.radius / 100) * 90,
					0,
					Math.PI,
					true);

	options.ctx.fill();
}

function drawMetallicArc(options) {
	/* Draw the metallic border of the speedometer
	 * by drawing two semi-circles, one over lapping
	 * the other with a bot of alpha transparency
	 */

	drawOuterMetallicArc(options);
	drawInnerMetallicArc(options);
}

function drawBackground(options) {
	/* Black background with alpha transparency to
	 * blend the edges of the metallic edge and
	 * black background
	 */
    var i = 0;

	options.ctx.globalAlpha = 0.2;
	options.ctx.fillStyle = "rgb(0,0,0)";

	// Draw semi-transparent circles
	for (i = 170; i < 180; i++) {
		options.ctx.beginPath();

		options.ctx.arc(
			options.center.X,
			options.center.Y,
			i,
			0,
			Math.PI,
			true
		);

		options.ctx.fill();
	}
}

function applyDefaultContextSettings(options) {
	/* Helper function to revert to gauges
	 * default settings
	 */

	options.ctx.lineWidth = 2;
	options.ctx.globalAlpha = 1.0;
	options.ctx.strokeStyle = "rgb(255, 255, 255)";
	options.ctx.fillStyle = 'rgb(255,255,255)';
}

function drawSmallTickMarks(options) {
	/* The small tick marks against the coloured
	 * arc drawn every 5 mph from 10 degrees to
	 * 170 degrees.
	 */

	var tickvalue = options.levelRadius - 8,
	    iTick = 0,
	    gaugeOptions = options.gaugeOptions,
	    iTickRad = 0,
	    onArchX,
	    onArchY,
	    innerTickX,
	    innerTickY,
	    fromX,
	    fromY,
	    line,
		toX,
		toY;

	applyDefaultContextSettings(options);

	// Tick every 20 degrees (small ticks)
	for (iTick = 10; iTick < 180; iTick += 20) {

		iTickRad = degToRad(iTick);

		/* Calculate the X and Y of both ends of the
		 * line I need to draw at angle represented at Tick.
		 * The aim is to draw the a line starting on the 
		 * coloured arc and continueing towards the outer edge
		 * in the direction from the center of the gauge. 
		 */

		onArchX = gaugeOptions.radius - (Math.cos(iTickRad) * tickvalue);
		onArchY = gaugeOptions.radius - (Math.sin(iTickRad) * tickvalue);
		innerTickX = gaugeOptions.radius - (Math.cos(iTickRad) * gaugeOptions.radius);
		innerTickY = gaugeOptions.radius - (Math.sin(iTickRad) * gaugeOptions.radius);

		fromX = (options.center.X - gaugeOptions.radius) + onArchX;
		fromY = (gaugeOptions.center.Y - gaugeOptions.radius) + onArchY;
		toX = (options.center.X - gaugeOptions.radius) + innerTickX;
		toY = (gaugeOptions.center.Y - gaugeOptions.radius) + innerTickY;

		// Create a line expressed in JSON
		line = createLine(fromX, fromY, toX, toY, "rgb(127,127,127)", 3, 0.6);

		// Draw the line
		drawLine(options, line);

	}
}

function drawLargeTickMarks(options) {
	/* The large tick marks against the coloured
	 * arc drawn every 10 mph from 10 degrees to
	 * 170 degrees.
	 */

	var tickvalue = options.levelRadius - 8,
	    iTick = 0,
        gaugeOptions = options.gaugeOptions,
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

	// 10 units (major ticks)
	for (iTick = 20; iTick < 180; iTick += 20) {

		iTickRad = degToRad(iTick);

		/* Calculate the X and Y of both ends of the
		 * line I need to draw at angle represented at Tick.
		 * The aim is to draw the a line starting on the 
		 * coloured arc and continueing towards the outer edge
		 * in the direction from the center of the gauge. 
		 */

		onArchX = gaugeOptions.radius - (Math.cos(iTickRad) * tickvalue);
		onArchY = gaugeOptions.radius - (Math.sin(iTickRad) * tickvalue);
		innerTickX = gaugeOptions.radius - (Math.cos(iTickRad) * gaugeOptions.radius);
		innerTickY = gaugeOptions.radius - (Math.sin(iTickRad) * gaugeOptions.radius);

		fromX = (options.center.X - gaugeOptions.radius) + onArchX;
		fromY = (gaugeOptions.center.Y - gaugeOptions.radius) + onArchY;
		toX = (options.center.X - gaugeOptions.radius) + innerTickX;
		toY = (gaugeOptions.center.Y - gaugeOptions.radius) + innerTickY;

		// Create a line expressed in JSON
		line = createLine(fromX, fromY, toX, toY, "rgb(127,127,127)", 3, 0.6);

		// Draw the line
		drawLine(options, line);
	}
}

function drawTicks(options) {
	/* Two tick in the coloured arc!
	 * Small ticks every 5
	 * Large ticks every 10
	 */
	drawSmallTickMarks(options);
	drawLargeTickMarks(options);
}

function drawTextMarkers(options) {
	/* The text labels marks above the coloured
	 * arc drawn every 10 mph from 10 degrees to
	 * 170 degrees.
	 */
	var innerTickX = 0,
	    innerTickY = 0,
        iTick = 0,
        gaugeOptions = options.gaugeOptions,
		iTickToPrint = iMinSpeed;

	applyDefaultContextSettings(options);

	// Font styling
	options.ctx.font = dialFont;
	options.ctx.fillStyle = dialFontColor;
	options.ctx.textAlign = 'center';
	options.ctx.textBaseline = 'middle';

	options.ctx.beginPath();

	// Tick every 20 (small ticks)
	radius = gaugeOptions.radius + dialFontOffset
	for (iTick = 10; iTick <= dialEnd; iTick += iTickSteps) {
		innerTickX = radius - (Math.cos(degToRad(iTick)) * radius);
		innerTickY = radius - (Math.sin(degToRad(iTick)) * radius);

		options.ctx.fillText(
			Math.round(iTickToPrint),
			(options.center.X - radius) + innerTickX,
			(gaugeOptions.center.Y - radius) + innerTickY + 5
		);

		// Increment tick counter
		iTickToPrint += iTickIncrement;
	}

    options.ctx.stroke();
}

function degrees_to_radians(degrees) {
	return (degrees- 180) * (Math.PI / 180);
}

function drawSpeedometerPart(options, strokeStyle, alphaValue, width, startAngle, endAngle) {
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
		options.levelRadius,
		degrees_to_radians(startAngle),
		degrees_to_radians(endAngle),
		false);

	options.ctx.stroke(); 
}

function drawSpeedometerColourArc(options) {
	/* Draws the colour arc.  Three different colours
	 * used here; thus, same arc drawn 3 times with
	 * different colours.
	 * TODO: Gradient possible?
	 */

	// drawSpeedometerPart(options, "rgb(82, 240, 55)", 0.25, 15, start, startOfOrange);
	drawSpeedometerPart(options, safeColor, 0.5, 5, dialStart, dialEnd * warningStart);
	
	drawSpeedometerPart(options, warningColor, 0.25, 15, dialEnd * warningStart, dialEnd * dangerStart);
	drawSpeedometerPart(options, warningColor, 0.5, 5, dialEnd * warningStart, dialEnd * dangerStart);

	drawSpeedometerPart(options, dangerColor, 0.5, 15, dialEnd * dangerStart, dialEnd);
	drawSpeedometerPart(options, dangerColor, 1.0, 5, dialEnd * dangerStart, dialEnd);

}

function drawSpeedDisplay(options) {
	/* The text labels marks above the coloured
	 * arc drawn every 10 mph from 10 degrees to
	 * 170 degrees.
	 */
	var innerTickX = 0,
	    innerTickY = 0,
        iTick = 0,
        gaugeOptions = options.gaugeOptions

	applyDefaultContextSettings(options);

	// Font styling
	options.ctx.font = speedFont;
	options.ctx.textAlign = 'center';
	options.ctx.textBaseline = 'middle';

	if (iCurrentSpeed > (100 * dangerStart)) {
        options.ctx.fillStyle = dangerColor;
    } else if (iCurrentSpeed > (100 * warningStart)) {
        options.ctx.fillStyle = warningColor;
    } else {
		options.ctx.fillStyle = safeColor;
	}

	options.ctx.beginPath();

	// Tick every 20 (small ticks)
	iTick = 90
	radius = gaugeOptions.radius / 2
	innerTickX = radius - (Math.cos(degToRad(iTick)) * radius);
	innerTickY = radius - (Math.sin(degToRad(iTick)) * radius);

	options.ctx.fillText(
		Math.round(iCurrentSpeed * (iMaxSpeed / 100)),
		(options.center.X - radius) + innerTickX,
		(gaugeOptions.center.Y - radius) + innerTickY + 5
	);

    options.ctx.stroke();
}

function drawNeedleDial(options, alphaValue, strokeStyle, fillStyle) {
	/* Draws the metallic dial that covers the base of the
	* needle.
	*/
    var i = 0;

	options.ctx.globalAlpha = alphaValue;
	options.ctx.lineWidth = 3;
	options.ctx.strokeStyle = strokeStyle;
	options.ctx.fillStyle = fillStyle;

	// Draw several transparent circles with alpha
	for (i = 0; i < 30; i++) {
		options.ctx.beginPath();
		options.ctx.arc(options.center.X,
			options.center.Y,
			i,
			0,
			Math.PI,
			true);

		options.ctx.fill();
		options.ctx.stroke();
	}
}

function convertSpeedToAngle(options) {
	/* Helper function to convert a speed to the 
	* equivelant angle.
	*/
	
	// Angle is calculated by multiplying speed (0-100) by 1.6 to normalize
	// it within 0-160 degrees. Then we add 10 to the calculated value to
	// transform range to 10-170
	var iSpeedAsAngle = ((options.speed * 1.6) % 180) + 10;
	// console.log('iSpeed: ' + iSpeed);
	// console.log('iSpeedAsAngle: ' + iSpeedAsAngle);

	// Ensure the angle is within range
	if (iSpeedAsAngle > 180) {
        iSpeedAsAngle = iSpeedAsAngle - 180;
    } else if (iSpeedAsAngle < 0) {
        iSpeedAsAngle = iSpeedAsAngle + 180;
    }

	return iSpeedAsAngle;
}

function drawNeedle(options) {
	/* Draw the needle in a nice read colour at the
	* angle that represents the options.speed value.
	*/

	var iSpeedAsAngle = convertSpeedToAngle(options),
	    iSpeedAsAngleRad = degToRad(iSpeedAsAngle),
        gaugeOptions = options.gaugeOptions,
        innerTickX = gaugeOptions.radius - (Math.cos(iSpeedAsAngleRad) * 20),
        innerTickY = gaugeOptions.radius - (Math.sin(iSpeedAsAngleRad) * 20),
        fromX = (options.center.X - gaugeOptions.radius) + innerTickX,
        fromY = (gaugeOptions.center.Y - gaugeOptions.radius) + innerTickY,
        endNeedleX = gaugeOptions.radius - (Math.cos(iSpeedAsAngleRad) * gaugeOptions.radius),
        endNeedleY = gaugeOptions.radius - (Math.sin(iSpeedAsAngleRad) * gaugeOptions.radius),
        toX = (options.center.X - gaugeOptions.radius) + endNeedleX,
		toY = (gaugeOptions.center.Y - gaugeOptions.radius) + endNeedleY

	drawLine(options, createLine(fromX, fromY, toX, toY, needleColor2, needleWidth + 5, 1.0));
	drawLine(options, createLine(fromX, fromY, toX, toY, needleColor1, needleWidth, 1.0));

	// Two circle to draw the dial at the base (give its a nice effect?)
	drawNeedleDial(options, 0.6, "rgb(127, 127, 127)", "rgb(255,255,255)");
	drawNeedleDial(options, 0.2, "rgb(127, 127, 127)", "rgb(127,127,127)");

}

function draw() {
	/* Main entry point for drawing the speedometer
	* If canvas is not support alert the user.
	*/
	
	var canvas = document.getElementById('tutorial'),
	    options = null;

	// Canvas good?
	if (canvas !== null && canvas.getContext) {
		options = buildOptionsAsJSON(canvas, iCurrentSpeed);

	    // Clear canvas
	    clearCanvas(options);

		// Draw the metallic styled edge
		drawMetallicArc(options);

		// Draw thw background
		drawBackground(options);

		// Draw speeometer colour arc
		drawSpeedometerColourArc(options);

		// Draw tick marks
		drawTicks(options);

		// Draw labels on markers
		drawTextMarkers(options);

		drawSpeedDisplay(options);

		// Draw the needle and base
		drawNeedle(options);
		
	} else {
		alert("Canvas not supported by your browser!");
	}
	
	if(iTargetSpeed == iCurrentSpeed) {
		clearTimeout(job);
		return;
	} else if(iTargetSpeed < iCurrentSpeed) {
		bDecrement = true;
	} else if(iTargetSpeed > iCurrentSpeed) {
		bDecrement = false;
	}
	
	if(bDecrement) {
		if(iCurrentSpeed - 10 < iTargetSpeed)
			iCurrentSpeed = iCurrentSpeed - 1;
		else
			iCurrentSpeed = iCurrentSpeed - 5;
	} else {
	
		if(iCurrentSpeed + 10 > iTargetSpeed)
			iCurrentSpeed = iCurrentSpeed + 1;
		else
			iCurrentSpeed = iCurrentSpeed + 5;
	}
	
	job = setTimeout("draw()", 5);
}

function drawWithInputValue(value) {
	iTargetSpeed = value;
	job = setTimeout("draw()", 5);
}

window.onload = function()
{
	// vid.playbackRate = 0.0;

	$('#speedSlider').on('input', function() { 
		sendSpeed($(this).val())
	});

	$('#speedSlider').on('change', function() { 
		sendSpeed($(this).val())
	});

	draw();

	window.setInterval(function()
	{
		refreshDisplay();
	}, 3000);
}