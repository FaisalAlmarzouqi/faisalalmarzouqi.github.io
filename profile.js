import { fetchGraphData } from './fetchgraph.js';

document.addEventListener("DOMContentLoaded", async () => {
  try {
    await loadXPData();
    await loadAuditRatio();
    await loadProjectRatio();
  } catch (err) {
    console.error("Error loading data:", err.message);
  }
});

// XP Query
async function loadXPData() {
  const query = `
    {
      transaction(where: { type: { _eq: "xp" } }) {
        amount
        path
        createdAt
      }
    }
  `;
  const data = await fetchGraphData(query);
  console.log("XP Data:", data);
  drawXPChart(data.transaction)
}

// Audit Ratio Query
async function loadAuditRatio() {
  const query = `
    {
      user {
        auditRatio
      }
    }
  `;
  const data = await fetchGraphData(query);
  console.log("Audit Ratio:", data);
   drawAuditChart(data.user[0].auditRatio)
}

// Project Ratio Query
async function loadProjectRatio() {
  const query = `
    {
      user {
        totalUp
        totalDown
      }
    }
  `;
  const data = await fetchGraphData(query);
  console.log("Project Ratio:", data);
  drawProjectChart(data.user[0].totalUp, data.user[0].totalDown)
}
function drawXPChart(data) {
  const ctx = document.getElementById("xpChart").getContext("2d");

  const labels = data.map(item => new Date(item.createdAt).toLocaleDateString());
  const amounts = data.map(item => item.amount);

  new Chart(ctx, {
    type: "line",
    data: {
      labels: labels,
      datasets: [{
        label: "XP Earned",
        data: amounts,
        borderColor: "blue",
        backgroundColor: "rgba(0, 0, 255, 0.1)",
        fill: true,
        tension: 0.3
      }]
    },
    options: {
      responsive: true,
      scales: {
        y: { beginAtZero: true }
      }
    }
  });
}

function drawAuditChart(ratio) {
  const ctx = document.getElementById("auditChart").getContext("2d");

  new Chart(ctx, {
    type: "doughnut",
    data: {
      labels: ["Audit Contribution", "Other"],
      datasets: [{
        data: [ratio, 1 - ratio],
        backgroundColor: ["green", "#ccc"]
      }]
    },
    options: {
      responsive: true,
      cutout: "70%",
    }
  });
}
function drawProjectChart(up, down) {
  const ctx = document.getElementById("projectChart").getContext("2d");

  new Chart(ctx, {
    type: "bar",
    data: {
      labels: ["Upvotes", "Downvotes"],
      datasets: [{
        label: "Project Votes",
        data: [up, down],
        backgroundColor: ["#4CAF50", "#F44336"]
      }]
    },
    options: {
      responsive: true,
      scales: {
        y: { beginAtZero: true }
      }
    }
  });
}
