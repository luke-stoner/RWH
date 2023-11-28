class Candidate {
  constructor(first, last, party, party_short, image, state, birthday) {
    this.first = first;
    this.last = last;
    this.party = party;
    this.party_short = party_short;
    this.image = image;
    this.state = state;
    this.birthday = birthday;
  }

  calculateAge() {
    const birthdayDate = new Date(this.birthday);
    const today = new Date();

    let age = today.getFullYear() - birthdayDate.getFullYear();
    const monthDifference = today.getMonth() - birthdayDate.getMonth();

    if (
      monthDifference < 0 ||
      (monthDifference === 0 && today.getDate() < birthdayDate.getDate())
    ) {
      age--;
    }

    return age;
  }
}

class CandidateVisualization {
  constructor(data) {
    this.candidates = data.map(
      (candidateData) => new Candidate(...Object.values(candidateData))
    );
    this.partyColors = {
      Republican: REPUBLICAN_RED,
      Democrat: DEMOCRAT_BLUE,
      Independent: INDEPENDENT_GRAY,
    };

    this.initializeSVG();
    this.initializeTooltip();
    this.createCandidateCircles();
    this.createLegend();
  }

  initializeSVG() {
    // Initialize SVG
    this.width = 900;
    this.height = 600;
    this.margin = 20;
    this.circleRadius = 65;
    this.circlePadding = 30;
    this.columns = Math.floor(
      (this.width - 2 * this.margin) /
        (2 * this.circleRadius + this.circlePadding)
    );
    this.rows = Math.ceil(this.candidates.length / this.columns);
    this.colWidth = (this.width - 2 * this.margin) / this.columns;
    this.rowHeight = (this.height - 2 * this.margin) / this.rows;

    this.svg = d3
      .select("#candidate-info")
      .append("svg")
      .attr("width", this.width)
      .attr("height", this.height)
      .attr("class", "candidate-svg");
  }

  initializeTooltip() {
    this.tooltip = d3
      .select("body")
      .append("div")
      .attr("class", "tooltip")
      .style("opacity", 50)
      .style("position", "absolute")
      .style("background-color", "rgba(255, 255, 255, 0.8)")
      .style("border", "solid")
      .style("border-width", "2px")
      .style("border-radius", "5px")
      .style("padding", "5px");
  }

  createCandidateCircles() {
    this.circles = this.svg
      .selectAll("g")
      .data(this.candidates)
      .enter()
      .append("g")
      .on("mouseover", (event, candidate) =>
        this.handleCircleMouseOver(event, candidate)
      )
      .on("mousemove", (event) => {
        this.tooltip
          .style("left", event.pageX + 10 + "px")
          .style("top", event.pageY + 10 + "px");
      })
      .on("mouseout", (element) => this.handleCircleMouseOut(element));

    this.circles
      .append("circle")
      .attr("class", "candidate-circle")
      .attr(
        "cx",
        (d, i) =>
          (i % this.columns) * this.colWidth + this.margin + this.circleRadius
      )
      .attr(
        "cy",
        (d, i) =>
          Math.floor(i / this.columns) * this.rowHeight +
          this.margin +
          this.circleRadius
      )
      .attr("r", this.circleRadius)
      .attr("fill", (d) => this.partyColors[d.party])
      .attr("filter", "url(#drop-shadow)");

    // Display full name below the circle
    this.circles
      .append("text")
      .text((d) => `${d.first} ${d.last}`)
      .attr(
        "x",
        (d, i) =>
          (i % this.columns) * this.colWidth + this.margin + this.circleRadius
      )
      .attr(
        "y",
        (d, i) =>
          Math.floor(i / this.columns) * this.rowHeight +
          this.margin +
          2 * this.circleRadius + 20
      )
      .attr("text-anchor", "middle")
      .attr("alignment-baseline", "middle")
      .attr("class", "candidate-label")
      .attr("fill", "black")
      .style("user-select", "none");

    // Shadows for circles
    const filter = this.svg
      .append("defs")
      .append("filter")
      .attr("id", "drop-shadow")
      .attr("height", "130%");

    filter
      .append("feGaussianBlur")
      .attr("in", "SourceAlpha")
      .attr("stdDeviation", 5)
      .attr("result", "blur");

    filter
      .append("feOffset")
      .attr("in", "blur")
      .attr("dx", 3)
      .attr("dy", 3)
      .attr("result", "offsetBlur");

    const feMerge = filter.append("feMerge");
    feMerge.append("feMergeNode").attr("in", "offsetBlur");
    feMerge.append("feMergeNode").attr("in", "SourceGraphic");
  }

  createLegend() {
    const legendWidth = Object.keys(this.partyColors).length * 120;
    const legendX = (this.width - legendWidth) / 2;

    const legend = this.svg
      .append("g")
      .attr("class", "legend")
      .attr("transform", `translate(${legendX}, ${this.height - this.margin})`);

    const legendItems = legend
      .selectAll(".legend-item")
      .data(Object.keys(this.partyColors))
      .enter()
      .append("g")
      .attr("class", "legend-item")
      .attr("transform", (d, i) => `translate(${i * 120}, -10)`);

    legendItems
      .append("circle")
      .attr("r", 7)
      .attr("cx", 10)
      .attr("cy", 10)
      .attr("fill", (d) => this.partyColors[d]);

    legendItems
      .append("text")
      .text((d) => d)
      .attr("x", 20)
      .attr("y", 12)
      .attr("alignment-baseline", "middle");
  }

  handleCircleMouseOver(event, candidate) {
    d3.select(event.target)
      .select(".candidate-circle")
      .transition()
      .duration(200)
      .attr("r", this.circleRadius + 5);
    d3.select(event.target)
      .select(".candidate-label")
      .classed("hovered-text", true);

    this.tooltip.transition().duration(200).style("opacity", 1);

    this.tooltip
      .html(
        `<strong>${candidate.first} ${candidate.last}</strong><br>Party: ${
          candidate.party
        }<br>State: ${candidate.state}<br>Age: ${candidate.calculateAge()}`
      )
      .style("left", event.pageX + 10 + "px")
      .style("top", event.pageY + 10 + "px");

    // Show candidate photo and name
    const photoDiv = document.getElementById("candidate-info-photo");
    photoDiv.innerHTML = `<img src="${candidate.image}" alt="${candidate.first} ${candidate.last}" style="width: 100%;" class="img-fluid hover-animate delay-0 rounded-circle">`;

    const nameDiv = document.getElementById("candidate-info-name");
    const nameElement = document.createElement("h5");
    nameElement.textContent = `${candidate.first} ${candidate.last}`;
    nameDiv.innerHTML = "";
    nameDiv.appendChild(nameElement);
  }

  handleCircleMouseOut(event) {
    const circle = d3.select(event.target).select(".candidate-circle");
    const label = d3.select(event.target).select(".candidate-label");

    circle.transition().duration(200).attr("r", this.circleRadius);
    label.classed("hovered-text", false);

    // Hide the tooltip
    this.tooltip.transition().duration(200).style("opacity", 0);
  }
}

const candidate_descriptions = [
  {
    first: "Joe",
    last: "Biden",
    party: "Democrat",
    party_short: "D",
    image: "img/candidate_portraits/biden.png",
    state: "Delaware",
    birthday: "November 20, 1942",
  },
  {
    first: "Doug",
    last: "Burgum",
    party: "Republican",
    party_short: "R",
    image: "img/candidate_portraits/burgum.png",
    state: "North Dakota",
    birthday: "August 1, 1956",
  },
  {
    first: "Chris",
    last: "Christie",
    party: "Republican",
    party_short: "R",
    image: "img/candidate_portraits/christie.png",
    state: "New Jersey",
    birthday: "September 6, 1962",
  },
  {
    first: "Ron",
    last: "DeSantis",
    party: "Republican",
    party_short: "R",
    image: "img/candidate_portraits/desantis.png",
    state: "Florida",
    birthday: "September 14, 1978",
  },
  {
    first: "Larry",
    last: "Elder",
    party: "Republican",
    party_short: "R",
    image: "img/candidate_portraits/elder.png",
    state: "California",
    birthday: "April 27, 1952",
  },
  {
    first: "Asa",
    last: "Hutchinson",
    party: "Republican",
    party_short: "R",
    image: "img/candidate_portraits/hutchinson.png",
    state: "Arkansas",
    birthday: "December 3, 1950",
  },
  {
    first: "Nikki",
    last: "Haley",
    party: "Republican",
    party_short: "R",
    image: "img/candidate_portraits/haley.png",
    state: "South Carolina",
    birthday: "January 20, 1972",
  },
  {
    first: "Will",
    last: "Hurd",
    party: "Republican",
    party_short: "R",
    image: "img/candidate_portraits/hurd.png",
    state: "Texas",
    birthday: "August 19, 1977",
  },
  {
    first: "Perry",
    last: "Johnson",
    party: "Republican",
    party_short: "R",
    image: "img/candidate_portraits/johnson.png",
    state: "Michigan",
    birthday: "January 23, 1948",
  },
  {
    first: "Robert",
    last: "Kennedy Jr",
    party: "Independent",
    party_short: "I",
    image: "img/candidate_portraits/kennedy.png",
    state: "Washington, D.C",
    birthday: "January 17, 1954",
  },
  {
    first: "Mike",
    last: "Pence",
    party: "Republican",
    party_short: "R",
    image: "img/candidate_portraits/pence.png",
    state: "Indiana",
    birthday: "June 7, 1959",
  },
  {
    first: "Vivek",
    last: "Ramaswamy",
    party: "Republican",
    party_short: "R",
    image: "img/candidate_portraits/ramaswamy.png",
    state: "Ohio",
    birthday: "August 9, 1985",
  },
  {
    first: "Tim",
    last: "Scott",
    party: "Republican",
    party_short: "R",
    image: "img/candidate_portraits/scott.png",
    state: "South Carolina",
    birthday: " September 19, 1965",
  },
  {
    first: "Donald",
    last: "Trump",
    party: "Republican",
    party_short: "R",
    image: "img/candidate_portraits/trump.png",
    state: "Florida",
    birthday: "June 14, 1946",
  },
  {
    first: "Marianne",
    last: "Williamson",
    party: "Democrat",
    party_short: "D",
    image: "img/candidate_portraits/williamson.png",
    state: "Iowa",
    birthday: "July 8, 1952",
  },
];

const candidateVisualization = new CandidateVisualization(
  candidate_descriptions
);
