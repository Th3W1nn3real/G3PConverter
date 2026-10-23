# Makes the project root importable when pytest is invoked as a plain
# console script (which does not add the current directory to sys.path).
from pathlib import Path
import sys

ROOT = Path(__file__).resolve().parent
if str(ROOT) not in sys.path:
    sys.path.insert(0, str(ROOT))
