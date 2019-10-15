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

// pubnub.subscribe(
// 	{
// 		channel: settings.channel,
// 		callback: subscriptUpdate(m)
// 	}
// );

// function subscriptUpdate(data) {

// };

function publishUpdate(data) {
	pubnub.publish(
		{
			message: data,
			channel: settings.channel
		}
	);
};

// UI EVENTS
/* video */
var vid = document.getElementById('vid');
vid.playbackRate = 0.0;

/* slider bar */
// var speedSlider = document.getElementById('speedSlider');

// speedSlider.addEventListener('change', onSliderChanged(this.value), false);
// function onSliderChanged(val) {
// 	// publishUpdate({item: "speedSlider", speed: val});
// 	setSpeed(val);
// };

/* speed buttons */
var button0 = document.getElementById('button0');
var button1 = document.getElementById('button1');
var button2 = document.getElementById('button2');
var button3 = document.getElementById('button3');
var button4 = document.getElementById('button4');
var button5 = document.getElementById('button5');
var button6 = document.getElementById('button6');
var button7 = document.getElementById('button7');
var button8 = document.getElementById('button8');
var button9 = document.getElementById('button9');
var button10 = document.getElementById('button10');

button0.onclick = function() {onButtonClick(0.0)};
button1.onclick = function() {onButtonClick(1.0)};
button2.onclick = function() {onButtonClick(2.0)};
button3.onclick = function() {onButtonClick(3.0)};
button4.onclick = function() {onButtonClick(4.0)};
button5.onclick = function() {onButtonClick(5.0)};
button6.onclick = function() {onButtonClick(6.0)};
button7.onclick = function() {onButtonClick(7.0)};
button8.onclick = function() {onButtonClick(8.0)};
button9.onclick = function() {onButtonClick(9.0)};
button10.onclick = function() {onButtonClick(10.0)};

function onButtonClick(val) {
	// publishUpdate({item: "speedButton", speed: val});

	// This is set directly here for testing but should be set by a 
	// pubnub subcribe message from the remote client
	setSpeed(val);
};

function setSpeed(val) {
	// sets color and background color of button elements based on speed
	for (i = 0; i <= val; i++) {
		document.getElementById('button'+i).style.color = "#f2a0c0";
		document.getElementById('button'+i).style.backgroundColor = "#ec6597";
	};
	for (i = val+1; i <= 10; i++) {
		document.getElementById('button'+i).style.color = "#993333";
		document.getElementById('button'+i).style.backgroundColor = "#331111";
	};
		
	vid.playbackRate = 5.0 * (val / 10.0);
};
