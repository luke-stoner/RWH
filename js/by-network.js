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

  // Chart dimensions
  const labelArea = 160;
  const width = 400;
  const barHeight = 20;
  const height = barHeight * networks.length;
  const rightOffset = width + labelArea;

  // Create the SVG container
  const chart = d3
    .select("#by-network")
    .append("svg")
    .attr("class", "chart")
    .attr("width", labelArea + width + width)
    .attr("height", height + 40); // Increased height to accommodate the legend

  // Scales
  const maxDemocratScore = d3.max(democratSentiment);
  const maxRepublicanScore = d3.max(republicanSentiment);
  const maxScore = Math.max(maxDemocratScore, maxRepublicanScore);

  const xFrom = d3.scaleLinear().domain([0, maxScore]).range([width, 0]);
  const xTo = d3.scaleLinear().domain([0, maxScore]).range([0, width]);
  const y = d3.scaleBand().domain(networks).range([0, height]).padding(0.1);

  // Left bars
  chart
    .selectAll("rect.left")
    .data(democratSentiment)
    .enter()
    .append("rect")
    .attr("x", function(pos) { return width - xFrom(pos); })
    .attr("y", (d, i) => y(networks[i]))
    .attr("class", "left")
    .attr("width", (d) => width - xFrom(d))
    .attr("height", y.bandwidth())
    .attr("fill", DEMOCRAT_BLUE);

  // Left labels
  chart
    .selectAll("text.leftscore")
    .data(democratSentiment)
    .enter()
    .append("text")
    .attr("x", (d) => xFrom(d) - 5)
    .attr("y", (d, i) => y(networks[i]) + y.bandwidth() / 2)
    .attr("dy", ".35em")
    .attr("text-anchor", "end")
    .attr("class", "leftscore")
    .text((d) => `${(d * 100).toFixed(1)}%`);

  // Middle labels (names)
  chart
    .selectAll("text.name")
    .data(networks)
    .enter()
    .append("text")
    .attr("x", labelArea / 2 + width)
    .attr("y", (d) => y(d) + y.bandwidth() / 2)
    .attr("dy", ".35em")
    .attr("text-anchor", "middle")
    .attr("class", "name")
    .text((d) => d);

  // Right bars
  chart
    .selectAll("rect.right")
    .data(republicanSentiment)
    .enter()
    .append("rect")
    .attr("x", rightOffset)
    .attr("y", (d, i) => y(networks[i]))
    .attr("class", "right")
    .attr("width", (d) => xTo(d)) // Corrected width calculation
    .attr("height", y.bandwidth())
    .attr("fill", REPUBLICAN_RED);

  // Right labels
  chart
    .selectAll("text.score")
    .data(republicanSentiment)
    .enter()
    .append("text")
    .attr("x", (d) => xTo(d) + rightOffset + 5)
    .attr("y", (d, i) => y(networks[i]) + y.bandwidth() / 2)
    .attr("dy", ".35em")
    .attr("text-anchor", "start")
    .attr("class", "score")
    .text((d) => `${(d * 100).toFixed(1)}%`);

  // Define the legend data and labels
  const legendData = [
    { label: "Democrat", color: DEMOCRAT_BLUE },
    { label: "Republican", color: REPUBLICAN_RED },
  ];

  // Create a group for the legend
  const legend = chart
    .append("g")
    .attr("class", "legend")
    .attr(
      "transform",
      `translate(${labelArea / 2 + width - 100}, ${height + 20})`
    );

  // Create legend rectangles and labels
  legend
    .selectAll("rect")
    .data(legendData)
    .enter()
    .append("rect")
    .attr("x", (d, i) => i * 115)
    .attr("width", 20)
    .attr("height", 20)
    .attr("fill", (d) => d.color);

  legend
    .selectAll("text")
    .data(legendData)
    .enter()
    .append("text")
    .attr("x", (d, i) => i * 115 + 25)
    .attr("y", 15)
    .text((d) => d.label);
});
