async function login() {
  const username = document.getElementById("username").value.trim();
  const password = document.getElementById("password").value.trim();
  const errorDiv = document.getElementById("error");

  // Clear any previous error messages
  errorDiv.textContent = "";

  try {
    const response = await fetch("https://learn.reboot01.com/api/auth/signin", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password }),
    });

    const data = await response.json();

    if (response.ok && data.token) {
      localStorage.setItem("token", data.token); // Save the token
      showDashboard();
    } else {
      errorDiv.textContent = "Login failed. Check your credentials.";
    }
  } catch (err) {
    errorDiv.textContent = "An error occurred.";
    console.error(err); // Log the error to the console
  }
}

function showDashboard() {
  document.getElementById("login").style.display = "none";
  document.getElementById("dashboard").style.display = "block";
}

function logout() {
  localStorage.removeItem("token");
  document.getElementById("dashboard").style.display = "none";
  document.getElementById("login").style.display = "block";
}

// Auto-login if token exists
window.onload = () => {
  if (localStorage.getItem("token")) {
    showDashboard();
  }
};
