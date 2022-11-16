from configparser import ConfigParser
from pathlib import Path

# load and parse config.ini
CONFIG_FILEPATH = Path(__file__).parent.parent / "config.ini"


def get_config():
    config = ConfigParser()
    config.sections()
    config.read(CONFIG_FILEPATH)

    return config


if __name__ == "__main__":
    config = get_config()
    print(config.getboolean("DEFAULT", "debug"))