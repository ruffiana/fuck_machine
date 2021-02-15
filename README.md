This project is intended to be used on a RPI (Raspberry Pi) in conjunction with a digital potenitiometer as the speed control for a fuck machine motor speed control.

While active, you can access the HTML interface via the local IP address of the computer on the network through the default TCP port of 80. I reccmeond you reserve an IP for your RPI.

On RPI or computer running test code:
`http://127.0.0.1/`

On RPI from other devices on same network:
`http://[local IP of RPI]/`
(ex:10.0.0.101)

You can make this publicly accessible by adding a port forward to your router which forward 80 requests to the network IP of the device running the code.
https://www.howtogeek.com/66214/how-to-forward-ports-on-your-router/

**If you know ways to make this configuration more secure, please let me know via comment here or email.**

# Install Python Libs
* pip install Flask
# Install on Windows or other systems that don't have RPi.GPIO libraries
* pip install git+https://github.com/sn4k3/FakeRPi

# How to Start
On RPI in root directory of project enter:
`"sudo python3 Python/fuck_machine/main.py"`
