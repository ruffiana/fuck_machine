from typing import Union


def clamp(
    value: Union[int, float],
    min_value: Union[int, float],
    max_value: Union[int, float],
) -> Union[int, float]:
    """Clamps the given value between min and max values.

    Args:
        value (Union[int, float]): The value to clamp between min and max.
        min_value (Union[int, float]): The minimum value.
        max_value (Union[int, float]): The maximum value.

    Returns:
        Union[int, float]: Returns the clamped value


    Examples:
        >>> clamp(50, 0, 100)
        50
        >>> clamp(5, 1, 3)
        3
        >>> clamp(1.0, 5.0, 10.0)
        5.0
    """
    return max(min(value, max_value), min_value)


def lerp(val1: float, val2: float, bias: float) -> float:
    """Linear interpolate between val1 and val2

    Args:
        val1 (float): First value
        val2 (float): Seconds value
        bias (float): Bias of lerp between val1(0.0) and val2(1.0)

    Returns:
        float: Interpolated value between val1 and val2.

    Examples:
        >>> lerp(0, 100, 0.5)
        50
        >>> lerp(1, 5, 0.8)
        4.2
    """
    return (1.0 - bias) * val1 + bias * val2


def to_cubic(value: Union[int, float]) -> Union[int, float]:
    """Applies cubic transform to given value.

    Primarily used to add a more gradual curve to low-end input signals

    Args:
        value (Union[int, float]): Value to transform.

    Returns:
        Union[int, float]: Value transformed by cubic forumla
    """
    return round((value**2) * 0.01, 2)


def normalize(arr):
    """Normalizes an array of values to fit between 0.0 and 1.0

    Args:
        arr (numpy.array): A numpy array.

    Returns:
        numpy.array: Normalized array
    """
    # Normalized data= ( data- min(data) )/( max(data)-min(data) )
    return (arr - min(arr)) / (max(arr) - min(arr))


def convert_value(
    val: Union[int, float],
    a_min: Union[int, float],
    a_max: Union[int, float],
    b_min: Union[int, float],
    b_max: Union[int, float],
) -> Union[int, float]:
    """Maps value from one range (a_min to a_max) to another (b_min - b_max)

    Args:
        val (_type_): _description_
        a_min (_type_): Minimum range of first value
        a_max (_type_): Maximum range of first value
        b_min (_type_): Minimum range of second value
        b_max (_type_): Minimum range of second value
    """
    return ((val - a_min) / (a_max - a_min)) * (b_max - b_min) + b_min


def convert_frequency(
    freq: Union[int, float],
    inp_min: Union[int, float],
    inp_max: Union[int, float],
    fps_min: Union[int, float],
    fps_max: Union[int, float],
    cubic: bool = True,
) -> Union[int, float]:
    """Converts raw frequency slider input to refresh rate

    Args:
        freq (Union[int, float]): Frequency value from slider input.
        fps_min (Union[int, float]): Minim frames per second.
        Defaults to FPS_MIN.
        fps_max (Union[int, float]): Maximum frames per second.
        Defaults to FPS_MAX.
        cubic (bool, optional): If true, apply cubic transform to frequency
        input value. Defaults to True.

    Returns:
        Union[int, float]: _description_
    """
    # Apply cubic function to raw frequency input so we get a more gradual
    # increase from 0 to 100
    if cubic:
        freq = to_cubic(freq)

    return convert_value(freq, inp_min, inp_max, fps_min, fps_max)


if __name__ == "__main__":
    for i in range(101):
        print(f"Freq {i} : {convert_frequency(i)}")
