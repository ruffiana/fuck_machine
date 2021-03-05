# Port that web server is accessed through. Port 80 is default for http
PORT = 80

# Max resistance value to map to speed value. This needs to be set based on
# digipot you're using
RES_MAX = 127

# Some motor drives expect higher resistance value to increase speed
# if this flag is true then invert speed value before calculating
# final resistancer value to send to digipot
INVERT = False

# This sets a scalar limit on speed control to keep asshats from killing you.
# Range is 0 to 100
SPEED_LIMIT = 100