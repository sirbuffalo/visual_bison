from re import search


def detect_data(text):
    if text.strip()


def detect_operation(text):
    if text.strip() == '+':
        return {
            'type': 'add'
        }
    elif text.strip() == '-':
        return {
            'type': 'subtract'
        }
    elif text.strip() == '*':
        return {
            'type': 'multiply'
        }
    elif text.strip() == '/':
        return {
            'type': 'divide'
        }
    return None

def lexical_analysis_expression(expression, line_num):
    lexical_analyzed_expression = []
    index = 0
    while index < len(expression):


def lexical_analysis(code):
    lexical_analyzed = []
    for line_num, line in enumerate(code.split('\n')):
        lexical_analyzed.append([])
        line = line.strip()
        if line == '':
            continue
        segment = ''
        for char in line:
            segment += char
            if search(r'^ *log *\($', segment):
                lexical_analyzed[-1].append({
                    'type': 'log'
                })
                lexical_analyzed[-1].append({
                    'type': 'open par'
                })
                segment = ''
    return lexical_analyzed


print(lexical_analysis('''
log(
'''))
