// Function to parse CSV data
function parseData(data) {
  const countMap = new Map();
  data.forEach((row) => {
    const candidateKey = row.first_name + "_" + row.last_name;
    if (countMap.has(candidateKey)) {
      countMap.set(candidateKey, countMap.get(candidateKey) + 1);
    } else {
      countMap.set(candidateKey, 1);
    }
  });

  return Array.from(countMap, ([key, frequency]) => {
    const [firstName, lastName] = key.split("_");
    return {
      name: lastName,
      frequency: frequency,
      photo: "img/candidate_portraits/" + lastName.toLowerCase() + ".png",
      party: data.find(
        (d) => d.first_name === firstName && d.last_name === lastName
      ).party,
    };
  });
}

// Load the CSV data
d3.csv("data/labeled.csv")
  .then(function (csvData) {
    var data = parseData(csvData);
    // Define the size of the SVG and margins
    var width = 960,
      height = 400, // was 500
      margin = { top: 0, right: 20, bottom: 20, left: 20 };

    // Compute the inner dimensions
    var innerWidth = width - margin.left - margin.right,
      innerHeight = height - margin.top - margin.bottom;

    // Append the SVG object to the volume-bubbles div
    var svg = d3
      .select("#volume-bubbles")
      .append("svg")
      .attr("width", width)
      .attr("height", height)
      .append("g")
      .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    // Create a pack layout with the new dimensions
    var pack = d3.pack().size([innerWidth, innerHeight]).padding(2);

    // Process the data to create a hierarchy and sort
    var root = d3.hierarchy({ children: data }).sum(function (d) {
      return d.frequency;
    }); // Size of the bubbles

    // Create the pack layout and nodes
    var node = svg
      .selectAll(".node")
      .data(pack(root).leaves())
      .enter()
      .append("g")
      .attr("class", "node");
    // Define the clipPath
    node
      .append("clipPath")
      .attr("id", function (d, i) {
        return "clip-" + i;
      }) // Give a unique id for each clipPath
      .append("circle")
      .attr("r", function (d) {
        return d.r;
      });
    // Define the transition
    var t = d3.transition().duration(750);

    // Apply the transition to the nodes
    node
      .transition(t)
      .delay(function (d, i) {
        return i * 50;
      }) // Delay by index
      .attr("transform", function (d) {
        return "translate(" + d.x + "," + d.y + ")";
      });

    // Define a scale for your legend sizes
    var sizeScale = d3
      .scaleSqrt()
      .domain([
        0,
        d3.max(data, function (d) {
          return d.frequency;
        }),
      ])
      .range([0, 50]); // Change 50 to the maximum size you want in the legend

    // Transition for circles
    // Sort data to ensure that smaller circles are on top
    data.sort(function (a, b) {
      return b.frequency - a.frequency;
    });

    // Define the transition
    var t = d3.transition().duration(750);

    // Append circle for each node and set the fill based on party
    node
      .append("circle")
      .attr("r", function (d) {
        return d.r;
      })
      .style("fill", function (d) {
        return PARTY_COLOR_MAP[d.data.party];
      });

    // Append images to each node, using the clipPath
    node
      .append("svg:image")
      .attr("xlink:href", function (d) {
        return d.data.photo;
      })
      .attr("clip-path", function (d, i) {
        return "url(#clip-" + i + ")";
      }) // Reference the unique clipPath id
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

    ////ADDING LEGEND
    // Define the legend sizes
    // Calculate minimum, median, and maximum
    var sortedData = data.map((d) => d.frequency).sort((a, b) => a - b);

    var minSize = sortedData[0];
    var medianSize = sortedData[Math.floor(sortedData.length / 2)];
    var maxSize = sortedData[sortedData.length - 1];

    // Update the legendSizes array
    // Update the legendSizes array
    // Update the legendSizes array
    var legendSizes = [minSize, medianSize, maxSize];

    // Adjust the sizeScale function if necessary
    // For example, setting a reasonable maximum size for the largest circle
    sizeScale.range([5, 30]); // Adjust the range as needed

    // Calculate SVG dimensions
    var spacing = 80; // Space between each legend item
    var maxLegendCircleSize = sizeScale(maxSize);
    var legendWidth = legendSizes.length * (maxLegendCircleSize * 2 + spacing);

    // Create an SVG for the legend
    var legendSvg = d3
      .select("#legend-container")
      .append("svg")
      .attr("width", legendWidth)
      .attr("height", maxLegendCircleSize * 2 + 30); // Extra space for labels

    // Create a group for each legend item
    var legend = legendSvg
      .selectAll(".legend")
      .data(legendSizes)
      .enter()
      .append("g")
      .attr("class", "legend")
      .attr("transform", function (d, i) {
        var xPosition = i * (maxLegendCircleSize * 2 + spacing) + 40;
        return "translate(" + xPosition + ",0)";
      });

    // Draw circles for each legend item
    legend
      .append("circle")
      .attr("cx", maxLegendCircleSize) // Center the circle in its group
      .attr("cy", maxLegendCircleSize) // Align vertically
      .attr("r", function (d) {
        return sizeScale(d);
      })
      .style("fill", "#ccc"); // Grey color

    // Add text labels to the legend
    legend
      .append("text")
      .attr("x", maxLegendCircleSize)
      .attr("y", maxLegendCircleSize * 2 + 20) // Position below the circle
      .text(function (d) {
        return `${d} mentions`;
      })
      .attr("font-size", "12px")
      .attr("text-anchor", "middle"); // Center the text under the circle
  })
  .catch(function (error) {
    console.error("Error loading the data:", error);
  });
