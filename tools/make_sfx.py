"""原创合成音效：撞击、落地、咔哒、呼啸、气泡、滴答。

python3 tools/make_sfx.py public/sfx
全部由噪声和正弦波现场合成，没有采样，可随仓库自由分发。
"""
import sys
from pathlib import Path

import numpy as np
from scipy.io import wavfile
from scipy.signal import butter, sosfilt

SR = 48000
rng = np.random.default_rng(42)


def t_(sec):
    return np.arange(int(sec * SR)) / SR


def sweep_sine(f0, f1, sec, k):
    """指数衰减的下滑正弦（底鼓式撞击的核心）。"""
    t = t_(sec)
    f = f1 + (f0 - f1) * np.exp(-t * k)
    return np.sin(2 * np.pi * np.cumsum(f) / SR)


def filt(x, kind, freq, order=2):
    return sosfilt(butter(order, freq, kind, fs=SR, output="sos"), x)


def noise(sec):
    return rng.standard_normal(int(sec * SR))


def bandsweep(x, f0, f1, q=3.0):
    """时变带通：中心频率从 f0 指数滑到 f1（呼啸声）。"""
    n = len(x)
    fc = f0 * (f1 / f0) ** (np.arange(n) / n)
    y = np.zeros(n)
    z1 = z2 = 0.0
    for i in range(n):
        # RBJ 带通（0 dB 峰值），直接 II 型：w = x - a1·w1 - a2·w2，y = α(w - w2)
        w0 = 2 * np.pi * fc[i] / SR
        alpha = np.sin(w0) / (2 * q)
        a0 = 1 + alpha
        w = x[i] - (-2 * np.cos(w0) / a0) * z1 - ((1 - alpha) / a0) * z2
        y[i] = (alpha / a0) * (w - z2)
        z2, z1 = z1, w
    return y


def norm(x, peak=0.9):
    x = x - np.mean(x)
    m = np.abs(x).max()
    return x / m * peak if m > 0 else x


def fade(x, ms_in=1, ms_out=15):
    n_in, n_out = int(SR * ms_in / 1000), int(SR * ms_out / 1000)
    x = x.copy()
    if n_in:
        x[:n_in] *= np.linspace(0, 1, n_in)
    if n_out:
        x[-n_out:] *= np.linspace(1, 0, n_out)
    return x


def hit(f0, f1, body, click, sec=0.45):
    t = t_(sec)
    s = sweep_sine(f0, f1, sec, 30) * np.exp(-t * body)
    c = filt(noise(sec), "bandpass", [1500, 7000]) * np.exp(-t * 90) * click
    sub = np.sin(2 * np.pi * f1 * t) * np.exp(-t * 7) * 0.35
    return fade(norm(s + c + sub, 0.95), 0, 40)


def land(f0, f1, sec=0.35):
    t = t_(sec)
    s = sweep_sine(f0, f1, sec, 40) * np.exp(-t * 14)
    th = filt(noise(sec), "lowpass", 900) * np.exp(-t * 35) * 0.6
    return fade(norm(s + th, 0.85), 0, 30)


def snap(pitch, sec=0.12):
    t = t_(sec)
    c = filt(noise(sec), "highpass", 3000) * np.exp(-t * 260)
    p = np.sin(2 * np.pi * pitch * t) * np.exp(-t * 70) * 0.5
    b = sweep_sine(420, 160, sec, 60) * np.exp(-t * 55) * 0.6
    return fade(norm(c + p + b, 0.85), 0, 10)


def whoosh(sec, f0, f1, peak_at=0.6):
    t = t_(sec)
    x = bandsweep(noise(sec), f0, f1, q=2.2)
    env = np.where(t < sec * peak_at, (t / (sec * peak_at)) ** 2, np.exp(-(t - sec * peak_at) * (6 / sec)))
    return fade(norm(x * env, 0.8), 2, 40)


def pop(f0, f1, sec=0.11):
    t = t_(sec)
    s = sweep_sine(f0, f1, sec, 55) * np.exp(-t * 38)
    c = filt(noise(sec), "highpass", 4000) * np.exp(-t * 400) * 0.25
    return fade(norm(s + c, 0.8), 0, 12)


def tick(freq, sec=0.07):
    t = t_(sec)
    s = np.sin(2 * np.pi * freq * t) * np.exp(-t * 120) + np.sin(2 * np.pi * freq * 2.01 * t) * np.exp(-t * 200) * 0.4
    c = filt(noise(sec), "highpass", 6000) * np.exp(-t * 600) * 0.3
    return fade(norm(s + c, 0.7), 0, 8)


SOUNDS = {
    "hit_1.wav": lambda: hit(140, 42, 9, 0.5),
    "hit_2.wav": lambda: hit(210, 62, 13, 0.8, 0.35),
    "land_1.wav": lambda: land(110, 48),
    "land_2.wav": lambda: land(150, 70),
    "snap_1.wav": lambda: snap(1900),
    "snap_2.wav": lambda: snap(2400),
    "whoosh-short_1.wav": lambda: whoosh(0.32, 500, 3800),
    "whoosh-short_2.wav": lambda: whoosh(0.3, 3000, 600, 0.45),
    "whoosh-long_1.wav": lambda: whoosh(0.85, 250, 4500, 0.7),
    "pop_1.wav": lambda: pop(900, 320),
    "pop_2.wav": lambda: pop(1100, 380),
    "pop_3.wav": lambda: pop(760, 260),
    "pop_4.wav": lambda: pop(1300, 450),
    "tick-crisp_1.wav": lambda: tick(3200),
}

if __name__ == "__main__":
    out = Path(sys.argv[1] if len(sys.argv) > 1 else "public/sfx")
    out.mkdir(parents=True, exist_ok=True)
    for name, fn in SOUNDS.items():
        x = fn()
        wavfile.write(out / name, SR, (np.clip(x, -1, 1) * 32767).astype(np.int16))
        print("ok", name, f"{len(x) / SR:.2f}s")
