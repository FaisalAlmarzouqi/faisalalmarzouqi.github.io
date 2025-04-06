async function fetchUserGraphs() {
    const token = localStorage.getItem("jwt");
  
    // If no token, redirect once
    if (!token) {
    //   if (window.location.pathname !== "index.html") { // Prevent redirect if already on login page
    //     window.location.href = "index.html";
    //   }
      return;
    }
  
    const query = `
      query {
        userGraphs {
          id
          name
          data
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
  
      // Handle GraphQL errors or invalid token gracefully
      if (result.errors || !result.data) {
        console.warn("GraphQL error or invalid token", result.errors);
        localStorage.removeItem("jwt");
        // if (window.location.pathname !== "index.html") { // Prevent redirect if already on login page
        //   window.location.href = "index.html";
        // }
        return;
      }
  
      // Process graphs data here
      console.log(result.data.userGraphs);
    } catch (error) {
      console.error("Fetch graphs error:", error);
      localStorage.removeItem("jwt");
    //   if (window.location.pathname !== "index.html") { // Prevent redirect if already on login page
    //     window.location.href = "index.html";
    //   }
    }
  }
  
window.onload = fetchGraphData;
