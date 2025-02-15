export function setupSearch() {
    const searchInput = document.getElementById("search-input");
  
    searchInput.addEventListener("input", () => {
      const searchTerm = searchInput.value.toLowerCase();
      document.querySelectorAll(".card").forEach((card) => {
        const title = card.querySelector("h2").textContent.toLowerCase();
        card.style.display = title.includes(searchTerm) ? "" : "none";
      });
    });
  }
  