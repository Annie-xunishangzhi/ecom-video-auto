import json, sys
from pathlib import Path
import pytest
ROOT = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(ROOT / "pipeline")); sys.path.insert(0, str(ROOT / "tools"))

@pytest.fixture
def root(): return ROOT
@pytest.fixture
def fx(): return ROOT / "tests" / "fixtures"
@pytest.fixture
def topics(): return json.loads((ROOT / "data" / "topics.json").read_text(encoding="utf-8"))
@pytest.fixture
def topic4(topics): return next(t for t in topics if t["step"] == 4)
@pytest.fixture
def topic2(topics): return next(t for t in topics if t["step"] == 2)
