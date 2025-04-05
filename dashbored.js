// Import necessary functions
import { renderXPGraph, renderAuditRatio } from './graphs.js';

// Function to fetch and render user profile data and graphs
// Fetch profile and render data
async function fetchProfile() {
  document.getElementById("loading").style.display = 'block';  // Show loading spinner
  
  // GraphQL query to fetch profile and XP data
  const query = `
    {
      user {
        login
        email
        totalUp
        totalDown
        auditRatio
      }
      xpData {
        transaction {
          amount
          path
        }
      }
    }
  `;
  
  try {
    const response = await fetch("https://learn.reboot01.com/api/graphql-engine/v1/graphql", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": "Bearer " + localStorage.getItem("token"),  // Use the token stored in localStorage
      },
      body: JSON.stringify({ query }),
    });

    const data = await response.json();
    
    document.getElementById("loading").style.display = 'none';  // Hide loading spinner
    
    if (data.errors) {
      throw new Error(data.errors[0].message);
    }
    
    // Update profile data
    const profileData = data.data.user;
    const xpData = data.data.xpData;
    
    // Render profile data
    document.getElementById("loginData").innerText = `Login: ${profileData.login}`;
    document.getElementById("email").innerText = `Email: ${profileData.email}`;
    document.getElementById("totalUp").innerText = `Total Up: ${profileData.totalUp}`;
    document.getElementById("totalDown").innerText = `Total Down: ${profileData.totalDown}`;
    document.getElementById("auditRatio").innerText = `Audit Ratio: ${profileData.auditRatio}`;
    
    // Render graphs
    renderXPGraph(xpData); // This will render the XP graph
    renderAuditRatio({ user: [profileData] }); // This will render the Audit Ratio graph
    
  } catch (error) {
    console.error("GraphQL error:", error);
    document.getElementById("error").innerText = "Error loading user data. Please try again later.";
    document.getElementById("loading").style.display = 'none';  // Hide loading spinner
  }
}

window.onload = () => {
  if (localStorage.getItem("token")) {
    showDashboard();
    fetchProfile();  // Fetch and render user data when logged in
  }
};


// Call the function to fetch profile data when the page loads
fetchProfile();
