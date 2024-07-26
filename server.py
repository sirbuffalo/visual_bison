from flask import Flask, render_template, request, redirect, url_for, send_file
from os.path import abspath
from json import dumps


app = Flask(__name__, template_folder=abspath('./client'))
@app.route('/run')
def run():
    code = [
        {
            'type': 'var_set',
            'name': 'x',
            'value': {
                'type': 'number',
                'value': 3.0
            },
            'line_num': 1
        },
        {
            'type': 'function_call',
            'name': 'log',
            'args': [
                {
                    'type': 'var_get',
                    'name': 'x'
                }
            ],
            'line_num': 3
        }
    ]
    return render_template('index.html', code=dumps(code))


@app.route('/run.js')
def run_js():
    return send_file(abspath('client/run.js'), download_name='run.js')

@app.route('/run.css')
def run_css():
    return send_file(abspath('client/run.css'), download_name='run.css')


if __name__ == '__main__':
    app.run(debug=False, port=3000)