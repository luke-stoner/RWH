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

    const root = d3.hierarchy({ children: data }).sum(function (d) {
      return d.frequency;
    });

    const node = svg
      .selectAll(".node")
      .data(pack(root).leaves())
      .enter()
      .append("g")
      .attr("class", "node")
      // Set the initial transform to center the nodes
      .attr("transform", `translate(${width / 2},${height / 2})`);

    node
      .append("clipPath")
      .attr("id", function (d, i) {
        return "clip-" + i;
      })
      .append("circle")
      .attr("r", 10); // Start with a radius of 10

    const t = d3.transition().duration(750);

    // Transition the circle's radius to its final value
    node
      .selectAll("circle")
      .transition(t)
      .delay(function (d, i) {
        return i * 50;
      })
      .attr("r", function (d) {
        return d.r;
      });

    node
      .transition(t)
      .delay(function (d, i) {
        return i * 50;
      })
      .attr("transform", function (d) {
        return `translate(${d.x},${d.y})`;
      });

    data.sort(function (a, b) {
      return b.frequency - a.frequency;
    });

    node
      .append("circle")
      .attr("r", function (d) {
        return d.r;
      })
      .style("fill", function (d) {
        return PARTY_COLOR_MAP[d.data.party];
      });

    node
      .append("svg:image")
      .attr("xlink:href", function (d) {
        return d.data.photo;
      })
      .attr("clip-path", function (d, i) {
        return "url(#clip-" + i + ")";
      })
      .attr("x", function (d) {
        return -d.r;
      })
      .attr("y", function (d) {
        return -d.r;
      })
      .attr("height", function (d) {
        return 2 * d.r;
      })
      .attr("width", function (d) {
        return 2 * d.r;
      });
  }
}
