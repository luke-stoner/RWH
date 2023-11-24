class ByNetworkVisual {
  constructor() {
    this.loadData();
  }

  async loadData() {
    const slider = document.getElementById("slider");
    const data = await d3.csv("data/labeled.csv", (row) => {
      row.date = d3.timeParse("%Y%m%d")(row.date);
      return row;
    });

    this.minDate = d3.min(data, (d) => d.date).getTime();
    this.maxDate = d3.max(data, (d) => d.date).getTime();

    this.setupSlider(slider, data);
    this.updateByNetwork(data);
  }

  setupSlider(slider, data) {
    noUiSlider.create(slider, {
      start: [this.minDate, this.maxDate],
      connect: true,
      behaviour: "drag",
      step: 1,
      range: {
        min: this.minDate,
        max: this.maxDate,
      },
      tooltips: {
        to: (value) => {
          const date = new Date(parseInt(value));
          return d3.timeFormat("%b %d, %Y")(date);
        },
      },
    });

    slider.noUiSlider.on("slide", (values) => {
      const selectedMinYear = new Date(+values[0]);
      const selectedMaxYear = new Date(+values[1]);

      const filteredData = data.filter(
        (d) => d.date >= selectedMinYear && d.date <= selectedMaxYear
      );

      this.updateByNetwork(filteredData);
    });
  }

  updateByNetwork(data) {
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

    this.createOrUpdateChart(networks, democratSentiment, republicanSentiment);
  }

  createOrUpdateChart(names, leftData, rightData) {
    this.labelArea = 160;
    this.width = 400;
    this.barHeight = 20;
    this.legendAreaBuffer = 50;
    this.height = this.barHeight * names.length + this.legendAreaBuffer;
    this.rightOffset = this.width + this.labelArea;
    this.leftPad = 25;

    // Create or select the SVG element
    this.chart = d3.select("#by-network").select("svg.chart");
    if (this.chart.empty()) {
      this.chart = d3
        .select("#by-network")
        .append("svg")
        .attr("class", "chart")
        .attr("width", this.labelArea + this.width + this.width)
        .attr("height", this.height);
      this.addXAxisTitles();
    }

    // Scales
    this.xFrom = d3
      .scaleLinear()
      .domain([0, d3.max(leftData)])
      .range([0, this.width]);

    this.y = d3
      .scaleBand()
      .domain(names)
      .range([10, this.height - this.legendAreaBuffer])
      .padding(0.1);

    this.xTo = d3
      .scaleLinear()
      .domain([0, d3.max(rightData)])
      .range([0, this.width]);

    this.transition = d3.transition().duration(750); // Define a transition

    // Update Democrat Chart
    this.updateDemocrat(leftData, names);

    // Update Y-axis Labels
    this.updateAxisLabels(names);

    // Update Republican Chart
    this.updateRepublican(rightData, names);
  }

  updateRepublican(rightData, names) {
    this.chart
      .selectAll("rect.right")
      .data(rightData)
      .join("rect")
      .transition(this.transition)
      .attr("x", this.rightOffset)
      .attr("y", (d, i) => this.y(names[i]))
      .attr("class", "right")
      .attr("width", this.xTo)
      .attr("height", this.y.bandwidth())
      .attr("fill", REPUBLICAN_RED);

    this.chart
      .selectAll("text.score")
      .data(rightData)
      .join("text")
      .transition(this.transition)
      .attr("x", (d) => this.xTo(d) + this.rightOffset)
      .attr("y", (d, i) => this.y(names[i]) + this.y.bandwidth() / 2)
      .attr("dx", -5)
      .attr("dy", ".36em")
      .attr("text-anchor", "end")
      .attr("class", "score")
      .attr("fill", "#FFFFFF")
      .text((d) => `${(d * 100).toFixed(0)}%`);
  }

  updateDemocrat(leftData, names) {
    this.chart
      .selectAll("rect.left")
      .data(leftData)
      .join("rect")
      .transition(this.transition)
      .attr("x", (d) => this.width - this.xFrom(d))
      .attr("y", (d, i) => this.y(names[i]))
      .attr("class", "left")
      .attr("width", this.xFrom)
      .attr("height", this.y.bandwidth())
      .attr("fill", DEMOCRAT_BLUE);

    this.chart
      .selectAll("text.leftscore")
      .data(leftData)
      .join("text")
      .transition(this.transition)
      .attr("x", (d) => this.width - this.xFrom(d) + this.leftPad)
      .attr("y", (d, i) => this.y(names[i]) + this.y.bandwidth() / 2)
      .attr("dx", "20")
      .attr("dy", ".36em")
      .attr("text-anchor", "end")
      .attr("class", "leftscore")
      .attr("fill", "#FFFFFF")
      .text((d) => `${(d * 100).toFixed(0)}%`);
  }
  updateAxisLabels(names) {
    this.chart
      .selectAll("text.name")
      .data(names)
      .join("text")
      .transition(this.transition)
      .attr("x", this.labelArea / 2 + this.width)
      .attr("y", (d) => this.y(d) + this.y.bandwidth() / 2)
      .attr("dy", ".20em")
      .attr("text-anchor", "middle")
      .attr("class", "name")
      .text(String);
  }
  addXAxisTitles() {
    // Add Democrat Title
    this.chart
      .append("text")
      .attr("x", this.width / 2)
      .attr("y", this.height - this.legendAreaBuffer / 2)
      .attr("text-anchor", "middle")
      .attr("class", "axis-title")
      .style("font-weight", "bold") // Set the font-weight to bold
      .text("Democrat");

    // Add Republican Title
    this.chart
      .append("text")
      .attr("x", this.rightOffset + this.width / 2)
      .attr("y", this.height - this.legendAreaBuffer / 2)
      .attr("text-anchor", "middle")
      .attr("class", "axis-title")
      .style("font-weight", "bold") 
      .text("Republican");
  }
}

new ByNetworkVisual();
