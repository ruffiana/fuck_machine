# coding: utf-8
import sys
from time import sleep

from RPi import GPIO    #calling header file which helps us use GPIO’s of PI

from pubnub.callbacks import SubscribeCallback 
from pubnub.enums import PNStatusCategory
from pubnub.pnconfiguration import PNConfiguration  
from pubnub.pubnub import PubNub  

import logging

from .config import SUBSCRIBE_KEY, PUBLISH_KEY, CHANNEL


# PubNub setup
pnconfig = PNConfiguration() 
pnconfig.subscribe_key = SUBSCRIBE_KEY
pnconfig.publish_key = PUBLISH_KEY


## GPIO setup
PIN = 18
FREQ = 1000                     # 1mhz
GPIO.setwarnings(False)         # do not show any warnings
GPIO.setmode(GPIO.BCM)          # we are programming the GPIO by BCM pin numbers. (PIN35 as ‘GPIO19’)
GPIO.setup(PIN, GPIO.OUT)       # initialize GPIO19 as an output.


# Listener to handle messages and events
class MyListener(SubscribeCallback):
    VOLT_IN = 3.3       # Ouptut voltage of pin being used for PWM
    VOLT_MAX = 1.45     # this gets us a max voltage of ~1.4v
    MAX_DUTY = min( int( VOLT_MAX / VOLT_IN * 100 ), 100 )
    MAX_SPEED = 10
    
    def __init__(self):
        self.cur_speed = 0
        self.p = GPIO.PWM(PIN, FREQ)          #GPIO19 as PWM output, with 100Hz frequency
        self.p.start(0)                              #generate PWM signal with 0% duty cycle        

    def status(self, pubnub, status):
        if status.category == PNStatusCategory.PNConnectedCategory:
            # This is expected for a subscribe, this means there is no error or issue whatsoever
            print('Connected to {}'.format(CHANNEL))
            pubnub.publish().channel(CHANNEL).message({'msg': 'main.py connected'}).sync()
        elif status.category == PNStatusCategory.PNReconnectedCategory:
            # This usually occurs if subscribe temporarily fails but reconnects. This means
            # there was an error but there is no longer any issue            
            print('Re-connected to {}'.format(CHANNEL))
        elif status.category == PNStatusCategory.PNUnexpectedDisconnectCategory:
            # internet got lost, do some magic and call reconnect when ready
            pubnub.reconnect()
        elif status.category == PNStatusCategory.PNTimeoutCategory:
            # do some magic and call reconnect when ready
            pubnub.reconnect()
        else:
            # logger.debug(status)
            pass


    def message(self, pubnub, message):
      _message = message.message

      if 'item' in _message.keys():
         if _message['item'] == 'speedSlider':
            self.cur_speed = _message['speed']
            self.set_duty_cycle(self.cur_speed)


    def set_duty_cycle(self, speed):
        """ Main function to set PWM duty cycle on pi GPIO
        
        Arguments:
            speed {int} -- Speed value used to deterimine duty cycle
        """
        duty_cycle = (speed * self.MAX_DUTY) / self.MAX_SPEED
#        print('Set duty cycle : {}'.format(duty_cycle))
        self.p.ChangeDutyCycle(duty_cycle)


    def presence(self, pubnub, presence):
      pass



#published in this fashion to comply with Eon
try:
    print('Initializing PubNub...')
    pubnub = PubNub(pnconfig)
    # pubnub.set_stream_logger('pubnub', logging.DEBUG)    
    
    print('Setting up listeners...')
    my_listener = MyListener()
    pubnub.add_listener(my_listener)    

    print('Subscribing to {}...'.format(CHANNEL))
    pubnub.subscribe().channels(CHANNEL).execute()

    print('Active. Press CTRL-C to exit.')
    while True:
        pass
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
    pubnub.unsubscribe_all()  
    GPIO.cleanup() # this ensures a clean exit
    sys.exit(1)
