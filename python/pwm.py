# coding: utf-8
#!/usr/bin/env python
import sys
from time import sleep

import importlib.util
try:
    importlib.util.find_spec('RPi.GPIO')
    import RPi.GPIO as GPIO
except ImportError:
    """
    import FakeRPi.GPIO as GPIO
    OR
    import FakeRPi.RPiO as RPiO
    """
    
    import FakeRPi.GPIO as GPIO



class Speed_Control( ):
    def __init__(self):
        VOLT_IN = 3.3       # Ouptut voltage of pin being used for PWM
        VOLT_MAX = 1.45     # this gets us a max voltage of ~1.4v
        MAX_DUTY = min( int( VOLT_MAX / VOLT_IN * 100 ), 100 )
        PIN = 18
        FREQ = 1000 # 1mhz

        ## GPIO setup
        GPIO.setwarnings(False)         # do not show any warnings
        GPIO.setmode(GPIO.BCM)          # we are programming the GPIO by BCM pin numbers. (PIN35 as ‘GPIO19’)
        GPIO.setup(PIN, GPIO.OUT)       # initialize GPIO19 as an output.        
        self.p = GPIO.PWM(PIN, FREQ)          #GPIO19 as PWM output, with 100Hz frequency
        self.p.start(0)                              #generate PWM signal with 0% duty cycle    


    def set_speed(self, speed):
        """ Main function to set PWM duty cycle on pi GPIO
        
        Arguments:
            speed {int} -- Speed value used to deterimine duty cycle
        """
        duty_cycle = (speed * self.MAX_DUTY) / self.MAX_SPEED
        #print('Set duty cycle : {}'.format(duty_cycle))
        return self.p.ChangeDutyCycle(duty_cycle)
    
    
    def cleanup(self):
        GPIO.cleanup() # this ensures a clean exit
