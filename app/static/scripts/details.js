export function openRecipeDetails(recipe) {
    document.getElementById("recipe-title").textContent = recipe.name;
    document.getElementById("recipe-description").textContent = recipe.description;
    document.getElementById("recipe-duration").textContent = recipe.duration;
    document.getElementById("recipe-difficulty").textContent = recipe.difficulty;
    document.getElementById("recipe-image").src = recipe.image_url || "/static/default-image.jpg";
  
    const ingredientsList = document.getElementById("recipe-ingredients");
    ingredientsList.innerHTML = "";
    recipe.ingredients.forEach((ingredient) => {
      const li = document.createElement("li");
      li.textContent = ingredient;
      ingredientsList.appendChild(li);
    });
  
    document.getElementById("recipe-details-modal").style.display = "flex";
  }
  
  export function closeRecipeDetails() {
    document.getElementById("recipe-details-modal").style.display = "none";
  }
  