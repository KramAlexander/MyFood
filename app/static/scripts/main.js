import { loadRecipes, addRecipeCard } from "./recipes.js";
import {
  openForm,
  closeForm,
  openIngredientsModal,
  closeIngredientsModal,
} from "./modals.js";

import { setupSearch } from "./search.js";
import { setupChat } from "./chat.js";

// Run necessary setup functions on page load
document.addEventListener("DOMContentLoaded", async () => {
  await loadRecipes();
  setupSearch();
  setupChat();
});

document.addEventListener("DOMContentLoaded", () => {
  // Attach event listener to the button
  document
    .querySelector(".floating-button")
    .addEventListener("click", openForm);

  // Attach event listener to close button
  document.querySelector(".close").addEventListener("click", closeForm);
});
