export function openForm() {
  document.querySelector(".formDiv").style.display = "flex";
}

export function closeForm() {
  document.querySelector(".formDiv").style.display = "none";
}

export function openIngredientsModal() {
  const formDiv = document.querySelector(".ingredientsDiv");
  const modal = document.getElementById("ingredientsForm");

  if (formDiv && modal) {
    formDiv.style.display = "flex";
    modal.style.display = "flex";
  } else {
    console.error("Ingredients modal or formDiv not found.");
  }
}

export function closeIngredientsModal() {
  const formDiv = document.querySelector(".ingredientsDiv");
  const modal = document.getElementById("ingredientsForm");

  if (formDiv && modal) {
    formDiv.style.display = "none";
    modal.style.display = "none";
  } else {
    console.error("Ingredients modal or formDiv not found.");
  }
}
