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
var vid = document.getElementById('vid');
vid.playbackRate = 0.0

function setVideoSpeed(obj)
{
	var value = obj.value;
		vid.playbackRate = 5.0 * (obj.value / 10.0;
}

speedSlider.addEventListener('change', function(e){
	publishUpdate({item: "speedSlider", speed: + this.value});
	setVideoSpeed(speedSlider);
}, false);
