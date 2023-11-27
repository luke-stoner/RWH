class SentimentChart {
  constructor(selector, width, height) {
    this.margin = { top: 30, right: 30, bottom: 30, left: 230 };
    this.width = width - this.margin.left - this.margin.right;
    this.height = height - this.margin.top - this.margin.bottom;
    this.selector = selector;
    this.initChart();
  }

  initChart() {
    this.x = d3.scaleLinear().domain([0, 1]).range([0, this.width]);
    this.y = d3.scaleBand().range([0, this.height]).padding(0.1);

    this.svg = d3
      .select(this.selector)
      .append("svg")
      .attr("width", this.width + this.margin.left + this.margin.right)
      .attr("height", this.height + this.margin.top + this.margin.bottom)
      .append("g")
      .attr("transform", `translate(${this.margin.left},${this.margin.top})`);
  }

  updateChart(data) {
    // Clear existing chart elements
    this.svg.selectAll("*").remove();

    // Re-create X axis
    this.svg
      .append("g")
      .attr("transform", `translate(0,${this.height})`)
      .call(d3.axisBottom(this.x).ticks(5));

    // Update Y axis domain based on new data
    this.y.domain(data.map((d) => d.name));
    this.svg
      .append("g")
      .call(d3.axisLeft(this.y).tickSize(0))
      .selectAll(".tick text")
      .attr("x", -this.y.bandwidth() * 1.2)
      .style("text-anchor", "end")
      .style("font-size", "16px");

    // Add bars
    this.svg
      .selectAll("myRect")
      .data(data)
      .enter()
      .append("rect")
      .attr("x", this.x(0))
      .attr("y", (d) => this.y(d.name))
      .attr("width", (d) => this.x(d.avg_sentiment))
      .attr("height", this.y.bandwidth())
      .attr("fill", (d) => (d.party === "R" ? REPUBLICAN_RED : DEMOCRAT_BLUE));

    // Add bar extensions
    this.svg
      .selectAll("barExtensions")
      .data(data)
      .enter()
      .append("rect")
      .attr("x", this.x(0) - this.y.bandwidth() / 2)
      .attr("y", (d) => this.y(d.name))
      .attr("width", this.y.bandwidth())
      .attr("height", this.y.bandwidth())
      .attr("fill", (d) => (d.party === "R" ? REPUBLICAN_RED : DEMOCRAT_BLUE));

    // Add background circles
    this.svg
      .selectAll("backgroundCircles")
      .data(data)
      .enter()
      .append("circle")
      .attr("cx", this.x(0) - this.y.bandwidth() / 2)
      .attr("cy", (d) => this.y(d.name) + this.y.bandwidth() / 2)
      .attr("r", this.y.bandwidth() / 2)
      .attr("fill", "white")
      .attr("stroke", (d) => (d.party === "R" ? REPUBLICAN_RED : DEMOCRAT_BLUE))
      .attr("stroke-width", 3);

    // Add images
    this.svg
      .selectAll("candidateImages")
      .data(data)
      .enter()
      .append("image")
      .attr("xlink:href", (d) => d.photo)
      .attr("x", this.x(0) - this.y.bandwidth())
      .attr("y", (d) => this.y(d.name))
      .attr("height", this.y.bandwidth())
      .attr("width", this.y.bandwidth())
      .attr("clip-path", "circle()");
  }

  loadData(dataUrl, filterFunction) {
    d3.csv(dataUrl).then((rawData) => {
      let processedData = filterFunction(rawData);
      this.updateChart(processedData);
    });
  }
}

// Function to filter data
function filterData(rawData, showAll) {
  const sentimentData = d3
    .rollups(
      rawData,
      (v) => d3.mean(v, (d) => +d.label),
      (d) => d.first_name + " " + d.last_name
    )
    .map((d) => ({
      name: d[0],
      avg_sentiment: d[1],
      photo:
        "img/candidate_portraits/" + d[0].split(" ")[1].toLowerCase() + ".png",
      party: rawData.find((r) => r.first_name + " " + r.last_name === d[0])
        .party,
    }))
    .sort((a, b) => d3.descending(a.avg_sentiment, b.avg_sentiment));

  const candidateOccurrences = d3
    .rollups(
      rawData,
      (v) => v.length,
      (d) => d.first_name + " " + d.last_name
    )
    .sort((a, b) => d3.descending(a[1], b[1]));

  if (showAll) {
    return sentimentData;
  } else {
    const topCandidates = candidateOccurrences.slice(0, 5).map((d) => d[0]);
    return sentimentData.filter((d) => topCandidates.includes(d.name));
  }
}

// Instantiate the chart
const sentimentChart = new SentimentChart(
  "#candidate-sentiment-bars",
  800,
  500
);

// Load initial data
sentimentChart.loadData("data/labeled.csv", (rawData) =>
  filterData(rawData, false)
);

// Event listener for the toggle switch
d3.select("#candidateToggle").on("change", function () {
  const showAll = d3.select(this).property("checked");
  d3.select("#toggleLabel").text(
    showAll ? "Display All Candidates" : "Show Top 5 Candidates"
  );
  sentimentChart.loadData("data/labeled.csv", (rawData) =>
    filterData(rawData, showAll)
  );
});
