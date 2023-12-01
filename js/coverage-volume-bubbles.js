class BubbleChart {
  constructor() {
    if (!BubbleChart.instance) {
      this.initialize();
      BubbleChart.instance = this;
    }
    return BubbleChart.instance;
  }

  initialize() {
    this.loadAndSetupChart();
  }

  async loadAndSetupChart() {
    const csvData = await this.loadData();
    const data = this.parseData(csvData);
    this.sortDataByFrequency(data);
    this.setupChart(data);
  }

  async loadData() {
    return await d3.csv("data/labeled.csv");
  }

  parseData(data) {
    const countMap = this.countCandidates(data);
    return this.formatDataForChart(countMap, data);
  }

  countCandidates(data) {
    const countMap = new Map();
    data.forEach((row) => {
      const candidateKey = this.createCandidateKey(row);
      countMap.set(candidateKey, (countMap.get(candidateKey) || 0) + 1);
    });
    return countMap;
  }

  createCandidateKey(row) {
    return `${row.first_name}_${row.last_name}`;
  }

  formatDataForChart(countMap, originalData) {
    return Array.from(countMap, ([key, frequency]) =>
      this.createChartData(key, frequency, originalData)
    );
  }

  createChartData(key, frequency, originalData) {
    const [firstName, lastName] = key.split("_");
    return {
      name: lastName,
      frequency,
      photo: `img/candidate_portraits/${lastName.toLowerCase()}.png`,
      party: this.findParty(firstName, lastName, originalData),
    };
  }

  findParty(firstName, lastName, data) {
    return data.find(
      (d) => d.first_name === firstName && d.last_name === lastName
    ).party;
  }

  sortDataByFrequency(data) {
    data.sort((a, b) => a.frequency - b.frequency);
  }

  setupChart(data) {
    const width = 960;
    const height = 400;
    const margin = { top: 0, right: 20, bottom: 20, left: 20 };

    const innerWidth = width - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;

    const svg = d3
      .select("#volume-bubbles")
      .append("svg")
      .attr("width", width)
      .attr("height", height)
      .append("g")
      .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    const pack = d3.pack().size([innerWidth, innerHeight]).padding(2);

    const root = d3.hierarchy({ children: data }).sum(function (d) {
      return d.frequency;
    });

    const node = svg
      .selectAll(".node")
      .data(pack(root).leaves())
      .enter()
      .append("g")
      .attr("class", "node");

    // Initial placement of circles at the top center
    node
      .attr("transform", function () {
        return "translate(" + innerWidth / 2 + ", 0)";
      })
      .append("circle")
      .attr("r", 10) // Small initial radius
      .style("fill", "lightgray"); // Initial color

    // Transition to positions on a line chart based on frequency
    node
      .transition()
      .duration(750)
      .delay(function (d, i) {
        return i * 50;
      })
      .attr("transform", function (d, i) {
        // Calculate the x-position based on frequency (spacing the circles out)
        const xPosition = (i * innerWidth) / data.length;
        // Calculate the y-position (you can modify this based on your requirements)
        const yPosition = innerHeight / 2;
        return "translate(" + xPosition + "," + yPosition + ")";
      })
      .select("circle")
      .style("fill", function (d) {
        return PARTY_COLOR_MAP[d.data.party];
      });

    node
      .append("text")
      .attr("text-anchor", "middle")
      .attr("dy", "2em")
      .text((d) => d.data.frequency.toLocaleString());
  }

  dynamicRound(value) {
    if (value === 0) return 0;

    const magnitude = Math.pow(10, Math.floor(Math.log10(Math.abs(value))));
    const roundTo = magnitude / 10;

    return Math.round(value / roundTo) * roundTo;
  }
}
