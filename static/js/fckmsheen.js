var vid;
var slider;

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

function sendSpeed(value)
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
	// // sets color and background color of button elements based on speed
	// for (i = 0; i <= 10; i++) {
	// 	if (i <= value)
	// 		$(".speedbtn:eq("+i+")").addClass("activebtn");
	// 	else
	// 		$(".speedbtn:eq("+i+")").removeClass("activebtn");
	// };

	
	// update slider to reflect current speed
	slider.value = value;
	// document.getElementById("speedSlider").value = "75";
	
	// set playback speed of video
	vid.playbackRate = 5.0 * (value / 100.0);
}


window.onload = function()
{
	vid = document.getElementById('vid');
	vid.playbackRate = 0.0;

	slider = document.getElementById('speedSlider')

	// $(".speedbtn").on( "click", function()
	// {
	// 	sendSpeed($(this).html());
	// });

	$('#speedSlider').on('input', function() { 
		sendSpeed($(this).val())
	});

	$('#speedSlider').on('change', function() { 
		sendSpeed($(this).val())
	});

	window.setInterval(function()
	{
		refreshDisplay();
	}, 3000);
}