from flask import Flask, render_template, request
from waitress import serve

app = Flask(__name__)

@app.route('/')
@app.route('/index')
def index():
    return "Hello World"


if __name__ == "__main__":
    serve(app, host="0.0.0.0", port=8000) # running on localhost, port 8000