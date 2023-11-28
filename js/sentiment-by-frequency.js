d3.csv("data/labeled.csv", row => {
    row.date = parseDate(row.date);
    return row
}).then(rawData => {
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

    // Create date slider
    const sliderRange = d3
        .sliderBottom()
        .min(d3.min(rawData, d => d.date))
        .max(d3.max(rawData, d => d.date))
        .width(250)
        .tickFormat(d3.timeFormat('%Y-%m-%d'))
        .ticks(3)
        .default([d3.min(rawData, d => d.date), d3.max(rawData, d => d.date)])
        .fill('#FFFFFF');

    // Add the slider to the DOM
    const gRange = d3
        .select('#sbf-slider-range')
        .append('svg')
        .attr('width', 400)
        .attr('height', 100)
        .append('g')
        .attr('transform', 'translate(90,30)');

    gRange.call(sliderRange);

    // Update the visualization based on a change in selection in the dropdown menu
    document.getElementById('network-selection').addEventListener('change', function () {
        // Call the updateVisualization function when the dropdown value changes
        updateVisualization();
    });

    // set date data to full range by default
    let filtered_date_data = rawData;

    // get selected years from slider and filter data
    sliderRange.on('onchange', val => {
        // Filter data based on slider values
        filtered_date_data = rawData.filter(d => d.date >= val[0] && d.date <= val[1])
        updateVisualization();
    });

    // Initialize Visualization
    updateVisualization();

    function updateVisualization() {
        // Get selected network
        let network = document.getElementById("network-selection").value;

        // Filter data by network
        let filteredData;

        if (network === 'all') {
            // If 'all' is selected, do not filter the dataset
            filteredData = filtered_date_data;
        } else {
            // Filter the dataset based on the selected network
            filteredData = filtered_date_data.filter(d => d.network === network);
        }

        // Calculate average sentiment label for each candidate
        const sentimentData = d3.rollups(
            filteredData,
            v => d3.mean(v, d => +d.label),
            d => d.first_name + " " + d.last_name
        ).map(d => ({
            name: d[0],
            avg_sentiment: d[1],
            photo: "img/candidate_portraits/" + d[0].split(" ")[1].toLowerCase() + ".png",
            party: filteredData.find(r => (r.first_name + " " + r.last_name) === d[0]).party
        }));
        const candidateOccurrences = d3.rollups(filteredData, v => v.length, d => d.first_name + " " + d.last_name)
            .sort((a, b) => d3.descending(a[1], b[1]));
        //putting them together
        const occurrencesMap = new Map(candidateOccurrences);

        // Add frequency to each sentiment data entry
        const combinedData = sentimentData.map(item => {
            const frequency = occurrencesMap.get(item.name) || 0; // Default to 0 if not found
            return {...item, frequency};
        });

        // Filter data to remove candidates with less than 20 mentions
        const finalData = combinedData.filter(d => d.frequency > 19)

        // Set up scales with padding for x-axis
        const xPadding = 15; // Adjust padding as needed
        const xScale = d3.scaleLinear()
            .domain([0, d3.max(finalData, d => d.frequency)])
            .range([xPadding, effectiveWidth - xPadding]); // Include padding on both ends

        const yScale = d3.scaleLinear()
            .domain([0, 1]) // Assuming avg_sentiment is between 0 and 1
            .range([effectiveHeight, 0]);

        // Select the axes if they already exist, and update them
        const xAxis = svg.selectAll(".x-axis").data([0]); // The data is a dummy placeholder
        const yAxis = svg.selectAll(".y-axis").data([0]); // The data is a dummy placeholder

        // Update the X axis if it exists, else create it
        xAxis.enter()
            .append("g")
            .attr("class", "x-axis")
            .merge(xAxis)
            .transition() // Add a transition
            .duration(750) // 750ms transition
            .attr("transform", `translate(0,${effectiveHeight})`)
            .call(d3.axisBottom(xScale));

        // Update the Y axis if it exists, else create it
        yAxis.enter()
            .append("g")
            .attr("class", "y-axis")
            .merge(yAxis)
            .transition() // Add a transition
            .duration(750) // 750ms transition
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

        // Update background circles with transition
        const circles = svg.selectAll(".backgroundCircles")
            .data(finalData, d => d.name);

        circles.exit()
            .transition()
            .duration(750)
            .attr("r", 0) // Shrink to disappear
            .remove();

        circles.enter()
            .append("circle")
            .attr("class", "backgroundCircles")
            .merge(circles)
            .transition()
            .duration(750)
            .attr("cx", d => xScale(d.frequency))
            .attr("cy", d => yScale(d.avg_sentiment))
            .attr("r", 20) // Adjust the radius as needed
            .attr("fill", d => d.party === "R" ? "#c93235" : "#1475b7")
            .style("stroke", "grey")
            .attr("opacity", 0.7);

        // Update candidate images with transition
        const images = svg.selectAll(".candidateImages")
            .data(finalData, d => d.name);

        // Remove images that are no longer present in the data
        images.exit()
            .transition()
            .duration(750)
            .attr("width", 0) // Shrink to disappear
            .remove();

        // Add new images and update existing ones
        images.enter()
            .append("image")
            .attr("class", "candidateImages")
            .attr("xlink:href", d => d.photo)
            .attr("x", d => xScale(d.frequency) - 20)
            .attr("y", d => yScale(d.avg_sentiment) - 20)
            .attr("width", 0) // Start with a width of 0 for a transition effect
            .attr("height", 0) // Start with a height of 0 for a transition effect
            .merge(images) // Merge enter and update selections
            .transition()
            .duration(750)
            .attr("x", d => xScale(d.frequency) - 20)
            .attr("y", d => yScale(d.avg_sentiment) - 20)
            .attr("width", 40) // Set the final width
            .attr("height", 40) // Set the final height
            .attr("clip-path", "circle()");
    }
});

