export function openRecipeDetails(recipe) {
  updateRecipeDetails(recipe);
  document.getElementById("recipe-details-modal").style.display = "flex";
}

export function closeRecipeDetails() {
  document.getElementById("recipe-details-modal").style.display = "none";
}

function updateRecipeDetails(recipe) {
  document.getElementById("recipe-title").textContent = recipe.name;
  document.getElementById("recipe-description").textContent =
    recipe.description;
  document.getElementById("recipe-duration").textContent = recipe.duration;
  document.getElementById("recipe-difficulty").textContent = recipe.difficulty;
  document.getElementById("recipe-image").src =
    recipe.image_url || "static/default-image.jpg";

  const ingredientsList = document.getElementById("recipe-ingredients");
  ingredientsList.innerHTML = "";

  recipe.ingredients.forEach((ingredient) => {
    const li = document.createElement("li");
    li.textContent = ingredient;
    ingredientsList.appendChild(li);
  });
}

export function setupRecipeDetails() {
  const cardContainer = document.querySelector(".card-container");
  if (!cardContainer) {
    return;
  }
  cardContainer.addEventListener("click", async (event) => {
    const button = event.target.closest(".button");
    if (!button) return;

    event.preventDefault();
    const card = button.closest(".card");
    if (!card) return;

    const recipeName = card.querySelector("h2").textContent;
    const recipe = {
      name: recipeName,
      description: card.querySelector(".card-text").textContent.split("\n")[0],
      duration: parseInt(
        card.querySelector(".card-text").textContent.match(/\d+/)[0]
      ),
      difficulty: "Loading...",
      image_url: card.querySelector("img").src,
      ingredients: ["Loading..."],
    };

    openRecipeDetails(recipe);

    try {
      const response = await fetch(`/api/recipes/`);
      if (!response.ok) throw new Error("Failed to fetch recipes");

      const recipes = await response.json();
      const recipeData = recipes.find((r) => r.name === recipeName);

      if (recipeData) {
        recipe.ingredients = recipeData.ingredients;
        recipe.difficulty = recipeData.difficulty;
      } else {
        recipe.ingredients = ["No ingredients found"];
      }

      updateRecipeDetails(recipe);
    } catch (error) {
      console.error("Error fetching recipe details:", error);
      updateRecipeDetails({
        ...recipe,
        ingredients: ["Failed to load ingredients"],
        difficulty: "N/A",
      });
    }
  });
}
