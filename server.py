from flask import Flask, render_template, request, redirect, url_for, send_file, jsonify, json
from os.path import abspath
from lexical_analysis import lexical_analysis
from semantic_analysis import semantic_analysis

app = Flask(__name__, template_folder=abspath('./client'))


@app.route('/run')
def run():
    return render_template('index.html')


@app.route('/parsed.json')
def parsed():
    return app.response_class(
        response=json.dumps([
            {
                "type": "var_set",
                "name": "x",
                "value": {
                    "type": "number",
                    "value": 3.0
                },
                "line_num": 1
            },
            {
                "type": "function_call",
                "name": "log",
                "args": [
                    {
                        "type": "var_get",
                        "name": "x"
                    }
                ],
                "line_num": 2
            }
        ]),
        status=200,
        mimetype='application/json'
    )


@app.route('/run.js')
def run_js():
    return send_file(abspath('client/run.js'), download_name='run.js')


@app.route('/run.css')
def run_css():
    return send_file(abspath('client/run.css'), download_name='run.css')


@app.route('/edit')
def edit():
    return render_template('edit/edit.html')

@app.post('/parse')
def parse():
    data = request.get_json()
    code = data.get('code')
    lexical_analyzed, error_lexical_analysis = lexical_analysis(code)
    if error_lexical_analysis:
        return app.response_class(
            response=json.dumps({
                'parsed': lexical_analyzed,
                'error': True
            }),
            status=200,
            mimetype='application/json'
        )
    else:
        semantic_analyzed, error_semantic_analysis = semantic_analysis(lexical_analyzed)
        return app.response_class(
            response=json.dumps({
                'parsed': semantic_analyzed,
                'error': error_semantic_analysis
            }),
            status=200,
            mimetype='application/json'
        )


@app.post('/edit.json')
def edit_data():
    return app.response_class(
        response=json.dumps({
            'code': '''x = 3\nlog(x)\n''',
            'events': [
                ('Start', True, True),
                ('Click', False, False)
            ],
            'projectTitle': 'Log 3'
        }),
        status=200,
        mimetype='application/json'
    )


@app.route('/edit.js')
def edit_js():
    return send_file(abspath('client/edit/edit.js'), download_name='edit.js')


@app.route('/edit.css')
def edit_css():
    return send_file(abspath('client/edit/edit.css'), download_name='edit.css')


@app.route('/exit.svg')
def exit_svg():
    return send_file(abspath('client/icons/exit.svg'), download_name='exit.svg')


@app.route('/run.svg')
def run_svg():
    return send_file(abspath('client/icons/run.svg'), download_name='run.svg')


@app.route('/run-hover.svg')
def run_hover_svg():
    return send_file(abspath('client/icons/run-hover.svg'), download_name='run-hover.svg')

@app.route('/console.svg')
def console_svg():
    return send_file(abspath('client/icons/console.svg'), download_name='console.svg')

@app.route('/console-hover.svg')
def console_hover_svg():
    return send_file(abspath('client/icons/console-hover.svg'), download_name='console-hover.svg')


if __name__ == '__main__':
    app.run(debug=False)
