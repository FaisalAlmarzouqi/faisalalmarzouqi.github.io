async function login() {
  const username = document.getElementById("username").value.trim();
  const password = document.getElementById("password").value.trim();
  const errorDiv = document.getElementById("error");

  // Base64 encode the username:password
  const base64Credentials = btoa(username + ":" + password);

  // Log credentials and Authorization header for debugging
  console.log("Base64 Encoded Credentials:", base64Credentials);
  console.log("Authorization Header: Basic " + base64Credentials);

  try {
    const response = await fetch("https://learn.reboot01.com/api/auth/signin", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": "Basic " + base64Credentials, // Add Authorization header with Base64 credentials
      },
    });

    const data = await response.json();

    // Log the response to see what is returned from the server
    console.log("Response:", data);

    if (response.ok && data.token) {
      localStorage.setItem("token", data.token); // Save the token
      showDashboard();
    } else {
      errorDiv.textContent = "Login failed. Check your credentials.";
    }
  } catch (err) {
    errorDiv.textContent = "An error occurred.";
    console.error(err);
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
