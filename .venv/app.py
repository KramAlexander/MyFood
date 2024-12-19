from flask import Flask, render_template, request
from waitress import serve
from flask_sqlalchemy import SQLAlchemy
from flask_restful import Resource, Api, reqparse, fields, marshal_with, abort
from sqlalchemy.dialects.postgresql import JSON

app = Flask(__name__)
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///database.db'
db = SQLAlchemy(app)
api = Api(app)

class RecipeModel(db.Model):
    id = db.Column(db.Integer,primary_key=True)
    name = db.Column(db.String(80),unique=True,nullable=False)
    description = db.Column(db.String(80),unique=False,nullable=False)
    duration = db.Column(db.Integer,nullable=False)
    ingredients = db.Column(JSON, nullable=False, default=list)
    difficulty = db.Column(db.Float,unique=False,nullable=False)
    

    def __repr__(self):
        return f"Recipe(name={self.name}, description={self.description}, duration={self.duration}, ingredients={self.ingredients}, difficulty={self.difficulty})"

    
    def add_ingredient(self, ingredient):
        if not isinstance(self.ingredients, list):
            self.ingredients = []
        if ingredient not in self.ingredients:
            self.ingredients.append(ingredient)

    def remove_ingredient(self, ingredient):

        if isinstance(self.ingredients, list) and ingredient in self.ingredients:
            self.ingredients.remove(ingredient)


recipe_args = reqparse.RequestParser()
recipe_args.add_argument('name',type=str,required=True,help="Name cannot be blank")
recipe_args.add_argument('description',type=str,required=True,help="Description cannot be blank")
recipe_args.add_argument('duration',type=int,required=True,help="Duration cannot be blank")
recipe_args.add_argument(
    'ingredients',
    type=str, 
    action='append',  
    required=True,
    help="Ingredients must be a list of strings"
)
recipe_args.add_argument('difficulty',type=float,required=True,help="Difficulty cannot be blank")

recipeFields = {
    'id': fields.Integer,
    'name': fields.String,
    'description': fields.String,
    'duration': fields.Integer,
    'ingredients': fields.List(fields.String),
    'difficulty': fields.Float,
}


class Recipes(Resource):
    @marshal_with(recipeFields)
    def get(self):
        recipes = RecipeModel.query.all()
        return recipes
    
    @marshal_with(recipeFields)
    def post(self):
        args = recipe_args.parse_args()
        recipe = RecipeModel(name=args["name"], description=args["description"],duration=args["duration"],ingredients=args["ingredients"],difficulty=args["difficulty"],)
        db.session.add(recipe)
        db.session.commit()
        recipes = RecipeModel.query.all()
        return recipes, 201
    
class Recipe(Resource):
    @marshal_with(recipeFields)
    def get(self,id):
        recipe = RecipeModel.query.filter_by(id=id).first()
        if not recipe:
            abort(404,"Recipe not found")
        return recipe
    
    @marshal_with(recipeFields)
    def patch(self,id):
        args = recipe_args.parse_args()
        recipe = RecipeModel.query.filter_by(id=id).first()
        if not recipe:
            abort(404,"Recipe not found")
        recipe.name = args["name"]
        recipe.description = args["description"]
        recipe.duration = args["duration"]
        recipe.ingredients = args["ingredients"]
        recipe.difficulty = args["difficulty"]
        db.session.commit()
        return recipe
    
    @marshal_with(recipeFields)
    def delete(self,id):
        recipe = RecipeModel.query.filter_by(id=id).first()
        if not recipe:
            abort(404,"Recipe not found")
        db.session.delete(recipe)
        db.session.commit()
        recipes = RecipeModel.query.all()
        return recipes
    
api.add_resource(Recipes, '/api/recipes/')
api.add_resource(Recipe,'/api/recipes/<int:id>')

@app.route('/')
@app.route('/index')
def index():
    return render_template('index.html')

if __name__ == '__main__':
    #app.run(debug=True)
    serve(app, host="0.0.0.0", port=8000) # running on localhost, port 8000