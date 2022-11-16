import random
import time
from collections import deque

import matplotlib.animation as animation
import matplotlib.pyplot as plt

from animation_functions import graph_wave

FPS = 30
TICK = 1.0 / FPS
INP_MAX = 100
MAX_X = 300

PLOT_SIZE = (20, 8)

# use ggplot style for more sophisticated visuals
# plt.style.use('ggplot')
plt.style.use("dark_background")


def live_plot(graph):
    # Create figure for plotting
    fig, ax = plt.subplots(figsize=PLOT_SIZE)

    # xs = deque([i for i in range(100)] * MAX_X, maxlen=MAX_X)
    xs = deque([i * TICK for i in range(MAX_X)])
    ys = deque([i for i in range(MAX_X)], maxlen=MAX_X)
    xs.rotate(-MAX_X)
    ys.rotate(-MAX_X)

    # ys = deque(ys, maxlen=MAX_X)

    # This function is called periodically from FuncAnimation
    def animate(i, xs, ys, title="Title"):
        # Update x and y lists
        xs.popleft()
        xs.append(xs[-1] + TICK)
        ys.rotate(-1)

        # Draw x and y lists
        ax.clear()
        ax.plot(xs, ys)

        # Format plot
        ax.set_xlabel("Time (sec)")
        ax.set_ylabel("Speed")
        ax.set_title(title)
        # ax.set_xlim([0, MAX_X])
        ax.set_ylim([0, INP_MAX])

    # Set up plot to call animate() function periodically

    ani = animation.FuncAnimation(
        fig, animate, fargs=(xs, ys), interval=1.0 / FPS * 1000
    )
    plt.show()


if __name__ == "__main__":
    live_plot(None)
