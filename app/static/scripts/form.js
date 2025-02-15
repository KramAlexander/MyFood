export async function submitRecipe() {
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

//######################################## imagePreview-section ########################################

let uploadedImageURL = "";

export function previewImage(input) {
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

export function removePreview(input) {
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

      if (entry.intersectionRatio > 0.5) {
        // Slide in when at least 50% visible
        card.classList.add("slide-in");
        card.classList.remove("slide-out");
      } else if (entry.intersectionRatio == 0) {
        // Reset animation when completely out of view
        card.classList.remove("slide-in");
        card.classList.add("slide-out");
      }
    });
  };

  const observer = new IntersectionObserver(observerCallback, observerOptions);

  cards.forEach((card) => observer.observe(card));
});

export function displayFinalImage() {
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

//######################################## steps-section ########################################
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

export function updateLabel() {
  formLabel.innerText = stepLabels[currentStep];
}
function showStep() {
  if (!steps.length) {
    return;
  }

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

export function nextStep() {
  if (currentStep < steps.length - 1) {
    currentStep++;
    showStep();
  }
}

export function prevStep() {
  if (currentStep > 0) {
    currentStep--;
    showStep();
  }
}

showStep();
