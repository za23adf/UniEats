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

/* ================= USER ================= */
const currentUser = localStorage.getItem("currentUser");
if (!currentUser) window.location.href = "login.html";
currentUserDisplay.textContent = "Logged in as: " + currentUser;

logoutBtn.addEventListener("click", () => {
  localStorage.removeItem("currentUser");
  window.location.href = "login.html";
});

/* ================= ALLERGIES ================= */
function getAllergies() {
  return JSON.parse(localStorage.getItem(currentUser + "_allergies") || "[]");
}

allergyBtn.addEventListener("click", () => allergyModal.style.display = "block");
closeAllergyBtn.addEventListener("click", () => allergyModal.style.display = "none");

window.addEventListener("click", e => {
  if (e.target === allergyModal) allergyModal.style.display = "none";
  if (e.target === recipeModal) recipeModal.style.display = "none";
});

allergyForm.addEventListener("submit", e => {
  e.preventDefault();
  const checked = [...allergyForm.querySelectorAll("input:checked")].map(cb => cb.value);
  localStorage.setItem(currentUser + "_allergies", JSON.stringify(checked));
  alert("Allergies saved!");
  allergyModal.style.display = "none";
});

/* ================= LOAD ================= */
window.addEventListener("load", () => {
  const allergies = getAllergies();
  allergyForm.querySelectorAll("input").forEach(cb => {
    cb.checked = allergies.includes(cb.value);
  });
  fetchRecipes("");
});

/* ================= SEARCH ================= */
searchButton.addEventListener("click", () => fetchRecipes(searchInput.value.trim()));
searchInput.addEventListener("keypress", e => {
  if (e.key === "Enter") fetchRecipes(searchInput.value.trim());
});

/* ================= FETCH LIST ================= */
async function fetchRecipes(query) {
  recipesContainer.innerHTML = "<p>Loading recipes...</p>";
  const allergies = getAllergies().join(",");

  try {
    const response = await fetch(
      `https://api.spoonacular.com/recipes/complexSearch?query=${query}&number=6&intolerances=${allergies}&apiKey=${API_KEY}`
    );
    const data = await response.json();
    displayRecipes(data.results);
  } catch (err) {
    recipesContainer.innerHTML = "<p>Error loading recipes.</p>";
    console.error(err);
  }
}

/* ================= DISPLAY LIST ================= */
function displayRecipes(recipes) {
  recipesContainer.innerHTML = "";

  if (!recipes || recipes.length === 0) {
    recipesContainer.innerHTML = "<p>No recipes found.</p>";
    return;
  }

  recipes.forEach(recipe => {
    const card = document.createElement("div");
    card.className = "recipeCard";
    card.style.animationDelay = Math.random() * 0.2 + "s";

    card.innerHTML = `
      <img src="https://spoonacular.com/recipeImages/${recipe.id}-556x370.jpg" alt="${recipe.title}">
      <h3>${recipe.title}</h3>
    `;

    card.addEventListener("click", () => loadFullRecipe(recipe.id));
    recipesContainer.appendChild(card);
  });
}

/* ================= FETCH FULL RECIPE ================= */
async function loadFullRecipe(id) {
  modalTitle.textContent = "Loading...";
  modalIngredients.innerHTML = "";
  modalInstructions.innerHTML = "";
  recipeModal.style.display = "block";

  try {
    const response = await fetch(
      `https://api.spoonacular.com/recipes/${id}/information?includeNutrition=false&apiKey=${API_KEY}`
    );
    const recipe = await response.json();
    showRecipeModal(recipe);
  } catch (error) {
    modalInstructions.innerHTML = "<li>Error loading instructions.</li>";
    console.error(error);
  }
}

/* ================= MODAL ================= */
modalCloseBtn.addEventListener("click", () => recipeModal.style.display = "none");

function showRecipeModal(recipe) {
  modalTitle.textContent = recipe.title;
  modalInfo.textContent = `Ready in ${recipe.readyInMinutes || "N/A"} mins · Servings: ${recipe.servings || "N/A"}`;

  /* INGREDIENTS */
  modalIngredients.innerHTML = "";
  recipe.extendedIngredients?.forEach(ing => {
    const li = document.createElement("li");
    li.textContent = ing.original;
    modalIngredients.appendChild(li);
  });

  /* INSTRUCTIONS – GUARANTEED */
  modalInstructions.innerHTML = "";

  if (recipe.analyzedInstructions?.length > 0) {
    recipe.analyzedInstructions[0].steps.forEach(step => {
      const li = document.createElement("li");
      li.textContent = step.step;
      modalInstructions.appendChild(li);
    });
  } 
  else if (recipe.instructions) {
    const clean = recipe.instructions.replace(/<\/?[^>]+(>|$)/g, "");
    clean.split(". ").forEach(sentence => {
      if (sentence.trim().length > 10) {
        const li = document.createElement("li");
        li.textContent = sentence.trim() + ".";
        modalInstructions.appendChild(li);
      }
    });
  } 
  else {
    modalInstructions.innerHTML = "<li>No preparation steps provided.</li>";
  }
}
