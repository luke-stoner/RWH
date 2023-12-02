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
    const margin = 20;

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

    // Create a group for the circles
    const circleGroup = svg.append("g");

    // Create circles with initial positions at the top center and zero opacity
    // Sort first so circles appear from least to greatest
    data.sort((a, b) => a.frequency - b.frequency);
    const circles = circleGroup
      .selectAll("circle")
      .data(data)
      .enter()
      .append("circle")
      .attr("cx", initialX)
      .attr("cy", initialY)
      .attr("r", 10)
      .style("fill", (d) => PARTY_COLOR_MAP[d.party]) // Change the fill color as needed
      .style("opacity", 0);

    // Make the circles fade in 1 by 1
    circles
      .transition()
      .duration(1000)
      .delay((d, i) => i * 500)
      .attr("cx", (d, i) => margin + i * circleSpacing)
      .attr("cy", finalY)
      .style("opacity", 1);
  }
}
