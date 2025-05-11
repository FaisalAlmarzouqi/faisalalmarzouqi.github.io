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

    // Divide the values by 100 before calling drawAuditSVG
    const doneDivided = user.totalUp / 1000000;  // divide by 1000000 for proper scaling to MB
    const receivedDivided = user.totalDown / 1000000;  // divide by 1000000 for proper scaling to MB

    drawAuditSVG(doneDivided, receivedDivided, user.auditRatio);
   
    const xpData = await loadXPData();
    drawXPSVG(xpData.transaction);

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
  const height = 220;
  const padding = 20;

  const svg = document.createElementNS(svgNS, "svg");
  svg.setAttribute("width", "100%");
  svg.setAttribute("height", "100%");
  svg.setAttribute("viewBox", `0 0 ${width} ${height}`);
  svg.style.background = "#1e1e1e";
  svg.style.borderRadius = "12px";

  const createText = (x, y, content, size = 11, color = "#ffffff", weight = "normal", anchor = "start") => {
    const text = document.createElementNS(svgNS, "text");
    text.setAttribute("x", x);
    text.setAttribute("y", y);
    text.textContent = content;
    text.setAttribute("fill", color);
    text.setAttribute("font-size", size);
    text.setAttribute("font-weight", weight);
    text.setAttribute("font-family", "Segoe UI, sans-serif");
    text.setAttribute("text-anchor", anchor);
    return text;
  };

  const createBar = (x, y, barWidth, color) => {
    const bar = document.createElementNS(svgNS, "rect");
    bar.setAttribute("x", x);
    bar.setAttribute("y", y);
    bar.setAttribute("width", barWidth);
    bar.setAttribute("height", 6); // Thin bar
    bar.setAttribute("fill", color);
    bar.setAttribute("rx", 3);
    return bar;
  };

  const maxVal = Math.max(done, received);
  const barMaxWidth = width - padding * 2 - 80;

  // Title
  svg.appendChild(createText(width / 2, padding, "Audit Ratio", 18, "#ffffff", "bold", "middle"));

  // Done Section
  const doneY = 60;
  svg.appendChild(createText(padding, doneY, "Done:", 13));
  svg.appendChild(createBar(padding + 60, doneY - 6, (done / maxVal) * barMaxWidth, "#00d0aa"));
  svg.appendChild(createText(
    width - padding,
    doneY + 14,   
    `${done.toFixed(2)} MB ↑`,  // 2 decimal places
    10,
    "#00d0aa",
    "normal",
    "end"
  ));

  // Received Section
  const receivedY = doneY + 40;
  svg.appendChild(createText(padding, receivedY, "Received:", 13));
  svg.appendChild(createBar(padding + 60, receivedY - 6, (received / maxVal) * barMaxWidth, "#ffffff"));
  svg.appendChild(createText(
    width - padding,
    receivedY + 14,   // moved **14px** below the bar
    `${received.toFixed(2)} MB ↓`, // 2 decimal places
    10,
    "#ffffff",
    "normal",
    "end"
  ));

  // Ratio Section
  const ratioY = receivedY + 50;
  svg.appendChild(createText(padding, ratioY, "Ratio:", 15));
  svg.appendChild(createText(width / 2, ratioY + 10, ratio.toFixed(2), 26, "#00d0aa", "bold", "middle"));

  // Label
  const label = ratio >= 1.5
    ? "Excellent!"
    : ratio >= 1.2
    ? "Almost perfect!"
    : ratio >= 1.0
    ? "Pretty good!"
    : "Needs work";
  svg.appendChild(createText(width / 2, ratioY + 50, label, 15, "#00d0aa", "normal", "middle"));

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
  const width = 450; // Slightly reduced width for better spacing
  const height = 300;
  const margin = { top: 40, right: 20, bottom: 60, left: 50 }; // Increased bottom margin to 60
  const chartWidth = width - margin.left - margin.right;
  const chartHeight = height - margin.top - margin.bottom;

  const svg = document.createElementNS(svgNS, "svg");
  svg.setAttribute("width", width);
  svg.setAttribute("height", height);
  svg.style.background = "#1e1e1e";
  svg.style.borderRadius = "12px";

  const chartGroup = document.createElementNS(svgNS, "g");
  chartGroup.setAttribute("transform", `translate(${margin.left},${margin.top + 20})`);
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

  // Increase space between bars by adjusting barWidth and bar spacing
  const barWidth = chartWidth / (data.length * 3); // Adjusted for more space between bars
  const barSpacing = 25; // Increased space between bars

  // Bars + X Labels
  data.forEach((d, i) => {
    const x = i * (barWidth + barSpacing); // Adjusted x position for spacing
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
    labelGroup.setAttribute("y", chartHeight + 20); // Adjusted Y position for labels
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
  title.setAttribute("y", margin.top - 10);
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

// Load and render user skills data
async function loadUserSkillData() {
  const query = `
    {
      user {
        transactions(
          where: {
            _and: [
              { type: { _iregex: "(^|[^[:alnum:]])[[:alnum:]]*skill[[:alnum:]]*($|[^[:alnum:]])" } },
              { type: { _like: "%skill%" } },
              { object: { type: { _eq: "project" } } },
              { type: { _in: [
                "skill_prog", "skill_algo", "skill_sys-admin", "skill_front-end", 
                "skill_back-end", "skill_stats", "skill_ai", "skill_game", "skill_tcp"
              ]}}
            ]
          }
          order_by: [{ type: asc }, { createdAt: desc }]
          distinct_on: type
        ) {
          amount
          type
        }
      }
    }
  `;

  try {
    const skillData = await fetchGraphData(query);
    console.log("Skill Data:", skillData);

    const user = skillData.user[0];
    if (!user) {
      console.error("No user data found.");
      return;
    }

    const transactions = user.transactions || [];
    console.log("Skill Transactions:", transactions);

    // Display user skill info
    const Skillsdone = document.getElementById("Skillsdone");
    if (!Skillsdone) {
      console.error("Element with id 'Skillsdone' not found.");
      return;
    }

    Skillsdone.innerHTML = `
      <p>Total Skills: ${transactions.length}</p>
    `;

    // Draw visual skill bars
    drawUserSkillBars(transactions);

  } catch (error) {
    console.error("Error loading user skill data:", error);
  }
}

// Draw the user's skills as individual bars
function drawUserSkillBars(transactions) {
  const svgNS = "http://www.w3.org/2000/svg";
  const width = 500; // Total width for the SVG (including space for XP numbers)
  const barHeight = 20;
  const barSpacing = 10;
  const labelWidth = 100; // Width for the skill labels
  const maxBarWidth = width - labelWidth - 40; // Space for bars and XP numbers (adjusted)

  const height = transactions.length * (barHeight + barSpacing) + 40;

  // Determine the maximum amount for scaling
  const maxAmount = Math.max(...transactions.map(tx => tx.amount || 0));

  const svg = document.createElementNS(svgNS, "svg");
  svg.setAttribute("width", width);
  svg.setAttribute("height", height);
  svg.style.background = "#1e1e1e";
  svg.style.borderRadius = "12px";

  transactions.forEach((tx, index) => {
    const y = 20 + index * (barHeight + barSpacing); // Vertical position for each bar
    const barWidth = (tx.amount / maxAmount) * maxBarWidth; // Calculate the width of the bar

    // Skill Label
    const label = createSVGText(svgNS, tx.type.replace("skill_", "").replace("-", " "), 20, y + barHeight - 5, "#ffffff", 14, "bold");
    svg.appendChild(label);

    // Background Bar
    const bgBar = createSVGRect(svgNS, labelWidth, y, maxBarWidth, barHeight, "#444", 10);
    svg.appendChild(bgBar);

    // Foreground Bar
    const fgBar = createSVGRect(svgNS, labelWidth, y, barWidth, barHeight, "#00aaff", 10);
    svg.appendChild(fgBar);

    // Amount Text (XP number attached to the end of the bar)
    const amountText = createSVGText(svgNS, `${tx.amount} XP`, labelWidth + barWidth + 10, y + barHeight / 2, "#aaa", 12); // Placing it at the end of the bar
    svg.appendChild(amountText);
  });

  const container = document.getElementById("Skillsdone");
  if (container) {
    container.appendChild(svg);
  } else {
    console.error("Container with id 'Skillsdone' not found.");
  }
}

// Helper: create text element for SVG
function createSVGText(ns, content, x, y, color, fontSize, weight = "normal") {
  const text = document.createElementNS(ns, "text");
  text.setAttribute("x", x);
  text.setAttribute("y", y);
  text.setAttribute("fill", color);
  text.setAttribute("font-size", fontSize);
  if (weight) text.setAttribute("font-weight", weight);
  text.setAttribute("alignment-baseline", "middle"); // Vertically center text
  text.textContent = content;
  return text;
}

// Helper: create rect element for SVG
function createSVGRect(ns, x, y, width, height, fill, rx = 0) {
  const rect = document.createElementNS(ns, "rect");
  rect.setAttribute("x", x);
  rect.setAttribute("y", y);
  rect.setAttribute("width", width);
  rect.setAttribute("height", height);
  rect.setAttribute("fill", fill);
  rect.setAttribute("rx", rx);
  return rect;
}

// Call the function on page load
document.addEventListener("DOMContentLoaded", () => {
  loadUserSkillData();
  loadUserBasicInfo(); 
});

// Load and render basic user info
async function loadUserBasicInfo() {
  const query = `
    {
      user {
        id
        login
        email
        attrs
      }
    }
  `;

  try {
    const data = await fetchGraphData(query);
    const user = data.user[0];

    if (!user) {
      console.error("No user info found.");
      return;
    }

    // Handle attrs (may be stringified)
    const attrs = typeof user.attrs === "string" ? JSON.parse(user.attrs) : user.attrs;

    // Update DOM elements
    document.getElementById("username").textContent = user.login || "User";
   
    drawUserBasicInfo({ ...user, attrs });

  } catch (error) {
    console.error("Failed to load user info:", error);
  }
}

// Render user info card
function drawUserBasicInfo(user) {
  const container = document.getElementById("user-info-section");
  if (!container) return;

  container.innerHTML = "";

  const infoItems = [
    { label: "User ID", value: user.id },
    { label: "Username", value: user.login },
    { label: "Email", value: user.email },
  ];

  infoItems.forEach(item => {
    const p = document.createElement("p");
    p.innerHTML = `<strong>${item.label}:</strong> ${item.value}`;
    container.appendChild(p);
  });
}


async function loadProjectXPData() {
  const query = `
    {
      transaction(
        where: {
          type: { _eq: "xp" },
          object: { type: { _eq: "project" } }
        }
        order_by: { createdAt: desc }
      ) {
        amount
        object {
          name
        }
      }
    }
  `;
  return await fetchGraphData(query);
}

function displayProjectXP(projects) {
  const container = document.getElementById("projectXPSection");
  if (!container) return;

  // Clear any previous content
  container.innerHTML = "<h3 style='color:white;'></h3>";

  const list = document.createElement("ul");
  list.style.listStyleType = "none";
  list.style.padding = "0";
  list.style.margin = "0";

  // Style the container itself
  container.style.maxHeight = "250px";
  container.style.overflowY = "auto";
  container.style.width = "100%";
  container.style.textAlign = "left";
  container.style.paddingRight = "10px";
  container.style.backgroundColor = "rgba(50, 50, 50, 0.6)";
  container.style.borderRadius = "12px";
  container.style.border = "1px solid rgba(255, 255, 255, 0.1)";
  container.style.boxShadow = "0 2px 10px rgba(0, 0, 0, 0.3)";
  container.style.padding = "10px";
  container.style.boxSizing = "border-box";

  // Optional: Scrollbar styles (for Firefox only, Chrome needs ::-webkit-scrollbar in CSS)
  container.style.scrollbarWidth = "thin";
  container.style.scrollbarColor = "rgba(255, 255, 255, 0.3) rgba(50, 50, 50, 0.6)";

  projects.forEach((tx) => {
    const name = tx.object?.name || "Unnamed Project";
    const xp = tx.amount;
    const kb = (xp / 1000).toFixed(1);  // Convert XP to kB

    const li = document.createElement("li");

    // Style each project item
    li.style.backgroundColor = "rgba(70, 70, 70, 0.7)";
    li.style.marginBottom = "10px";
    li.style.padding = "12px";
    li.style.borderRadius = "8px";
    li.style.color = "#fff";
    li.style.fontSize = "1.1rem";
    li.style.transition = "background-color 0.3s ease";

    // Hover effect
    li.addEventListener("mouseenter", () => {
      li.style.backgroundColor = "rgba(90, 90, 90, 0.8)";
    });
    li.addEventListener("mouseleave", () => {
      li.style.backgroundColor = "rgba(70, 70, 70, 0.7)";
    });

    // Add the project kB display
    li.innerText = `${name} – ${kb} kB`;

    list.appendChild(li);
  });

  container.appendChild(list);
}

document.addEventListener("DOMContentLoaded", async () => {
  try {
    const projectData = await loadProjectXPData();
    displayProjectXP(projectData.transaction);
  } catch (err) {
    console.error("Error loading project XP data:", err);
  }
});
