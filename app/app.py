from flask import Flask, render_template, request, jsonify
from flask_migrate import Migrate
from flask_sqlalchemy import SQLAlchemy
from flask_restful import Resource, Api, reqparse, fields, marshal_with, abort
from flask_socketio import SocketIO, emit
from sqlalchemy import JSON
import os
from google import genai
from dotenv import load_dotenv

load_dotenv()
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")

if not GEMINI_API_KEY:
    raise RuntimeError("GEMINI_API_KEY is not set in the .env file.")

client = genai.Client(api_key = GEMINI_API_KEY)
# --------------------------------
# 1) Flask App & Config
# --------------------------------
app = Flask(__name__)
app.config["SQLALCHEMY_DATABASE_URI"] = "sqlite:///database.db"
app.config["SECRET_KEY"] = "some-secret-key"  # Needed for Flask-SocketIO sessions

db = SQLAlchemy(app)
migrate = Migrate(app, db)
api = Api(app)

socketio = SocketIO(app)

# --------------------------------
# 2) Database Model
# --------------------------------
class RecipeModel(db.Model):
    __tablename__ = "recipes" 
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(80), unique=True, nullable=False)
    description = db.Column(db.String(80), nullable=False)
    image_url = db.Column(db.String(255), nullable=True)
    duration = db.Column(db.Integer, nullable=False)
    ingredients = db.Column(JSON, nullable=False, default=list)
    difficulty = db.Column(db.Float, nullable=False)

    def __repr__(self):
        return (
            f"<RecipeModel name={self.name}, "
            f"description={self.description}, "
            f"image_url={self.image_url}, "
            f"duration={self.duration}, "
            f"ingredients={self.ingredients}, "
            f"difficulty={self.difficulty}>"
        )

    def add_ingredient(self, ingredient):
        """Append a single ingredient to the list if it doesn't exist."""
        if not isinstance(self.ingredients, list):
            self.ingredients = []
        if ingredient not in self.ingredients:
            self.ingredients.append(ingredient)

    def remove_ingredient(self, ingredient):
        """Remove a single ingredient if it exists."""
        if isinstance(self.ingredients, list) and ingredient in self.ingredients:
            self.ingredients.remove(ingredient)

# --------------------------------
# 3) Request Parsers
# --------------------------------
recipe_args = reqparse.RequestParser()
recipe_args.add_argument("name", type=str, required=True, help="Name cannot be blank")
recipe_args.add_argument("description", type=str, required=True, help="Description cannot be blank")
recipe_args.add_argument("duration", type=int, required=True, help="Duration cannot be blank")
recipe_args.add_argument("image_url", type=str, required=False)
recipe_args.add_argument(
    "ingredients",
    type=str,
    action="append",
    required=True,
    help="Ingredients must be a list of strings",
)
recipe_args.add_argument("difficulty", type=float, required=True, help="Difficulty cannot be blank")

# --------------------------------
# 4) Fields for JSON Marshalling
# --------------------------------
recipeFields = {
    "id": fields.Integer,
    "name": fields.String,
    "description": fields.String,
    "image_url": fields.String,
    "duration": fields.Integer,
    "ingredients": fields.List(fields.String),
    "difficulty": fields.Float,
}

# --------------------------------
# 5) Resource Classes
# --------------------------------
class Recipes(Resource):
    @marshal_with(recipeFields)
    def get(self):
        """Return all recipes."""
        recipes = RecipeModel.query.all()
        return recipes

    @marshal_with(recipeFields)
    def post(self):
        """Create a new recipe and emit an event to all Socket.IO clients."""
        args = recipe_args.parse_args()
        new_recipe = RecipeModel(
            name=args["name"],
            description=args["description"],
            image_url=args["image_url"],  
            duration=args["duration"],
            ingredients=args["ingredients"],
            difficulty=args["difficulty"],
        )
        db.session.add(new_recipe)
        db.session.commit()

        # Emit "new_recipe" event to all connected WebSocket clients
        recipe_data = {
            "id": new_recipe.id,
            "name": new_recipe.name,
            "description": new_recipe.description,
            "image_url": new_recipe.image_url,
            "duration": new_recipe.duration,
            "ingredients": new_recipe.ingredients,
            "difficulty": new_recipe.difficulty,
        }
        socketio.emit("new_recipe", recipe_data)
        print("DEBUG: Emitted new_recipe event with data:", recipe_data)
        return new_recipe, 201


class Recipe(Resource):
    @marshal_with(recipeFields)
    def get(self, id):
        """Return a single recipe by ID."""
        recipe = RecipeModel.query.filter_by(id=id).first()
        if not recipe:
            abort(404, "Recipe not found")
        return recipe

    @marshal_with(recipeFields)
    def patch(self, id):
        """Update (partial) a single recipe by ID."""
        args = recipe_args.parse_args()
        recipe = RecipeModel.query.filter_by(id=id).first()
        if not recipe:
            abort(404, "Recipe not found")

        recipe.name = args["name"]
        recipe.description = args["description"]
        recipe.image_url = args["image_url"]
        recipe.duration = args["duration"]
        recipe.ingredients = args["ingredients"]
        recipe.difficulty = args["difficulty"]

        db.session.commit()
        return recipe

    @marshal_with(recipeFields)
    def delete(self, id):
        """Delete a recipe by ID."""
        recipe = RecipeModel.query.filter_by(id=id).first()
        if not recipe:
            abort(404, "Recipe not found")
        db.session.delete(recipe)
        db.session.commit()
        return RecipeModel.query.all()

chat_history = []  # Example: Store chat messages

class ChatMessage:
    def __init__(self, id, question, response):
        self.id = id
        self.question = question
        self.response = response

@app.route("/chat/gemini", methods=["POST"])
def get_google_chat():  # Remove "async" here
    data = request.get_json()
    if not data or "prompt" not in data:
        return jsonify({"error": "Prompt is required"}), 400

    prompt = data["prompt"]

    conversation_context = "\n".join(
        [f"User: {msg.question}\nGemini: {msg.response}" for msg in chat_history]
    )
    full_prompt = f"{conversation_context}\nUser: {prompt}\nGemini:"

    response = client.models.generate_content(
        model="gemini-2.0-flash",
        contents=full_prompt
    )

    answer = response.text if response.text else "No response available."

    message_id = len(chat_history) + 1
    chat_message = ChatMessage(id=message_id, question=prompt, response=answer)
    chat_history.append(chat_message)

    return jsonify({
        "id": message_id,
        "question": prompt,
        "response": answer
    })
# --------------------------------
# 6) Register API Resources
# --------------------------------
api.add_resource(Recipes, "/api/recipes/")
api.add_resource(Recipe, "/api/recipes/<int:id>")

# --------------------------------
# 7) File Upload Route
# --------------------------------
@app.route("/upload/image", methods=["POST"])
def upload_image():
    if not os.path.exists("app/static/uploads"):
        os.makedirs("app/static/uploads")

    if "image" not in request.files:
        return jsonify({"error": "No image part in the request"}), 400

    image = request.files["image"]
    if image.filename == "":
        return jsonify({"error": "No selected file"}), 400

    upload_path = os.path.join("app","static", "uploads", image.filename)
    image.save(upload_path)
    
    return jsonify({"message": "File uploaded successfully", "filename": image.filename})

# --------------------------------
# 8) Frontend Routes
# --------------------------------
@app.route("/")
@app.route("/index")
def index():
    return render_template("index.html")

@app.route("/chat")
def chat():
    return render_template("chat.html")

# --------------------------------
# 9) Socket.IO Events (Optional)
# --------------------------------
@socketio.on("connect")
def handle_connect():
    print("Client connected.")

@socketio.on("disconnect")
def handle_disconnect():
    print("Client disconnected.")

# --------------------------------
# 10) Run the Application
# --------------------------------
if __name__ == "__main__":
    socketio.run(app, host="0.0.0.0", port=8000, debug=True)