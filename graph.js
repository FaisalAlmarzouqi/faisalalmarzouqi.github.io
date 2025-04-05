// Function to render XP Graph (can be enhanced or extended)
export function renderXPGraph(xpData) {
    const barWidth = 140;  // Width of each bar in the graph
    const maxXP = Math.max(...xpData.transaction.map(tx => tx.amount));  // Maximum XP to set scale
    const svgWidth = xpData.transaction.length * barWidth + 100;  // Calculate SVG width
 
    const xpGraph = document.getElementById('xpGraph');
    xpGraph.style.width = '50%';
 
    function getColor(xpAmount, maxXP) {
        const ratio = xpAmount / maxXP;
        if (ratio < 0.33) {
            return '#38a169'; // Green for low XP
        } else if (ratio < 0.66) {
            return '#f6e05e'; // Yellow for medium XP
        } else {
            return '#e53e3e'; // Red for high XP
        }
    }
 
    // Render the XP graph
    const svgXp = `
        <div style="min-width: ${svgWidth}px; transform: rotateX(180deg)">  
            <svg width="${svgWidth}" height="400" viewBox="0 0 ${svgWidth} 400" preserveAspectRatio="xMidYMid meet">
                <g transform="translate(50, 350)">
                    ${xpData.transaction.map((tx, index) => {
                        const height = (tx.amount / maxXP) * 300;
                        const x = index * barWidth + 20;
                        const y = -height;
                        const moduleName = tx.path.split('/').pop();
                        const barColor = getColor(tx.amount, maxXP);
 
                        return `
                            <g class="bar">
                                <rect x="${x}" y="${y}" width="80" height="0" fill="${barColor}">
                                    <animate attributeName="height" from="0" to="${height}" dur="0.8s" fill="freeze" />
                                    <animate attributeName="y" from="0" to="${y}" dur="0.8s" fill="freeze" />
                                </rect>
                                <text x="${x + 40}" y="${-height - 10}" fill="#2d3748" font-size="12" text-anchor="middle">${(tx.amount/1000).toFixed(1)}kb</text>
                                <text x="${x + 40}" y="40" fill="#2d3748" font-size="12" text-anchor="middle">${moduleName}</text>
                            </g>`;
                    }).join('')}
                    <line x1="0" y1="0" x2="${svgWidth}" y2="0" stroke="#718096" />
                </g>
            </svg>
        </div>
    `;
    xpGraph.innerHTML = svgXp;
 }
 
 // Function to render Audit Ratio Circle
 export function renderAuditRatio(auditData) {
    const ratio = Math.round((auditData.user[0].auditRatio || 0) * 2) / 2;
    const circle = document.getElementById('auditRatioGraph');
    const radius = 90;
    const circumference = 2 * Math.PI * radius;
 
    circle.innerHTML = `
        <div class="audit-circle">
            <div class="glow-spinner"></div>
            <svg class="progress-ring" width="200" height="200">
                <circle
                    class="progress-ring-circle-bg"
                    stroke="#e2e8f0"
                    stroke-width="12"
                    fill="transparent"
                    r="${radius}"
                    cx="100"
                    cy="100"
                />
                <circle
                    class="progress-ring-circle"
                    stroke="#4299e1"
                    stroke-width="12"
                    fill="transparent"
                    r="${radius}"
                    cx="100"
                    cy="100"
                    style="stroke-dasharray: ${circumference};
                           stroke-dashoffset: ${circumference - (ratio / 3) * circumference}"
                />
            </svg>
            <div class="audit-value">${auditData.user[0].auditRatio.toFixed(1)}</div>
        </div>
    `;
 }
 