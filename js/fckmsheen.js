var vid;

function refreshDisplay()
{
	$.post({
		url: "receiver",
		data: 
		{
			action: 'statusChk',
		},
		dataType: "json",
		type: 'POST',
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
	$.post({
		url: "receiver",
		data: 
		{
			action: 'sendSpeed',
			speed: value
		},
		dataType: "json",
		type: 'POST',
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
	if(value)
		$("#label").html("Ruffiana is online");
	else
		$("#label").html("Ruffiana is offline");
}

function setSpeed(value)
{
	$(".speedbtn").removeClass("activebtn");
	$(".speedbtn:eq("+value+")").addClass("activebtn");
		
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
	}, 500);
}