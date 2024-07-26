from flask import Flask, render_template, request, redirect, url_for, send_file
import os.path as path

app = Flask(__name__)
@app.route('/run')
def run():
    return render_template('run.html', projectTitle='test')

@app.route('/app.ts')
def run_js():
    return send_file(path.abspath('scripts/app.ts'), download_name='app.ts')

@app.route('/run.css')
def run_css():
    return send_file(path.abspath('styles/run.css'), download_name='run.css')

if __name__ == '__main__':
    app.run(debug=False, port=3000)