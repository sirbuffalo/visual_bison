from re import search
import unicodedata
from json import load


operators_unprocessed = load(open('operators.json', 'r'))
operators = {
    operator['operator']: operation['name']
    for operation in operators_unprocessed
    if operation['operator_type'] == 'normal'
    for operator in operation['operators']
}


def detect_data(unstripped_text):
    text = unstripped_text.strip()
    try:
        return {
            'type': 'number',
            'value': float(text.strip())
        }
    except ValueError:
        pass
    try:
        return {
            'type': 'number',
            'value': unicodedata.numeric(text.strip())
        }
    except (ValueError, TypeError):
        pass


def detect_operation(text):
    text = text.strip()
    if text in operators:
        return {
            'type': operators[text]
        }


def lexical_analysis_expression(unstripped_expression, line_num):
    expression = unstripped_expression.strip()
    for index in range(len(expression)):
        detected_data = detect_data(expression[:index + 1])
        if detected_data:
            for index2 in range(index + 1, len(expression) + 1):
                detected_operation = detect_operation(expression[index + 1:index2])
                if detected_operation:
                    other_analysed, err = lexical_analysis_expression(expression[index2:], line_num)
                    if other_analysed is not None and not err:
                        return [detected_data, detected_operation] + other_analysed, False
            else:
                if index == len(expression) - 1:
                    return [detected_data], False
    return {
        'type': 'error',
        'error_type': 'syntax error',
        'line_num': line_num,
        'message': 'Invalid found'
    }, True


def lexical_analysis(code):
    lexical_analyzed = []
    for line_num, line in enumerate(code.split('\n')):
        # lexical_analyzed.append([])
        line = line.strip()
        if line == '':
            continue
        index = 0
        while index < len(line):
            for index_end in range(len(line), index, -1):
                segment = line[index:index_end]
                if search(r'^ *log *\($', segment):
                    index_new = index_end
                    for index_end in range(len(line), index_new, -1):
                        segment = line[index_new:index_end]
                        if segment[-1] != ')':
                            continue
                        lexical_analyzed_expression = lexical_analysis_expression(segment[:-1], line_num)
                        if lexical_analyzed_expression:
                            lexical_analyzed.append({
                                'type': 'log',
                                'value': lexical_analyzed_expression
                            })
                            index = index_end
                            break
                    else:
                        return {
                            'type': 'error',
                            'error_type': 'syntax error',
                            'line_num': line_num,
                            'text': 'invalid syntax'
                        }, True
                    break
            else:
                return {
                    'type': 'error',
                    'error_type': 'syntax error',
                    'line_num': line_num,
                    'text': 'invalid syntax'
                }, True

    return lexical_analyzed, False
