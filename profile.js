// Fetch Profile and render data
async function fetchProfile() {
  const token = localStorage.getItem("jwt");

  console.log('Token fetched:', token);  // Debugging log

  // Check for missing or invalid token
  if (!token || token.split('.').length !== 3) {
      console.error("Invalid or missing JWT token.");
      localStorage.removeItem("jwt");  // Remove invalid token

      // If we're on the profile page, redirect to login (index.html)
      if (window.location.pathname !== "/index.html" && !window.redirected) {
          window.redirected = true;  // Set a flag to prevent repeated redirects
          window.location.href = "index.html";
      }
      return;
  }

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
  }`;

  try {
      const response = await fetch("https://learn.reboot01.com/api/graphql-engine/v1/graphql", {
          method: "POST",
          headers: {
              "Content-Type": "application/json",
              "Authorization": "Bearer " + token,
          },
          body: JSON.stringify({ query }),
      });

      const data = await response.json();

      if (data.errors) {
          throw new Error(data.errors[0].message);
      }

      const profileData = data.data.user;
      const xpData = data.data.xpData;

      // Render profile data
      document.getElementById("loginData").innerText = `Login: ${profileData.login}`;
      document.getElementById("email").innerText = `Email: ${profileData.email}`;
      document.getElementById("totalUp").innerText = `Total Up: ${profileData.totalUp}`;
      document.getElementById("totalDown").innerText = `Total Down: ${profileData.totalDown}`;
      document.getElementById("auditRatio").innerText = `Audit Ratio: ${profileData.auditRatio}`;

      // Render graphs
      renderXPGraph(xpData);
      renderAuditRatio({ user: [profileData] });

      // Call loadProfile for additional user-specific data (like level, user stats)
      await loadProfile();
  } catch (error) {
      console.error("GraphQL error:", error);
      // If there's an error fetching profile, redirect to login
      window.redirected = true;
      window.location.href = "index.html";
  }
}

// Load profile data including title, level, and more
async function loadProfile() {
  const userId = await getUserIdFromToken();

  if (!userId) {
      console.error('Failed to retrieve user ID');
      return;
  }

  try {
      const titleData = await fetchData(getTitleData, { userId });
      const auditData = await fetchData(getAuditData, { userId });
      const xpForProjects = await fetchData(getXpForProjects, { userId });

      // Display user info in the new profile container
      document.getElementById('userName').innerText = `Hello, ${titleData.user[0].firstName} ${titleData.user[0].lastName} !`;
      document.getElementById('email').innerText = ` ${titleData.user[0].email}`;
      document.getElementById('userLevel').innerText = `${titleData.event_user[0].level}`;
      document.getElementById('userXP').innerText = ` ${(xpForProjects.transaction.reduce((acc, tx) => acc + tx.amount, 0) / 1000).toFixed(1)} Kb`;
      document.getElementById('audit').innerText = `${(auditData.user[0].auditRatio).toFixed(1)}`;

      // Render graphs
      renderXPGraph(xpForProjects);
      renderAuditRatio(auditData);

  } catch (error) {
      console.error('Error loading profile data:', error);
  }
}

// Helper function to extract user ID from JWT (assuming you have this logic)
async function getUserIdFromToken() {
  const jwt = localStorage.getItem('jwt');
  if (!jwt) return null;

  try {
      const decodedToken = decodeJWT(jwt);  // Assuming you have a decodeJWT function
      return decodedToken.userId;
  } catch (error) {
      console.error('Error decoding token:', error);
      return null;
  }
}

// Mockup for decoding JWT (replace with actual decoding logic)
function decodeJWT(token) {
  const payload = token.split('.')[1];  // Assuming standard JWT structure (header.payload.signature)
  return JSON.parse(atob(payload));  // Decode base64 and parse as JSON
}

// Call fetchProfile or loadProfile when the page loads
window.onload = async () => {
  console.log('Window loaded. Checking for JWT...');
  
  if (localStorage.getItem("jwt")) {
      await fetchProfile();  // Fetch and render user data when logged in
  } else {
      console.log('No JWT found. Redirecting to login...');
      if (window.location.pathname !== "/index.html") {
          if (!window.redirected) {
              window.redirected = true;
              window.location.href = "index.html"; // Redirect to login page
          }
      }
  }
};

// Logout function
function logout() {
  localStorage.removeItem('jwt');
  window.location.href = 'index.html';  // Redirect to login page after logout
}
