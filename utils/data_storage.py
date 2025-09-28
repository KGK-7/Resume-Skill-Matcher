import json
import os

def save_result(data, filename="results.json"):
    filepath = os.path.join("utils", filename)
    try:
        with open(filepath, "a") as f:
            json.dump(data, f)
            f.write("\n")
        return True
    except Exception as e:
        print(f"Error saving data: {e}")
        return False
