import logging

# port for flask-hosted webpage. Port 80 is the port number assigned to
#  commonly used internet communication protocol,
# Hypertext Transfer Protocol (HTTP)
PORT = 80

DEV = False
LOG_LEVEL = logging.DEBUG if DEV else logging.INFO
LOG_SPEED_CONTROL = False

# Max resistance value to map to speed value. This needs to be set based on
# digipot you're using
RES_MAX = 127
# Some motor drives expect higher resistance value to increase speed
# if this flag is true then invert speed value before calculating
# final resistance value to send to digipot
INVERT = False

# This sets a scalar limit on speed control to keep asshats from killing you.
# Range is 0 to 100
SPEED_LIMIT = 100

# These are default/starting values for HTML slider controls
def_speed = 0
def_freq = 50

# values used to remap frequency slider input values to frames
# per second
INP_MIN = 0.0
INP_MAX = 100.0

# Values for displaying graphs
TIME_LENGTH = 10
REFRESH_RATE = 30
TICK = 1.0 / REFRESH_RATE

# generated graph samples for 1 unit of time. Higher values
# affect the smoothness of the graphs, but this currently
# correlates with how quickly the pattern plays
SAMPLES = 300
FPS_MIN = 1
FPS_MAX = 300
