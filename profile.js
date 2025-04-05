// Fetch Profile and render data
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
              "Authorization": "Bearer " + localStorage.getItem("token"),
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


// Call fetchProfile or loadProfile when the page loads
window.onload = () => {
  if (localStorage.getItem("token")) {
      fetchProfile();  // Fetch and render user data when logged in
  }
};
