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
    const initialX = width / 2; // Initial X position for the circles
    const initialY = 0; // Initial Y position for the circles
    const numCircles = data.length;

    // Create SVG container
    const svg = d3
      .select("#volume-bubbles")
      .append("svg")
      .attr("width", width)
      .attr("height", height);

    // Sort data
    data.sort((a, b) => a.frequency - b.frequency);

    // Define a scale for the circle radius based on frequency
    const maxFrequency = d3.max(data, (d) => d.frequency);
    const radiusScale = d3.scaleSqrt().domain([0, maxFrequency]).range([6, 50]);
    const fontSizeScale = d3.scaleLinear().domain([4, 50]).range([8, 24]);

    // Calculate cumulative widths for circles
    let cumulativeWidths = [margin];
    data.forEach((d, i) => {
      if (i > 0) {
        const previousCircle = data[i - 1];
        const spacing =
          radiusScale(d.frequency) + radiusScale(previousCircle.frequency) + 10;
        cumulativeWidths.push(cumulativeWidths[i - 1] + spacing);
      }
    });

    // Create a group for the circles and labels
    const group = svg.append("g");

    // Create circles with radius based on frequency
    const circles = group
      .selectAll("circle")
      .data(data)
      .enter()
      .append("circle")
      .attr("cx", initialX)
      .attr("cy", initialY)
      .attr("r", (d) => radiusScale(d.frequency))
      .style("fill", (d) => PARTY_COLOR_MAP[d.party])
      .style("opacity", 0);

    // Add frequency label at the center of each circle
    const labels = group
      .selectAll("text")
      .data(data)
      .enter()
      .append("text")
      .attr("x", (d, i) => cumulativeWidths[i])
      .attr("y", (d) => height / 2) // y position at the vertical center of the circle
      .text((d) => d.frequency.toLocaleString())
      .attr("text-anchor", "middle")
      .style("fill", "#FFFFFF")
      .style("font-size", (d) => `${fontSizeScale(radiusScale(d.frequency))}px`)
      .attr("dy", (d) => `${fontSizeScale(radiusScale(d.frequency)) / 2 - 2}px`) // Adjust dy for vertical centering
      .style("opacity", 0);

    // Transition for circles to fan out into a straight line
    const fanOutDuration = 1000;
    const fanOutDelay = fanOutDuration / 2 + 700;
    circles
      .transition()
      .duration(fanOutDuration)
      .delay((d, i) => i * fanOutDelay)
      .attr("cx", (d, i) => cumulativeWidths[i])
      .attr("cy", height / 2) // Final Y position for the circles
      .style("opacity", 1);

    // Transition for labels to match circle appearance
    labels
      .transition()
      .duration(fanOutDuration)
      .delay((d, i) => i * fanOutDelay)
      .attr("x", (d, i) => cumulativeWidths[i])
      .attr("y", (d) => height / 2)
      .style("opacity", 1);

    // Append image elements for each data point
    const images = group
      .selectAll("image")
      .data(data)
      .enter()
      .append("image")
      .attr("xlink:href", (d) => d.photo)
      .attr("x", (d) => initialX - radiusScale(d.frequency)) // Center the image on the circle's initial X
      .attr("y", (d) => initialY - radiusScale(d.frequency)) // Center the image on the circle's initial Y
      .attr("width", (d) => 2 * radiusScale(d.frequency)) // Image width = 2 * radius
      .attr("height", (d) => 2 * radiusScale(d.frequency)) // Image height = 2 * radius
      .style("opacity", 0)
      .style("clip-path", "circle(50%)"); // Apply circular clipping to make the image circular

    // Transition for images to fan out with circles
    images
      .transition()
      .duration(fanOutDuration)
      .delay((d, i) => i * fanOutDelay)
      .attr("x", (d, i) => cumulativeWidths[i] - radiusScale(d.frequency)) // Adjust position to center on circle
      .attr("y", (d) => height / 2 - radiusScale(d.frequency))
      .style("opacity", 0); // Adjust position to center on circle

    // Additional text to show after all transitions are complete
    const totalDelay = numCircles * fanOutDelay; // Total time until the last circle and label have appeared
    const firstMessage = svg
      .append("text")
      .attr("x", width / 2)
      .attr("y", height / 3)
      .text("There is a lot of variance here...")
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
          .text("Some candidates are mentioned more than others...")
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
            // ... [rest of your existing code] ...

            // Function to focus on each circle, fade out label, and fade in image
            function focusOnCircle(index) {
              if (index >= data.length) {
                return; // Stop if there are no more circles
              }

              const xPosition = cumulativeWidths[index];
              const scale = 6; // Example zoom level
              const translateX = width / 2 - xPosition * scale;
              const translateY = height / 2 - (height / 2) * scale;

              // Zoom to the circle first
              group
                .transition()
                .duration(1000)
                .attr(
                  "transform",
                  `translate(${translateX}, ${translateY}) scale(${scale})`
                )
                .on("end", () => {
                  // After zooming, fade out the label
                  labels
                    .filter((d, i) => i === index)
                    .transition()
                    .duration(500)
                    .style("opacity", 0)
                    .on("end", () => {
                      // After label fades out, fade in the image
                      images
                        .filter((d, i) => i === index)
                        .transition()
                        .duration(500)
                        .style("opacity", 1)
                        .on("end", () => {
                          // Move to the next circle after a short delay
                          setTimeout(() => {
                            focusOnCircle(index + 1);
                          }, 500);
                        });
                    });
                });
            }

            // Start the sequential transition with the first circle
            focusOnCircle(0);

            // ... [rest of your code, or end the function] ...
          }); //HERE
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
      .delay((d, i) => i * 200) // Increase delay for more punctuated effect
      .attr("transform", (d) => `translate(${d.x},${d.y})`);

    // Transition for circles and clipPaths to scale up
    circles
      .transition()
      .duration(1000)
      .delay((d, i) => i * 200) // Increase delay for more punctuated effect
      .attr("r", (d) => radiusScale(d.data.frequency)) // Scale up to final radius
      .style("opacity", 1); // Fade in to opacity 1

    node
      .selectAll("clipPath circle")
      .transition()
      .duration(1000)
      .delay((d, i) => i * 200) // Increase delay for more punctuated effect
      .attr("r", (d) => radiusScale(d.data.frequency)); // Scale up to final radius

    // Transition for images to scale up and fade in
    images
      .transition()
      .duration(1000)
      .delay((d, i) => i * 200) // Increase delay for more punctuated effect
      .attr("x", (d) => -radiusScale(d.data.frequency))
      .attr("y", (d) => -radiusScale(d.data.frequency))
      .attr("height", (d) => 2 * radiusScale(d.data.frequency))
      .attr("width", (d) => 2 * radiusScale(d.data.frequency))
      .style("opacity", 1)
      .end()
      .then(() => {
        // Append text after all transitions are complete
        svg
          .append("text")
          .attr("x", width / 2)
          .attr("y", height - 15)
          .attr("text-anchor", "middle")
          .style("font-size", "16px")
          .style("opacity", 0)
          .text(
            "Joe Biden and Donald Trump are the most frequently mentioned candidates"
          )
          .transition()
          .duration(1000)
          .style("opacity", 1);
      });
  }
}
