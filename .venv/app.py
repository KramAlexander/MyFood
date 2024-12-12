from flask import Flask, render_template, request
from waitress import serve
from flask_sqlalchemy import SQLAlchemy
from flask_restful import Resource, Api, reqparse, fields, marshal_with, abort

app = Flask(__name__)
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///database.db'
db = SQLAlchemy(app)
api = Api(app)

class UserModel(db.Model):
    id = db.Column(db.Integer,primary_key=True)
    name = db.Column(db.String(80),unique=True,nullable=False)
    email = db.Column(db.String(80),unique=True,nullable=False)

    def __repr__(self):
        return f"User(name = {self.name}, email = {self.name})"

user_args = reqparse.RequestParser()
user_args.add_argument('name',type=str,required=True,help="Name cannot be blank")
user_args.add_argument('email',type=str,required=True,help="Email cannot be blank")

class Users(Resource):
    def get(self):
        users = UserModel.query.all()
        return users
    
api.add_resource(Users, '/api/users/')
@app.route('/')
@app.route('/index')
def index():
    return render_template('index.html')

@app.route('/test')
def test():
    return '<h1>test api call</h1>'
if __name__ == '__main__':
    serve(app, host="0.0.0.0", port=8000) # running on localhost, port 8000