import re
import datetime
import logging

# Set up logging configuration (to be used by the main app, but we define a basic handler here)
# The main GUI application should configure the file handler to point to 'error_log.md'
logger = logging.getLogger("MyPPT_Agent")

class StandardCommandParser:
    """
    Parses natural language commands based on the rules defined in 'action_guidelines.md'.
    Supports standard format:
    수요기도회
    예배전 찬양 : 434장, 449장
    본문 : 요 13:15
    제목 : 예수 닮아가기(2)
    설교후 찬송 : 289장
    """
    def __init__(self):
        # Flexible separator pattern: allow :, -, or space
        self.sep_pattern = r"[:\-\s]+"

    def parse(self, text):
        """
        Parses the full command text and returns a structured dictionary.
        """
        data = {
            "service_type": None,
            "hymns_before": [],     # List of strings (e.g., ["434", "449"])
            "bible_range": None,    # String (e.g., "요 13:15")
            "sermon_title": None,   # String
            "hymns_after": [],      # List of strings
            "target_date_str": None # String (YYYY-MM-DD format)
        }

        lines = text.strip().split('\n')
        
        # Iterate through lines to extract info
        current_section = None
        
        for line in lines:
            line = line.strip()
            if not line:
                continue

            # 1. Service Type Detection
            if "수요" in line:
                data["service_type"] = "Wednesday"
                continue
            elif "금요" in line:
                data["service_type"] = "Friday"
                continue
            
            # 2. Extract Data using Regex
            # Hymns Before Sermon (예배전 찬양)
            if re.search(r"예배전.*찬양", line):
                data["hymns_before"] = self._extract_hymns(line)
                continue

            # Bible Title for Display (성경 본문 : 시편 23장 1~3절)
            if re.search(r"성경.*본문", line):
                match = re.search(r"본문" + self.sep_pattern + r"(.*)", line)
                if match:
                    data["bible_range"] = match.group(1).strip() # Use this for display title
                continue

            # Bible Search Query (본문 검색 : 시 23:1-3)
            # If this exists, it overrides the search query but not necessarily the display title
            if re.search(r"본문.*검색", line):
                match = re.search(r"검색" + self.sep_pattern + r"(.*)", line)
                if match:
                    data["bible_search_query"] = match.group(1).strip()
                continue
                
            # Fallback for old "본문" only
            elif re.search(r"본문", line):
                match = re.search(r"본문" + self.sep_pattern + r"(.*)", line)
                if match and "bible_range" not in data:
                    data["bible_range"] = match.group(1).strip()
                    data["bible_search_query"] = match.group(1).strip() # Use same for search
                continue
            
            # Sermon Title (제목)
            if re.search(r"제목", line):
                match = re.search(r"제목" + self.sep_pattern + r"(.*)", line)
                if match:
                    # Remove quotes if present
                    raw_title = match.group(1).strip()
                    data["sermon_title"] = raw_title.strip('"').strip("'")
                continue
                
            # Hymns After Sermon (설교후 찬송/찬양 / 예배 후 찬양)
            if re.search(r"(설교후|예배\s*후).*찬[송양]", line):
                data["hymns_after"] = self._extract_hymns(line)
                continue

        # 3. Intelligence Rules (Date Calculation)
        if data["service_type"]:
            data["target_date_str"] = self._calculate_next_date(data["service_type"])
        else:
            # Default to Wednesday if not specified? Or handle error?
            # For now, let's log a warning but not set date, let UI handle it.
            logger.warning("Service type not explicit. Defaulting logic may apply in UI.")

        return data

    def _extract_hymns(self, line):
        """
        Extracts hymns from a line, supporting both numbers and natural language titles.
        Example 1: "예배전 찬양 : 434장, 449장" -> ["434", "449"]
        Example 2: "예배전 찬양 : 실로암, 28장, 승리하였네" -> ["실로암", "28", "승리하였네"]
        """
        # 1. Remove the header part (e.g., "예배전 찬양 :", "설교후 찬송")
        # Find the first separator and take everything after it
        match = re.search(self.sep_pattern, line)
        if match:
            # Start after the match
            content = line[match.end():]
        else:
            # Fallback: maybe no separator? Try to remove known keywords
            content = re.sub(r"(예배전|설교후|예배\s*후).*찬[송양]", "", line).strip()
            
        # 2. Split by comma
        raw_items = content.split(',')
        
        cleaned_items = []
        for item in raw_items:
            item = item.strip()
            if not item: continue
            
            # If it's pure number + '장', usually we extract just the number for consistency,
            # BUT for natural language search, "28장" might be better kept as "28" or "28장".
            # The GUI logic expects raw strings now and handles adding "새찬송가 ppt" if it's numeric.
            
            # Strategy: Keep "raw" but strip "장" if it is purely numeric "123장" -> "123"
            # so that GUI can decide to format it or not.
            # But "실로암" stays "실로암".
            
            # Check for "Number + 장" pattern
            num_match = re.fullmatch(r"(\d+)\s*장?", item)
            if num_match:
                cleaned_items.append(num_match.group(1))
            else:
                # Text title
                cleaned_items.append(item)
                
        return cleaned_items

    def _calculate_next_date(self, service_type):
        """
        Calculates the next Wednesday or Friday date.
        "Date Intelligence": Always targets the UPCOMING Wednesday/Friday.
        """
        today = datetime.date.today()
        
        if service_type == "Wednesday":
            target_weekday = 2 # Wednesday
        elif service_type == "Friday":
            target_weekday = 4 # Friday
        else:
            return None

        days_ahead = target_weekday - today.weekday()
        if days_ahead <= 0: # Target day already happened this week or is today
            days_ahead += 7
        
        next_date = today + datetime.timedelta(days_ahead)
        return next_date.strftime("%Y년 %m월 %d일")

if __name__ == "__main__":
    # Quick Test
    parser = StandardCommandParser()
    sample_text = """
    수요기도회
    예배전 찬양 : 434장, 449장
    본문 : 요 13:15
    제목 - 예수 닮아가기(2)
    설교후 찬송  289장
    """
    result = parser.parse(sample_text)
    print("Test Result:", result)
