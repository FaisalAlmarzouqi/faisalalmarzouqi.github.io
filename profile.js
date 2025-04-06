async function fetchUserProfile() {
  const token = localStorage.getItem("jwt");

  // If no token, redirect once
  if (!token) {
    // if (window.location.pathname !== "index.html") { // Prevent redirect if already on login page
    //   window.location.href = "index.html";
    // }
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
    const response = await fetch("/graphql", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token, query }),
    });

    const result = await response.json();

    // If the token is invalid or the GraphQL request failed
    if (result.errors || !result.data) {
      console.warn("Invalid token or GraphQL error", result.errors);
      localStorage.removeItem("jwt");
      // if (window.location.pathname !== "index.html") { // Prevent redirect if already on login page
      //   window.location.href = "index.html";
      // }
      return;
    }

    const user = result.data.user;
    document.getElementById("username").textContent = `${user.firstName} ${user.lastName} (@${user.login})`;
    document.getElementById("email").textContent = user.email;
  } catch (error) {
    console.error("Fetch profile error:", error);
    localStorage.removeItem("jwt");
    // if (window.location.pathname !== "index.html") { // Prevent redirect if already on login page
    //   window.location.href = "index.html";
    // }
  }
}

window.onload = fetchUserProfile;
