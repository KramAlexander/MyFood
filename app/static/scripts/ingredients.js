import { closeIngredientsModal } from "./modals.js";

export function addIngredient() {
  const name = document.getElementById("ingredient-name").value.trim();
  const amount = document.getElementById("ingredient-amount").value.trim();

  if (name && amount) {
    const ingredientDiv = document.createElement("div");
    ingredientDiv.className = "ingredient-item";

    ingredientDiv.innerHTML = `
          <span class="ingredient-text">${name} | ${amount}</span>
          <span class="remove-btn">×</span>
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

export function removeIngredient(event) {
  if (event.target.classList.contains("remove-btn")) {
    event.target.parentElement.remove();
  }
}
