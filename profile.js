import { fetchGraphData } from './fetchgraph.js';

// Check for JWT token in localStorage
const token = localStorage.getItem("jwt");
if (!token) {
  alert("You're not logged in. Redirecting to login page.");
  window.location.href = "index.html";
}

// Event listener for DOM content load
document.addEventListener("DOMContentLoaded", async () => {
  try {
    // Load and draw audit ratio data
    const auditData = await loadAuditRatio();
    const user = auditData.user[0]; // assume it's an array
    drawAuditSVG(user.totalUp, user.totalDown, user.auditRatio);
   
    const xpData = await loadXPData();
    drawXPSVG(xpData.transaction);

//     const levelData = await loadUserLevelData();
//         const userLevel = levelData.user[0]; // assume it's an array
// console.log("levelData", levelData);

    // const userLevel = levelData.user[0]; // assume it's an array
    // drawUserLevelSVG(userLevel.level, userLevel.experience);

    // Setup logout functionality
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

// Queries
async function loadAuditRatio() {
  const query = `
    {
      user {
        auditRatio
        totalUp
        totalDown
      }
    }
  `;
  return await fetchGraphData(query);
}

// Chart drawing function for audit ratio data
function drawAuditSVG(done, received, ratio) {
  const svgNS = "http://www.w3.org/2000/svg";
  const width = 360;
  const height = 200; // Increased height for better spacing
  const maxVal = Math.max(done, received);

  const svg = document.createElementNS(svgNS, "svg");
  svg.setAttribute("width", width);
  svg.setAttribute("height", height);
  svg.style.background = "#1e1e1e";
  svg.style.borderRadius = "12px";
  svg.style.padding = "10px"; // Added padding to avoid text collision

  // Function to create text elements in SVG
  const createText = (x, y, content, size = 14, color = "#ffffff", weight = "normal") => {
    const text = document.createElementNS(svgNS, "text");
    text.setAttribute("x", x);
    text.setAttribute("y", y);
    text.textContent = content;
    text.setAttribute("fill", color);
    text.setAttribute("font-size", size);
    text.setAttribute("font-weight", weight);
    text.setAttribute("font-family", "Segoe UI, sans-serif");
    return text;
  };

  // Function to create bar elements in SVG
  const createBar = (x, y, barWidth, color) => {
    const bar = document.createElementNS(svgNS, "rect");
    bar.setAttribute("x", x);
    bar.setAttribute("y", y);
    bar.setAttribute("width", barWidth);
    bar.setAttribute("height", 10); // Increased bar height for better visibility
    bar.setAttribute("fill", color);
    bar.setAttribute("rx", 5); // Rounded corners for the bars
    return bar;
  };

  // Title
  svg.appendChild(createText(20, 25, "Audits Ratio", 16, "#ffffff", "500"));

  // Done
  svg.appendChild(createText(20, 55, "Done", 14));
  svg.appendChild(createBar(80, 49, (done / maxVal) * 200, "#00d0aa"));
  svg.appendChild(createText(290, 55, `${done.toFixed(2)} MB ↑`, 12, "#00d0aa"));

  // Received
  svg.appendChild(createText(20, 85, "Received", 14));
  svg.appendChild(createBar(80, 79, (received / maxVal) * 200, "#ffffff"));
  svg.appendChild(createText(290, 85, `${received.toFixed(2)} MB ↓`, 12, "#ffffff"));

  // Ratio
  svg.appendChild(createText(5, 130, "Audit Ratio", 16, "#ffffff"));
  svg.appendChild(createText(85, 130, ratio.toFixed(2), 30, "#00d0aa", "100"));

  // Label based on ratio
  const label = ratio >= 1.5
    ? "Excellent!"
    : ratio >= 1.2
    ? "Almost perfect!"
    : ratio >= 1.0
    ? "Pretty good!"
    : "Needs work";
  svg.appendChild(createText(85, 170, label, 16, "#00d0aa"));

  // Append SVG to the dashboard container
  document.getElementById("auditRatioCard").innerHTML = "";
  document.getElementById("auditRatioCard").appendChild(svg);
}
// LOAD XP DATA
async function loadXPData() {
  const query = `
    {
      transaction(where: { type: { _eq: "xp" } }) {
        amount
        createdAt
      }
    }
  `;
  return await fetchGraphData(query);
}

// DRAW XP SVG GRAPH
function drawXPSVG(transactions) {
  const svgNS = "http://www.w3.org/2000/svg";
  const width = 400;
  const height = 250;
  const margin = { top: 30, right: 20, bottom: 40, left: 50 };
  const chartWidth = width - margin.left - margin.right;
  const chartHeight = height - margin.top - margin.bottom;

  const svg = document.createElementNS(svgNS, "svg");
  svg.setAttribute("width", width);
  svg.setAttribute("height", height);
  svg.style.background = "#1e1e1e";
  svg.style.borderRadius = "12px";

  const chartGroup = document.createElementNS(svgNS, "g");
  chartGroup.setAttribute("transform", `translate(${margin.left},${margin.top})`);
  svg.appendChild(chartGroup);

  // Group XP by month
  const monthMap = {};
  transactions.forEach(tx => {
    const date = new Date(tx.createdAt);
    const key = `${date.getFullYear()}-${date.getMonth()}`;
    monthMap[key] = (monthMap[key] || 0) + tx.amount;
  });

  const sortedMonths = Object.keys(monthMap).sort((a, b) => {
    const [ay, am] = a.split("-").map(Number);
    const [by, bm] = b.split("-").map(Number);
    return ay !== by ? ay - by : am - bm;
  });

  const data = sortedMonths.map(key => {
    const [year, month] = key.split("-");
    const date = new Date(year, month);
    return {
      month: date.toLocaleString("default", { month: "short" }),
      year,
      xp: monthMap[key],
    };
  });

  const maxXP = Math.max(...data.map(d => d.xp));
  const barWidth = chartWidth / data.length - 10;

  

  // Bars + X Labels
  data.forEach((d, i) => {
    const x = i * (barWidth + 10);
    const barHeight = (d.xp / maxXP) * chartHeight;
    const y = chartHeight - barHeight;

    const rect = document.createElementNS(svgNS, "rect");
    rect.setAttribute("x", x);
    rect.setAttribute("y", y);
    rect.setAttribute("width", barWidth);
    rect.setAttribute("height", barHeight);
    rect.setAttribute("fill", "#00aaff");
    rect.setAttribute("rx", 4);
    chartGroup.appendChild(rect);

    // XP label on top of each bar
    const { value, unit } = formatXP(d.xp);
    const valLabel = document.createElementNS(svgNS, "text");
    valLabel.setAttribute("x", x + barWidth / 2);
    valLabel.setAttribute("y", y - 5);
    valLabel.setAttribute("text-anchor", "middle");
    valLabel.setAttribute("fill", "#aaa");
    valLabel.setAttribute("font-size", "10");
    valLabel.textContent = `${value} ${unit}`;
    chartGroup.appendChild(valLabel);

    const labelGroup = document.createElementNS(svgNS, "text");
    labelGroup.setAttribute("x", x + barWidth / 2);
    labelGroup.setAttribute("y", chartHeight + 12);
    labelGroup.setAttribute("text-anchor", "middle");
    labelGroup.setAttribute("fill", "#aaa");
    labelGroup.setAttribute("font-size", "10");

    const monthTspan = document.createElementNS(svgNS, "tspan");
    monthTspan.setAttribute("x", x + barWidth / 2);
    monthTspan.setAttribute("dy", "0");
    monthTspan.textContent = d.month;
    labelGroup.appendChild(monthTspan);

    const yearTspan = document.createElementNS(svgNS, "tspan");
    yearTspan.setAttribute("x", x + barWidth / 2);
    yearTspan.setAttribute("dy", "1.2em");
    yearTspan.textContent = d.year;
    labelGroup.appendChild(yearTspan);

    chartGroup.appendChild(labelGroup);
  });

  const title = document.createElementNS(svgNS, "text");
  title.setAttribute("x", margin.left);
  title.setAttribute("y", 20);
  title.setAttribute("fill", "#ffffff");
  title.setAttribute("font-size", 16);
  title.setAttribute("font-weight", "bold");
  title.textContent = "XP Gained Per Month";
  svg.appendChild(title);

  const container = document.getElementById("xpChartCard");
  container.innerHTML = "";
  container.appendChild(svg);

  // Helper to format XP as KB or MB
  function formatXP(xp) {
    if (xp >= 1_000_000) {
      return { value: (xp / 1_000_000).toFixed(2), unit: "MB" };
    } else {
      return { value: (xp / 1_000).toFixed(2), unit: "KB" };
    }
  }
}
// Add the new chart function for User Level
// Example of fetching and processing user level data
async function loadUserLevelData() {
  const query = `
    {
      user {
        id
        transactions(where: {type: {_eq: "level"}}) {
          amount
          type
          createdAt
        }
      }
    }
  `;
  
  const levelData = await fetchGraphData(query);
  console.log("Level Data:", levelData);  // Log the fetched data
  
  const user = levelData.user[0];  // Assuming there is one user
  console.log("User:", user); // Log the user data
  
  // Ensure user.transactions is available
  const transactions = user.transactions || [];
  console.log("Transactions:", transactions);

  const totalLevel = calculateLevelSum(transactions);  // Pass the transactions to the function
  console.log("Total Level:", totalLevel);

  // Now display the user's level
  document.getElementById("levelCard").innerHTML = `
    <p>User ID: ${user.id}</p>
    <p>Total Level: ${totalLevel}</p>
  `;

  // Optionally, render the level visually with an SVG
  drawUserLevelSVG(totalLevel, transactions);
}

function calculateLevelSum(transactions) {
  if (!transactions || transactions.length === 0) {
    return 0;
  }

  return transactions.reduce((sum, transaction) => {
    // Ensure you're accessing the correct field in the transaction
    const experiencePoints = transaction.amount || 0; // Adjust if it's another field
    return sum + experiencePoints;
  }, 0);
}




// Call loadUserLevelData when the page is loaded
document.addEventListener("DOMContentLoaded", () => {
  loadUserLevelData();
  const userLevelElement = document.getElementById("levelCard");
  if (userLevelElement) {
      // Your code to update the element goes here
  } else {
      console.error("Element not found: levelCard");
  }
});


function drawUserLevelSVG(level, experience) {
  // Log the level and experience values
  console.log("Level: ", level); 
  console.log("Experience: ", experience);

  if (isNaN(level) || isNaN(experience)) {
    console.error("Invalid level or experience data.");
    return; // Exit if values are not valid
  }

  const svgNS = "http://www.w3.org/2000/svg";
  const width = 400;
  const height = 200;
  const barWidth = 300;
  const barHeight = 20;

  const validLevel = Math.min(Math.max(level, 0), 100); // Ensure level is between 0 and 100
  const levelPercent = (validLevel / 100) * 100;

  const validExperience = !isNaN(experience) ? experience : 0;

  const svg = document.createElementNS(svgNS, "svg");
  svg.setAttribute("width", width);
  svg.setAttribute("height", height);
  svg.style.background = "#1e1e1e";
  svg.style.borderRadius = "12px";

  // Title
  const title = document.createElementNS(svgNS, "text");
  title.setAttribute("x", 20);
  title.setAttribute("y", 30);
  title.setAttribute("fill", "#ffffff");
  title.setAttribute("font-size", "16");
  title.setAttribute("font-weight", "bold");
  title.textContent = "Current Level";
  svg.appendChild(title);

  // Level number
  const levelText = document.createElementNS(svgNS, "text");
  levelText.setAttribute("x", 20);
  levelText.setAttribute("y", 70);
  levelText.setAttribute("fill", "#00d0aa");
  levelText.setAttribute("font-size", "40");
  levelText.setAttribute("font-weight", "bold");
  levelText.textContent = `Lv. ${validLevel}`;
  svg.appendChild(levelText);

  // Progress bar background
  const bgBar = document.createElementNS(svgNS, "rect");
  bgBar.setAttribute("x", 20);
  bgBar.setAttribute("y", 100);
  bgBar.setAttribute("width", barWidth);
  bgBar.setAttribute("height", barHeight);
  bgBar.setAttribute("fill", "#444");
  bgBar.setAttribute("rx", 10);
  svg.appendChild(bgBar);

  // Progress bar fill
  const fgBar = document.createElementNS(svgNS, "rect");
  fgBar.setAttribute("x", 20);
  fgBar.setAttribute("y", 100);
  fgBar.setAttribute("width", (levelPercent / 100) * barWidth);
  fgBar.setAttribute("height", barHeight);
  fgBar.setAttribute("fill", "#00aaff");
  fgBar.setAttribute("rx", 10);
  svg.appendChild(fgBar);

  // Experience text
  const xpText = document.createElementNS(svgNS, "text");
  xpText.setAttribute("x", 20);
  xpText.setAttribute("y", 150);
  xpText.setAttribute("fill", "#aaa");
  xpText.setAttribute("font-size", "14");
  xpText.textContent = `${validExperience.toLocaleString()} XP`;
  svg.appendChild(xpText);

  // Append to the container
  const container = document.getElementById("levelCard");
  if (container) {
    container.innerHTML = "";
    container.appendChild(svg);
  } else {
    console.error("Container element with id 'levelCard' not found.");
  }
}






// Additional chart functions (same as before)
// function drawXPChart(data) {
//   const ctx = document.getElementById("xpChart")?.getContext("2d");
//   if (!ctx) return;

//   const labels = data.map(item => new Date(item.createdAt).toLocaleDateString());
//   const amounts = data.map(item => item.amount);

//   new Chart(ctx, {
//     type: "line",
//     data: {
//       labels,
//       datasets: [{
//         label: "XP Earned",
//         data: amounts,
//         borderColor: "blue",
//         backgroundColor: "rgba(0, 0, 255, 0.1)",
//         fill: true,
//         tension: 0.3
//       }]
//     }
//   });
// }

// function drawProjectChart(up, down) {
//   const ctx = document.getElementById("projectChart")?.getContext("2d");
//   if (!ctx) return;

//   new Chart(ctx, {
//     type: "bar",
//     data: {
//       labels: ["Upvotes", "Downvotes"],
//       datasets: [{
//         label: "Votes",
//         data: [up, down],
//         backgroundColor: ["#4CAF50", "#F44336"]
//       }]
//     }
//   });
// }
