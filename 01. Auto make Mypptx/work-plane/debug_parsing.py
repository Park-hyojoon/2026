
import re

def parse_song_numbers_old(input_text):
    """
    Original parsing logic for comparison
    """
    numbers = []
    input_text = input_text.strip()
    parts = [p.strip() for p in input_text.split(',')]
    for part in parts:
        if '-' in part:
            try:
                start, end = part.split('-')
                start = int(start.strip())
                end = int(end.strip())
                numbers.extend(range(start, end + 1))
            except:
                pass
        else:
            try:
                numbers.append(int(part))
            except:
                pass
    return numbers

def parse_song_numbers_new(input_text):
    """
    New robust parsing logic
    """
    numbers = []
    if not input_text or "예:" in input_text:
        return []
    
    # Pre-processing: simple cleaning
    cleaned = input_text.replace('(', ',').replace(')', ',').replace('[', ',').replace(']', ',')
    
    # Split by comma first to respect ranges
    parts = [p.strip() for p in cleaned.split(',')]
    
    for part in parts:
        if not part: continue
        
        # Check for range pattern "number - number"
        range_match = re.search(r'(\d+)\s*-\s*(\d+)', part)
        if range_match:
            try:
                start = int(range_match.group(1))
                end = int(range_match.group(2))
                if start <= end:
                    numbers.extend(range(start, end + 1))
                continue
            except:
                pass
        
        # If not a range, extract all numbers found
        found_nums = re.findall(r'\d+', part)
        for num_str in found_nums:
            numbers.append(int(num_str))
            
    return numbers

def test(input_str):
    print(f"Input: '{input_str}'")
    print(f"Old: {parse_song_numbers_old(input_str)}")
    print(f"New: {parse_song_numbers_new(input_str)}")
    print("-" * 20)

if __name__ == "__main__":
    test("3( 436, 204, 288)")
    test("28-30")
    test("28, 29, 30")
    test("예: 28, 29")
    test("10 20 30") 
    test("436, 204, 288")
