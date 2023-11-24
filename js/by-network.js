// Load the CSV file
d3.csv("data/labeled.csv").then(function (data) {
  // Extract unique network names and sort them
  const networks = Array.from(new Set(data.map((d) => d.network))).sort(
    d3.ascending
  );

  // Calculate average scores for each network and party
  const avgScores = d3
    .rollups(
      data,
      (v) => d3.mean(v, (d) => d.label),
      (d) => d.network,
      (d) => d.party
    )
    .map(([network, partyData]) =>
      partyData.map(([party, avgScore]) => ({ network, party, avgScore }))
    )
    .flat();

  // Extract avgScore values for Democrats and Republicans
  const democratSentiment = avgScores
    .filter((d) => d.party === "D")
    .map((d) => d.avgScore);
  const republicanSentiment = avgScores
    .filter((d) => d.party === "R")
    .map((d) => d.avgScore);

  var names = networks;
  var leftData = democratSentiment;
  var rightData = republicanSentiment;

  // Chart setup
  var labelArea = 160;
  var chart,
    width = 400,
    bar_height = 20,
    height = bar_height * names.length;
  var rightOffset = width + labelArea;
  var leftPad = 25;

  // Create SVG element in the specified div
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
    .range([0, width]);

  var y = d3.scaleBand().domain(names).range([10, height]).padding(0.1);

  var xTo = d3
    .scaleLinear()
    .domain([0, d3.max(rightData)])
    .range([0, width]);

  // Left bars
  chart
    .selectAll("rect.left")
    .data(leftData)
    .join("rect")
    .attr("x", (d) => width - xFrom(d))
    .attr("y", (d, i) => y(names[i]))
    .attr("class", "left")
    .attr("width", xFrom)
    .attr("height", y.bandwidth())
    .attr("fill", DEMOCRAT_BLUE);

  // Left labels
  chart
    .selectAll("text.leftscore")
    .data(leftData)
    .join("text")
    .attr("x", (d) => width - xFrom(d) + leftPad)
    .attr("y", (d, i) => y(names[i]) + y.bandwidth() / 2)
    .attr("dx", "20")
    .attr("dy", ".36em")
    .attr("text-anchor", "end")
    .attr("class", "leftscore")
    .attr("fill", "#FFFFFF")
    .text((d) => `${(d * 100).toFixed(0)}%`);

  // Middle labels
  chart
    .selectAll("text.name")
    .data(names)
    .join("text")
    .attr("x", labelArea / 2 + width)
    .attr("y", (d) => y(d) + y.bandwidth() / 2)
    .attr("dy", ".20em")
    .attr("text-anchor", "middle")
    .attr("class", "name")
    .text(String);

  // Right bars
  chart
    .selectAll("rect.right")
    .data(rightData)
    .join("rect")
    .attr("x", rightOffset)
    .attr("y", (d, i) => y(names[i]))
    .attr("class", "right")
    .attr("width", xTo)
    .attr("height", y.bandwidth())
    .attr("fill", REPUBLICAN_RED);

  // Right labels
  chart
    .selectAll("text.score")
    .data(rightData)
    .join("text")
    .attr("x", (d) => xTo(d) + rightOffset)
    .attr("y", (d, i) => y(names[i]) + y.bandwidth() / 2)
    .attr("dx", -5)
    .attr("dy", ".36em")
    .attr("text-anchor", "end")
    .attr("class", "score")
    .attr("fill", "#FFFFFF")
    .text((d) => `${(d * 100).toFixed(0)}%`);
});
