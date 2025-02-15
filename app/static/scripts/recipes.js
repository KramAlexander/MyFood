export async function loadRecipes() {
    try {
      const response = await fetch("/api/recipes/");
      if (!response.ok) throw new Error("Failed to fetch recipes");
  
      const recipes = await response.json();
      recipes.forEach((recipe) => addRecipeCard(recipe));
    } catch (error) {
      console.error("Error loading recipes:", error);
    }
  }
  
  export function addRecipeCard(recipe) {
    const cardContainer = document.querySelector(".card-container");
  
    const card = document.createElement("div");
    card.className = "card";
    card.innerHTML = `
      <img src="${recipe.image_url || "/static/default-image.jpg"}" class="card-img-top" alt="Recipe Image"/>
      <div class="card-content">
        <h2>${recipe.name}</h2>
        <p class="card-text">${recipe.description}<br/>Duration: ${recipe.duration} min</p>
        <a href="#" class="button">Find out more <span class="material-symbols-outlined">arrow_right_alt</span></a>
      </div>`;
  
    cardContainer.appendChild(card);
  }
  
  // WebSocket setup
  const socket = io();
  
  socket.on("new_recipe", (recipeData) => {
    console.log("Received new recipe:", recipeData);
    addRecipeCard(recipeData);
  });
  