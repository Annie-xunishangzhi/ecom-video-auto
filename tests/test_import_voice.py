import sys
from pathlib import Path
import numpy as np
sys.path.insert(0, str(Path(__file__).resolve().parents[1] / "tools"))
from import_voice import squeeze
from audio import SR

def test_long_pause_is_squeezed_to_max_gap():
    tone = 0.5 * np.sin(np.arange(SR) / 10)
    x = np.concatenate([tone, np.zeros(SR * 2), tone])
    y = squeeze(x, 0.3)
    assert abs(len(y) - (2 * SR + 0.3 * SR)) < 0.02 * SR

def test_short_pause_kept():
    tone = 0.5 * np.sin(np.arange(SR) / 10)
    x = np.concatenate([tone, np.zeros(int(SR * 0.2)), tone])
    assert len(squeeze(x, 0.3)) == len(x)
