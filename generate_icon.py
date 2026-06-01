#!/usr/bin/env python3
"""
Generate a 1024x1024 PNG icon for MTA Ready app.
- Background: navy blue #1B2A4A
- Snow-capped mountain peaks (white/light grey, geometric, two peaks)
- Topographic contour lines in the background (subtle)
- Small checklist card at bottom (dark navy rectangle with 3 green check marks)
Uses only Python stdlib (struct + zlib).
"""
import struct
import zlib
import math

W, H = 1024, 1024

# Create pixel array (RGBA)
pixels = bytearray(W * H * 4)

def set_pixel(x, y, r, g, b, a=255):
    if 0 <= x < W and 0 <= y < H:
        idx = (y * W + x) * 4
        pixels[idx] = r
        pixels[idx+1] = g
        pixels[idx+2] = b
        pixels[idx+3] = a

def blend_pixel(x, y, r, g, b, a):
    """Alpha blend onto existing pixel."""
    if 0 <= x < W and 0 <= y < H:
        idx = (y * W + x) * 4
        ea = pixels[idx+3] / 255.0
        fa = a / 255.0
        oa = fa + ea * (1 - fa)
        if oa > 0:
            pixels[idx]   = int((r * fa + pixels[idx]   * ea * (1 - fa)) / oa)
            pixels[idx+1] = int((g * fa + pixels[idx+1] * ea * (1 - fa)) / oa)
            pixels[idx+2] = int((b * fa + pixels[idx+2] * ea * (1 - fa)) / oa)
            pixels[idx+3] = int(oa * 255)

def fill_rect(x1, y1, x2, y2, r, g, b, a=255):
    for y in range(y1, y2+1):
        for x in range(x1, x2+1):
            set_pixel(x, y, r, g, b, a)

def draw_line_aa(x0, y0, x1, y1, r, g, b, thickness=2):
    """Draw anti-aliased line."""
    dx = x1 - x0
    dy = y1 - y0
    dist = math.sqrt(dx*dx + dy*dy)
    if dist == 0:
        return
    steps = int(dist) * 2 + 1
    for i in range(steps + 1):
        t = i / steps
        fx = x0 + dx * t
        fy = y0 + dy * t
        for tx in range(-thickness, thickness+1):
            for ty in range(-thickness, thickness+1):
                px = int(fx + tx)
                py = int(fy + ty)
                dist_from_center = math.sqrt(tx*tx + ty*ty)
                if dist_from_center <= thickness:
                    alpha = int(255 * max(0, 1 - dist_from_center / thickness))
                    blend_pixel(px, py, r, g, b, alpha)

def fill_polygon(points, r, g, b, a=255):
    """Fill a polygon using scanline algorithm."""
    if len(points) < 3:
        return
    min_y = max(0, min(p[1] for p in points))
    max_y = min(H-1, max(p[1] for p in points))
    for y in range(min_y, max_y+1):
        intersections = []
        n = len(points)
        for i in range(n):
            x0, y0 = points[i]
            x1, y1 = points[(i+1) % n]
            if (y0 <= y < y1) or (y1 <= y < y0):
                if y1 != y0:
                    x = x0 + (y - y0) * (x1 - x0) / (y1 - y0)
                    intersections.append(int(x))
        intersections.sort()
        for i in range(0, len(intersections)-1, 2):
            x_start = max(0, intersections[i])
            x_end = min(W-1, intersections[i+1])
            for x in range(x_start, x_end+1):
                if a == 255:
                    set_pixel(x, y, r, g, b, a)
                else:
                    blend_pixel(x, y, r, g, b, a)

# ── 1. Fill background: navy blue #1B2A4A ──────────────────────────────────
for i in range(W * H):
    idx = i * 4
    pixels[idx]   = 0x1B
    pixels[idx+1] = 0x2A
    pixels[idx+2] = 0x4A
    pixels[idx+3] = 0xFF

# ── 2. Topographic contour lines (subtle, slightly lighter than bg) ─────────
# Draw several elliptical contour rings centered around the mountain area
import math

def draw_arc_segment(cx, cy, rx, ry, start_deg, end_deg, r, g, b, a, thickness=2):
    steps = int(abs(end_deg - start_deg) * rx / 10) + 60
    prev = None
    for i in range(steps + 1):
        angle = math.radians(start_deg + (end_deg - start_deg) * i / steps)
        x = int(cx + rx * math.cos(angle))
        y = int(cy + ry * math.sin(angle))
        if prev:
            for tx in range(-thickness, thickness+1):
                for ty in range(-thickness, thickness+1):
                    d = math.sqrt(tx*tx + ty*ty)
                    if d <= thickness:
                        alpha_frac = max(0, 1 - d / (thickness + 0.5))
                        blend_pixel(x+tx, y+ty, r, g, b, int(a * alpha_frac))
        prev = (x, y)

# Contour lines — lighter navy, subtle
contour_color = (0x28, 0x3E, 0x65, 80)
contour_rings = [
    (512, 580, 480, 200),
    (512, 600, 400, 160),
    (512, 620, 320, 120),
    (512, 640, 240, 85),
    (512, 660, 160, 60),
    (512, 600, 550, 220),
    (512, 560, 420, 175),
]
for (cx, cy, rx, ry) in contour_rings:
    draw_arc_segment(cx, cy, rx, ry, 180, 360, *contour_color[:3], contour_color[3], thickness=2)

# ── 3. Mountain peaks ───────────────────────────────────────────────────────
# Two geometric mountain peaks
# Left peak (slightly smaller, behind)
left_peak = [(180, 680), (430, 280), (560, 680)]
# Right peak (main peak)
right_peak = [(360, 680), (640, 220), (870, 680)]

# Draw mountain body: dark slate-grey (#2A3B5A)
fill_polygon(left_peak, 0x2A, 0x3B, 0x5A)
fill_polygon(right_peak, 0x2A, 0x3B, 0x5A)

# Snow cap on left peak — white/light grey
left_snow_line_y = 420
# Interpolate left peak sides at snow_line_y
# Left peak: (180,680)->(430,280)->(560,680)
# Left side from (180,680) to (430,280):  x = 180 + (y-680)*(430-180)/(280-680)
left_snow_xl = int(180 + (left_snow_line_y - 680) * (430 - 180) / (280 - 680))
# Right side from (430,280) to (560,680): x = 430 + (y-280)*(560-430)/(680-280)
left_snow_xr = int(430 + (left_snow_line_y - 280) * (560 - 430) / (680 - 280))
left_snow = [(left_snow_xl, left_snow_line_y), (430, 280), (left_snow_xr, left_snow_line_y)]
fill_polygon(left_snow, 0xD8, 0xDD, 0xE8)

# Snow cap on right peak
right_snow_line_y = 380
# Right peak: (360,680)->(640,220)->(870,680)
# Left side: x = 360 + (y-680)*(640-360)/(220-680)
right_snow_xl = int(360 + (right_snow_line_y - 680) * (640 - 360) / (220 - 680))
# Right side: x = 640 + (y-220)*(870-640)/(680-220)
right_snow_xr = int(640 + (right_snow_line_y - 220) * (870 - 640) / (680 - 220))
right_snow = [(right_snow_xl, right_snow_line_y), (640, 220), (right_snow_xr, right_snow_line_y)]
fill_polygon(right_snow, 0xEC, 0xF0, 0xF5)

# ── 4. Ground/base line ─────────────────────────────────────────────────────
# Flat base across bottom
fill_rect(0, 680, W-1, H-1, 0x17, 0x24, 0x3E)

# ── 5. Checklist card at bottom ─────────────────────────────────────────────
card_x1, card_y1 = 280, 720
card_x2, card_y2 = 744, 870
card_r, card_rx = card_x2 - card_x1, 18

# Card background: dark navy rectangle (#0F1A30)
fill_rect(card_x1, card_y1, card_x2, card_y2, 0x0F, 0x1A, 0x30)
# Card border: subtle highlight
draw_line_aa(card_x1, card_y1, card_x2, card_y1, 0x2E, 0x4A, 0x7E, 1)
draw_line_aa(card_x1, card_y2, card_x2, card_y2, 0x2E, 0x4A, 0x7E, 1)
draw_line_aa(card_x1, card_y1, card_x1, card_y2, 0x2E, 0x4A, 0x7E, 1)
draw_line_aa(card_x2, card_y1, card_x2, card_y2, 0x2E, 0x4A, 0x7E, 1)

# Draw 3 check marks with lines (green #4A8B28)
def draw_checkmark(cx, cy, size, r, g, b):
    """Draw a checkmark tick."""
    # Short leg
    x0, y0 = cx - size//2, cy
    x1, y1 = cx - size//6, cy + size//2
    # Long leg
    x2, y2 = cx + size//2, cy - size//3
    draw_line_aa(x0, y0, x1, y1, r, g, b, thickness=3)
    draw_line_aa(x1, y1, x2, y2, r, g, b, thickness=3)

# Also draw the check circle
def draw_check_circle(cx, cy, radius, r, g, b):
    for angle_deg in range(0, 360, 2):
        angle = math.radians(angle_deg)
        x = int(cx + radius * math.cos(angle))
        y = int(cy + radius * math.sin(angle))
        blend_pixel(x, y, r, g, b, 200)
        blend_pixel(x+1, y, r, g, b, 150)
        blend_pixel(x, y+1, r, g, b, 150)

# 3 check items, evenly spaced
row_ys = [card_y1 + 30, card_y1 + 65, card_y1 + 100]
for row_y in row_ys:
    # Circle
    draw_check_circle(card_x1 + 34, row_y + 8, 14, 0x4A, 0x8B, 0x28)
    # Check mark inside
    draw_checkmark(card_x1 + 34, row_y + 6, 16, 0x4A, 0x8B, 0x28)
    # Line representing text
    fill_rect(card_x1 + 60, row_y + 4, card_x1 + 200, row_y + 12, 0x3A, 0x55, 0x7A)

# ── 6. Write PNG ────────────────────────────────────────────────────────────
def write_png(filename, pixels, width, height):
    def chunk(name, data):
        c = struct.pack('>I', len(data)) + name + data
        crc = zlib.crc32(name + data) & 0xFFFFFFFF
        return c + struct.pack('>I', crc)

    # Build raw image data
    raw = bytearray()
    for y in range(height):
        raw.append(0)  # filter type None
        for x in range(width):
            idx = (y * width + x) * 4
            raw.extend(pixels[idx:idx+4])

    compressed = zlib.compress(bytes(raw), 9)

    ihdr_data = struct.pack('>IIBBBBB', width, height, 8, 2, 0, 0, 0)
    # Use 8 bit depth, color type 2 = RGB... but we have RGBA, so use color type 6
    ihdr_data = struct.pack('>II', width, height) + bytes([8, 6, 0, 0, 0])

    png = b'\x89PNG\r\n\x1a\n'
    png += chunk(b'IHDR', ihdr_data)
    png += chunk(b'IDAT', compressed)
    png += chunk(b'IEND', b'')

    with open(filename, 'wb') as f:
        f.write(png)

write_png('/home/user/MTA-New/assets/icon.png', pixels, W, H)
print("Icon written to /home/user/MTA-New/assets/icon.png")
