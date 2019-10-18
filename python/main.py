# coding: utf-8
#!/usr/bin/env python
import sys
from time import sleep

from pubnub.callbacks import SubscribeCallback
from pubnub.enums import PNOperationType, PNStatusCategory
from pubnub.pnconfiguration import PNConfiguration
from pubnub.pubnub import PubNub

from config import SUBSCRIBE_KEY, PUBLISH_KEY, CHANNEL
from digipot import Speed_Control



# PubNub setup
pnconfig = PNConfiguration() 
pnconfig.subscribe_key = SUBSCRIBE_KEY
pnconfig.publish_key = PUBLISH_KEY




def Publish_Listener(envelope, status):
    # Check whether request successfully completed or not
    if not status.is_error():
        pass  # Message successfully published to specified channel.
    else:
        pass  # Handle message publish error. Check 'category' property to find out possible issue
        # because of which request did fail.
        # Request can be resent using: [status retry];



# Listener to handle messages and events
class Subscribe_Listener(SubscribeCallback):
    MAX_SPEED = 10
    
    def __init__(self):
        self.speed_control = Speed_Control()
    

    def status(self, pubnub, status):
        # The status object returned is always related to subscribe but could contain
        # information about subscribe, heartbeat, or errors
        # use the operationType to switch on different options
        if status.operation == PNOperationType.PNSubscribeOperation \
                or status.operation == PNOperationType.PNUnsubscribeOperation:
            if status.category == PNStatusCategory.PNConnectedCategory:
                # This is expected for a subscribe, this means there is no error or issue whatsoever
                print(f'Connected to {CHANNEL}')
                msg = {'statusOnline': 'online'}
                pubnub.publish().channel(CHANNEL).message(msg).sync()
            elif status.category == PNStatusCategory.PNReconnectedCategory:
                # This usually occurs if subscribe temporarily fails but reconnects. This means
                # there was an error but there is no longer any issue
                print(f'Re-connected to {CHANNEL}')
            elif status.category == PNStatusCategory.PNDisconnectedCategory:
                # This is the expected category for an unsubscribe. This means there
                # was no error in unsubscribing from everything
                pass
            elif status.category == PNStatusCategory.PNUnexpectedDisconnectCategory:
                # This is usually an issue with the internet connection, this is an error, handle
                # appropriately retry will be called automatically
                pubnub.reconnect()
            elif status.category == PNStatusCategory.PNAccessDeniedCategory:
                # This means that PAM does not allow this client to subscribe to this
                # channel and channel group configuration. This is another explicit error
                pass
            else:
                # This is usually an issue with the internet connection, this is an error, handle appropriately
                # retry will be called automatically
                pass
        elif status.operation == PNOperationType.PNSubscribeOperation:
            # Heartbeat operations can in fact have errors, so it is important to check first for an error.
            # For more information on how to configure heartbeat notifications through the status
            # PNObjectEventListener callback, consult http://www.pubnub.com/docs/python/api-reference-configuration#configuration
            if status.is_error():
                # There was an error with the heartbeat operation, handle here
                pass
            else:
                # Heartbeat operation was successful
                pass
        else:
            # Encountered unknown status type
            pass


    def message(self, pubnub, message):
        """
        Event handlers for pubNub messages
        
        Arguments:
            pubnub {[type]} -- [description]
            message {[type]} -- [description]
        """
        _message = message.message
        _keys = _message.keys()

        if 'requestOnlineStatus' in _keys:
            msg = {'statusOnline': 'online'}
            pubnub.publish().channel(CHANNEL).message(msg).sync()

        if 'requestSpeedCurrent' in _keys:
            msg = {'speedCurrent': self.speed_control.speed}
            pubnub.publish().channel(CHANNEL).message(msg).sync()

        if 'requestSpeedChange' in _keys:
            new_speed = _message['requestSpeedChange']
            self.speed_control.speed = new_speed
            msg = {'speedCurrent': self.speed_control.speed}
            pubnub.publish().channel(CHANNEL).message(msg).sync()


    def presence(self, pubnub, presence):
        pass



def main( ):
    try:
        print('Initializing PubNub...')
        pubnub = PubNub(pnconfig)
        
        print('Setting up listeners...')
        my_listener = Subscribe_Listener()
        pubnub.add_listener(my_listener)

        print(f'Subscribing to {CHANNEL}...')
        pubnub.subscribe().channels(CHANNEL).execute()

        print('Active. Press CTRL-C to exit.')
        while True:
            # Push an update every 10 seconds to keep connection active
            sleep(10)
            msg = {
                'speedCurrent': my_listener.speed_control.speed},
                'statusOnline': 'online'
                }
            pubnub.publish().channel(CHANNEL).message(msg).sync()
    except KeyboardInterrupt:
        # here you put any code you want to run before the program   
        # exits when you press CTRL+C
        print('Exiting...')
    except:  
        # this catches ALL other exceptions including errors.  
        # You won't get any error messages for debugging  
        # so only use it once your code is working  
        print( "Other error or exception occurred!" )
    finally:
        msgs = {'speedCurrent': 0, 'statusOnline': 'offline'}
        pubnub.publish().channel(CHANNEL).message(m).sync()

        pubnub.unsubscribe_all()
        my_listener.speed_control.cleanup()
        sys.exit(1)



# if __name__ == 'main':
#     main()

main()