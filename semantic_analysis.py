from json import load


operators_unprocessed = load(open('operators.json', 'r'))
step_dict = {
    step: [
        item
        for item in operators_unprocessed
        if item['step'] == step
    ]
    for step in set(
        item['step'] for item in operators_unprocessed
    )
}

operators = [
    step_dict[step]
    for step in sorted(step_dict)
]

operators_dict = {
    operator['name']: operator
    for operator in operators_unprocessed
}

operators_to_search = [
    [
        {
            'type': operation['name']
        }
        for operation in step
    ]
    for step in operators
]

def process_data(data):
    if data['type'] in ['add', 'subtract', 'multiply', 'divide']:
        return data
    if data['type'] == 'number':
        return data

def semantic_analysis_expression(lexical_analyzed_expression, line_num):
    if len(lexical_analyzed_expression) == 1:
        return process_data(lexical_analyzed_expression[0]), False
    semantic_analyzed_expression = lexical_analyzed_expression

    while True:
        index = None
        for items in operators_to_search:
            indexes = [semantic_analyzed_expression.index(item) for item in items if item in semantic_analyzed_expression]
            if len(indexes) > 0:
                index = min(indexes)
                break
        else:
            break

        if index < 0:
            return {
                'type': 'error',
                'error_type': 'syntax error',
                'line_num': line_num,
                'text': 'invalid syntax'
            }, True
        if index >= len(semantic_analyzed_expression):
            return {
                'type': 'error',
                'error_type': 'syntax error',
                'line_num': line_num,
                'text': 'invalid syntax'
            }, True
        if operators_dict[semantic_analyzed_expression[index]['type']]['operator_type'] == 'normal':
            if index < 1:
                return {
                    'type': 'error',
                    'error_type': 'syntax error',
                    'line_num': line_num,
                    'text': 'invalid syntax'
                }, True
            if index > len(semantic_analyzed_expression) - 2:
                return {
                    'type': 'error',
                    'error_type': 'syntax error',
                    'line_num': line_num,
                    'text': 'invalid syntax'
                }, True
            semantic_analyzed_expression[index - 1:index + 2] = [
                {
                    'type': semantic_analyzed_expression[index]['type'],
                    'value1': process_data(semantic_analyzed_expression[index - 1]),
                    'value2': process_data(semantic_analyzed_expression[index + 1])
                }
            ]
    return semantic_analyzed_expression[0], False


def semantic_analysis(lexical_analyzed):
    semantic_analyzed = []
    for command in lexical_analyzed:
        if command['type'] == 'log':
            pass