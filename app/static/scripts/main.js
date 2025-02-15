import { loadRecipes, addRecipeCard } from "./recipes.js";
import {
  openForm,
  closeForm,
  openIngredientsModal,
  closeIngredientsModal,
} from "./modals.js";

import { setupSearch } from "./search.js";
import { setupChat, sendMessage } from "./chat.js";
import { nextStep, prevStep, submitRecipe, updateLabel } from "./form.js";
import { previewImage, removePreview, displayFinalImage } from "./form.js";
import { addIngredient, removeIngredient } from "./ingredients.js";
import { setupRecipeDetails, closeRecipeDetails } from "./details.js";

document.addEventListener("DOMContentLoaded", async () => {
  await loadRecipes();
  setupSearch();
  setupChat();
  setupRecipeDetails();

  // browse: open and close form
  const floatingButton = document.querySelector(".floating-button");
  const closeButton = document.querySelector(".close");
  if (floatingButton) floatingButton.addEventListener("click", openForm);
  if (closeButton) closeButton.addEventListener("click", closeForm);

  // browse: search button
  const searchBtn = document.querySelector(".search");
  const searchContainer = document.querySelector(".search-container");
  const searchInput = document.getElementById("search-input");

  if (searchBtn && searchContainer && searchInput) {
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
      filterCards(this.value.toLowerCase());
    });

    function filterCards(searchTerm) {
      document.querySelectorAll(".card").forEach((card) => {
        const titleElem = card.querySelector("h2");
        const titleText = titleElem ? titleElem.textContent.toLowerCase() : "";
        card.style.display = titleText.includes(searchTerm) ? "" : "none";
      });
    }
  }

  // browse: open and close recipe details
  const closeRecipeDetailsBtn = document.getElementById("close-recipe-details");
  if (closeRecipeDetailsBtn)
    closeRecipeDetailsBtn.addEventListener("click", closeRecipeDetails);

  // form: steps
  document
    .querySelectorAll(".next-btn")
    .forEach((button) => button.addEventListener("click", nextStep));
  document
    .querySelectorAll(".prev-btn")
    .forEach((button) => button.addEventListener("click", prevStep));

  // form: open and close ingredients modal
  const openIngredientsModalBtn = document.getElementById(
    "openIngredientsModel"
  );
  if (openIngredientsModalBtn)
    openIngredientsModalBtn.addEventListener("click", openIngredientsModal);

  document
    .querySelectorAll(".close")
    .forEach((button) =>
      button.addEventListener("click", closeIngredientsModal)
    );

  // form: add and remove ingredient
  const submitIngredientBtn = document.getElementById("add-ingredient-submit");
  if (submitIngredientBtn)
    submitIngredientBtn.addEventListener("click", addIngredient);

  const ingredientsContainer = document.querySelector("#inputed-ingredients");
  if (ingredientsContainer)
    ingredientsContainer.addEventListener("click", removeIngredient);

  // form: image preview
  const imageInput = document.getElementById("image-input");
  if (imageInput)
    imageInput.addEventListener("change", (event) =>
      previewImage(event.target)
    );

  // form: update labels
  const nameInput = document.getElementById("name-input");
  const descriptionInput = document.getElementById("description-input");
  const numberInput = document.getElementById("number-input");

  if (nameInput) nameInput.addEventListener("focus", () => updateLabel("Name"));
  if (descriptionInput)
    descriptionInput.addEventListener("focus", () =>
      updateLabel("Description")
    );
  if (imageInput)
    imageInput.addEventListener("focus", () => updateLabel("Image"));
  if (numberInput)
    numberInput.addEventListener("focus", () =>
      updateLabel("Duration (minutes)")
    );

  // form: submit recipe button
  const submitRecipeBtn = document.getElementById("submit-Recipe-btn");
  if (submitRecipeBtn) submitRecipeBtn.addEventListener("click", submitRecipe);

  // ratings: handle star rating clicks
  const stars = document.querySelectorAll(".ratings span");
  let ratings = [];

  stars.forEach((star) => {
    star.addEventListener("click", function () {
      stars.forEach((siblingStar) =>
        siblingStar.removeAttribute("data-clicked")
      );
      this.setAttribute("data-clicked", "true");
      let rating = this.dataset.rating;
      let data = { stars: rating };
      ratings.push(data);
      localStorage.setItem("rating", JSON.stringify(ratings));
    });
  });

  // chat: send-button
  const sendButton = document.querySelector(".send-btn");
  if (sendButton) sendButton.addEventListener("click", sendMessage);
});
