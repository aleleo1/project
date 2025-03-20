import { createEffect, onMount } from "solid-js";
import * as d3 from 'd3';

export default function Chart(p: any) {
  let chartContainer;
  
  createEffect(() => {
    if (chartContainer) {
      console.log('chart change: ', chartContainer);
    }
  });
  
  onMount(() => {
    try {
      if (chartContainer) {
        // Mock Data
        let data = [
          { date: new Date("2020-01-01"), close: 150 },
          { date: new Date("2020-02-01"), close: 170 },
          { date: new Date("2020-03-01"), close: 160 },
          { date: new Date("2020-04-01"), close: 180 },
          { date: new Date("2020-05-01"), close: 210 },
          { date: new Date("2020-06-01"), close: 190 },
          // (shortened for brevity - keep your original data)
        ];
        
        // Fixed dimensions - 350x350
        const width = 350;
        const height = 350;
        const margin = { top: 30, right: 30, bottom: 50, left: 50 };
        const innerWidth = width - margin.left - margin.right;
        const innerHeight = height - margin.top - margin.bottom;
        
        // Clear existing content
        d3.select(chartContainer).html("");
        
        // Create the main SVG element with fixed size
        const svg = d3.select(chartContainer)
          .attr("width", width)
          .attr("height", height)
          .attr("viewBox", `0 0 ${width} ${height}`)
          .attr("style", "max-width: 100%; height: auto;");
        
        // Create a group for the chart elements with margins applied
        const g = svg.append("g")
          .attr("transform", `translate(${margin.left},${margin.top})`);
        
        // Create scales
        const x = d3.scaleUtc()
          .domain(d3.extent(data, d => d.date))
          .range([0, innerWidth]);
        
        const y = d3.scaleLinear()
          .domain([0, d3.max(data, d => d.close) * 1.1])
          .nice()
          .range([innerHeight, 0]);
        
        // Add X axis
        g.append("g")
          .attr("transform", `translate(0,${innerHeight})`)
          .call(d3.axisBottom(x).ticks(5))
          .selectAll("text")
          .style("text-anchor", "end")
          .attr("dx", "-.8em")
          .attr("dy", ".15em")
          .attr("transform", "rotate(-45)");
        
        // Add X axis label
        g.append("text")
          .attr("x", innerWidth / 2)
          .attr("y", innerHeight + margin.bottom - 10)
          .style("text-anchor", "middle")
          .text("Date");
        
        // Add Y axis
        g.append("g")
          .call(d3.axisLeft(y).ticks(8));
        
        // Add Y axis label
        g.append("text")
          .attr("transform", "rotate(-90)")
          .attr("y", -margin.left + 15)
          .attr("x", -innerHeight / 2)
          .attr("dy", "1em")
          .style("text-anchor", "middle")
          .text("Price ($)");
        
        // Add grid lines
        g.append("g")
          .attr("class", "grid")
          .selectAll("line")
          .data(y.ticks(8))
          .enter()
          .append("line")
          .attr("x1", 0)
          .attr("x2", innerWidth)
          .attr("y1", d => y(d))
          .attr("y2", d => y(d))
          .attr("stroke", "#e0e0e0")
          .attr("stroke-dasharray", "3,3");
        
        // Add the line
        const line = d3.line()
          .x(d => x(d.date))
          .y(d => y(d.close))
          .curve(d3.curveMonotoneX);
        
        g.append("path")
          .datum(data)
          .attr("fill", "none")
          .attr("stroke", "steelblue")
          .attr("stroke-width", 2)
          .attr("d", line);
        
        // Add data points
        g.selectAll(".data-point")
          .data(data)
          .enter()
          .append("circle")
          .attr("class", "data-point")
          .attr("cx", d => x(d.date))
          .attr("cy", d => y(d.close))
          .attr("r", 4)
          .attr("fill", "steelblue")
          .on("mouseover", function(event, d) {
            d3.select(this)
              .attr("r", 7)
              .attr("fill", "orange");
              
            // Create tooltip on mouseover
            const tooltip = svg.append("g")
              .attr("class", "tooltip")
              .style("pointer-events", "none");
            
            const formatDate = d3.timeFormat("%b %d, %Y");
            
            // Add background rectangle
            const text = formatDate(d.date) + ": $" + d.close;
            const textNode = tooltip.append("text")
              .text(text)
              .attr("font-size", "12px")
              .attr("fill", "white");
            
            const textBox = textNode.node().getBBox();
            
            tooltip.insert("rect", "text")
              .attr("x", textBox.x - 5)
              .attr("y", textBox.y - 5)
              .attr("width", textBox.width + 10)
              .attr("height", textBox.height + 10)
              .attr("rx", 4)
              .attr("fill", "rgba(0,0,0,0.8)");
            
            // Position the tooltip
            const tooltipX = x(d.date) + margin.left;
            const tooltipY = y(d.close) + margin.top - 20;
            
            tooltip.attr("transform", `translate(${tooltipX - textBox.width/2}, ${tooltipY})`);
          })
          .on("mouseout", function() {
            d3.select(this)
              .attr("r", 4)
              .attr("fill", "steelblue");
            
            // Remove tooltip on mouseout
            svg.selectAll(".tooltip").remove();
          });
        
        // Add title
        svg.append("text")
          .attr("x", width / 2)
          .attr("y", margin.top / 2)
          .attr("text-anchor", "middle")
          .style("font-size", "16px")
          .style("font-weight", "bold")
          .text("Stock Price Over Time");
      }
    } catch (err) {
      console.error("Chart error:", err);
    }
  });
  
  return (
    <div style="width: 350px; height: 350px;">
      <svg ref={chartContainer} />
    </div>
  );
}