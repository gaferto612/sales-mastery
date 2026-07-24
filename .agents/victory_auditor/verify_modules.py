import os
import re
import html
from bs4 import BeautifulSoup

MODULES_DIR = r"c:\Users\henri\Desktop\GitHub\sales-mastery"
REPORT_PATH = r"c:\Users\henri\Desktop\GitHub\sales-mastery\audit_report.md"

def get_module_data(mod_num):
    filename = f"module-{mod_num:02d}.html"
    filepath = os.path.join(MODULES_DIR, filename)
    if not os.path.exists(filepath):
        return None
    
    size_bytes = os.path.getsize(filepath)
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # Strip HTML tags to count body words
    soup = BeautifulSoup(content, 'html.parser')
    text = soup.get_text()
    words = re.findall(r'\b\w+\b', text)
    word_count = len(words)
    
    # Check for structural elements
    has_badge = bool(soup.find(class_=re.compile(r'badge|meta-strip|module-header|module-meta', re.I)) or re.search(r'class=["\'][^"\']*(badge|meta-strip)[^"\']*["\']', content, re.I))
    
    citations = len(re.findall(r'citation|doi:|journal|etal\.|peer-reviewed|academic', content, re.I))
    case_studies = len(re.findall(r'case-study|case study|clinical case|scenario', content, re.I))
    roleplays = len(re.findall(r'roleplay|verbatim|dialogue|script|rep:|prospect:', content, re.I))
    bio_states = len(re.findall(r'cortisol|dopamine|amygdala|polyvagal|autonomic|sympathetic|biological state|neurological', content, re.I))
    
    return {
        'filename': filename,
        'size_bytes': size_bytes,
        'word_count': word_count,
        'has_badge': has_badge,
        'citations_count': citations,
        'case_studies_count': case_studies,
        'roleplays_count': roleplays,
        'bio_states_count': bio_states,
    }

print("=== ACTUAL MODULE FILE DATA ===")
actual_data = {}
for i in range(1, 31):
    data = get_module_data(i)
    actual_data[i] = data
    print(f"Module {i:02d}: {data['size_bytes']} bytes, {data['word_count']} words, badge={data['has_badge']}, citations={data['citations_count']}, case_studies={data['case_studies_count']}, roleplays={data['roleplays_count']}, bio_states={data['bio_states_count']}")

# Read audit_report.md
with open(REPORT_PATH, 'r', encoding='utf-8') as f:
    report_text = f.read()

print("\n=== AUDIT REPORT CHECK ===")
print(f"Report total length: {len(report_text)} characters, {len(report_text.splitlines())} lines.")

# Check for placeholders
placeholders = re.findall(r'TODO|LOREM IPSUM|INSERT HERE|TBD|\[\.\.\.\]|\[PLACEHOLDER\]', report_text, re.I)
print(f"Placeholder instances found in report: {len(placeholders)}")

# Verify all 30 modules exist in report
module_sections = re.findall(r'### Module (\d\d):', report_text)
print(f"Module sections found in section 4: {len(module_sections)}")

# Check for specific structural element mentions in report
missing_elements = [
    'academic citation',
    'clinical case study',
    'verbatim roleplay',
    'biological state',
    'badge',
    'word count'
]

print("\n=== MISSING STRUCTURAL ELEMENTS MENTIONS ===")
for elem in missing_elements:
    matches = len(re.findall(re.escape(elem), report_text, re.I))
    print(f"'{elem}': {matches} occurrences")

