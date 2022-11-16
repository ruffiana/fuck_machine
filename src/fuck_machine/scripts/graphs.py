from collections import deque

import numpy as np
from matplotlib import animation, pyplot

try:
    from . import config_parser
    from .common import *
except ImportError:
    import config_parser
    from common import *

# get attributes from config.ini
config = config_parser.get_config()

# min/max input values from GUI sliders
INP_MIN = config.getint('DEFAULT', 'min', fallback=0)
INP_MAX = config.getint('DEFAULT', 'max', fallback=100)
# number of samples/frames to generate from pattern functions
SAMPLES = config.getint('graph', 'samples', fallback=300)
# length of time in seconds when creating display graphs
TIME_LENGTH = config.getint('graph', 'length', fallback=10)
# interval for FuncAnimation calculated by 1.0 second divided by refresh rate
# and converted to miliseconds
REFRESH_RATE = config.getint('graph', 'refresh', fallback=0)
TICK = 1.0 / REFRESH_RATE
INTERVAL = TICK * 1000
# size of graph figure
WIDTH = config.getint('graph', 'width', fallback=20)
HEIGHT = config.getint('graph', 'height', fallback=8)
PLOT_SIZE = (WIDTH, HEIGHT)

# use ggplot style for more sophisticated visuals
pyplot.style.use("ggplot")
# pyplot.style.use('dark_background')


def graph_to_lists(graph):
    # # plot the data and customize
    x, y = list(zip(*graph))
    return x, y


def static(graph, title=None):
    # create the figure and axis objects
    fig, ax = pyplot.subplots(figsize=(PLOT_SIZE))

    # plot the data and customize
    ax.plot(*graph)

    ax.set_xlabel("Time (sec)")
    ax.set_ylabel("Speed")
    if title:
        ax.set_title(title)
    # ax.set_xlim([0, time])
    # ax.set_ylim([0, INP_MAX])

    pyplot.show()
    return fig


def output(
    time: Union[int, float],
    speed: Union[int, float],
    round_to: int = 2,
    scale: int = 1,
) -> str:
    """Outputs time : speed value and graphic representation to terminal

    Args:
        time (float): Time value in seconds.
        speed (float): Speed value as float.
        round_to (int, optional): Round values to this decimal place. Defaults to 2.
        scale (int, optional): Horizontal scale of graph. Defaults to 100.
    """
    speed = round(float("{:.02f}".format(speed * scale)))
    output = f'{round(time, round_to)}s\t: {round(speed, round_to)}\t|{speed * " "}*'
    print(output)
    return output


def live(y_func, title=None, xlabel="Time (sec)", ylabel="Speed", ylim=(0, 1)):
    # Create figure for plotting
    fig, ax = pyplot.subplots(figsize=PLOT_SIZE)

    # xs = deque(np.zeros(SAMPLES), maxlen=SAMPLES)
    xs = deque(np.arange(-SAMPLES * TICK, 0, TICK))
    # xs = deque(np.zeros(SAMPLES))
    ys = deque(np.zeros(SAMPLES))

    # This function is called periodically from FuncAnimation
    def animate(i, y_func, xs, ys, title=title):
        # Update x and y lists
        xs.popleft()
        xs.append(xs[-1] + TICK)
        ys.popleft()
        y = y_func()
        ys.append(y)

        # format plot
        ax.clear()
        ax.set_title("{} ({})".format(title, y))
        ax.set_xlabel(xlabel)
        ax.set_ylabel(ylabel)
        ax.set_ylim(ylim)
        ax.set_xlim(xs[-1] - TIME_LENGTH, xs[-1])

        # plot graph
        ax.plot(xs, ys)
        pyplot.draw()
        pyplot.pause(0.001)

    # Set up plot to call animate() function periodically
    ani = animation.FuncAnimation(fig,
                                  animate,
                                  fargs=(y_func, xs, ys),
                                  interval=INTERVAL)

    pyplot.ion()
    pyplot.show(block=False)


def anim(graph, title=None):
    """Displays an animated graph

    Args:
        graph (np.array): 2D array represting time as X and amplitude as Y
        time (int, optional): Length of time. Defaults to const.TIME_LENGTH.
        title (str, optional): If supplied, use this as the graph title. Defaults to None.

    Returns:
        matplotlib.figure: The graph's Figure object
    """
    # Create figure for plotting
    fig, ax = pyplot.subplots(figsize=PLOT_SIZE)
    ax.set_xlim([0, 1])
    ax.set_ylim([0, 1])
    ax.set_title(title)
    ax.set_xlabel("Time (sec)")
    ax.set_ylabel("Speed")

    (line, ) = ax.plot(*graph)

    # This function is called periodically from FuncAnimation
    def animate(i):
        y = graph[1]
        y = np.roll(y, -i)
        line.set_ydata(y)
        return (line, )

    ani = animation.FuncAnimation(fig, animate, interval=INTERVAL)
    pyplot.show()

    return fig


if __name__ == "__main__":
    pyplot.close("all")

    from patterns import Patterns
    patterns = Patterns()

    graph = patterns.graph_ripple()
    static(graph)
    anim(graph)

    pyplot.close("all")
