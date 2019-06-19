var settings = {
	channel: 'Channel-Ruffiana_Plays',
	publish_key: 'pub-c-486a9fac-91fa-4b7a-b3e3-672a80ca88a4',
	subscribe_key: 'sub-c-6bbe07d2-921f-11e9-b271-9aa5f5ecb24a'
};

var pubnub = new PubNub(
	{
		channels: [settings.channel],
		publishKey: settings.publish_key,
		subscribeKey: settings.subscribe_key
	}
);

// pubnub.subscribe({
// 	channel: settings.channel,
// 	callback: function(m) {
// 	}
// })

/* 
	Data settings:

	LED

	item: 'light-*'
	speed: 0 - 10

*/

function publishUpdate(data) {
	pubnub.publish(
		{
			message: data,
			channel: settings.channel
		}
	);
}

// UI EVENTS
var speedSlider = document.getElementById('speedSlider');

var img = document.getElementById('img');
var img_array = [
	'images/sissy_fuck_machine_1.gif',
	'images/sissy_fuck_machine_25.gif',
	'images/sissy_fuck_machine_50.gif',
	'images/sissy_fuck_machine_75.gif',
	'images/sissy_fuck_machine.gif',
	'images/sissy_fuck_machine_150.gif',
	'images/sissy_fuck_machine_200.gif',
	'images/sissy_fuck_machine_400.gif',
	'images/sissy_fuck_machine_800.gif'
];

function setImage(obj)
{
	var value = obj.value;
	if (value < 1) {
		img.src = img_array[0];
	} else if (value < 1) {
		img.src = img_array[1];
	} else if (value < 3) {
		img.src = img_array[2];
	} else if (value < 5) {
		img.src = img_array[3];
	} else if (value < 7) {
		img.src = img_array[4];
	} else if (value < 9) {
		img.src = img_array[5];
	} else if (value < 10) {
		img.src = img_array[6];
	} else {
		img.src = img_array[7];
	}
}

speedSlider.addEventListener('change', function(e){
	publishUpdate({item: "speedSlider", speed: + this.value});
	setImage(speedSlider);
}, false);
