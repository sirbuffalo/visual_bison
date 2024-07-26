import unicodedata
from json import load
import re


operators_unprocessed = load(open('operators.json', 'r'))
operators = {
    operator['operator']: operation['name']
    for operation in operators_unprocessed
    if operation['operator_type'] == 'normal'
    for operator in operation['operators']
}


def valid_varname(text):
    return bool(re.search('^[A-Za-z_][A-Za-z0-9_]*$', text))

def process_args(text):
    for i in range(len(text), 0, -1):
        analysis, err = lexical_analysis_expression(text[:i], 0)
        if err:
            continue
        if len(text[i:].strip()) == 0:
            return [analysis]
        if text[i] != ',':
            continue
        rest_of_args = process_args(text[i + 1:])
        if rest_of_args is not None:
            return [analysis] + rest_of_args
    return None

def process_function_call(text):
    if text.endswith(')'):
        for i in range(1, len(text) - 2):
            if valid_varname(text[:i].strip()):
                if text[i:].lstrip().startswith('('):
                    processed_args = process_args(text[i + 1:-1])
                    if processed_args is not None:
                        return {
                            'type': 'function_call',
                            'name': text[:i].strip(),
                            'args': processed_args,
                        }
    return None


def detect_data(unstripped_text):
    text = unstripped_text.strip()

    # Numbers
    try:
        return {
            'type': 'number',
            'value': float(text.strip())
        }
    except ValueError:
        pass

    # Vulgar Fractions
    try:
        return {
            'type': 'number',
            'value': unicodedata.numeric(text.strip())
        }
    except (ValueError, TypeError):
        pass

    # Variables
    if valid_varname(text):
        return {
            'type': 'var_get',
            'name': text
        }
    processed_function_call = process_function_call(text)
    if processed_function_call is not None:
        return processed_function_call
    return None


def detect_operation(text):
    text = text.strip()
    if text in operators:
        return {
            'type': operators[text]
        }


def lexical_analysis_expression(unstripped_expression, line_num):
    expression = unstripped_expression.strip()
    for index in range(len(expression)):
        # Detecting Data
        detected_data = detect_data(expression[:index + 1])
        # Checking if Data Is Valid
        if detected_data is not None:
            for index2 in range(index + 1, len(expression) + 1):
                # Detecting Operation
                detected_operation = detect_operation(expression[index + 1:index2])
                # Checking if Operation is Valid
                if detected_operation:
                    # Analysing Rest of Expression with recursion
                    other_analysed, err = lexical_analysis_expression(expression[index2:], line_num)
                    if other_analysed is not None and not err:
                        # Checking if valid
                        return [detected_data, detected_operation] + other_analysed, False
            else:
                # Just data no math
                if index == len(expression) - 1:
                    return [detected_data], False
    # No Expression Found
    return {
        'type': 'error',
        'error_type': 'syntax error',
        'line_num': line_num,
        'message': 'Invalid found'
    }, True


def lexical_analysis(code):
    lexical_analyzed = []
    for line_num, line in enumerate(code.split('\n')):
        line = line.strip()
        
        # Blank Line
        if line == '':
            continue

        # Variable Set
        for i in range(1, len(line) - 1):
            if valid_varname(line[:i]):
                if line[i:].lstrip().startswith('='):
                    print(line[i:].lstrip()[1:].lstrip())
                    lexical_analyzed_expression, err = lexical_analysis_expression(line[i:].lstrip()[1:], line_num)
                    print(lexical_analyzed_expression)
                    print(err)
                    if not err:
                        lexical_analyzed.append({
                            'type': 'var_set',
                            'name': line[:i].strip(),
                            'value': lexical_analyzed_expression,
                            'line_num': line_num,
                        })
                        break
        else:

            # Function Call
            processed_function_call = process_function_call(line)
            if processed_function_call is not None:
                processed_function_call.update({'line_num': line_num})
                lexical_analyzed.append(processed_function_call)
                continue

            # Error if no types recognised
            return {
                'type': 'error',
                'error_type': 'syntax error',
                'line_num': line_num,
                'message': 'Invalid syntax error'
            }, True

    return lexical_analyzed, False
