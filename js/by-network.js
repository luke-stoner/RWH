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

  console.log(avgScores);
  console.log(leftData);
  console.log(rightData);

});
