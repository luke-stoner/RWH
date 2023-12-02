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
    const fanOutDuration = 1000;
    const fanOutDelay = fanOutDuration / 2;
    circles
      .transition()
      .duration(fanOutDuration)
      .delay((d, i) => i * fanOutDelay)
      .attr("cx", (d, i) => margin + i * circleSpacing)
      .attr("cy", finalY)
      .style("opacity", 1);

    // Label transition to match circle appearance
    labels
      .transition()
      .duration(fanOutDuration)
      .delay((d, i) => i * fanOutDelay)
      .attr("x", (d, i) => margin + i * circleSpacing)
      .attr("y", finalY + circleRadius + 15)
      .style("opacity", 1);

    // Additional text to show after all transitions are complete
    const totalDelay = numCircles * fanOutDelay; // Total time until the last circle and label have appeared
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
      .transition()
      .delay(3000)
      .duration(1000)
      .style("opacity", 0)
      .end() // End first message
      .then(() => {
        // Begin second message
        const secondMessage = svg
          .append("text")
          .attr("x", width / 2)
          .attr("y", height / 3)
          .text("Some candidates are mentioned more than others")
          .attr("text-anchor", "middle")
          .style("opacity", 0)
          .transition()
          .duration(1000)
          .style("opacity", 1)
          .transition()
          .delay(3000)
          .duration(1000)
          .style("opacity", 0)
          .end() // End of second message
          .then(() => {
            labels
              .transition()
              .duration(1000)
              .style("opacity", 0)
              .end()
              .then(() => {
                circles
                  .transition()
                  .duration(1000)
                  .attr("cx", width / 2)
                  .attr("cy", height / 2)
                  .style("opacity", 0)
                  .end()
                  .then(() => {
                    // End of the first set of animations
                    svg.selectAll("*").remove();
                    this.secondVisualization(data);
                  });
              });
          });
      });
  }

  secondVisualization(data) {
    // Sort data
    data.sort((a, b) => b.frequency - a.frequency);

    // Select the existing SVG element by its ID
    const svg = d3.select("#volume-bubbles svg");

    // Get the width and height from the existing SVG
    const width = +svg.attr("width");
    const height = +svg.attr("height");

    const pack = d3.pack().size([width, height]).padding(2);

    // Define a scale for the circle sizes
    const maxFrequency = d3.max(data, (d) => d.frequency);
    const radiusScale = d3
      .scaleSqrt()
      .domain([0, maxFrequency])
      .range([10, 100]); // Adjust range as needed

    const root = d3
      .hierarchy({ children: data })
      .sum((d) => radiusScale(d.frequency));

    // Create node groups, initially positioned at the center
    const node = svg
      .selectAll(".node")
      .data(pack(root).leaves())
      .enter()
      .append("g")
      .attr("class", "node")
      .attr("transform", `translate(${width / 2},${height / 2})`); // Start at center

    // Create clipPaths for images with initial small radius
    node
      .append("clipPath")
      .attr("id", (d, i) => "clip-" + i)
      .append("circle")
      .attr("r", 10); // Start with small radius

    // Append circles to nodes with initial small radius
    const circles = node
      .append("circle")
      .attr("r", 10) // Start with small radius
      .style("fill", (d) => PARTY_COLOR_MAP[d.data.party])
      .style("opacity", 0); // Start with opacity 0

    // Append images to nodes with initial small size
    const images = node
      .append("svg:image")
      .attr("xlink:href", (d) => d.data.photo)
      .attr("clip-path", (d, i) => "url(#clip-" + i + ")")
      .attr("x", -5) // Half of the initial radius
      .attr("y", -5) // Half of the initial radius
      .attr("height", 10) // Double of the initial radius
      .attr("width", 10) // Double of the initial radius
      .style("opacity", 0); // Start with opacity 0

    // Transition nodes to their final positions with staggered delay
    node
      .transition()
      .duration(1000) // Duration of the transition in milliseconds
      .delay((d, i) => i * 100) // Stagger the start of each transition
      .attr("transform", (d) => `translate(${d.x},${d.y})`);

    // Transition for circles and clipPaths to scale up
    circles
      .transition()
      .duration(1000)
      .delay((d, i) => i * 100)
      .attr("r", (d) => radiusScale(d.data.frequency)) // Scale up to final radius
      .style("opacity", 1); // Fade in to opacity 1

    node
      .selectAll("clipPath circle")
      .transition()
      .duration(1000)
      .delay((d, i) => i * 100)
      .attr("r", (d) => radiusScale(d.data.frequency)); // Scale up to final radius

    // Transition for images to scale up and fade in
    images
      .transition()
      .duration(1000)
      .delay((d, i) => i * 100)
      .attr("x", (d) => -radiusScale(d.data.frequency))
      .attr("y", (d) => -radiusScale(d.data.frequency))
      .attr("height", (d) => 2 * radiusScale(d.data.frequency))
      .attr("width", (d) => 2 * radiusScale(d.data.frequency))
      .style("opacity", 1); 
  }
}
