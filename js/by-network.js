// 1. Load the CSV file
d3.csv("data/labeled.csv").then(function (data) {
  // Extract unique network names and sort them
  var networks = Array.from(new Set(data.map((d) => d.network))).sort(
    d3.ascending
  );

  // Calculate average scores for each network and party
  var avgScores = d3
    .rollups(
      data,
      (v) => d3.mean(v, (d) => d.label),
      (d) => d.network,
      (d) => d.party
    )
    .map(([network, partyData]) => {
      return partyData.map(([party, avgScore]) => {
        return { network, party, avgScore };
      });
    })
    .flat();

  // Filter out separate datasets for Democrats and Republicans
  var leftData = avgScores
    .filter((d) => d.party === "D")
    .map((d) => d.avgScore); // Extract avgScore values
  var rightData = avgScores
    .filter((d) => d.party === "R")
    .map((d) => d.avgScore); // Extract avgScore values

  var names = networks;

  // Random numbers generator
  var randomNumbers = function () {
    var numbers = [];
    for (var i = 0; i < 20; i++) {
      numbers.push(parseInt(Math.random() * 19) + 1);
    }
    return numbers;
  };

  // Random names generator
  var randomNames = function () {
    var names = [];
    for (var i = 0; i < 20; i++) {
      names.push(
        String.fromCharCode(65 + Math.random() * 25) +
          String.fromCharCode(65 + Math.random() * 25) +
          String.fromCharCode(65 + Math.random() * 25)
      );
    }
    return names;
  };

  // Generate data
  var names = randomNames();
  var leftData = randomNumbers();
  var rightData = randomNumbers();

  // Chart dimensions
  var labelArea = 160;
  var width = 400;
  var barHeight = 20;
  var height = barHeight * names.length;
  var rightOffset = width + labelArea;

  // Create the SVG container
  var chart = d3
    .select("#by-network")
    .append("svg")
    .attr("class", "chart")
    .attr("width", labelArea + width + width)
    .attr("height", height);

  // Scales
  var xFrom = d3
    .scaleLinear()
    .domain([0, d3.max(leftData)])
    .range([width, 0]);

  var y = d3.scaleBand().domain(names).range([0, height]).padding(0.1);

  // Left bars
  chart
    .selectAll("rect.left")
    .data(leftData)
    .enter()
    .append("rect")
    .attr("x", (d) => xFrom(d))
    .attr("y", (d, i) => y(names[i]))
    .attr("class", "left")
    .attr("width", (d) => width - xFrom(d))
    .attr("height", y.bandwidth());

  // Left labels
  chart
    .selectAll("text.leftscore")
    .data(leftData)
    .enter()
    .append("text")
    .attr("x", (d) => xFrom(d) - 5)
    .attr("y", (d, i) => y(names[i]) + y.bandwidth() / 2)
    .attr("dy", ".35em")
    .attr("text-anchor", "end")
    .attr("class", "leftscore")
    .text((d) => d);

  // Middle labels (names)
  chart
    .selectAll("text.name")
    .data(names)
    .enter()
    .append("text")
    .attr("x", labelArea / 2 + width)
    .attr("y", (d) => y(d) + y.bandwidth() / 2)
    .attr("dy", ".35em")
    .attr("text-anchor", "middle")
    .attr("class", "name")
    .text((d) => d);

  // Right bars scale
  var xTo = d3
    .scaleLinear()
    .domain([0, d3.max(rightData)])
    .range([0, width]);

  // Right bars
  chart
    .selectAll("rect.right")
    .data(rightData)
    .enter()
    .append("rect")
    .attr("x", rightOffset)
    .attr("y", (d, i) => y(names[i]))
    .attr("class", "right")
    .attr("width", xTo)
    .attr("height", y.bandwidth());

  // Right labels
  chart
    .selectAll("text.score")
    .data(rightData)
    .enter()
    .append("text")
    .attr("x", (d) => xTo(d) + rightOffset + 5)
    .attr("y", (d, i) => y(names[i]) + y.bandwidth() / 2)
    .attr("dy", ".35em")
    .attr("text-anchor", "start")
    .attr("class", "score")
    .text((d) => d);
});
