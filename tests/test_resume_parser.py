from utils.resume_parser import clean_and_extract_keywords

def test_clean_and_extract_keywords():
    text = "Python, Flask, and SQL Developer"
    result = clean_and_extract_keywords(text)
    assert "python" in result
    assert "flask" in result
    assert "sql" in result
