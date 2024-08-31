import unicodedata
from json import load
import re

indent = '    '
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

    for start_end_index in range(1, len(text) - 1):
        if text[start_end_index:start_end_index + 3] == '...':
            start_str = text[:start_end_index]
            start, err = lexical_analysis_expression(start_str, 0)
            if not err:
                end_str = text[start_end_index + 3:]
                end, err = lexical_analysis_expression(end_str, 0)
                if not err:
                    return {
                        'type': 'range',
                        'start': start,
                        'end': end
                    }

    # Variables
    if valid_varname(text):
        return {
            'type': 'var_get',
            'name': text
        }

    # Functions
    processed_function_call = process_function_call(text)
    if processed_function_call is not None:
        return processed_function_call

    # Parentheses

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
        'error_type': 'syntax_error',
        'line_num': line_num,
        'message': 'invalid syntax'
    }, True


def lexical_analysis(code):
    lexical_analyzed = []
    add_tos = [lexical_analyzed]
    for line_num, line in enumerate(code.split('\n'), 1):

        line_without_indent = line
        indents = 0
        for i in range(4, len(line), len(indent)):
            if line[i - 4:i] == indent:
                line_without_indent = line[i:]
                indents += 1
            else:
                break

        line = line_without_indent.strip()
        if line == '':
            continue
        del add_tos[indents + 1:]
        if indents >= len(add_tos):
            return {
                'type': 'error',
                'error_type': 'indent_error',
                'line_num': line_num,
                'message': 'too many indents'
            }, True

        # Comments
        in_double_string = False
        in_single_string = False
        escaped = False
        line_without_comments = ''
        for char in line:
            if escaped:
                escaped = False
                line_without_comments += char
            elif char == '"' and not in_single_string:
                in_double_string = not in_double_string
                line_without_comments += char
            elif char == '\'' and not in_double_string:
                in_single_string = not in_single_string
                line_without_comments += char
            elif char == '\\' and (in_single_string or in_double_string):
                escaped = True
                line_without_comments += char
            elif char == '#' and not in_single_string and not in_double_string:
                break
            line_without_comments += char
        line = line_without_comments.rstrip()

        # Blank Line
        if line == '':
            continue

        # Variable Set
        for i in range(1, len(line) - 1):
            if valid_varname(line[:i]):
                if line[i:].lstrip().startswith('='):
                    lexical_analyzed_expression, err = lexical_analysis_expression(line[i:].lstrip()[1:], line_num)
                    if not err:
                        add_tos[indents].append({
                            'type': 'var_set',
                            'name': line[:i].strip(),
                            'value': lexical_analyzed_expression,
                            'line_num': line_num,
                        })
                        break
        else:

            # For Loop
            if line.startswith('for ') and line.endswith(':'):
                non_for = line[4:].lstrip()
                con = True
                for i in range(1, len(non_for) - 4):
                    if valid_varname(non_for[:i]):
                        var_name = non_for[:i]
                        non_for_var = non_for[i:].lstrip()
                        if non_for_var.startswith('in '):
                            expr = non_for_var[3:-1]
                            list_to_loop_through, err = lexical_analysis_expression(expr, line_num)
                            if not err:
                                code_to_run = []
                                add_tos[indents].append({
                                    'type': 'for',
                                    'line_num': line_num,
                                    'var_name': var_name,
                                    'list': list_to_loop_through,
                                    'code': code_to_run,
                                })
                                add_tos.append(code_to_run)
                                break
                else:
                    con = False
                if con:
                    continue

            # Function Call
            processed_function_call = process_function_call(line)
            if processed_function_call is not None:
                processed_function_call.update({'line_num': line_num})
                add_tos[indents].append(processed_function_call)
                continue

            # Error if no types recognised
            return {
                'type': 'error',
                'error_type': 'syntax_error',
                'line_num': line_num,
                'message': 'invalid syntax'
            }, True

    return lexical_analyzed, False
