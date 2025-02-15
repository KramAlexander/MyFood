export function addIngredient() {
    const name = document.getElementById("ingredient-name").value.trim();
    const amount = document.getElementById("ingredient-amount").value.trim();
  
    if (name && amount) {
      const ingredientDiv = document.createElement("div");
      ingredientDiv.className = "ingredient-item";
      ingredientDiv.innerHTML = `<span class="ingredient-text">${name} | ${amount}</span>
                                 <span class="remove-btn" onclick="removeIngredient(this)">×</span>`;
  
      document.querySelector("#inputed-ingredients").appendChild(ingredientDiv);
      document.getElementById("ingredient-name").value = "";
      document.getElementById("ingredient-amount").value = "";
    } else {
      alert("Please fill out both fields.");
    }
  }
  
  export function removeIngredient(button) {
    button.parentElement.remove();
  }
  