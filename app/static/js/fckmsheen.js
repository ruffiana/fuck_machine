var vid;

function refreshDisplay()
{
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
			var r = data;
			if(r.status == "OK")
			{
				setLabel(r.online);
				setSpeed(r.speed);
			}
		}
	});
}

function sendSpeedClick(value)
{
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
			var r = data;
			if(r.status == "OK")
			{
				setLabel(r.online);
				setSpeed(r.speed);
			}
		}
	});

	// Manual Hack to test the JS
	// setSpeed(value)
}

function setLabel(value)
{
	if(value == true)
		$("#label").html("Ruffiana is online");
	else
		$("#label").html("Ruffiana is offline");
}

function setSpeed(value)
{
	// sets color and background color of button elements based on speed
	for (i = 0; i <= 10; i++) {
		if (i <= value)
			$(".speedbtn:eq("+i+")").addClass("activebtn");
		else
			$(".speedbtn:eq("+i+")").removeClass("activebtn");
	};
	
	// set playback speed of video
	vid.playbackRate = 5.0 * (value / 10.0);
}


window.onload = function()
{
	vid = document.getElementById('vid');
	vid.playbackRate = 0.0;

	$(".speedbtn").on( "click", function()
	{
		sendSpeedClick($(this).html());
	});

	window.setInterval(function()
	{
		refreshDisplay();
	}, 3000);
}