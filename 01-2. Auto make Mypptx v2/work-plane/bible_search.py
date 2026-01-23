"""
Bible Search Module
Fetches Bible verses from www.bskorea.or.kr
"""

import re
import requests
from bs4 import BeautifulSoup

# Mapping of Korean abbreviations to book codes
BOOK_MAPPING = {
    # 구약 (Old Testament)
    "창": "gen", "창세기": "gen",
    "출": "exo", "출애굽기": "exo",
    "레": "lev", "레위기": "lev",
    "민": "num", "민수기": "num",
    "신": "deu", "신명기": "deu",
    "수": "jos", "여호수아": "jos",
    "삿": "jdg", "사사기": "jdg",
    "룻": "rut", "룻기": "rut",
    "삼상": "1sa", "사무엘상": "1sa",
    "삼하": "2sa", "사무엘하": "2sa",
    "왕상": "1ki", "열왕기상": "1ki",
    "왕하": "2ki", "열왕기하": "2ki",
    "대상": "1ch", "역대상": "1ch",
    "대하": "2ch", "역대하": "2ch",
    "스": "ezr", "에스라": "ezr",
    "느": "neh", "느헤미야": "neh",
    "에": "est", "에스더": "est",
    "욥": "job", "욥기": "job",
    "시": "psa", "시편": "psa",
    "잠": "pro", "잠언": "pro",
    "전": "ecc", "전도서": "ecc",
    "아": "sng", "아가": "sng",
    "사": "isa", "이사야": "isa",
    "렘": "jer", "예레미야": "jer",
    "애": "lam", "예레미야애가": "lam",
    "겔": "ezk", "에스겔": "ezk",
    "단": "dan", "다니엘": "dan",
    "호": "hos", "호세아": "hos",
    "욜": "jol", "요엘": "jol",
    "암": "amo", "아모스": "amo",
    "옵": "oba", "오바댜": "oba",
    "욘": "jnh", "요나": "jnh",
    "미": "mic", "미가": "mic",
    "나": "nam", "나훔": "nam",
    "합": "hab", "하박국": "hab",
    "습": "zep", "스바냐": "zep",
    "학": "hag", "학개": "hag",
    "슥": "zec", "스가랴": "zec",
    "말": "mal", "말라기": "mal",

    # 신약 (New Testament)
    "마": "mat", "마태복음": "mat",
    "막": "mrk", "마가복음": "mrk",
    "눅": "luk", "누가복음": "luk",
    "요": "jhn", "요한복음": "jhn",
    "행": "act", "사도행전": "act",
    "롬": "rom", "로마서": "rom",
    "고전": "1co", "고린도전서": "1co",
    "고후": "2co", "고린도후서": "2co",
    "갈": "gal", "갈라디아서": "gal",
    "엡": "eph", "에베소서": "eph",
    "빌": "phi", "빌립보서": "phi",
    "골": "col", "골로새서": "col",
    "살전": "1th", "데살로니가전서": "1th",
    "살후": "2th", "데살로니가후서": "2th",
    "딤전": "1ti", "디모데전서": "1ti",
    "딤후": "2ti", "디모데후서": "2ti",
    "딛": "tit", "디도서": "tit",
    "몬": "phm", "빌레몬서": "phm",
    "히": "heb", "히브리서": "heb",
    "약": "jas", "야고보서": "jas",
    "벧전": "1pe", "베드로전서": "1pe",
    "벧후": "2pe", "베드로후서": "2pe",
    "요일": "1jn", "요한1서": "1jn",
    "요이": "2jn", "요한2서": "2jn",
    "요삼": "3jn", "요한3서": "3jn",
    "유": "jud", "유다서": "jud",
    "계": "rev", "요한계시록": "rev",
}

# Mapping of book codes to full Korean names
BOOK_FULL_NAMES = {
    # 구약
    "gen": "창세기", "exo": "출애굽기", "lev": "레위기", "num": "민수기", "deu": "신명기",
    "jos": "여호수아", "jdg": "사사기", "rut": "룻기", "1sa": "사무엘상", "2sa": "사무엘하",
    "1ki": "열왕기상", "2ki": "열왕기하", "1ch": "역대상", "2ch": "역대하",
    "ezr": "에스라", "neh": "느헤미야", "est": "에스더", "job": "욥기", "psa": "시편",
    "pro": "잠언", "ecc": "전도서", "sng": "아가", "isa": "이사야", "jer": "예레미야",
    "lam": "예레미야애가", "ezk": "에스겔", "dan": "다니엘", "hos": "호세아", "jol": "요엘",
    "amo": "아모스", "oba": "오바댜", "jnh": "요나", "mic": "미가", "nam": "나훔",
    "hab": "하박국", "zep": "스바냐", "hag": "학개", "zec": "스가랴", "mal": "말라기",
    # 신약
    "mat": "마태복음", "mrk": "마가복음", "luk": "누가복음", "jhn": "요한복음", "act": "사도행전",
    "rom": "로마서", "1co": "고린도전서", "2co": "고린도후서", "gal": "갈라디아서",
    "eph": "에베소서", "phi": "빌립보서", "col": "골로새서", "1th": "데살로니가전서",
    "2th": "데살로니가후서", "1ti": "디모데전서", "2ti": "디모데후서", "tit": "디도서",
    "phm": "빌레몬서", "heb": "히브리서", "jas": "야고보서", "1pe": "베드로전서",
    "2pe": "베드로후서", "1jn": "요한1서", "2jn": "요한2서", "3jn": "요한3서",
    "jud": "유다서", "rev": "요한계시록",
}


def parse_bible_reference(text):
    """
    Parse Bible reference like "창 1:5" or "창 1:5-10"
    Returns: (book_code, chapter, start_verse, end_verse) or None
    """
    # Pattern: 책 장:절 or 책 장:절-절
    pattern = r'([가-힣]+)\s*(\d+):(\d+)(?:-(\d+))?'
    match = re.match(pattern, text.strip())

    if not match:
        return None

    book_abbr = match.group(1)
    chapter = match.group(2)
    start_verse = match.group(3)
    end_verse = match.group(4) if match.group(4) else start_verse

    # Map book abbreviation to code
    book_code = BOOK_MAPPING.get(book_abbr)
    if not book_code:
        return None

    return book_code, chapter, start_verse, end_verse


def fetch_bible_verse(book_code, chapter, start_verse, end_verse=None):
    """
    Fetch Bible verse(s) from bskorea.or.kr
    Returns: (verse_text, formatted_reference) or (error_message, None)
    """
    if end_verse is None:
        end_verse = start_verse

    url = "https://www.bskorea.or.kr/bible/korbibReadpage.php"
    params = {
        "version": "GAE",  # 개역개정
        "book": book_code,
        "chap": chapter,
        "sec": start_verse
    }

    try:
        response = requests.get(url, params=params, timeout=10)
        response.raise_for_status()
        response.encoding = 'utf-8'

        soup = BeautifulSoup(response.text, 'html.parser')

        # Find the main Bible content - it's a DIV, not TD!
        bible_content = soup.find('div', id='tdBible1')
        if not bible_content:
            return "오류: 성경 본문을 찾을 수 없습니다."

        # Find all verse spans
        verses = []
        start = int(start_verse)
        end = int(end_verse)

        # Each verse is in a <span> tag containing <span class="number">
        for span in bible_content.find_all('span', recursive=False):
            # Find verse number
            number_span = span.find('span', class_='number')
            if number_span:
                # Extract verse number (remove &nbsp; and whitespace)
                verse_num_text = number_span.get_text(strip=True)
                try:
                    verse_num = int(verse_num_text)
                except ValueError:
                    continue

                # Check if this verse is in our range
                if start <= verse_num <= end:
                    # Get the verse text (everything after the number span)
                    # Clone the span to remove the number_span
                    verse_text = span.get_text(separator=' ', strip=True)
                    # Remove the verse number from the beginning
                    verse_text = verse_text.replace(verse_num_text, '', 1).strip()

                    # Clean up footnote markers like 1), 2), etc.
                    verse_text = re.sub(r'\d+\)', '', verse_text)

                    verses.append(f"{verse_num}. {verse_text}")

        if verses:
            # Join verses with " / " instead of newline
            verses_text = ' / '.join(verses)

            # Create formatted reference like "창세기 1장 1~5절"
            book_full_name = BOOK_FULL_NAMES.get(book_code, "")
            if start_verse == end_verse:
                formatted_ref = f"{book_full_name} {chapter}장 {start_verse}절"
            else:
                formatted_ref = f"{book_full_name} {chapter}장 {start_verse}~{end_verse}절"

            return (verses_text, formatted_ref)
        else:
            return ("오류: 요청한 구절을 찾을 수 없습니다.", None)

    except requests.RequestException as e:
        return (f"오류: 네트워크 연결 실패 - {str(e)}", None)
    except Exception as e:
        return (f"오류: {str(e)}", None)


def search_and_get_verse(text):
    """
    Main function: parse input and fetch verse
    Example: search_and_get_verse("창 1:5") or search_and_get_verse("시 23:1-6")
    Returns: (verse_text, formatted_reference) or (error_message, None)
    """
    parsed = parse_bible_reference(text)

    if not parsed:
        return ("오류: 올바른 형식으로 입력해주세요. (예: 창 1:5 또는 시 23:1-6)", None)

    book_code, chapter, start_verse, end_verse = parsed
    return fetch_bible_verse(book_code, chapter, start_verse, end_verse)


if __name__ == "__main__":
    # Test
    print("테스트: 창 1:5")
    verse_text, formatted_ref = search_and_get_verse("창 1:5")
    print(f"Reference: {formatted_ref}")
    print(f"Verse: {verse_text}")
    print()

    print("테스트: 시 23:1-3")
    verse_text, formatted_ref = search_and_get_verse("시 23:1-3")
    print(f"Reference: {formatted_ref}")
    print(f"Verse: {verse_text}")
