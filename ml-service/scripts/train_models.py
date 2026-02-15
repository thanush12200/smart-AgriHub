from pathlib import Path
import sys

ROOT = Path(__file__).resolve().parents[1]
if str(ROOT) not in sys.path:
    sys.path.insert(0, str(ROOT))

from app.training import train_and_save


if __name__ == "__main__":
    metadata = train_and_save(Path("models"))
    print(f"Training complete. Version: {metadata['version']} | Trained at: {metadata['trainedAt']}")
