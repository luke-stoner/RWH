function loadData() {
  var slider = document.getElementById("slider");

  d3.csv("data/labeled.csv", (row) => {
    row.date = d3.timeParse("%Y%m%d")(row.date);
    return row;
  }).then((data) => {
    let minDate = d3.min(data, (d) => d.date).getTime(); // Convert to timestamp
    let maxDate = d3.max(data, (d) => d.date).getTime(); // Convert to timestamp

    noUiSlider.create(slider, {
      start: [minDate, maxDate],
      connect: true,
      behaviour: "drag",
      step: 1,
      range: {
        min: minDate,
        max: maxDate,
      },
      tooltips: {
        to: function (value) {
          return parseInt(value);
        },
      },
    });

    slider.noUiSlider.on("slide", function (values) {
      let selectedMinYear = new Date(+values[0]);
      let selectedMaxYear = new Date(+values[1]);

      filteredData = data.filter(
        (d) => d.date >= selectedMinYear && d.date <= selectedMaxYear
      );

      // Call the updateVisualization function with the filtered data
      updateByNetwork(filteredData);
    });

    updateByNetwork(data);
  });
}

function updateByNetwork(data) {
  const networks = Array.from(new Set(data.map((d) => d.network))).sort(
    d3.ascending
  );

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
    height = 900;
  var rightOffset = width + labelArea;
  var leftPad = 25;
  var chart = d3
    .select("#by-network")
    .append("svg")
    .attr("class", "chart")
    .attr("width", labelArea + width + width)
    .attr("height", 900);

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

  // Democrat bars
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

  // Democrat labels
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

  // Y-axis Labels
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

  // Republican Bars
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

  // Republican Labels
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
}

loadData();
