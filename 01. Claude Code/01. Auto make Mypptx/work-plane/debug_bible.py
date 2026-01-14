"""
Debug script to check Bible website HTML structure
"""

import sys
import io
import requests
from bs4 import BeautifulSoup

# Force UTF-8 output
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')

url = "https://www.bskorea.or.kr/bible/korbibReadpage.php"
params = {
    "version": "GAE",
    "book": "gen",
    "chap": "1",
    "sec": "5"
}

try:
    response = requests.get(url, params=params, timeout=10)
    response.encoding = 'utf-8'
    print(f"Status Code: {response.status_code}")
    print(f"URL: {response.url}")
    print("\n" + "="*80)

    soup = BeautifulSoup(response.text, 'html.parser')

    # Try different selectors
    print("\n1. Looking for tdBible1:")
    td1 = soup.find('td', id='tdBible1')
    if td1:
        print(f"Found tdBible1!")
        print(f"Content preview: {td1.get_text()[:500]}")
    else:
        print("tdBible1 not found")

    print("\n2. Looking for leftCont:")
    left = soup.find(class_='leftCont')
    if left:
        print(f"Found leftCont!")
        try:
            text = left.get_text()[:500]
            print(f"Content preview (len={len(left.get_text())}): {text}")
        except:
            print("Content preview: [encoding issue]")
    else:
        print("leftCont not found")

    print("\n3. All elements with 'bible' in id (case insensitive):")
    for elem in soup.find_all(id=True):
        if 'bible' in elem.get('id', '').lower():
            print(f"  - {elem.name} with id='{elem.get('id')}'")

    print("\n4. Save full HTML to file for inspection:")
    with open("bible_page.html", "w", encoding="utf-8") as f:
        f.write(response.text)
    print("Saved to bible_page.html")

except Exception as e:
    print(f"Error: {e}")
