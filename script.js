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

/* ================= USER SESSION ================= */
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

/* ================= FETCH RECIPES ================= */
async function fetchRecipes(query) {
  recipesContainer.innerHTML = "<p>Loading recipes...</p>";
  const allergies = getAllergies().join(",");

  try {
    const response = await fetch(
      `https://api.spoonacular.com/recipes/complexSearch?query=${query}&number=6&addRecipeInformation=true&intolerances=${allergies}&apiKey=${API_KEY}`
    );
    const data = await response.json();
    displayRecipes(data.results);
  } catch (err) {
    recipesContainer.innerHTML = "<p>Error loading recipes.</p>";
    console.error(err);
  }
}

/* ================= DISPLAY RECIPES ================= */
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
      <img src="${recipe.image}" alt="${recipe.title}">
      <h3>${recipe.title}</h3>
    `;

    card.addEventListener("click", () => showRecipeModal(recipe));
    recipesContainer.appendChild(card);
  });
}

/* ================= MODAL ================= */
modalCloseBtn.addEventListener("click", () => recipeModal.style.display = "none");

function showRecipeModal(recipe) {
  modalTitle.textContent = recipe.title;
  modalInfo.textContent = `Ready in ${recipe.readyInMinutes || "N/A"} mins · Servings: ${recipe.servings || "N/A"}`;

  modalIngredients.innerHTML = "";
  modalInstructions.innerHTML = "";

  /* INGREDIENTS */
  if (recipe.extendedIngredients) {
    recipe.extendedIngredients.forEach(ing => {
      const li = document.createElement("li");
      li.textContent = ing.original;
      modalIngredients.appendChild(li);
    });
  }

  /* INSTRUCTIONS (FIXED) */
  if (recipe.analyzedInstructions && recipe.analyzedInstructions.length > 0) {
    recipe.analyzedInstructions[0].steps.forEach(step => {
      const li = document.createElement("li");
      li.textContent = step.step;
      modalInstructions.appendChild(li);
    });
  } else if (recipe.instructions) {
    // Convert HTML instructions to readable text
    const tempDiv = document.createElement("div");
    tempDiv.innerHTML = recipe.instructions;

    tempDiv.querySelectorAll("p").forEach(p => {
      const li = document.createElement("li");
      li.textContent = p.textContent;
      modalInstructions.appendChild(li);
    });
  } else {
    modalInstructions.innerHTML = "<li>No instructions available.</li>";
  }

  recipeModal.style.display = "block";
}
