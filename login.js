async function login() {
  const username = document.getElementById("username").value.trim();
  const password = document.getElementById("password").value.trim();
  const errorBox = document.getElementById("error");

  if (!username || !password) {
    errorBox.textContent = "Please enter both username and password.";
    return;
  }

  try {
    const response = await fetch("https://learn.reboot01.com/api/auth/signin", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password }),
    });

    const data = await response.json();

    if (!response.ok) {
      errorBox.textContent = data.error || "Login failed.";
      return;
    }

    // Store token in localStorage for later GraphQL access
    localStorage.setItem("token", data.token); // Save the token
    window.location.href = "dashbored.html"; // Redirect to dashboard
  } catch (err) {
    console.error(err);
    errorBox.textContent = "An error occurred. Please try again.";
  }
}
