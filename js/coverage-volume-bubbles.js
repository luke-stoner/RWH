class BubbleChart {
  constructor() {
    if (BubbleChart.instance) {
      return BubbleChart.instance;
    }
    BubbleChart.instance = this;

    this.loadData();
  }

  async loadData() {
    const csvData = await d3.csv("data/labeled.csv");
    const data = d3.rollup(
      csvData,
      (v) => ({
        name: v[0].last_name,
        frequency: v.length,
        photo: `img/candidate_portraits/${v[0].last_name.toLowerCase()}.png`,
        party: v[0].party,
      }),
      (d) => `${d.first_name}_${d.last_name}`
    );

    this.createVisualization(Array.from(data.values()));
    this.setupLegend(Array.from(data.values()));
  }

  createVisualization(data) {
    const width = 900;
    const height = 600;
    const margin = 30;
    const circleRadius = 10;

    const svg = d3
      .select("#volume-bubbles")
      .append("svg")
      .attr("width", width)
      .attr("height", height);

    // Calculate the total width available for the circles & determine spacing
    const numCircles = data.length;
    const totalWidthForCircles = width - 2 * margin;
    const circleSpacing = totalWidthForCircles / (numCircles - 1);

    // Calculate the initial and final positions for the circles
    const initialX = width / 2;
    const initialY = 0;
    const finalY = height / 2;

    // Create a group for the circles and labels
    const group = svg.append("g");

    // Sort data
    data.sort((a, b) => a.frequency - b.frequency);

    // Create circles
    const circles = group
      .selectAll("circle")
      .data(data)
      .enter()
      .append("circle")
      .attr("cx", initialX)
      .attr("cy", initialY)
      .attr("r", circleRadius)
      .style("fill", (d) => PARTY_COLOR_MAP[d.party])
      .style("opacity", 0);

    // Add frequency label below each circle
    const labels = group
      .selectAll("text")
      .data(data)
      .enter()
      .append("text")
      .attr("x", initialX)
      .attr("y", initialY + circleRadius + 15)
      .text((d) => d.frequency.toLocaleString())
      .attr("text-anchor", "middle")
      .style("opacity", 0);

    // Circle transition to fade & fan each circle
    // in 1 by 1 into a straight line
    circles
      .transition()
      .duration(1000)
      .delay((d, i) => i * 500)
      .attr("cx", (d, i) => margin + i * circleSpacing)
      .attr("cy", finalY)
      .style("opacity", 1);

    // Label transition to match circle appearance
    labels
      .transition()
      .duration(1000)
      .delay((d, i) => i * 500)
      .attr("x", (d, i) => margin + i * circleSpacing)
      .attr("y", finalY + circleRadius + 15)
      .style("opacity", 1);

    // Additional text to show after all transitions are complete
    const totalDelay = numCircles * 500; // Total time until the last circle and label have appeared
    const firstMessage = svg
      .append("text")
      .attr("x", width / 2)
      .attr("y", height / 3)
      .text("There is a lot of variance here")
      .attr("text-anchor", "middle")
      .style("opacity", 0);

    firstMessage
      .transition()
      .delay(totalDelay)
      .duration(1000)
      .style("opacity", 1)
      .transition() // Start a new transition to fade out the first message
      .delay(3000) // Time before fading out, adjust as needed
      .duration(1000)
      .style("opacity", 0)
      .end() // This ensures the next transition waits for this to finish
      .then(() => {
        // Second message
        svg
          .append("text")
          .attr("x", width / 2)
          .attr("y", height / 3)
          .text("Some candidates are mentioned more than others")
          .attr("text-anchor", "middle")
          .style("opacity", 0)
          .transition()
          .duration(1000)
          .style("opacity", 1);
      });
  }
}
