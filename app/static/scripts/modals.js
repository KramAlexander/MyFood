console.log("modals.js is loaded");

export function openForm() {
  document.querySelector(".formDiv").style.display = "flex";
}

export function closeForm() {
  document.querySelector(".formDiv").style.display = "none";
}

export function openIngredientsModal() {
  document.querySelector(".ingredientsDiv").style.display = "flex";
}

export function closeIngredientsModal() {
  document.querySelector(".ingredientsDiv").style.display = "none";
}
