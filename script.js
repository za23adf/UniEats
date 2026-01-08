const searchInput = document.getElementById("searchInput");
const searchButton = document.getElementById("searchBtn");
const recipesContainer = document.getElementById("recipeContainer");
const recipeModal = document.getElementById("recipeModal");
const modalTitle = document.getElementById("modalTitle");
const modalInfo = document.getElementById("modalInfo");
const modalIngredients = document.getElementById("modalIngredients");
const modalInstructions = document.getElementById("modalInstructions");
const modalCloseBtn = recipeModal.querySelector(".closeBtn");

const allergyBtn = document.getElementById("allergyBtn");
const allergyModal = document.getElementById("allergyModal");
const closeAllergyBtn = allergyModal.querySelector(".closeBtn");
const allergyForm = document.getElementById("allergyForm");

const logoutBtn = document.getElementById("logoutBtn");
const currentUserDisplay = document.getElementById("currentUser");

const API_KEY = "425c47cd7d244430a4fd9f1442c39743";

// Show current user
const currentUser = localStorage.getItem("currentUser");
if (!currentUser) window.location.href = "login.html";
currentUserDisplay.textContent = "Logged in as: " + currentUser;

// Logout
logoutBtn.addEventListener("click", () => {
  localStorage.removeItem("currentUser");
  window.location.href = "login.html";
});

// Allergies
allergyBtn.addEventListener("click", () => allergyModal.style.display = "block");
closeAllergyBtn.addEventListener("click", () => allergyModal.style.display = "none");
window.addEventListener("click", e => { if(e.target === allergyModal) allergyModal.style.display = "none"; });

function getAllergies() {
  return JSON.parse(localStorage.getItem(currentUser + "_allergies") || "[]");
}

allergyForm.addEventListener("submit", e => {
  e.preventDefault();
  const checked = Array.from(allergyForm.querySelectorAll("input[type=checkbox]:checked")).map(cb => cb.value);
  localStorage.setItem(currentUser + "_allergies", JSON.stringify(checked));
  alert("Allergies saved!");
  allergyModal.style.display = "none";
});

// Prefill allergy checkboxes
window.addEventListener("load", () => {
  const allergies = getAllergies();
  allergyForm.querySelectorAll("input[type=checkbox]").forEach(cb => {
    cb.checked = allergies.includes(cb.value);
  });
  fetchRecipes(""); // show default recipes
});

// Recipe Modal
modalCloseBtn.addEventListener("click", () => recipeModal.style.display = "none");
window.addEventListener("click", e => { if(e.target === recipeModal) recipeModal.style.display = "none"; });

// Search
searchButton.addEventListener("click", () => {
  const query = searchInput.value.trim();
  fetchRecipes(query);
});

searchInput.addEventListener("keypress", e => {
  if(e.key === "Enter") {
    e.preventDefault();
    fetchRecipes(searchInput.value.trim());
  }
});

async function fetchRecipes(query) {
  recipesContainer.innerHTML = "<p>Loading recipes...</p>";
  const allergies = getAllergies();
  const intoleranceParam = allergies.join(",");

  try {
    const response = await fetch(
      `https://api.spoonacular.com/recipes/complexSearch?query=${query}&number=6&addRecipeInformation=true&intolerances=${intoleranceParam}&apiKey=${API_KEY}`
    );
    const data = await response.json();
    displayRecipes(data.results);
  } catch (error) {
    recipesContainer.innerHTML = "<p>Error fetching recipes.</p>";
    console.error(error);
  }
}

function displayRecipes(recipes) {
  recipesContainer.innerHTML = "";
  if (!recipes || recipes.length === 0) {
    recipesContainer.innerHTML = "<p>No recipes found.</p>";
    return;
  }

  recipes.forEach(recipe => {
    const card = document.createElement("div");
    card.className = "recipeCard";
    card.innerHTML = `<img src="${recipe.image}" alt="${recipe.title}"><h3>${recipe.title}</h3>`;
    card.addEventListener("click", () => showRecipeModal(recipe));
    recipesContainer.appendChild(card);
  });
}

function showRecipeModal(recipe) {
  modalTitle.textContent = recipe.title;
  modalInfo.textContent = `Ready in ${recipe.readyInMinutes || "N/A"} mins | Servings: ${recipe.servings || "N/A"}`;
  modalIngredients.innerHTML = "";
  modalInstructions.innerHTML = "";

  if(recipe.extendedIngredients) {
    recipe.extendedIngredients.forEach(ing => {
      const li = document.createElement("li");
      li.textContent = ing.original ? ing.original : ing;
      modalIngredients.appendChild(li);
    });
  }
  if(recipe.analyzedInstructions && recipe.analyzedInstructions.length > 0) {
    recipe.analyzedInstructions[0].steps.forEach(step => {
      const li = document.createElement("li");
      li.textContent = step.step;
      modalInstructions.appendChild(li);
    });
  } else {
    modalInstructions.innerHTML = "<li>Instructions not available.</li>";
  }

  recipeModal.style.display = "block";
}
