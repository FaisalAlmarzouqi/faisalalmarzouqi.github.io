async function fetchUserProfile() {
  const token = localStorage.getItem("jwt");

  if (!token) {
    console.warn("No JWT token found. Redirecting to login.");
    // Optional: redirect to login
    // window.location.href = "index.html";
    return;
  }

  // Debug: Log JWT format
  if (!token.includes('.') || token.split('.').length !== 3) {
    console.warn("Invalid JWT format. Clearing token and redirecting.");
    localStorage.removeItem("jwt");
    // Optional: redirect
    // window.location.href = "index.html";
    return;
  }

  const query = `
    query {
      user {
        id
        login
        firstName
        lastName
        email
      }
    }
  `;

  try {
    const response = await fetch("https://learn.reboot01.com/api/graphql-engine/v1/graphql", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`,
      },
      body: JSON.stringify({ query }),
    });

    const result = await response.json();

    if (result.errors || !result.data) {
      console.warn("GraphQL error or invalid token:", result.errors);
      localStorage.removeItem("jwt");
      // Optional: redirect to login
      // window.location.href = "index.html";
      return;
    }

    const user = result.data.user;
    document.getElementById("loginData").textContent = `${user.firstName} ${user.lastName} (@${user.login})`;
    document.getElementById("email").textContent = user.email;

    // Hide loading, show profile content
    document.getElementById("loading").style.display = "none";
    document.getElementById("profile").style.display = "block";
  } catch (error) {
    console.error("Error fetching user profile:", error);
    localStorage.removeItem("jwt");
    // Optional: redirect to login
    // window.location.href = "index.html";
  }
}

// Auto-run on page load
window.addEventListener("DOMContentLoaded", fetchUserProfile);
