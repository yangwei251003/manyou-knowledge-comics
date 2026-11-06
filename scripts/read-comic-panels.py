"""Read gutter boundaries from an ImageGen page without changing the art."""
import json
import sys

from PIL import Image


def split_axis(mask, count, vertical):
    width, height = mask.size
    length = width if vertical else height
    cross = height if vertical else width
    if count == 1:
        return [[0, length]]

    runs = []
    start = None
    for offset in range(length):
        box = (offset, 0, offset + 1, height) if vertical else (0, offset, width, offset + 1)
        light = mask.crop(box).histogram()[255] >= cross * 0.83
        if light and start is None:
            start = offset
        if not light and start is not None:
            if start >= length * 0.12 and offset <= length * 0.88 and 2 <= offset - start <= 36:
                runs.append((start, offset))
            start = None
    if len(runs) != count - 1:
        raise ValueError(f"Expected {count - 1} internal gutters, found {runs}")
    return list(zip([0] + [end for _, end in runs], [start for start, _ in runs] + [length]))


filename, columns, rows = sys.argv[1:]
with Image.open(filename) as image:
    mask = image.convert("L").point(lambda channel: 255 if channel > 217 else 0)
    column_ranges = split_axis(mask, int(columns), True)
    row_ranges = split_axis(mask, int(rows), False)
    print(json.dumps([[x0, y0, x1, y1] for y0, y1 in row_ranges for x0, x1 in column_ranges]))
