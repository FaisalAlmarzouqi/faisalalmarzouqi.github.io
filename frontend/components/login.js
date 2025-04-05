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
  function getCookie(name) {
    const value = "; " + document.cookie;
    const parts = value.split("; " + name + "=");
    if (parts.length === 2) return parts.pop().split(";").shift();
  }
  
  async function login() {
    const username = document.getElementById("username").value;
    const password = document.getElementById("password").value;
  
    const res = await fetch("/signin", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password })
    });
  
    const data = await res.json();
    if (res.ok && data.token) {
      document.cookie = `jwt=${data.token}; path=/`;
      alert("Login successful!");
      document.getElementById("dashboard").style.display = "block";
    } else {
      alert("Login failed.");
    }
  }
  
  async function fetchGraphQLData() {
    const token = getCookie("jwt");
    const query = `
      {
        user {
          login
          email
        }
      }
    `;
  
    const res = await fetch("/graphql", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token, query })
    });
  
    const data = await res.json();
    document.getElementById("result").innerText = JSON.stringify(data, null, 2);
  }
  
  