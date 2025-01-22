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
    // Create a new ingredient item
    const ingredientDiv = document.createElement("div");
    ingredientDiv.className = "ingredient-item";

    // Add ingredient details and a remove button
    ingredientDiv.innerHTML = `
      <span>- ${name} | ${amount}</span>
      <button type="button" class="remove-btn" onclick="removeIngredient(this)">-</button>

    `;

    // Find the correct container to add ingredients
    const ingredientsContainer = document.querySelector(
      "#ingredients-container"
    );
    if (ingredientsContainer) {
      const placeholderText =
        ingredientsContainer.querySelector(".placeholder-text");

      // Remove placeholder if present
      if (placeholderText) {
        placeholderText.remove();
      }

      // Add the new ingredient to the container
      ingredientsContainer.appendChild(ingredientDiv);
    } else {
      console.error("Ingredients container not found.");
    }

    // Clear input fields and close modal
    closeIngredientsModal();
  } else {
    alert("Please fill out both fields.");
  }
}

// Function to remove an ingredient
function removeIngredient(button) {
  const ingredientDiv = button.parentElement;
  if (ingredientDiv) {
    ingredientDiv.remove();

    // Check if the container is now empty and add a placeholder if needed
    const ingredientsContainer = document.querySelector(
      "#ingredients-container"
    );
    if (ingredientsContainer && ingredientsContainer.children.length === 0) {
      const placeholderText = document.createElement("p");
      placeholderText.className = "placeholder-text";
      placeholderText.textContent = "No ingredients added yet.";
      ingredientsContainer.appendChild(placeholderText);
    }
  } else {
    console.error("Ingredient item not found.");
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

  const observerOptions = {
    root: null,
    rootMargin: "100px 0px -50px 0px", // Extend the top boundary for earlier appearance
    threshold: [0, 0.5], // Trigger on fully invisible (0) and partially visible (0.5)
  };

  const observerCallback = (entries) => {
    entries.forEach((entry) => {
      const card = entry.target;

      if (entry.intersectionRatio >= 0.5) {
        // Slide in when at least 50% visible
        card.classList.add("slide-in");
        card.classList.remove("slide-out");
      } else if (entry.intersectionRatio === 0) {
        // Reset animation when completely out of view
        card.classList.remove("slide-in");
        card.classList.add("slide-out");
      }
    });
  };

  const observer = new IntersectionObserver(observerCallback, observerOptions);
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

    observer.observe(card);
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

function previewImage(input) {
  const container = document.getElementById("image-preview-container");
  container.innerHTML = "";

  if (input.files && input.files[0]) {
    const file = input.files[0];
    const reader = new FileReader();

    reader.onload = function (e) {
      const img = document.createElement("img");
      img.src = e.target.result;
      img.alt = file.name;

      const removeBtn = document.createElement("button");
      removeBtn.textContent = "Remove";
      removeBtn.className = "remove-btn";
      removeBtn.onclick = function () {
        removePreview(input);
      };

      container.appendChild(img);
      container.appendChild(removeBtn);
    };

    reader.readAsDataURL(file);
  }
}

function removePreview(input) {
  const container = document.getElementById("image-preview-container");
  input.value = "";
  container.innerHTML = "";
}
document.addEventListener("DOMContentLoaded", () => {
  const cards = document.querySelectorAll(".card");

  const observerOptions = {
    root: null,
    rootMargin: "100px 0px 0px 0px", // Extend the top boundary for earlier appearance
    threshold: [0, 0.5], // Trigger on fully invisible (0) and partially visible (0.5)
  };

  const observerCallback = (entries) => {
    entries.forEach((entry) => {
      const card = entry.target;

      if (entry.intersectionRatio >= 0.5) {
        // Slide in when at least 50% visible
        card.classList.add("slide-in");
        card.classList.remove("slide-out");
      } else if (entry.intersectionRatio === 0) {
        // Reset animation when completely out of view
        card.classList.remove("slide-in");
        card.classList.add("slide-out");
      }
    });
  };

  const observer = new IntersectionObserver(observerCallback, observerOptions);

  cards.forEach((card) => observer.observe(card));
});
