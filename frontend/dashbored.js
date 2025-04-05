// frontend/dashboard.js
async function fetchProfile() {
    const query = `
      {
        user {
          login
          email
          totalUp
          totalDown
          auditRatio
        }
      }
    `;
  
    try {
      const response = await fetch("/graphql", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query }),
        credentials: "include", // send cookie
      });
  
      const data = await response.json();
      document.getElementById("data").innerText = JSON.stringify(data, null, 2);
    } catch (error) {
      console.error("GraphQL error:", error);
    }
  }
  
  fetchProfile();
  