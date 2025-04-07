async function fetchGraphData() {
  const token = localStorage.getItem("jwt");
  if (!token) {
    console.warn("No JWT token found");
    return;
  }

  const query = `
    query {
      user {
        id
        login
        auditRatio
        totalUp
        totalDown
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
      console.error("GraphQL error:", result.errors);
      return;
    }

    const user = result.data.user;
    console.log("User data:", user);

    // Render some values for now
    document.getElementById("graph-audit-ratio").textContent = `Audit Ratio: ${user.auditRatio}`;
    document.getElementById("graph-total-up").textContent = `Total Up: ${user.totalUp}`;
    document.getElementById("graph-total-down").textContent = `Total Down: ${user.totalDown}`;

  } catch (error) {
    console.error("Fetch graph error:", error);
  }
}

window.onload = fetchGraphData;
