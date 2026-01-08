const recipes = [
  {
    name: "Pasta",
    description: "Quick and cheap pasta meal, ideal for students."
  },
  {
    name: "Omelette",
    description: "Fast protein-rich breakfast or dinner option."
  },
  {
    name: "Fried Rice",
    description: "Perfect for using leftovers with minimal effort."
  },
  {
    name: "Instant Noodles",
    description: "Ultra-fast comfort food on a budget."
  }
];

const recipeList = document.getElementById("recipeList");
const searchInput = document.getElementById("searchInput");

const modal = document.getElementById("recipeModal");
const modalTitle = document.getElementById("modalTitle");
const modalDescription = document.getElementById("modalDescription");
const closeBtn = document.querySelector(".closeBtn");

closeBtn.onclick = () => modal.style.display = "none";
window.onclick = e => { if (e.target === modal) modal.style.display = "none"; };

function displayRecipes(filter = "") {
  recipeList.innerHTML = "";

  recipes
    .filter(r => r.name.toLowerCase().includes(filter.toLowerCase()))
    .forEach(recipe => {
      const card = document.createElement("div");
      card.className = "recipe-card";
      card.innerHTML = `<h3>${recipe.name}</h3><p>${recipe.description}</p>`;

      card.onclick = () => {
        modalTitle.textContent = recipe.name;
        modalDescription.textContent = recipe.description;
        modal.style.display = "block";
      };

      recipeList.appendChild(card);
    });
}

searchInput.addEventListener("input", e => displayRecipes(e.target.value));
displayRecipes();
