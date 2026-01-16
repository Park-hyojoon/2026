import os
import json
import re

# Configuration
DATA_DIR = r"d:\00. WorkSpace\02. Creat\01. Antigravity\2026\05. AccountingGame\00.Data"
OUTPUT_FILE = r"d:\00. WorkSpace\02. Creat\01. Antigravity\2026\05. AccountingGame\questions_converted.js"

def parse_files():
    all_questions = []
    
    # List all txt files
    files = [f for f in os.listdir(DATA_DIR) if f.endswith('.txt')]
    print(f"Found {len(files)} data files.")

    question_id_counter = 1

    for filename in files:
        filepath = os.path.join(DATA_DIR, filename)
        print(f"Processing: {filename}")
        
        try:
            with open(filepath, 'r', encoding='utf-8') as f:
                content = f.read()
                
            # Basic cleaning
            lines = content.split('\n')
            
            # Simple State Machine for Parsing
            current_q = None
            
            for i, line in enumerate(lines):
                line = line.strip()
                if not line: continue
                
                # Detect Question Start (Number followed by text or "01", "02")
                # Looking for patterns like "01", "1.", "137:"
                if re.match(r'^(\d{1,3}[\.:\s]|0\d\s)', line):
                    # Save previous question if exists
                    if current_q and current_q.get('options') and current_q.get('answer'):
                        all_questions.append(current_q)
                    
                    # Start new question
                    current_q = {
                        "id": question_id_counter,
                        "type": "quiz", # Default type
                        "category": filename.replace(".txt", "").replace("RawData_", ""),
                        "question": line,
                        "options": [],
                        "answer": 1, # Default
                        "explanation": "해설 참조"
                    }
                    question_id_counter += 1
                    
                # Detect Options (①, ②, ③, ④ or (1), (2) etc.)
                elif current_q:
                    # Check for circle numbers or parentheses
                    if any(x in line for x in ['①', '②', '③', '④']) or re.match(r'^\(\d\)', line):
                        # Simple split by spacing or common delimiters could be hard due to OCR noise
                        # For now, treat the whole line as a potential option source
                        # If the line starts with an option indicator, add it
                        current_q['options'].append(line)
                        
                # Detect Answer/Explanation (Looking for [해설], [정답], or circle number at end)
                if current_q and ('해설' in line or '정답' in line):
                    current_q['explanation'] = line
                    # Try to find the answer number in this line
                    match = re.search(r'[①②③④]', line)
                    if match:
                         map_ans = {'①':1, '②':2, '③':3, '④':4}
                         current_q['answer'] = map_ans.get(match.group(), 1)


            # Append last question
            if current_q and current_q.get('options'):
                all_questions.append(current_q)

        except Exception as e:
            print(f"Error parsing {filename}: {e}")

    # Fallback if no questions found (to prevent empty game)
    if not all_questions:
        print("Warning: No questions parsed automatically. Using fallback data.")
        # ... (We will rely on existing data if this fails, but let's try to generate file)

    # Convert to JS file format (window.questions = [...])
    js_content = f"window.generatedQuestions = {json.dumps(all_questions, ensure_ascii=False, indent=2)};"
    
    with open(OUTPUT_FILE, 'w', encoding='utf-8') as f:
        f.write(js_content)
        
    print(f"Successfully generated {len(all_questions)} questions to {OUTPUT_FILE}")

if __name__ == "__main__":
    parse_files()
