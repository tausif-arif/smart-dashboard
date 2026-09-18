from pathlib import Path

import pandas as pd
from sqlalchemy import create_engine


BASE_DIR = Path(__file__).resolve().parent
DATA_DIR = BASE_DIR / "Global+Electronics+Retailer"

DATABASE_URL = "postgresql+psycopg2://postgres:postgres@localhost:5432/smart_dashboard"

engine = create_engine(DATABASE_URL)


def ingest_csv(file_path: Path):
    table_name = file_path.stem.lower().replace(" ", "_")

    print(f"Loading {file_path.name}...")

    try:
        df = pd.read_csv(file_path)
    except UnicodeDecodeError:
        df = pd.read_csv(file_path, encoding="latin1")

    df.columns = (
        df.columns
        .str.strip()
        .str.lower()
        .str.replace(" ", "_")
        .str.replace("-", "_")
    )

    df.to_sql(
        table_name,
        engine,
        if_exists="replace",
        index=False,
        chunksize=5000,
        method="multi",
    )

    print(f"✓ {table_name}: {len(df):,} rows")


def main():
    csv_files = sorted(DATA_DIR.glob("*.csv"))

    if not csv_files:
        print(f"No CSV files found in {DATA_DIR}")
        return

    for csv_file in csv_files:
        try:
            ingest_csv(csv_file)
        except Exception as error:
            print(f"✗ Failed: {csv_file.name}")
            print(error)

    print("\nIngestion completed.")


if __name__ == "__main__":
    main()