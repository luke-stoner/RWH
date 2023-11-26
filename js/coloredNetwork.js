class NetworkCoverage {
  static DEFAULT_NETWORK = "FOXNEWSW";
  static FONT_SIZE = "16px";

  constructor(selector, dataPath) {
    this.selector = selector;
    this.dataPath = dataPath;
    this.gridSize = 80;
    this.margin = { top: 20, right: 20, bottom: 20, left: 20 };
    this.svg = null;
    this.defs = null; // For gradient definitions
    this.allData = null;
  }

  // Load data from the given path
  loadData() {
    d3.csv(this.dataPath)
      .then((data) => {
        this.allData = data;
        this.updateVisualization();
      })
      .catch((error) => console.error("Error loading data:", error));
  }

  // Update the visualization with selected or default network
  updateVisualization(selectedNetwork = NetworkCoverage.DEFAULT_NETWORK) {
    this.clearVisualization();
    let filteredData = this.filterDataByNetwork(selectedNetwork);
    let networkPercentages = this.calculatePercentages(filteredData);
    this.setupSVG(networkPercentages.length);
    this.createGrid(networkPercentages);
  }

  // Clear existing SVG content
  clearVisualization() {
    d3.select(this.selector).select("svg").remove();
  }

  // Filter data by network
  filterDataByNetwork(network) {
    return this.allData.filter((d) => d.network === network);
  }

  // Filter data by party
  filterDataByParty(data) {
    return data.filter((d) => d.party === "R" || d.party === "D");
  }

  // Calculate percentages for each network
  calculatePercentages(data) {
    let filteredData = this.filterDataByParty(data);
    let networkData = d3.group(filteredData, (d) => d.network);
    return Array.from(networkData, ([network, rows]) => ({
      network,
      democrat_coverage: d3.mean(rows, (d) => (d.party === "D" ? 1 : 0)) * 100,
      republican_coverage:
        d3.mean(rows, (d) => (d.party === "R" ? 1 : 0)) * 100,
    }));
  }

  // Setup SVG element
  setupSVG(length) {
    const width = this.gridSize * length + this.margin.left + this.margin.right;
    const height = this.gridSize + this.margin.top + this.margin.bottom;
    this.svg = d3
      .select(this.selector)
      .append("svg")
      .attr("width", width)
      .attr("height", height);

    // Definitions for gradients
    this.defs = this.svg.append("defs");

    // Main group for visualization
    this.svg = this.svg
      .append("g")
      .attr("transform", `translate(${this.margin.left},${this.margin.top})`);
  }

  // Create gradient for each network
  createGradient(id, democratPercentage, republicanPercentage) {
    let gradient = this.defs.append("linearGradient").attr("id", id);

    gradient
      .append("stop")
      .attr("offset", `${democratPercentage}%`)
      .attr("stop-color", DEMOCRAT_BLUE);

    gradient
      .append("stop")
      .attr("offset", `${democratPercentage}%`)
      .attr("stop-color", REPUBLICAN_RED);
  }

  // Create grid cells with gradient-filled text
  createGrid(networkPercentages) {
    networkPercentages.forEach((networkData, i) => {
      // Create gradient for each network
      let gradientId = `gradient-${networkData.network}`;
      this.createGradient(
        gradientId,
        networkData.democrat_coverage,
        networkData.republican_coverage
      );

      let cell = this.svg
        .append("g")
        .attr("class", "cell")
        .attr("transform", `translate(${i * this.gridSize}, 0)`);

      cell
        .append("text")
        .attr("x", this.gridSize / 2)
        .attr("y", 20)
        .attr("text-anchor", "middle")
        .style("font-size", NetworkCoverage.FONT_SIZE)
        .attr("fill", `url(#${gradientId})`)
        .text(networkData.network);
    });
  }
}

// Usage of the class
const networkCoverage = new NetworkCoverage(
  "#network-coverage",
  "data/labeled.csv"
);
networkCoverage.loadData();

// Dropdown event listener
d3.select("#inputGroupSelect01").on("change", function () {
  const selectedNetwork = d3.select(this).property("value");
  networkCoverage.updateVisualization(selectedNetwork);
});
