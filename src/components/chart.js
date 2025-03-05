import * as d3 from "https://cdn.jsdelivr.net/npm/d3@7/+esm";

// Mock Data
let data = [
  { date: new Date("2020-01-01"), close: 150 },
  { date: new Date("2020-02-01"), close: 170 },
  { date: new Date("2020-03-01"), close: 160 },
  { date: new Date("2020-04-01"), close: 180 },
  { date: new Date("2020-05-01"), close: 210 },
  { date: new Date("2020-06-01"), close: 190 },
  { date: new Date("2020-07-01"), close: 220 },
  { date: new Date("2020-08-01"), close: 230 },
  { date: new Date("2020-09-01"), close: 200 },
  { date: new Date("2020-10-01"), close: 250 },
  { date: new Date("2020-11-01"), close: 270 },
  { date: new Date("2020-12-01"), close: 260 },
  { date: new Date("2021-01-01"), close: 280 },
  { date: new Date("2021-02-01"), close: 300 },
  { date: new Date("2021-03-01"), close: 290 },
  { date: new Date("2021-04-01"), close: 310 },
  { date: new Date("2021-05-01"), close: 320 },
  { date: new Date("2021-06-01"), close: 350 },
  { date: new Date("2021-07-01"), close: 340 },
  { date: new Date("2021-08-01"), close: 360 },
  { date: new Date("2021-09-01"), close: 370 },
  { date: new Date("2021-10-01"), close: 380 },
  { date: new Date("2021-11-01"), close: 400 },
  { date: new Date("2021-12-01"), close: 420 },
  { date: new Date("2022-01-01"), close: 430 },
  { date: new Date("2022-02-01"), close: 450 },
  { date: new Date("2022-03-01"), close: 440 },
  { date: new Date("2022-04-01"), close: 460 },
  { date: new Date("2022-05-01"), close: 480 },
  { date: new Date("2022-06-01"), close: 470 },
  { date: new Date("2022-07-01"), close: 490 },
  { date: new Date("2022-08-01"), close: 510 },
  { date: new Date("2022-09-01"), close: 500 },
  { date: new Date("2022-10-01"), close: 520 },
  { date: new Date("2022-11-01"), close: 540 },
  { date: new Date("2022-12-01"), close: 530 },
  { date: new Date("2023-01-01"), close: 550 },
  { date: new Date("2023-02-01"), close: 570 },
  { date: new Date("2023-03-01"), close: 560 },
  { date: new Date("2023-04-01"), close: 590 },
  { date: new Date("2023-05-01"), close: 600 },
  { date: new Date("2023-06-01"), close: 620 },
  { date: new Date("2023-07-01"), close: 610 },
  { date: new Date("2023-08-01"), close: 630 },
  { date: new Date("2023-09-01"), close: 650 },
  { date: new Date("2023-10-01"), close: 640 },
  { date: new Date("2023-11-01"), close: 670 },
  { date: new Date("2023-12-01"), close: 680 },
  { date: new Date("2024-03-01"), close: 760 },
  { date: new Date("2024-04-01"), close: 790 },
  { date: new Date("2024-05-01"), close: 700 },
  { date: new Date("2024-06-01"), close: 720 },
  { date: new Date("2024-07-01"), close: 710 },
  { date: new Date("2024-08-01"), close: 730 },
  { date: new Date("2024-09-01"), close: 750 },
  { date: new Date("2024-10-01"), close: 740 },
  { date: new Date("2024-11-01"), close: 770 },
  { date: new Date("2024-12-01"), close: 780 },
  { date: new Date("2025-05-01"), close: 800 },
  { date: new Date("2025-06-01"), close: 820 },
  { date: new Date("2025-07-01"), close: 810 },
  { date: new Date("2025-08-01"), close: 830 },
  { date: new Date("2025-09-01"), close: 850 },
  { date: new Date("2025-10-01"), close: 840 },
  { date: new Date("2025-11-01"), close: 870 },
  { date: new Date("2025-12-01"), close: 880 }
];

// Sorting options
window.orders = {
    ascending: (a, b) => d3.ascending(a.date, b.date),
    descending: (a, b) => d3.descending(a.date, b.date),
  };
data = data.sort(window.orders.ascending)
console.log(data)

// Chart dimensions
const width = 320;
const totalWidth = width * 6;
const height = 420;
const margin = { top: 30, right: 40, bottom: 100, left: 50 };

// Create scales
const x = d3
  .scaleUtc()
  .domain(d3.extent(data, (d) => d.date))
  .range([margin.left, totalWidth - margin.right]);

const y = d3
  .scaleLinear()
  .domain([0, d3.max(data, (d) => d.close) * 1.1]) // Add 10% padding to top
  .nice()
  .range([height - margin.bottom, margin.top]);

// Create main container
const chartContainer = d3.select("#chart");
chartContainer.html(""); // Clear previous chart if any

// Create div that holds the two SVGs
const parent = chartContainer.append("div")
  .style("position", "relative");

// Create the static vertical axis
const yAxisSvg = parent
  .append("svg")
  .attr("width", margin.left + 10)
  .attr("height", height)
  .style("position", "absolute")
  .style("z-index", 1);

// Add Y-axis
const yAxisG = yAxisSvg
  .append("g")
  .attr("transform", `translate(${margin.left},0)`)
  .call(d3.axisLeft(y).ticks(8));

// Add Y-axis label
yAxisG.append("text")
  .attr("transform", "rotate(-90)")
  .attr("y", -margin.left + 15)
  .attr("x", -height/2)
  .attr("dy", "1em")
  .style("text-anchor", "middle")
  .style("fill", "black")
  .text("Price ($)");

// Create scrolling div for the chart
const body = parent
  .append("div")
  .attr("class", "chart-scroll-container")
  .style("overflow-x", "scroll")
  .style("-webkit-overflow-scrolling", "touch")
  .style("cursor", "grab")
  .style("margin-left", `${margin.left}px`); // Align with y-axis

// Add tooltip div (new addition)
const tooltip = d3.select("body").append("div")
  .attr("class", "tooltip")
  .style("position", "absolute")
  .style("visibility", "hidden")
  .style("background-color", "rgba(0, 0, 0, 0.8)")
  .style("color", "white")
  .style("padding", "8px")
  .style("border-radius", "4px")
  .style("font-size", "12px")
  .style("pointer-events", "none")
  .style("z-index", 10);

const svg = body
  .append("svg")
  .attr("width", totalWidth)
  .attr("height", height)
  .style("display", "block");

// Add grid lines for y-axis
svg.append("g")
  .attr("class", "grid-lines")
  .selectAll("line.grid")
  .data(y.ticks(8))
  .enter()
  .append("line")
  .attr("class", "grid")
  .attr("x1", margin.left)
  .attr("x2", totalWidth - margin.right)
  .attr("y1", d => y(d))
  .attr("y2", d => y(d))
  .attr("stroke", "#e0e0e0")
  .attr("stroke-width", 1)
  .attr("stroke-dasharray", "3,3");

// Add horizontal axis
const xAxis = d3.axisBottom(x)
  .ticks(d3.utcMonth.every(1))
  .tickSizeOuter(0);

svg.append("g")
  .attr("class", "x-axis")
  .attr("transform", `translate(0,${height - margin.bottom})`)
  .call(xAxis)
  .selectAll("text")
  .style("text-anchor", "end")
  .attr("transform", "rotate(-45)")
  .attr("dx", "-0.8em")
  .attr("dy", "0.15em");

// Add X-axis label
svg.append("text")
  .attr("transform", `translate(${totalWidth/2},${height - margin.bottom/3})`)
  .style("text-anchor", "middle")
  .text("Date");

// Add title
svg.append("text")
  .attr("x", totalWidth / 2)
  .attr("y", margin.top / 2)
  .attr("text-anchor", "middle")
  .style("font-size", "16px")
  .style("font-weight", "bold")
  .text("Stock Price Over Time");

// Add tick marks (tickels)
svg.selectAll(".tick-mark")
  .data(data)
  .enter()
  .append("line")
  .attr("class", "tick-mark")
  .attr("x1", (d) => x(d.date))
  .attr("x2", (d) => x(d.date))
  .attr("y1", y(0))
  .attr("y2", (d) => y(d.close))
  .attr("stroke", "steelblue")
  .attr("stroke-width", 2);

// Add circles at data points with mouse events for tooltips (updated)
svg.selectAll(".data-point")
  .data(data)
  .enter()
  .append("circle")
  .attr("class", "data-point")
  .attr("cx", d => x(d.date))
  .attr("cy", d => y(d.close))
  .attr("r", 4)
  .attr("fill", "steelblue")
  // Added hover effect
  .style("cursor", "pointer")
  // Added mouseover event
  .on("mouseover", function(event, d) {
    // Change appearance on hover
    d3.select(this)
      .attr("r", 7)
      .attr("fill", "orange");
    
    // Format date for display
    const formatDate = d3.timeFormat("%B %d, %Y");
    
    // Show and position tooltip
    tooltip
      .html(`<strong>Date:</strong> ${formatDate(d.date)}<br><strong>Price:</strong> $${d.close.toFixed(2)}`)
      .style("visibility", "visible")
      .style("left", (event.pageX + 10) + "px")
      .style("top", (event.pageY - 28) + "px");
  })
  // Added mouseout event
  .on("mouseout", function() {
    // Restore original appearance
    d3.select(this)
      .attr("r", 4)
      .attr("fill", "steelblue");
    
    // Hide tooltip
    tooltip.style("visibility", "hidden");
  })
  // Add mousemove event to move tooltip with cursor
  .on("mousemove", function(event) {
    tooltip
      .style("left", (event.pageX + 10) + "px")
      .style("top", (event.pageY - 28) + "px");
  });

// Initialize the scroll position
body.node().scrollLeft = 0;

// Make the entire SVG draggable by capturing events
svg.style("cursor", "grab")
   .style("touch-action", "none"); // Prevent default touch actions

// Variables for drag tracking
let isDragging = false;
let startX;
let scrollLeft;

// Event handlers with direct DOM API for better compatibility
const scrollContainer = body.node();

// Function to handle mousedown
function handleMouseDown(event) {
  // Don't initiate drag if we clicked on a data point (allowing tooltip functionality)
  if (event.target.classList.contains('data-point')) return;
  
  isDragging = true;
  startX = event.clientX;
  scrollLeft = scrollContainer.scrollLeft;
  
  svg.style("cursor", "grabbing");
  
  // Prevent default browser behavior
  event.preventDefault();
  
  // Add temporary event listeners to document for better tracking
  document.addEventListener('mousemove', handleMouseMove);
  document.addEventListener('mouseup', handleMouseUp);
}

// Function to handle mousemove
function handleMouseMove(event) {
  if (!isDragging) return;
  
  // Calculate how far the mouse has moved
  const dx = event.clientX - startX;
  
  // Scroll the container accordingly
  scrollContainer.scrollLeft = scrollLeft - dx;
  
  // Prevent default behavior to avoid selection while dragging
  event.preventDefault();
}

// Function to handle mouseup
function handleMouseUp(event) {
  isDragging = false;
  svg.style("cursor", "grab");
  
  // Remove temporary event listeners
  document.removeEventListener('mousemove', handleMouseMove);
  document.removeEventListener('mouseup', handleMouseUp);
}

// Function to handle touch start
function handleTouchStart(event) {
  // Don't initiate drag if we touched on a data point
  if (event.target.classList.contains('data-point')) return;
  
  if (event.touches.length !== 1) return;
  
  isDragging = true;
  startX = event.touches[0].clientX;
  scrollLeft = scrollContainer.scrollLeft;
  
  svg.style("cursor", "grabbing");
  
  // Prevent default browser behavior
  event.preventDefault();
}

// Function to handle touch move
function handleTouchMove(event) {
  if (!isDragging || event.touches.length !== 1) return;
  
  // Calculate how far the finger has moved
  const dx = event.touches[0].clientX - startX;
  
  // Scroll the container accordingly
  scrollContainer.scrollLeft = scrollLeft - dx;
  
  // Prevent default behavior to avoid scrolling the page
  event.preventDefault();
}

// Function to handle touch end
function handleTouchEnd(event) {
  isDragging = false;
  svg.style("cursor", "grab");
}

// Add mouse event listeners to SVG
svg.on("mousedown", handleMouseDown);

// Add touch event listeners to SVG
svg.node().addEventListener('touchstart', handleTouchStart, { passive: false });
svg.node().addEventListener('touchmove', handleTouchMove, { passive: false });
svg.node().addEventListener('touchend', handleTouchEnd);

// Modified update function for better ordering and to maintain tooltips
function update(order) {
  // Sort the data
  data = data.sort(order);
  
  // Redefine x domain based on sorted data
  x.domain(d3.extent(data, d => d.date));
  
  // Create transition
  const t = svg.transition().duration(750);
  
  // Update x-axis with new domain
  svg.select(".x-axis")
    .transition(t)
    .call(xAxis)
    .selectAll("text")
    .style("text-anchor", "end")
    .attr("transform", "rotate(-45)")
    .attr("dx", "-0.8em")
    .attr("dy", "0.15em");
    
  // Update tick marks
  svg.selectAll(".tick-mark")
    .data(data)
    .transition(t)
    .attr("x1", d => x(d.date))
    .attr("x2", d => x(d.date))
    .attr("y1", y(0))
    .attr("y2", d => y(d.close));
    
  // Update data points
  svg.selectAll(".data-point")
    .data(data)
    .transition(t)
    .attr("cx", d => x(d.date))
    .attr("cy", d => y(d.close));
}


// Make update function available to window
window.update = update;