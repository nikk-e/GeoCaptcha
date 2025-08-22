from pathlib import Path
import pandas as pd

def get_captcha():
    df = pd.read_csv(Path(__file__).parent.parent.resolve() / "database.txt")
    return df.iloc[0]

def check_captcha(id, answer) -> bool:
    df = pd.read_csv(Path(__file__).parent.parent.resolve() / "database.txt")
    return df.loc[df["id"] == id, "captcha"].eq(answer).any()

if __name__ == "__main__":
    print(get_captcha())
    print(f"Should be true: {check_captcha(1,'bruh-face')}")
    print(f"Should be false: {check_captcha(1,'bruh')}")