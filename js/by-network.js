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

  console.log(networks);
  console.log(leftData);
  console.log(rightData);

  var labelArea = 160;

  var chart,
    width = 400,
    bar_height = 20,
    height = bar_height * networks.length;

  var rightOffset = width + labelArea;

  var chart = d3
    .select("#by-network")
    .append("svg")
    .attr("class", "chart")
    .attr("width", labelArea + width + width)
    .attr("height", height);

  var xFrom = d3
    .scaleLinear()
    .domain([0, d3.max(leftData)])
    .range([0, width]);

  var y = d3.scaleOrdinal().domain(networks).range([10, height]);

  var yPosByIndex = function (d, index) {
    return y(index);
  };

  chart
    .selectAll("rect.left")
    .data(leftData)
    .enter()
    .append("rect")
    .attr("x", function (pos) {
      return width - xFrom(pos);
    })
    .attr("y", yPosByIndex)
    .attr("class", "left")
    .attr("width", xFrom)
    .attr("height", y.bandwidth()); // Use y.bandwidth() to set the height of the right bars

  chart
    .selectAll("rect.right")
    .data(rightData)
    .enter()
    .append("rect")
    .attr("x", rightOffset)
    .attr("y", yPosByIndex)
    .attr("class", "right")
    .attr("width", xTo)
    .attr("height", y.bandwidth()); // Use y.bandwidth() to set the height of the right bars

  // chart
  //   .selectAll("text.leftscore")
  //   .data(leftData)
  //   .enter()
  //   .append("text")
  //   .attr("x", function (d) {
  //     return width - xFrom(d);
  //   })
  //   .attr("y", function (d, z) {
  //     return y(z) + y.bandwidth() / 2;
  //   })
  //   .attr("dx", "20")
  //   .attr("dy", ".36em")
  //   .attr("text-anchor", "end")
  //   .attr("class", "leftscore")
  //   .text(String);

  // chart
  //   .selectAll("text.name")
  //   .data(networks)
  //   .enter()
  //   .append("text")
  //   .attr("x", labelArea / 2 + width)
  //   .attr("y", function (d) {
  //     return y(d) + y.bandwidth() / 2;
  //   })
  //   .attr("dy", ".20em")
  //   .attr("text-anchor", "middle")
  //   .attr("class", "name")
  //   .text(String);

  // var xTo = d3.scale
  //   .linear()
  //   .domain([0, d3.max(rightData)])
  //   .range([0, width]);

  // chart
  //   .selectAll("text.score")
  //   .data(rightData)
  //   .enter()
  //   .append("text")
  //   .attr("x", function (d) {
  //     return xTo(d) + rightOffset;
  //   })
  //   .attr("y", function (d, z) {
  //     return y(z) + y.bandwidth() / 2;
  //   })
  //   .attr("dx", -5)
  //   .attr("dy", ".36em")
  //   .attr("text-anchor", "end")
  //   .attr("class", "score")
  //   .text(String);
});
