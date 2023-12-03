class SentimentChart {
  constructor() {
    if (SentimentChart.instance) {
      return SentimentChart.instance;
    }
    SentimentChart.instance = this;

    this.setupProperties();
    this.initChart();
    this.bindEvents();
    this.initialLoad();
  }
  initialLoad() {
    this.loadData(this.dataUrl, (rawData) =>
      SentimentChart.filterData(rawData, false)
    );
  }

  setupProperties() {
    this.margin = { top: 30, right: 30, bottom: 30, left: 230 };
    this.width = 800 - this.margin.left - this.margin.right;
    this.height = 500 - this.margin.top - this.margin.bottom;
    this.selector = "#candidate-sentiment-bars";
    this.dataUrl = "data/labeled.csv";
    this.transitionDuration = 750; // Transition duration in milliseconds
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

  bindEvents() {
    const self = this;
    d3.selectAll('input[name="inlineRadioOptions"]').on("change", function () {
      const showAll = d3.select("#show-all-sentiment").property("checked");
      self.loadData(self.dataUrl, (rawData) =>
        SentimentChart.filterData(rawData, showAll)
      );
    });
  }

  updateChart(data) {
    this.clearChart();
    this.createAxis(data);
    this.createBars(data);
    this.createBarExtensions(data);
    this.createBackgroundCircles(data);
    this.createImages(data);
    this.createDashedLine();
  }

  clearChart() {
    this.svg.selectAll("*").remove();
  }

  createAxis(data) {
    this.svg
      .append("g")
      .attr("transform", `translate(0,${this.height})`)
      .call(
        d3
          .axisBottom(this.x)
          .tickValues([0, 0.25, 0.5, 0.75, 1])
          .tickFormat(d3.format(".0%"))
      );

    this.svg
      .append("text")
      .attr("class", "x-axis-title")
      .attr("x", this.width / 2)
      .attr("y", this.height + 30)
      .style("text-anchor", "middle")
      .style("font-size", "12px")
      .text("Positive Mentions");

    this.y.domain(data.map((d) => d.name));
    this.svg
      .append("g")
      .call(d3.axisLeft(this.y).tickSize(0))
      .selectAll(".tick text")
      .attr("x", -this.y.bandwidth() * 1.2)
      .style("text-anchor", "end")
      .style("font-size", "16px");
  }

  createBars(data) {
    const bars = this.svg
      .selectAll("rect")
      .data(data)
      .enter()
      .append("rect")
      .attr("x", this.x(0))
      .attr("y", (d) => this.y(d.name))
      .attr("height", this.y.bandwidth())
      .attr("fill", (d) => PARTY_COLOR_MAP[d.party]);

    bars
      .transition()
      .duration(this.transitionDuration)
      .attr("width", (d) => this.x(d.avg_sentiment));
  }

  createBarExtensions(data) {
    const barExtensions = this.svg
      .selectAll("barExtensions")
      .data(data)
      .enter()
      .append("rect")
      .attr("x", this.x(0) - this.y.bandwidth() / 2)
      .attr("y", (d) => this.y(d.name))
      .attr("height", this.y.bandwidth())
      .attr("fill", (d) => PARTY_COLOR_MAP[d.party]);

    barExtensions
      .transition()
      .duration(this.transitionDuration)
      .attr("width", this.y.bandwidth());
  }

  createBackgroundCircles(data) {
    const backgroundCircles = this.svg
      .selectAll("circle")
      .data(data)
      .enter()
      .append("circle")
      .attr("cx", this.x(0) - this.y.bandwidth() / 2)
      .attr("cy", (d) => this.y(d.name) + this.y.bandwidth() / 2)
      .attr("r", 0)
      .attr("fill", "white")
      .attr("stroke", (d) => PARTY_COLOR_MAP[d.party])
      .attr("stroke-width", 3);

    backgroundCircles
      .transition()
      .duration(this.transitionDuration)
      .attr("r", this.y.bandwidth() / 2);
  }

  createImages(data) {
    const images = this.svg
      .selectAll("image")
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
      .duration(this.transitionDuration)
      .attr("height", this.y.bandwidth())
      .attr("width", this.y.bandwidth());
  }

  createDashedLine() {
    this.svg
      .append("line")
      .attr("x1", this.x(0.5))
      .attr("x2", this.x(0.5))
      .attr("y1", 0)
      .attr("y2", this.height)
      .style("stroke-dasharray", "5,5")
      .style("stroke", "#000000")
      .style("stroke-width", 2);
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
