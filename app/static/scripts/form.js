export async function submitRecipe() {
    try {
      const name = document.getElementById("name-input").value.trim();
      const description = document.getElementById("description-input").value.trim();
      const image = document.getElementById("image-input").files[0];
  
      if (!name || !description || !image) {
        alert("Please complete all fields.");
        return;
      }
  
      const formData = new FormData();
      formData.append("image", image);
      
      await fetch("/upload/image", { method: "POST", body: formData });
  
      alert("Recipe submitted successfully!");
      location.reload();
    } catch (error) {
      console.error("Error submitting recipe:", error);
      alert("Failed to submit.");
    }
  }
  
  export function previewImage(input) {
    const reader = new FileReader();
    reader.onload = (e) => {
      document.getElementById("image-preview-container").innerHTML = `<img src="${e.target.result}" alt="Preview"/>`;
    };
    reader.readAsDataURL(input.files[0]);
  }
  