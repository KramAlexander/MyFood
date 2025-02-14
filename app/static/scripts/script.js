function openForm() {
  document.querySelector(".formDiv").style.display = "flex";
}

function closeForm() {
  document.querySelector(".formDiv").style.display = "none";
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
  const formDiv = document.querySelector(".ingredientsDiv");
  const modal = document.getElementById("ingredientsForm");

  if (formDiv && modal) {
    formDiv.style.display = "flex";
    modal.style.display = "flex";
  } else {
    console.error("Ingredients modal or formDiv not found.");
  }
}

function closeIngredientsModal() {
  const formDiv = document.querySelector(".ingredientsDiv");
  const modal = document.getElementById("ingredientsForm");

  if (formDiv && modal) {
    formDiv.style.display = "none";
    modal.style.display = "none";
  } else {
    console.error("Ingredients modal or formDiv not found.");
  }
}

function addIngredient() {
  const name = document.getElementById("ingredient-name").value.trim();
  const amount = document.getElementById("ingredient-amount").value.trim();

  if (name && amount) {
    const ingredientDiv = document.createElement("div");
    ingredientDiv.className = "ingredient-item";

    ingredientDiv.innerHTML = `
        <span class="ingredient-text">${name} | ${amount}</span>
        <span class="remove-btn" onclick="removeIngredient(this)">×</span>
      `;

    const ingredientsContainer = document.querySelector("#inputed-ingredients");
    if (ingredientsContainer) {
      ingredientsContainer.appendChild(ingredientDiv);
    } else {
      console.error("Ingredients container not found.");
    }

    closeIngredientsModal();
    document.getElementById("ingredient-name").value = "";
    document.getElementById("ingredient-amount").value = "";
  } else {
    alert("Please fill out both fields.");
  }
}

function removeIngredient(button) {
  const ingredientDiv = button.parentElement;
  if (ingredientDiv) {
    ingredientDiv.remove();

    const ingredientsContainer = document.querySelector(
      "#ingredients-container"
    );
    if (ingredientsContainer && ingredientsContainer.children.length === 0) {
      ingredientsContainer.appendChild(placeholderText);
    }
  } else {
    console.error("Ingredient item not found.");
  }
}

async function submitRecipe() {
  try {
    const name = document.getElementById("name-input").value.trim();
    const description = document
      .getElementById("description-input")
      .value.trim();
    const imageInput = document.getElementById("image-input");
    const image = imageInput.files[0];

    if (!image) {
      alert("Please select an image.");
      return;
    }

    const filename = image.name;

    let formData = new FormData();
    formData.append("image", image);

    const uploadResponse = await fetch("/upload/image", {
      method: "POST",
      body: formData,
    });

    if (!uploadResponse.ok) {
      alert("Image upload failed. Please try again.");
      return;
    }

    const duration = document.getElementById("number-input").value.trim();
    const difficulty = document.querySelector(
      ".ratings span[data-clicked='true']"
    )?.dataset.rating;

    if (!name || !description || !filename || !duration || !difficulty) {
      alert("Please fill out all fields.");
      return;
    }

    const ingredients = [];
    document.querySelectorAll(".ingredient-item span").forEach((item) => {
      const [ingredientName, ingredientAmount] = item.textContent.split(" | ");
      if (ingredientName && ingredientAmount) {
        ingredients.push(
          `${ingredientName.trim()} (${ingredientAmount.trim()})`
        );
      }
    });

    if (ingredients.length === 0) {
      alert("Please add at least one ingredient.");
      return;
    }

    const data = {
      name,
      description,
      image_url: `../static/uploads/${filename}`,
      duration: parseInt(duration, 10),
      ingredients,
      difficulty: parseFloat(difficulty),
    };

    const response = await fetch("/api/recipes/", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });

    if (response.ok) {
      alert("Recipe created successfully!");
      console.log("New Recipe:", await response.json());
      location.reload();
    } else {
      alert("Failed to create recipe. Please try again.");
      console.error("Error:", await response.json());
    }
  } catch (error) {
    console.error("Error submitting recipe:", error);
    alert("An unexpected error occurred. Please try again.");
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
let uploadedImageURL = "";

function previewImage(input) {
  const container = document.getElementById("image-preview-container");
  container.innerHTML = "";

  if (input.files && input.files[0]) {
    const file = input.files[0];
    const reader = new FileReader();

    reader.onload = function (e) {
      uploadedImageURL = e.target.result; // Store the image URL globally

      const img = document.createElement("img");
      img.src = e.target.result;
      img.alt = file.name;

      const removeBtn = document.createElement("span");
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
let currentStep = 0;
const steps = document.querySelectorAll(".form-step");
const progress = document.getElementById("progress");
const formLabel = document.getElementById("form-label");

const stepLabels = [
  "Name",
  "Description",
  "Image",
  "Duration (minutes)",
  "Difficulty",
  "Ingredients",
  "Review & Submit",
];

function updateLabel() {
  formLabel.innerText = stepLabels[currentStep];
}
function showStep() {
  steps.forEach((step, index) => {
    step.classList.toggle("active", index === currentStep);

    if (index === currentStep) {
      step.classList.add("active");
    }
  });

  progress.style.width = `${(currentStep / (steps.length - 1)) * 100}%`;

  const dots = document.querySelectorAll(".dot");
  dots.forEach((dot, index) => {
    dot.classList.toggle("active", index <= currentStep);
  });

  if (currentStep === steps.length - 1) {
    displayFinalImage();
    dots.forEach((dot, index) => {
      setTimeout(() => {
        dot.classList.add("grow");

        setTimeout(() => {
          dot.classList.remove("grow");
        }, 300);
      }, index * 150);
    });
  }

  updateLabel();
}

function nextStep() {
  if (currentStep < steps.length - 1) {
    currentStep++;
    showStep();
  }
}

function prevStep() {
  if (currentStep > 0) {
    currentStep--;
    showStep();
  }
}

showStep();
function displayFinalImage() {
  const finalImageContainer = document.getElementById("final-image-preview");
  const finalTitleContainer = document.getElementById("final-title-preview");

  finalImageContainer.innerHTML = "";
  finalTitleContainer.innerHTML = "";

  const recipeName = document.getElementById("name-input").value.trim();

  if (uploadedImageURL) {
    const img = document.createElement("img");
    img.src = uploadedImageURL;
    img.alt = "Uploaded Recipe Image";
    img.style.maxWidth = "120px";
    img.style.borderRadius = "8px";
    img.style.boxShadow = "0 4px 10px rgba(0, 0, 0, 0.3)";
    img.style.margin = "0 auto";
    img.style.display = "block";

    finalImageContainer.appendChild(img);
  }

  if (recipeName) {
    finalTitleContainer.textContent = recipeName;
  }
}
document.addEventListener("DOMContentLoaded", () => {
  const searchBtn = document.querySelector(".search");
  const searchContainer = document.querySelector(".search-container");
  const searchInput = document.getElementById("search-input");

  searchBtn.addEventListener("click", function (e) {
    e.preventDefault();

    if (
      searchContainer.style.display === "none" ||
      searchContainer.style.display === ""
    ) {
      searchContainer.style.display = "block";
      searchInput.focus();
    } else {
      searchContainer.style.display = "none";
      searchInput.value = "";
      filterCards("");
    }
  });
  searchInput.addEventListener("input", function () {
    const searchTerm = this.value.toLowerCase();
    filterCards(searchTerm);
  });

  function filterCards(searchTerm) {
    const cards = document.querySelectorAll(".card");

    cards.forEach((card) => {
      const titleElem = card.querySelector("h2");
      const titleText = titleElem ? titleElem.textContent.toLowerCase() : "";

      if (titleText.includes(searchTerm)) {
        card.style.display = "";
      } else {
        card.style.display = "none";
      }
    });
  }
});

function openRecipeDetails(recipe) {
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

  document.getElementById("recipe-details-modal").style.display = "flex";
}

function closeRecipeDetails() {
  document.getElementById("recipe-details-modal").style.display = "none";
}

document.addEventListener("DOMContentLoaded", () => {
  document.querySelectorAll(".card .button").forEach((button) => {
    button.addEventListener("click", (event) => {
      event.preventDefault();
      const card = event.target.closest(".card");
      const recipe = {
        name: card.querySelector("h2").textContent,
        description: card
          .querySelector(".card-text")
          .textContent.split("\n")[0],
        duration: parseInt(
          card.querySelector(".card-text").textContent.match(/\d+/)[0]
        ),
        difficulty: Math.floor(Math.random() * 5) + 1,
        image_url: card.querySelector("img").src,
        ingredients: ["Ingredient 1", "Ingredient 2", "Ingredient 3"],
      };
      openRecipeDetails(recipe);
    });
  });
});
document.addEventListener("DOMContentLoaded", () => {
  document
    .querySelector(".card-container")
    .addEventListener("click", async (event) => {
      const button = event.target.closest(".button");
      if (!button) return;

      event.preventDefault();
      const card = button.closest(".card");

      if (!card) return;

      const recipeName = card.querySelector("h2").textContent;
      const recipe = {
        name: recipeName,
        description: card
          .querySelector(".card-text")
          .textContent.split("\n")[0],
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
});

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

function sendMessage() {
  const inputField = document.getElementById("chat-input");
  const message = inputField.value.trim();
  if (message === "") return;

  const messagesContainer = document.getElementById("chat-messages");
  const userMessage = document.createElement("div");
  userMessage.textContent = `You: ${message}`;
  userMessage.style.padding = "5px 10px";
  userMessage.style.marginBottom = "5px";
  userMessage.style.background = "rgba(255, 255, 255, 0.2)";
  userMessage.style.borderRadius = "5px";
  messagesContainer.appendChild(userMessage);

  inputField.value = "";
  messagesContainer.scrollTop = messagesContainer.scrollHeight;
}
async function sendMessage() {
  const inputField = document.getElementById("chat-input");
  const chatMessages = document.getElementById("chat-messages");
  const userMessage = inputField.value.trim();

  if (userMessage === "") return;

  appendMessage("You", userMessage, "user-message");

  inputField.value = "";

  try {
    let response = await fetch("/chat/gemini", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ prompt: userMessage }),
    });

    if (!response.ok) {
      throw new Error("Failed to fetch response from chatbot.");
    }

    let data = await response.json();

    appendMessage(
      "Bot",
      data.response || "No response from bot",
      "bot-message"
    );

    setTimeout(() => {
      chatMessages.scrollTop = chatMessages.scrollHeight;
    }, 100);
  } catch (error) {
    console.error("Error:", error);
    appendMessage(
      "Bot",
      "Error: Unable to connect to chatbot.",
      "error-message"
    );
  }
}

function appendMessage(sender, text, className) {
  const chatMessages = document.getElementById("chat-messages");
  const messageDiv = document.createElement("div");
  messageDiv.classList.add("message", className);
  messageDiv.innerHTML = `<strong>${sender}:</strong> ${text}`;
  chatMessages.appendChild(messageDiv);
}

document
  .getElementById("chat-input")
  .addEventListener("keypress", function (event) {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      sendMessage();
    }
  });
