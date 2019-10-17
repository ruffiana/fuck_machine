// PubNub config
var settings = {
	channel: 'Channel-Ruffiana_Plays',
	publish_key: 'pub-c-486a9fac-91fa-4b7a-b3e3-672a80ca88a4',
	subscribe_key: 'sub-c-6bbe07d2-921f-11e9-b271-9aa5f5ecb24a'
};

// Initialize PubNub
var pubnub = new PubNub(
	{
		channels: [settings.channel],
		publishKey: settings.publish_key,
		subscribeKey: settings.subscribe_key
	}
);

pubnub.addListener({
	message: function(m) {
		 // handle message
		 var channelName = m.channel; // The channel for which the message belongs
		 var channelGroup = m.subscription; // The channel group or wildcard subscription match (if exists)
		 var pubTT = m.timetoken; // Publish timetoken
		 var msg = m.message; // The Payload
		 var publisher = m.publisher; //The Publisher
	},
	presence: function(p) {
		 // handle presence
		 var action = p.action; // Can be join, leave, state-change or timeout
		 var channelName = p.channel; // The channel for which the message belongs
		 var occupancy = p.occupancy; // No. of users connected with the channel
		 var state = p.state; // User State
		 var channelGroup = p.subscription; //  The channel group or wildcard subscription match (if exists)
		 var publishTime = p.timestamp; // Publish timetoken
		 var timetoken = p.timetoken;  // Current timetoken
		 var uuid = p.uuid; // UUIDs of users who are connected with the channel
	},
	signal: function(s) {
		 // handle signal
		 var channelName = s.channel; // The channel for which the signal belongs
		 var channelGroup = s.subscription; // The channel group or wildcard subscription match (if exists)
		 var pubTT = s.timetoken; // Publish timetoken
		 var msg = s.message; // The Payload
		 var publisher = s.publisher; //The Publisher
	},
	user: function(userEvent) {
		 // for Objects, this will trigger when:
		 // . user updated
		 // . user deleted
	},
	space: function(spaceEvent) {
		 // for Objects, this will trigger when:
		 // . space updated
		 // . space deleted
	},
	membership: function(membershipEvent) {
		 // for Objects, this will trigger when:
		 // . user added to a space
		 // . user removed from a space
		 // . membership updated on a space
	},
	messageAction: function(ma) {
		 // handle message action
		 var channelName = ma.channel; // The channel for which the message belongs
		 var publisher = ma.publisher; //The Publisher
		 var event = ma.message.event; // message action added or removed
		 var type = ma.message.data.type; // message action type
		 var value = ma.message.data.value; // message action value
		 var messageTimetoken = ma.message.data.messageTimetoken; // The timetoken of the original message
		 var actionTimetoken = ma.message.data.actionTimetoken; //The timetoken of the message action
	},
	status: function(s) {
		 var affectedChannelGroups = s.affectedChannelGroups; // The channel groups affected in the operation, of type array.
		 var affectedChannels = s.affectedChannels; // The channels affected in the operation, of type array.
		 var category = s.category; //Returns PNConnectedCategory
		 var operation = s.operation; //Returns PNSubscribeOperation
		 var lastTimetoken = s.lastTimetoken; //The last timetoken used in the subscribe request, of type long.
		 var currentTimetoken = s.currentTimetoken; //The current timetoken fetched in the subscribe response, which is going to be used in the next request, of type long.
		 var subscribedChannels = s.subscribedChannels; //All the current subscribed channels, of type array.
	}
});

// Publish function
function publishUpdate(data) {
	pubnub.publish(
		{
			message: data,
			channel: settings.channel
		}
	);
};

function publishRequestOnlineStatus() {
	publishUpdate({item: "onlineStatus"});
};

function publishRequestSpeedCurrent() {
	publishUpdate({item: "speedCurrent"});
};

function publishRequestSpeedChange(val) {
	publishUpdate({item: "speedChangeRequest", speed: val});
};

function onLoad() {
	publishRequestOnlineStatus();
	publishRequestSpeedCurrent();
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
	publishRequestSpeedChange();

	// This is set directly here for testing but should be set by a 
	// pubnub subcribe message from the remote client
	setSpeed(val);
};

function onButtonClick(val) {
	publishUpdate({item: "speedChangeRequest", speed: val});

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
