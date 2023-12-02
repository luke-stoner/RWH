class CandidateIntroduction {
  constructor(data) {
    if (CandidateIntroduction.instance) {
      return CandidateIntroduction.instance;
    }

    this.candidates = data.map(
      (candidateData) => new Candidate(...Object.values(candidateData))
    );
    this.partyColors = {
      Republican: REPUBLICAN_RED,
      Democrat: DEMOCRAT_BLUE,
      Independent: INDEPENDENT_GRAY,
    };

    this.partySecondaryColors = {
      Republican: "#CD5C5C",
      Democrat: "#6495ED",
      Independent: "#A9A9A9",
    };

    this.initializeSVG();
    this.createCandidateCircles();
    this.createLegend();
    this.isModalOpen = false;

    CandidateIntroduction.instance = this;
  }
  percentageToColor(percentage) {
    if (percentage < 0 || percentage > 100) {
      throw new Error("Percentage must be between 0 and 100.");
    }

    const normalizedPercentage = percentage / 100;

    const darkRed = [175, 0, 0];
    const darkYellow = [175, 175, 0];
    const darkGreen = [0, 100, 0];

    // Interpolate between darkRed and darkYellow for values from 0 to 0.5
    // Interpolate between darkYellow and darkGreen for values from 0.5 to 1
    let color;
    if (normalizedPercentage <= 0.5) {
      const t = normalizedPercentage * 2; // Scale to 0-1
      color = [
        Math.round((1 - t) * darkRed[0] + t * darkYellow[0]),
        Math.round((1 - t) * darkRed[1] + t * darkYellow[1]),
        Math.round((1 - t) * darkRed[2] + t * darkYellow[2]),
      ];
    } else {
      const t = (normalizedPercentage - 0.5) * 2; // Scale to 0-1
      color = [
        Math.round((1 - t) * darkYellow[0] + t * darkGreen[0]),
        Math.round((1 - t) * darkYellow[1] + t * darkGreen[1]),
        Math.round((1 - t) * darkYellow[2] + t * darkGreen[2]),
      ];
    }

    return `rgb(${color[0]}, ${color[1]}, ${color[2]})`;
  }

  initializeSVG() {
    this.width = 900;
    this.height = 600;
    this.margin = 20;
    this.circleRadius = 65;
    this.borderThickness = 7;
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

  populateModal(candidate) {
    const candidateNameModal = document.getElementById("candidate-name-modal");
    candidateNameModal.textContent = `${candidate.first} ${candidate.last}`;

    const candidateImageModal = document.getElementById(
      "candidate-modal-image"
    );
    candidateImageModal.src = candidate.alternate_image;

    const candidateBioModal = document.getElementById("candidate-modal-bio");
    candidateBioModal.textContent = candidate.modal_bio;

    const candidateMentionsModal = document.getElementById(
      "candidate-modal-mentions"
    );

    candidate
      .calculateMentions()
      .then((mentionCount) => {
        candidateMentionsModal.textContent = mentionCount.toLocaleString();
      })
      .catch((error) => {
        console.error("Error calculating mentions:", error);
      });

    const candidatePositiveModal = document.getElementById(
      "candidate-modal-positive-percent"
    );

    candidate
      .calculatePositivePercent()
      .then((positivePercent) => {
        candidatePositiveModal.textContent = `${positivePercent.toFixed(1)}%`;
        candidatePositiveModal.style.color =
          this.percentageToColor(positivePercent);
      })
      .catch((error) => {
        console.error("Error calculating positive percent:", error);
      });
  }

  createCandidateCircles() {
    this.circles = this.svg
      .selectAll("g")
      .data(this.candidates)
      .enter()
      .append("g")
      .attr(
        "transform",
        (d, i) =>
          `translate(${(i % this.columns) * this.colWidth + this.margin}, ${
            Math.floor(i / this.columns) * this.rowHeight + this.margin
          })`
      )
      .on("mouseover", (event, candidate) =>
        this.handleCircleMouseOver(event, candidate)
      )
      .on("mouseout", (event, candidate) =>
        this.handleCircleMouseOut(event, candidate)
      )
      .on("click", (event, candidate) => {
        this.isModalOpen = true;
        this.populateModal(candidate);
        $("#candidate-modal").modal("show");
      });

    this.circles.style("cursor", "pointer");

    // Add the party color outline to the white circle
    this.circles
      .append("circle")
      .attr("class", "candidate-color-circle")
      .attr("cx", this.circleRadius + this.borderThickness)
      .attr("cy", this.circleRadius + this.borderThickness)
      .attr("r", this.circleRadius + this.borderThickness)
      .attr("fill", (d) => this.partyColors[d.party]);

    // Add a white circle behind the candidate's image
    this.circles
      .append("circle")
      .attr("class", "candidate-white-circle")
      .attr("cx", this.circleRadius + this.borderThickness)
      .attr("cy", this.circleRadius + this.borderThickness)
      .attr("r", this.circleRadius)
      .attr("fill", "white");

    // Add the image inside the white circle
    this.circles
      .append("image")
      .attr("xlink:href", (d) => d.image)
      .attr("x", this.borderThickness)
      .attr("y", this.borderThickness)
      .attr("width", 2 * this.circleRadius)
      .attr("height", 2 * this.circleRadius)
      .attr(
        "clip-path",
        "circle(" +
          this.circleRadius +
          "px at " +
          this.circleRadius +
          "px " +
          this.circleRadius +
          "px)"
      );

    // Display full name below the circle
    this.circles
      .append("text")
      .text((d) => `${d.first} ${d.last}`)
      .attr("x", this.circleRadius + this.borderThickness)
      .attr("y", 2 * this.circleRadius + this.borderThickness + 25)
      .attr("text-anchor", "middle")
      .attr("alignment-baseline", "middle")
      .attr("class", "candidate-label")
      .attr("fill", "black")
      .style("user-select", "none");

    $("#candidate-modal").on("hidden.bs.modal", () => this.handleModalClose());
  }

  handleModalClose() {
    this.isModalOpen = false;
    this.resetCircles();
    this.reattachMouseOutEvents();
  }

  reattachMouseOutEvents() {
    this.circles.on("mouseout", (event, candidate) =>
      this.handleCircleMouseOut(event, candidate)
    );
  }

  resetCircles() {
    this.circles.each((d, i, nodes) => {
      const circleElement = nodes[i];
      // Reset the circle to its normal state
      d3.select(circleElement)
        .select(".candidate-color-circle")
        .transition()
        .duration(200)
        .attr("r", this.circleRadius + this.borderThickness);

      d3.select(circleElement)
        .select(".candidate-white-circle")
        .transition()
        .duration(200)
        .attr("r", this.circleRadius)
        .attr("fill", "white");

      d3.select(circleElement)
        .select("image")
        .transition()
        .duration(200)
        .attr("width", this.circleRadius * 2)
        .attr("height", this.circleRadius * 2)
        .attr(
          "clip-path",
          "circle(" +
            this.circleRadius +
            "px at " +
            this.circleRadius +
            "px " +
            this.circleRadius +
            "px)"
        );
    });
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

  resetCircles() {
    this.circles.each((d, i, nodes) => {
      this.handleCircleMouseOut({ currentTarget: nodes[i] });
    });
  }

  handleCircleMouseOver(event, candidate) {
    if (!this.isModalOpen) {
      // Check if the modal is closed
      const circleElement = event.currentTarget;
      const enlargedRadius = this.circleRadius * 1.05;

      // Transition the color and radius
      d3.select(circleElement)
        .select(".candidate-color-circle")
        .transition()
        .duration(200)
        .attr("r", enlargedRadius + this.borderThickness);

      d3.select(circleElement)
        .select(".candidate-white-circle")
        .transition()
        .duration(200)
        .attr("r", enlargedRadius)
        .attr("fill", (d) => this.partySecondaryColors[candidate.party]);

      // Resize the image
      d3.select(circleElement)
        .select("image")
        .transition()
        .duration(200)
        .attr("width", enlargedRadius * 2)
        .attr("height", enlargedRadius * 2)
        .attr(
          "clip-path",
          "circle(" +
            this.circleRadius * 1.025 +
            "px at " +
            this.circleRadius * 1.025 +
            "px " +
            this.circleRadius * 1.025 +
            "px)"
        );
    }
  }

  handleCircleMouseOut(event) {
    if (!this.isModalOpen) {
      // Check if the modal is closed
      const circleElement = event.currentTarget;

      d3.select(circleElement)
        .select(".candidate-color-circle")
        .transition()
        .duration(200)
        .attr("r", this.circleRadius + this.borderThickness);

      d3.select(circleElement)
        .select(".candidate-white-circle")
        .transition()
        .duration(200)
        .attr("r", this.circleRadius)
        .attr("fill", "#FFFFFF");

      // Restore the image size
      d3.select(circleElement)
        .select("image")
        .transition()
        .duration(200)
        .attr("width", this.circleRadius * 2)
        .attr("height", this.circleRadius * 2)
        .attr(
          "clip-path",
          "circle(" +
            this.circleRadius +
            "px at " +
            this.circleRadius +
            "px " +
            this.circleRadius +
            "px)"
        );
    }
  }
}
