function updateChart(data, svg, x, y, height) {
    // Clear existing chart elements
    svg.selectAll("*").remove();

    // Re-create X axis
    svg.append("g")
        .attr("transform", `translate(0,${height})`)
        .call(d3.axisBottom(x).ticks(5));

    // Update Y axis domain based on new data
    y.domain(data.map(d => d.name));
    svg.append("g")
        .call(d3.axisLeft(y).tickSize(0))
        .selectAll(".tick text")
        .attr("x", -y.bandwidth() * 1.2)
        .style("text-anchor", "end")
        .style("font-size", "16px");

    // Add bars
    svg.selectAll("myRect")
        .data(data)
        .enter()
        .append("rect")
        .attr("x", x(0))
        .attr("y", d => y(d.name))
        .attr("width", d => x(d.avg_sentiment))
        .attr("height", y.bandwidth())
        .attr("fill", d => d.party === "R" ? REPUBLICAN_RED : DEMOCRAT_BLUE);

    // Add bar extensions
    svg.selectAll("barExtensions")
        .data(data)
        .enter()
        .append("rect")
        .attr("x", x(0) - y.bandwidth() / 2)
        .attr("y", d => y(d.name))
        .attr("width", y.bandwidth())
        .attr("height", y.bandwidth())
        .attr("fill", d => d.party === "R" ? REPUBLICAN_RED : DEMOCRAT_BLUE);

    // Add background circles
    svg.selectAll("backgroundCircles")
        .data(data)
        .enter()
        .append("circle")
        .attr("cx", x(0) - y.bandwidth() / 2)
        .attr("cy", d => y(d.name) + y.bandwidth() / 2)
        .attr("r", y.bandwidth() / 2)
        .attr("fill", "white")
        .attr("stroke", d => d.party === "R" ? REPUBLICAN_RED : DEMOCRAT_BLUE)
        .attr("stroke-width", 3);

    // Add images
    svg.selectAll("candidateImages")
        .data(data)
        .enter()
        .append("image")
        .attr("xlink:href", d => d.photo)
        .attr("x", x(0) - y.bandwidth())
        .attr("y", d => y(d.name))
        .attr("height", y.bandwidth())
        .attr("width", y.bandwidth())
        .attr("clip-path", "circle()");
}

// Load the data
d3.csv("data/labeled.csv").then(rawData => {
    // data processing code...
    // Calculate average sentiment label for each candidate
    const sentimentData = d3.rollups(
        rawData,
        v => d3.mean(v, d => +d.label),
        d => d.first_name + " " + d.last_name
    ).map(d => ({ name: d[0], avg_sentiment: d[1], photo: "img/candidate_portraits/" + d[0].split(" ")[1].toLowerCase() + ".png", party: rawData.find(r => (r.first_name + " " + r.last_name) === d[0]).party }));

    // Sort data based on avg_sentiment
    sentimentData.sort((a, b) => d3.descending(a.avg_sentiment, b.avg_sentiment));
    console.log("Sentiment data:", sentimentData)

    // Calculate the occurrence of each candidate
    const candidateOccurrences = d3.rollups(rawData, v => v.length, d => d.first_name + " " + d.last_name)
        .sort((a, b) => d3.descending(a[1], b[1]));

    // Set dimensions and margins for the chart
    const margin = { top: 30, right: 30, bottom: 30, left: 230 },
        width = 800 - margin.left - margin.right,
        height = 500 - margin.top - margin.bottom;

    // Create scales
    const x = d3.scaleLinear()
        .domain([0, 1])  // Define the range of average sentiment
        .range([0, width]);

    const y = d3.scaleBand()
        .range([0, height])
        .padding(.1);

    // Append SVG object to the chart div
    const svg = d3.select("#candidate-sentiment-bars")
        .append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform", `translate(${margin.left},${margin.top})`);

    // Function to filter data
    function filterData(showAll) {
        if (showAll) {
            return sentimentData;
        } else {
            const topCandidates = candidateOccurrences.slice(0, 5).map(d => d[0]);
            return sentimentData.filter(d => topCandidates.includes(d.name));
        }
    }

    // Initial chart with top 5 candidates
    updateChart(filterData(false), svg, x, y, height);

    // Event listener for the switch
    d3.select("#candidateToggle").on("change", function() {
        const showAll = d3.select(this).property("checked");
        d3.select("#toggleLabel").text(showAll ? "Display All Candidates" : "Show Top 5 Candidates");
        updateChart(filterData(showAll), svg, x, y, height);
    });
});
