function openForm() {
  document.getElementById("myModal").style.display = "flex";
}

function closeForm() {
  document.getElementById("myModal").style.display = "none";
}

const stars = document.querySelectorAll(".ratings span");
let ratings = [];

for (let star of stars) {
  star.addEventListener("click", function () {
    stars.forEach((siblingStar) => siblingStar.removeAttribute("data-clicked"));
    this.setAttribute("data-clicked", "true");
    let rating = this.dataset.rating;
    let data = {
      stars: rating,
    };
    ratings.push(data);
    localStorage.setItem("rating", JSON.stringify(ratings));
  });
}
function openIngredientsModal() {
  const modal = document.getElementById("ingredientsModal");
  const form = document.getElementById("ingredientForm");

  if (modal) {
    modal.style.display = "flex";
  } else {
    console.error("Ingredients modal not found.");
  }
}

function closeIngredientsModal() {
  const modal = document.getElementById("ingredientsModal");

  if (modal) {
    document.getElementById("ingredient-name").value = "";
    document.getElementById("ingredient-amount").value = "";
    modal.style.display = "none";
  } else {
    console.error("Ingredients modal not found.");
  }
}

function addIngredient() {
  console.log("Adding ingredient");
  const name = document.getElementById("ingredient-name").value.trim();
  const amount = document.getElementById("ingredient-amount").value.trim();

  if (name && amount) {
    const ingredientDiv = document.createElement("div");
    ingredientDiv.className = "ingredient-item";
    ingredientDiv.innerHTML = `<span>${name} | ${amount}</span>`;

    const ingredientsForm = document.querySelector(".ingredients-form");
    const addButton = document.querySelector(".ingredients-btn");

    ingredientsForm.insertBefore(ingredientDiv, addButton);

    closeIngredientsModal();
  } else {
    alert("Please fill out both fields.");
  }
}
async function submitRecipe() {
  const name = document.getElementById("name-input").value.trim();
  const description = document.getElementById("description-input").value.trim();
  const imageInput = document.getElementById("image-input");
  const image = imageInput.files[0];
  const filename = image.name;

  let formData = new FormData();
  formData.append("image", image);
  fetch("/upload/image", { method: "POST", body: formData });

  const duration = document.getElementById("number-input").value.trim();
  const difficulty = document.querySelector(
    ".ratings span[data-clicked='true']"
  )?.dataset.rating;
  const ingredients = [];

  document.querySelectorAll(".ingredient-item span").forEach((item) => {
    const [ingredientName, ingredientAmount] = item.textContent.split(" | ");
    ingredients.push(`${ingredientName.trim()} (${ingredientAmount.trim()})`);
  });

  if (
    !name ||
    !description ||
    !filename ||
    !duration ||
    !difficulty ||
    ingredients.length === 0
  ) {
    alert("Please fill out all fields and add at least one ingredient.");
    return;
  }

  const data = {
    name,
    description,
    image_url: `static/uploads/${image.name}`,

    duration: parseInt(duration, 10),
    ingredients,
    difficulty: parseFloat(difficulty),
  };

  try {
    const response = await fetch("/api/recipes/", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });

    const result = await response.json();
    if (response.ok) {
      alert("Recipe created successfully!");
      console.log("New Recipe:", result);
      location.reload();
    } else {
      alert("Failed to create recipe. Please try again.");
      console.error(result);
    }
  } catch (error) {
    console.error("Error submitting recipe:", error);
    alert("An error occurred. Please try again later.");
  }
}
document.addEventListener("DOMContentLoaded", async () => {
  async function loadRecipes() {
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

  function addRecipeCard(recipe) {
    const cardContainer = document.querySelector(".card-container");

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
  }

  await loadRecipes();

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
});
