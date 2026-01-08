const loginBtn = document.getElementById("loginBtn");
const usernameInput = document.getElementById("username");

loginBtn.addEventListener("click", () => {
  const username = usernameInput.value.trim();
  if (username === "") {
    alert("Please enter a username.");
    return;
  }

  // Save current user
  localStorage.setItem("currentUser", username);

  // If allergies not set yet, create empty array
  if (!localStorage.getItem(username + "_allergies")) {
    localStorage.setItem(username + "_allergies", JSON.stringify([]));
  }

  // Redirect to main recipe page
  window.location.href = "index.html";
});
