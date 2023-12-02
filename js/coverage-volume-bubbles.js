class BubbleChart {
  constructor() {
    if (BubbleChart.instance) {
      return BubbleChart.instance;
    }

    BubbleChart.instance = this;
    this.loadData();
  }

  static getInstance() {
    return BubbleChart.instance || new BubbleChart();
  }

  async loadData() {
    try {
      const csvData = await d3.csv("data/labeled.csv");
      const data = this.parseData(csvData);

      this.setupChart(data);
      this.setupLegend(data);
    } catch (error) {
      console.error("Error loading the data:", error);
    }
  }

  parseData(data) {
    const countMap = new Map();
    data.forEach((row) => {
      const candidateKey = row.first_name + "_" + row.last_name;
      if (countMap.has(candidateKey)) {
        countMap.set(candidateKey, countMap.get(candidateKey) + 1);
      } else {
        countMap.set(candidateKey, 1);
      }
    });

    return Array.from(countMap, ([key, frequency]) => {
      const [firstName, lastName] = key.split("_");
      return {
        name: lastName,
        frequency: frequency,
        photo: "img/candidate_portraits/" + lastName.toLowerCase() + ".png",
        party: data.find(
          (d) => d.first_name === firstName && d.last_name === lastName
        ).party,
      };
    });
  }

  setupChart(data) {
    const width = 400;
    const height = 600;
    const margin = { top: 0, right: 20, bottom: 20, left: 20 };

    const innerWidth = width - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;

    const svg = d3
      .select("#volume-bubbles")
      .append("svg")
      .attr("width", width)
      .attr("height", height)
      .append("g");

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

    node
      .append("clipPath")
      .attr("id", function (d, i) {
        return "clip-" + i;
      })
      .append("circle")
      .attr("r", function (d) {
        return d.r;
      });

    const t = d3.transition().duration(750);

    node
      .transition(t)
      .delay(function (d, i) {
        return i * 50;
      })
      .attr("transform", function (d) {
        return `translate(${d.x},${d.y})`;
      });

    data.sort(function (a, b) {
      return b.frequency - a.frequency;
    });

    node
      .append("circle")
      .attr("r", function (d) {
        return d.r;
      })
      .style("fill", function (d) {
        return PARTY_COLOR_MAP[d.data.party];
      });

    node
      .append("svg:image")
      .attr("xlink:href", function (d) {
        return d.data.photo;
      })
      .attr("clip-path", function (d, i) {
        return "url(#clip-" + i + ")";
      })
      .attr("x", function (d) {
        return -d.r;
      })
      .attr("y", function (d) {
        return -d.r;
      })
      .attr("height", function (d) {
        return 2 * d.r;
      })
      .attr("width", function (d) {
        return 2 * d.r;
      });
  }
}
