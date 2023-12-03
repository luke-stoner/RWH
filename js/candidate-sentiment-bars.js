class SentimentChart {
  constructor() {

     if (SentimentChart.instance) {
       return SentimentChart.instance;
     }
    SentimentChart.instance = this;
    
    this.margin = { top: 30, right: 30, bottom: 30, left: 230 };
    this.width = 800 - this.margin.left - this.margin.right;
    this.height = 500 - this.margin.top - this.margin.bottom;
    this.selector = "#candidate-sentiment-bars";

    this.initChart();
    this.initAxes();
    this.loadData("data/labeled.csv", (rawData) =>
      SentimentChart.filterData(rawData, false)
    );

    d3.select("#candidateToggle").on("change", () => {
      const showAll = d3.select("#candidateToggle").property("checked");
      d3.select("#toggleLabel").text(
        showAll ? "Display All Candidates" : "Show Top 5 Candidates"
      );
      this.loadData("data/labeled.csv", (rawData) =>
        SentimentChart.filterData(rawData, showAll)
      );
    });
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

  initAxes() {
    // Create X axis
    this.svg
      .append("g")
      .attr("transform", `translate(0,${this.height})`)
      .call(d3.axisBottom(this.x).ticks(5));

    // Create Y axis
    this.svg
      .append("g")
      .call(d3.axisLeft(this.y).tickSize(0))
      .selectAll(".tick text")
      .attr("x", -this.y.bandwidth() * 1.2)
      .style("text-anchor", "end")
      .style("font-size", "16px");
  }

  updateChart(data) {
    const TRANSITION_DURATION = 750; // Transition duration in milliseconds

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

    // Add bars with transition
    const bars = this.svg
      .selectAll("myRect")
      .data(data)
      .enter()
      .append("rect")
      .attr("x", this.x(0))
      .attr("y", (d) => this.y(d.name))
      .attr("height", this.y.bandwidth())
      .attr("fill", (d) => (d.party === "R" ? REPUBLICAN_RED : DEMOCRAT_BLUE));

    bars
      .transition()
      .duration(TRANSITION_DURATION)
      .attr("width", (d) => this.x(d.avg_sentiment));

    // Add bar extensions with transition
    const barExtensions = this.svg
      .selectAll("barExtensions")
      .data(data)
      .enter()
      .append("rect")
      .attr("x", this.x(0) - this.y.bandwidth() / 2)
      .attr("y", (d) => this.y(d.name))
      .attr("height", this.y.bandwidth())
      .attr("fill", (d) => (d.party === "R" ? REPUBLICAN_RED : DEMOCRAT_BLUE));

    barExtensions
      .transition()
      .duration(TRANSITION_DURATION)
      .attr("width", this.y.bandwidth());

    // Add background circles with transition
    const backgroundCircles = this.svg
      .selectAll("backgroundCircles")
      .data(data)
      .enter()
      .append("circle")
      .attr("cx", this.x(0) - this.y.bandwidth() / 2)
      .attr("cy", (d) => this.y(d.name) + this.y.bandwidth() / 2)
      .attr("r", 0)
      .attr("fill", "white")
      .attr("stroke", (d) => (d.party === "R" ? REPUBLICAN_RED : DEMOCRAT_BLUE))
      .attr("stroke-width", 3);

    backgroundCircles
      .transition()
      .duration(TRANSITION_DURATION)
      .attr("r", this.y.bandwidth() / 2);

    // Add images with transition
    const images = this.svg
      .selectAll("candidateImages")
      .data(data)
      .enter()
      .append("image")
      .attr("xlink:href", (d) => d.photo)
      .attr("x", this.x(0) - this.y.bandwidth())
      .attr("y", (d) => this.y(d.name))
      .attr("height", 0)
      .attr("width", 0)
      .attr("clip-path", "circle()");

    images
      .transition()
      .duration(TRANSITION_DURATION)
      .attr("height", this.y.bandwidth())
      .attr("width", this.y.bandwidth());
  }

  loadData(dataUrl, filterFunction) {
    d3.csv(dataUrl).then((rawData) => {
      let processedData = filterFunction(rawData);
      this.updateChart(processedData);
    });
  }

  static filterData(rawData, showAll) {
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
          "img/candidate_portraits/" +
          d[0].split(" ")[1].toLowerCase() +
          ".png",
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
}

