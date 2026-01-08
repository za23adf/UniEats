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

/* ================= DEMO FALLBACK (REALISTIC GRID) ================= */
const demoRecipes = [
  {
    id: 1,
    title: "Creamy Chicken Pasta",
    image: "https://images.unsplash.com/photo-1525755662778-989d0524087e",
    readyInMinutes: 25,
    servings: 2,
    extendedIngredients: [{ original: "Pasta" }, { original: "Chicken" }],
    instructions: "Boil pasta. Cook chicken. Mix with sauce."
  },
  {
    id: 2,
    title: "Quick Veggie Stir Fry",
    image: "https://images.unsplash.com/photo-1603133872878-684f208fb84b",
    readyInMinutes: 15,
    servings: 1,
    extendedIngredients: [{ original: "Vegetables" }],
    instructions: "Stir fry vegetables. Add sauce."
  },
  {
    id: 3,
    title: "Student Omelette",
    image: "https://images.unsplash.com/photo-1551218808-94e220e084d2",
    readyInMinutes: 10,
    servings: 1,
    extendedIngredients: [{ original: "Eggs" }],
    instructions: "Beat eggs. Cook in pan."
  },
  {
    id: 4,
    title: "Simple Tomato Pasta",
    image: "https://images.unsplash.com/photo-1521389508051-d7ffb5dc8c33",
    readyInMinutes: 20,
    servings: 2,
    extendedIngredients: [{ original: "Tomato sauce" }],
    instructions: "Cook pasta. Add sauce."
  },
  {
    id: 5,
    title: "Grilled Cheese Sandwich",
    image: "https://images.unsplash.com/photo-1605475128023-2c7b67d1c5d1",
    readyInMinutes: 8,
    servings: 1,
    extendedIngredients: [{ original: "Bread & cheese" }],
    instructions: "Grill sandwich until golden."
  },
  {
    id: 6,
    title: "Easy Rice Bowl",
    image: "https://images.unsplash.com/photo-1540189549336-e6e99c3679fe",
    readyInMinutes: 12,
    servings: 1,
    extendedIngredients: [{ original: "Rice" }],
    instructions: "Cook rice. Add toppings."
  }
];

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

    if (!response.ok) throw new Error("API limit");

    const data = await response.json();
    localStorage.setItem("cachedRecipeList", JSON.stringify(data.results));
    displayRecipes(data.results);

  } catch {
    const cached = JSON.parse(localStorage.getItem("cachedRecipeList"));
    displayRecipes(cached && cached.length ? cached : demoRecipes);
  }
}

/* ================= DISPLAY LIST ================= */
function displayRecipes(recipes) {
  recipesContainer.innerHTML = "";

  recipes.forEach(recipe => {
    const card = document.createElement("div");
    card.className = "recipeCard";

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
  modalInfo.textContent = `Ready in ${recipe.readyInMinutes} mins · Servings: ${recipe.servings}`;

  modalIngredients.innerHTML = "";
  recipe.extendedIngredients?.forEach(i => {
    const li = document.createElement("li");
    li.textContent = i.original;
    modalIngredients.appendChild(li);
  });

  modalInstructions.innerHTML = "";
  recipe.instructions.split(". ").forEach(step => {
    if (step.trim()) {
      const li = document.createElement("li");
      li.textContent = step;
      modalInstructions.appendChild(li);
    }
  });

  recipeModal.style.display = "block";
}
