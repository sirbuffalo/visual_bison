def add(a, b, line_num):
    if not isinstance(a, dict) or not isinstance(b, dict):
        return {
            'type': 'error',
            'error_type': 'unexpected error',
            'line_num': line_num,
            'text': 'unexpected error during addition'
        }, True
    if 'type' not in a or 'type' not in b:
        return {
            'type': 'error',
            'error_type': 'unexpected error',
            'line_num': line_num,
            'text': 'unexpected error during addition'
        }, True
    if a['type'] != 'number' or b['type'] != 'number':
        return {
            'type': 'error',
            'error_type': 'type error',
            'line_num': line_num,
            'text': 'addition only works on numbers'
        }, True
    if 'value' not in a or 'value' not in b:
        return {
            'type': 'error',
            'error_type': 'unexpected error',
            'line_num': line_num,
            'text': 'unexpected error during addition'
        }, True
    if isinstance(a['value'], (int, float)) and isinstance(b['value'], (int, float)):
        return {
            'type': 'number',
            'value': a['value'] + b['value']
        }
    else:
        return {
            'type': 'error',
            'error_type': 'unexpected error',
            'line_num': line_num,
            'text': 'unexpected error during addition'
        }, True


def subtract(a, b, line_num):
    if not isinstance(a, dict) or not isinstance(b, dict):
        return {
            'type': 'error',
            'error_type': 'unexpected error',
            'line_num': line_num,
            'text': 'unexpected error during subtraction'
        }, True
    if 'type' not in a or 'type' not in b:
        return {
            'type': 'error',
            'error_type': 'unexpected error',
            'line_num': line_num,
            'text': 'unexpected error during subtraction'
        }, True
    if a['type'] != 'number' or b['type'] != 'number':
        return {
            'type': 'error',
            'error_type': 'type error',
            'line_num': line_num,
            'text': 'subtraction only works on numbers'
        }, True
    if 'value' not in a or 'value' not in b:
        return {
            'type': 'error',
            'error_type': 'unexpected error',
            'line_num': line_num,
            'text': 'unexpected error during subtraction'
        }, True
    if isinstance(a['value'], (int, float)) and isinstance(b['value'], (int, float)):
        return {
            'type': 'number',
            'value': a['value'] - b['value']
        }, False
    else:
        return {
            'type': 'error',
            'error_type': 'unexpected error',
            'line_num': line_num,
            'text': 'unexpected error during subtraction'
        }, True
