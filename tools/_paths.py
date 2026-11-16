import sys
from pathlib import Path
ROOT = Path(__file__).resolve().parent.parent
if str(ROOT / "pipeline") not in sys.path: sys.path.insert(0, str(ROOT / "pipeline"))
