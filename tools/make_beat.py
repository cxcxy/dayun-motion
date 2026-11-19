"""原创鼓点：120 BPM，第 0 帧就是第一拍底鼓。python3 tools/make_beat.py <秒> <输出.wav>"""
import sys, numpy as np
from scipy.io import wavfile
from scipy.signal import butter, sosfilt

SR, BPM = 48000, 120
dur = float(sys.argv[1]); out = sys.argv[2]
n = int(SR * dur); L = np.zeros(n); R = np.zeros(n)
beat = 60 / BPM
rng = np.random.default_rng(7)

def add(sig, t, pan=0.0, g=1.0):
    i = int(t * SR); j = min(n, i + len(sig))
    if i >= n: return
    L[i:j] += sig[: j - i] * g * (1 - max(0, pan)); R[i:j] += sig[: j - i] * g * (1 + min(0, pan))

def kick():
    t = np.arange(int(0.35 * SR)) / SR
    f = 45 + 110 * np.exp(-t * 28)
    return np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t * 9) + 0.25 * np.exp(-t * 300) * rng.standard_normal(len(t))

hp = butter(4, 7000, "hp", fs=SR, output="sos"); bp = butter(2, [900, 4000], "bp", fs=SR, output="sos")
def hat(len_s=0.04):
    t = np.arange(int(len_s * SR)) / SR
    return sosfilt(hp, rng.standard_normal(len(t))) * np.exp(-t * 90)
def clap():
    t = np.arange(int(0.25 * SR)) / SR
    env = sum(np.exp(-np.clip(t - d, 0, None) * 60) * (t >= d) for d in (0, 0.012, 0.024)) + np.exp(-t * 14) * 0.4
    return sosfilt(bp, rng.standard_normal(len(t))) * env
def bass(freq, len_s):
    t = np.arange(int(len_s * SR)) / SR
    s = np.sign(np.sin(2 * np.pi * freq * t)) * 0.35 + np.sin(2 * np.pi * freq * t)
    lp = butter(2, 400, "lp", fs=SR, output="sos")
    return sosfilt(lp, s) * np.minimum(1, t * 200) * np.exp(-t * 6)

roots = [55.0, 43.65, 65.41, 49.0]  # A F C G
k = 0
t = 0.0
while t < dur:
    bar = k // 4; pos = k % 4
    add(kick(), t, g=1.0)
    if pos in (1, 3): add(clap(), t, g=0.55)
    add(hat(), t + beat / 2, pan=0.3, g=0.35)
    add(hat(0.02), t + beat * 0.75, pan=-0.3, g=0.18)
    add(bass(roots[bar % 4], beat * 0.45), t + beat / 2, g=0.5)
    k += 1; t = k * beat

mix = np.stack([L, R], 1)
mix /= np.abs(mix).max() / 0.89
wavfile.write(out, SR, (mix * 32767).astype(np.int16))
print("ok", out, dur)
