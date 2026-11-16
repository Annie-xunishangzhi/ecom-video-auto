import numpy as np
from audio import write_wav, read_wav, SR
def tone(freq, seconds, amp=0.5, sr=SR):
    t = np.arange(int(seconds*sr))/sr; return (amp*np.sin(2*np.pi*freq*t)).astype(np.float32)
def band_level(x, freq, sr=SR):
    """x 在 freq 附近的幅度"""
    X = np.abs(np.fft.rfft(x*np.hanning(len(x)))); f = np.fft.rfftfreq(len(x), 1/sr)
    return float(X[(f>freq-15)&(f<freq+15)].max())
