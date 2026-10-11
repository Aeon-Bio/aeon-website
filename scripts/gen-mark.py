#!/usr/bin/env python3
# The aeon mark, as printed on the business card (claude.ai/artifact/A1T4Hncs3pWMGPmkkb7DE7).
# Deterministic: same window, same plates, byte-stable output. Needs numpy + Pillow.
#
#   python3 scripts/gen-mark.py            # writes static/mark/aeon-mark-{3000.png,1500.webp,750.webp}
#
"""The aeon mark: a long exposure of one Lorenz trajectory.

Biology is a process, so the mark is a process: one trajectory of the Lorenz
system, photographed with the shutter open. Light is deposited per unit TIME,
not per unit length, so where the motion is slow the trail burns bright and
where it is fast it thins; the axis we do not project (y) is depth, so near
passes are wider and brighter than far ones and crossings glow where they
add. Hue runs primary -> biolum along the trail's own time, the trail fades
in from nothing, and it ends in a head of light. Rendered per pixel like the
site's canvas, 3000x2400 px for a 1000x800 frame (about 1200 dpi at 62 mm),
RGBA with straight alpha so it sits on any ground.
"""
import sys, os, pathlib, math
import numpy as np
from PIL import Image

SIG, RHO, BETA = 10.0, 28.0, 8.0 / 3.0
SX, SY, OX, OY = 23.0, 15.2, 500, 780          # frame: 1000x800 units
S = 3.0                                        # px per unit
CORE = float(os.environ.get('MARK_CORE', '3'))   # extra gain on the white core of near passes
GAIN = float(os.environ.get('MARK_GAIN', '3'))   # exposure: matched to the printed card (99th-pct luminance 0.42 vs card 0.47 on deep space)
W, H = int(1000 * S), int(800 * S)

def lorenz(x, y, z, steps, dt=0.004, skip=30000):
    pts = []
    for i in range(steps + skip):
        dx = SIG * (y - x); dy = x * (RHO - z) - y; dz = x * y - BETA * z
        x += dx * dt; y += dy * dt; z += dz * dt
        if i >= skip: pts.append((x, y, z))
    return pts

def proj(p): return (OX + p[0] * SX) * S, (OY - p[2] * SY) * S
def hexrgb(h): return np.array([int(h[i:i + 2], 16) for i in (1, 3, 5)], float) / 255

class Plate:
    """An accumulator of light (or ink). stamp() adds a Gaussian spot."""
    def __init__(self, scale=1.0):
        self.s = scale; self.w, self.h = int(W * scale), int(H * scale)
        self.rgb = np.zeros((self.h, self.w, 3), np.float32)
        self.d = np.zeros((self.h, self.w), np.float32)
    def stamp(self, x, y, sigma, peak, col):
        x, y, sigma = x * self.s, y * self.s, sigma * self.s
        r = int(math.ceil(3 * sigma))
        x0, y0 = int(round(x)), int(round(y))
        xs = np.arange(max(0, x0 - r), min(self.w, x0 + r + 1))
        ys = np.arange(max(0, y0 - r), min(self.h, y0 + r + 1))
        if not len(xs) or not len(ys): return
        g = np.exp(-(((xs - x) ** 2)[None, :] + ((ys - y) ** 2)[:, None]) / (2 * sigma * sigma)) * peak
        self.d[ys[0]:ys[-1] + 1, xs[0]:xs[-1] + 1] += g
        self.rgb[ys[0]:ys[-1] + 1, xs[0]:xs[-1] + 1] += g[:, :, None] * col[None, None, :]
    def full(self):
        if self.s == 1.0: return self.rgb, self.d
        up = lambda a: np.asarray(Image.fromarray(a).resize((W, H), Image.BICUBIC), np.float32)
        return np.stack([up(self.rgb[:, :, i]) for i in range(3)], -1), up(self.d)

def line_peak(I, sigma, spacing):
    """Per-stamp peak so that stamps `spacing` apart along a line sum to on-line intensity I."""
    return I * spacing / (math.sqrt(2 * math.pi) * sigma)

def expose(T, cols, weights, layers):
    """Walk the trajectory, depositing light per unit time.
    layers: list of (plate, sigma(d), intensity(t, d), colour(t, d))"""
    P = [proj(p) for p in T]
    ys = [p[1] for p in T]; lo, hi = min(ys), max(ys)
    n = len(T)
    for i in range(n - 1):
        (x0, y0), (x1, y1) = P[i], P[i + 1]
        seglen = math.hypot(x1 - x0, y1 - y0)
        t = i / (n - 2); d = (T[i][1] - lo) / (hi - lo)
        wt = weights[i]
        spacing = 1.2                                   # px between sub-stamps
        k = max(1, int(math.ceil(seglen / spacing)))
        for plate, sig_f, I_f, col_f in layers:
            sigma = sig_f(d); I = I_f(t, d) * wt
            if I <= 0: continue
            peak = line_peak(I, sigma, seglen / k) / k * k   # exposure per step spread over k stamps
            for j in range(k):
                u = (j + 0.5) / k
                plate.stamp(x0 + (x1 - x0) * u, y0 + (y1 - y0) * u, sigma, peak / k * k / k if False else peak / k, col_f(t, d))

def time_weights(T):
    """Long exposure: slow motion deposits more light. Compressed so the fast
    outer arcs stay visible and the slow inner turns do not blow out."""
    P = [proj(p) for p in T]
    sp = np.array([math.hypot(P[i + 1][0] - P[i][0], P[i + 1][1] - P[i][1]) for i in range(len(P) - 1)])
    w = (np.median(sp) / np.maximum(sp, 1e-6)) ** 0.45
    return np.clip(w, 0.55, 1.8) * sp / np.median(sp)   # x sp: light per step, spread over the step's length

def render_dark(T, cols):
    primary, biolum, white = hexrgb('#4cc9f0'), hexrgb('#80ffdb'), np.array([1, 1, 1.0])
    ramp = lambda t: 0.08 + 0.92 * t ** 1.4
    hue = lambda t, d: primary * (1 - t) + biolum * t
    body, core, halo = Plate(), Plate(), Plate(0.25)
    wts = time_weights(T)
    expose(T, cols, wts, [
        (halo, lambda d: 8.0 * S * (0.7 + 0.5 * d), lambda t, d: GAIN * (0.10 + 0.26 * d) * ramp(t), hue),
        (body, lambda d: S * (0.55 + 0.75 * d), lambda t, d: GAIN * (0.35 + 0.65 * d) * ramp(t), hue),
        (core, lambda d: S * 0.42, lambda t, d: GAIN * CORE * 1.1 * d ** 2.2 * ramp(t), lambda t, d: hue(t, d) * 0.25 + white * 0.75),
    ])
    hx, hy = proj(T[-1])
    for plate, sig, peak, col in ((halo, 15 * S, 0.5, primary), (body, 5.5 * S, 1.0, biolum), (core, 1.9 * S, 1.6, white)):
        plate.stamp(hx, hy, sig, peak, col)
    L = body.full()[0] + core.full()[0] + halo.full()[0]
    a = np.clip(L.max(-1), 0, 1)
    rgb = np.clip(L / np.maximum(a, 1e-6)[:, :, None], 0, 1)
    rgb = np.where(a[:, :, None] > 0, rgb, 0)
    return np.dstack([rgb, a])

def render_light(T, cols):
    ink, prim, bio = hexrgb('#1a1b2f'), hexrgb('#2a7fb0'), hexrgb('#1c8f6e')
    paper = hexrgb('#F7F8FA')
    ramp = lambda t: 0.16 + 0.84 * t ** 1.3
    def hue(t, d):
        return ink * (1 - t / 0.6) + prim * (t / 0.6) if t < 0.6 else prim * (1 - (t - 0.6) / 0.4) + bio * ((t - 0.6) / 0.4)
    body, hil = Plate(), Plate()
    wts = time_weights(T)
    expose(T, cols, wts, [
        (body, lambda d: S * (0.8 + 1.0 * d), lambda t, d: (0.55 + 0.6 * d) * ramp(t), hue),
        (hil, lambda d: S * 0.5, lambda t, d: 0.55 * d ** 2.4 * ramp(t), lambda t, d: paper),
    ])
    hx, hy = proj(T[-1])
    body.stamp(hx, hy, 4.2 * S, 1.8, bio); hil.stamp(hx, hy, 1.5 * S, 1.6, paper)
    C, D = body.rgb, body.d
    Hc, Hd = hil.rgb, hil.d
    density = np.clip(D - Hd, 0, None)
    col = C / np.maximum(D, 1e-6)[:, :, None]
    a = 1 - np.exp(-1.3 * density)
    rgb = np.where(a[:, :, None] > 0, np.clip(col, 0, 1), 0)
    return np.dstack([rgb, a])

def save(img, path):
    Image.fromarray((np.clip(img, 0, 1) * 255 + 0.5).astype(np.uint8), 'RGBA').save(path, optimize=True)

if __name__ == '__main__':
    out = pathlib.Path(sys.argv[1]) if len(sys.argv) > 1 else pathlib.Path(__file__).resolve().parent.parent / 'static' / 'mark'
    out.mkdir(parents=True, exist_ok=True)
    # The window: 1400 steps of the (0.5, 0.8, 1.2) run after the 30000-step skip, chosen by hand
    # from candidates that end ~30 steps before a lobe hop, so the head sits on an outer arc and
    # nothing in the window is a parked spiral (see cands.png).
    # The card's head sits at step 30000+4759 of the (0.5, 0.8, 1.2) run (the 13:16 script's
    # 3359+1400 window). The printed card exposed far longer than 1400 steps, so the window is
    # anchored at that END and extended backwards: same head, denser exposure.
    END = 3359 + 1400
    N = int(os.environ.get('MARK_STEPS', '7000'))
    T = lorenz(0.5, 0.8, 1.2, steps=N, skip=30000 + END - N)
    hops = sum((a[0] < 0) != (b[0] < 0) for a, b in zip(T, T[1:]))
    print(f'window of {len(T)} steps ending at {END}, {hops} lobe hops, head at x={T[-1][0]:.1f} z={T[-1][2]:.1f}')
    dark = render_dark(T, None)
    save(dark, out / 'aeon-mark-3000.png')
    full = Image.fromarray((np.clip(dark, 0, 1) * 255 + 0.5).astype(np.uint8), 'RGBA')
    for w in (1500, 750):
        full.resize((w, w * 4 // 5), Image.LANCZOS).save(out / f'aeon-mark-{w}.webp', quality=88, method=6)
    for f in sorted(out.iterdir()):
        print(f.name, f.stat().st_size, 'bytes')