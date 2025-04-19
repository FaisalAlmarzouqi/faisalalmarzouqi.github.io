import { fetchGraphData } from './fetchgraph.js';

const token = localStorage.getItem("jwt");

if (!token) {
  alert("You're not logged in. Redirecting to login page.");
  window.location.href = "index.html";
}

document.addEventListener("DOMContentLoaded", async () => {
  try {
    const xpData = await loadXPData();
    drawXPChart(xpData.transaction);

    const auditData = await loadAuditRatio();
    drawAuditChart(auditData.user[0].auditRatio);

    const voteData = await loadProjectRatio();
    drawProjectChart(voteData.user[0].totalUp, voteData.user[0].totalDown);

    const logoutBtn = document.getElementById("logoutBtn");
    if (logoutBtn) {
      logoutBtn.addEventListener("click", () => {
        localStorage.removeItem("jwt");
        window.location.href = "index.html";
      });
    } else {
      console.warn("Logout button not found.");
    }

  } catch (err) {
    console.error("Error loading data:", err.message);
    alert("Error loading dashboard data. Please login again.");
    window.location.href = "index.html";
  }
});

// Queries (same as before)
async function loadXPData() {
  const query = `{
    transaction(where: { type: { _eq: "xp" } }) {
      amount
      path
      createdAt
    }
  }`;
  return await fetchGraphData(query);
}

async function loadAuditRatio() {
  const query = `{ user { auditRatio } }`;
  return await fetchGraphData(query);
}

async function loadProjectRatio() {
  const query = `{ user { totalUp totalDown } }`;
  return await fetchGraphData(query);
}

// Chart functions (same as before)
function drawXPChart(data) {
  const ctx = document.getElementById("xpChart")?.getContext("2d");
  if (!ctx) return;

  const labels = data.map(item => new Date(item.createdAt).toLocaleDateString());
  const amounts = data.map(item => item.amount);

  new Chart(ctx, {
    type: "line",
    data: {
      labels,
      datasets: [{
        label: "XP Earned",
        data: amounts,
        borderColor: "blue",
        backgroundColor: "rgba(0, 0, 255, 0.1)",
        fill: true,
        tension: 0.3
      }]
    }
  });
}

function drawAuditChart(ratio) {
  const ctx = document.getElementById("auditChart")?.getContext("2d");
  if (!ctx) return;

  new Chart(ctx, {
    type: "doughnut",
    data: {
      labels: ["Audit", "Other"],
      datasets: [{
        data: [ratio, 1 - ratio],
        backgroundColor: ["green", "#ccc"]
      }]
    }
  });
}

function drawProjectChart(up, down) {
  const ctx = document.getElementById("projectChart")?.getContext("2d");
  if (!ctx) return;

  new Chart(ctx, {
    type: "bar",
    data: {
      labels: ["Upvotes", "Downvotes"],
      datasets: [{
        label: "Votes",
        data: [up, down],
        backgroundColor: ["#4CAF50", "#F44336"]
      }]
    }
  });
}

