// frontend/login.js
async function signIn() {
    const username = document.getElementById("username").value;
    const password = document.getElementById("password").value;
  
    try {
      const response = await fetch("/signin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
        credentials: "include", // allow cookie to be sent/received
      });
  
      const data = await response.json();
  
      if (response.ok) {
        window.location.href = "dashboard.html"; // redirect on success
      } else {
        alert("Error: " + data.error);
      }
    } catch (error) {
      console.error("Login error:", error);
    }
  }
  