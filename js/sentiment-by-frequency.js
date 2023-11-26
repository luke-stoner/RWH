d3.csv("data/labeled.csv").then(rawData => {
    // data processing code...
    // Calculate average sentiment label for each candidate
    const sentimentData = d3.rollups(
        rawData,
        v => d3.mean(v, d => +d.label),
        d => d.first_name + " " + d.last_name
    ).map(d => ({
        name: d[0],
        avg_sentiment: d[1],
        photo: "img/candidate_portraits/" + d[0].split(" ")[1].toLowerCase() + ".png",
        party: rawData.find(r => (r.first_name + " " + r.last_name) === d[0]).party
    }));
    const candidateOccurrences = d3.rollups(rawData, v => v.length, d => d.first_name + " " + d.last_name)
        .sort((a, b) => d3.descending(a[1], b[1]));
    //putting them together
    const occurrencesMap = new Map(candidateOccurrences);

    // Add frequency to each sentiment data entry
    const combinedData = sentimentData.map(item => {
        const frequency = occurrencesMap.get(item.name) || 0; // Default to 0 if not found
        return { ...item, frequency };
    });

    // Define margins
    const margin = { top: 50, right: 50, bottom: 50, left: 50 };

    // Assuming you have predefined the overall width and height of your SVG
    const width = 960; // Adjust as needed
    const height = 500; // Adjust as needed

    // Effective width and height after accounting for margins
    const effectiveWidth = width - margin.left - margin.right;
    const effectiveHeight = height - margin.top - margin.bottom;

    // Set up the SVG canvas
    const svg = d3.select("#sentiment-by-frequency")
        .append("svg")
        .attr("width", width)
        .attr("height", height)
        .append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");


// Set up scales
    const xScale = d3.scaleLinear()
        .domain([0, d3.max(combinedData, d => d.frequency)])
        .range([0, effectiveWidth]);

    const yScale = d3.scaleLinear()
        .domain([0, 1]) // Assuming avg_sentiment is between 0 and 1
        .range([effectiveHeight, 0]);

    // Add X axis
    svg.append("g")
        .attr("transform", `translate(0,${effectiveHeight})`)
        .call(d3.axisBottom(xScale));

    // Add Y axis
    svg.append("g")
        .call(d3.axisLeft(yScale));

    // Add X Axis label
    svg.append("text")
        .attr("transform",
            "translate(" + (effectiveWidth / 2) + " ," +
            (effectiveHeight + margin.bottom - 10) + ")")
        .style("text-anchor", "middle")
        .text("Number of Mentions");

    // Add Y Axis label
    svg.append("text")
        .attr("transform", "rotate(-90)")
        .attr("y", 0 - margin.left + 5)
        .attr("x", 0 - (effectiveHeight / 2))
        .attr("dy", "1em")
        .style("text-anchor", "middle")
        .text("Average Sentiment");

    // Add background circles
    svg.selectAll(".backgroundCircles")
        .data(combinedData)
        .enter()
        .append("circle")
        .attr("cx", d => xScale(d.frequency))
        .attr("cy", d => yScale(d.avg_sentiment))
        .attr("r", 20) // Adjust the radius as needed
        .attr("fill", d => d.party === "R" ? "#c93235" : "#1475b7")
        .style("stroke", "grey")
        .attr("opacity", 0.7);

    // Add images
    svg.selectAll(".candidateImages")
        .data(combinedData)
        .enter()
        .append("image")
        .attr("xlink:href", d => d.photo)
        .attr("x", d => xScale(d.frequency) - 20) // Adjust position based on the circle radius
        .attr("y", d => yScale(d.avg_sentiment) - 20) // Adjust position based on the circle radius
        .attr("height", 40) // Adjust size as needed
        .attr("width", 40) // Adjust size as needed
        .attr("clip-path", "circle()");
});

