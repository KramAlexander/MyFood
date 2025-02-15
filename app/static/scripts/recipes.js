export async function loadRecipes() {
  try {
    const response = await fetch("/api/recipes/");
    if (!response.ok) {
      throw new Error("Failed to fetch recipes");
    }

    const recipes = await response.json();
    recipes.forEach((recipe) => {
      addRecipeCard(recipe);
    });
  } catch (error) {
    console.error("Error loading recipes:", error);
  }
}

const observerOptions = {
  root: null,
  rootMargin: "100px 0px -50px 0px",
  threshold: [0, 0.5],
};

const observerCallback = (entries) => {
  entries.forEach((entry) => {
    const card = entry.target;

    if (entry.intersectionRatio >= 0.5) {
      card.classList.add("slide-in");
      card.classList.remove("slide-out");
    } else if (entry.intersectionRatio === 0) {
      card.classList.remove("slide-in");
      card.classList.add("slide-out");
    }
  });
};

const observer = new IntersectionObserver(observerCallback, observerOptions);

export function addRecipeCard(recipe) {
  const cardContainer = document.querySelector(".card-container");

  if (!cardContainer) {
    return;
  }
  const card = document.createElement("div");
  card.className = "card";
  card.innerHTML = `
        <img
          src="${recipe.image_url || "/static/default-image.jpg"}"
          class="card-img-top"
          alt="Recipe Image"
        />
        <div class="card-content">
          <h2>${recipe.name}</h2>
          <p class="card-text">
            ${recipe.description}<br />
            Duration: ${recipe.duration} min
          </p>
          <a href="#" class="button">
            Find out more
            <span class="material-symbols-outlined"> arrow_right_alt </span>
          </a>
        </div>
      `;

  cardContainer.appendChild(card);

  observer.observe(card);
}
// WebSocket setup
const socket = io();

socket.on("connect", () => {
  console.log("WebSocket connected!");
});

socket.on("disconnect", () => {
  console.log("WebSocket disconnected!");
});

socket.on("new_recipe", (recipeData) => {
  console.log("Received new recipe:", recipeData);
  addRecipeCard(recipeData);
});
