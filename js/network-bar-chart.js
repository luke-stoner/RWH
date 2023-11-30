d3.csv("data/labeled.csv", row => {
    row.date = parseDate(row.date);
    return row
}).then(csv => {

    // Store csv in data variable
    let rawData = csv;

    // Set margin, width, height
    let margin = {top: 30, right: 30, bottom: 30, left: 50};
    let width = 400 - margin.left - margin.right;
    let height = 300 - margin.top - margin.bottom;

    // initialize svg drawing space
    let svg = d3.select("#network-bar-chart-area").append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    // Set x,y scales
    let x = d3.scaleLinear().domain([0, 1]).range([0, width]);
    let y = d3.scaleBand().range([0, height]).padding(0.1);

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
        .select('#nbc-slider-range')
        .append('svg')
        .attr('width', 400)
        .attr('height', 100)
        .append('g')
        .attr('transform', 'translate(90,30)');

    gRange.call(sliderRange);

    // Networks to include in the filtered dataset
    const networksToInclude = ['FOXNEWSW', 'MSNBCW', 'CNNW', 'CSPAN', 'BBCNEWS'];

    // Filter the dataset to include only specified networks
    const filteredData = rawData.filter(entry => networksToInclude.includes(entry.network));

    // set date data to full range by default
    let filtered_date_data = filteredData;

    // call update visualization function
    updateVisualization()

    // get selected years from slider and filter data
    sliderRange.on('onchange', val => {
        // Filter data based on slider values
        filtered_date_data = filteredData.filter(d => d.date >= val[0] && d.date <= val[1])
        updateVisualization();
    });

    function updateVisualization() {

        // Get sentiment data for networks
        let data = d3
            .rollups(
                filtered_date_data,
                (v) => d3.mean(v, (d) => +d.label),
                (d) => d.network
            )
            .map((d) => ({
                network: d[0],
                avg_sentiment: d[1],
                photo:
                    "img/networks/" + d[0] + ".png",
            }))
            .sort((a, b) => d3.descending(a.avg_sentiment, b.avg_sentiment));

        // Function to map network values to colors
        function assignColor(network) {
            switch(network) {
                case 'CSPAN':
                    return '#001A72';
                case 'FOXNEWSW':
                    return '#003366';
                case 'CNNW':
                    return '#cc0000';
                case 'BBCNEWS':
                    return '#b90005';
                case 'MSNBCW':
                    return '#6460AA';
            }
        }

        // Add 'color' variable to the JSON data
        data.forEach(entry => {
            entry.color = assignColor(entry.network);
        });

        console.log(data)

        const TRANSITION_DURATION = 750; // Transition duration in milliseconds

        // Clear existing chart elements
        svg.selectAll("*").remove();

        // Re-create X axis
        svg
            .append("g")
            .attr("transform", `translate(0,${height})`)
            .call(d3.axisBottom(x).ticks(5));

        // Update Y axis domain based on new data
        y.domain(data.map((d) => d.network));
        svg
            .append("g")
            .call(d3.axisLeft(y).tickSize(0))
            .selectAll(".tick text")
            .attr("x", -y.bandwidth() * 1.2)
            .style("text-anchor", "end")
            .style("font-size", "16px");

        // Add bars with transition
        const bars = svg
            .selectAll("myRect")
            .data(data)
            .enter()
            .append("rect")
            .attr("x", x(0))
            .attr("y", (d) => y(d.network))
            .attr("height", y.bandwidth())
            .attr("fill", (d) => d.color);

        bars
            .transition()
            .duration(TRANSITION_DURATION)
            .attr("width", (d) => x(d.avg_sentiment));

        // Add bar extensions with transition
        const barExtensions = svg
            .selectAll("barExtensions")
            .data(data)
            .enter()
            .append("rect")
            .attr("x", x(0) - y.bandwidth() / 2)
            .attr("y", (d) => y(d.network))
            .attr("height", y.bandwidth())
            .attr("fill", (d) => d.color);

        barExtensions
            .transition()
            .duration(TRANSITION_DURATION)
            .attr("width", y.bandwidth());

        // Add background circles with transition
        const backgroundCircles = svg
            .selectAll("backgroundCircles")
            .data(data)
            .enter()
            .append("circle")
            .attr("cx", x(0) - y.bandwidth() / 2)
            .attr("cy", (d) => y(d.network) + y.bandwidth() / 2)
            .attr("r", 0)
            .attr("fill", "white")
            .attr("stroke", (d) => d.color)
            .attr("stroke-width", 3);

        backgroundCircles
            .transition()
            .duration(TRANSITION_DURATION)
            .attr("r", y.bandwidth() / 2);

        // Add images with transition
        const images = svg
            .selectAll("networkImages")
            .data(data)
            .enter()
            .append("image")
            .attr("xlink:href", (d) => d.photo)
            .attr("x", x(0) - y.bandwidth())
            .attr("y", (d) => y(d.network))
            .attr("height", 0)
            .attr("width", 0)
            .attr("clip-path", "circle()");

        images
            .transition()
            .duration(TRANSITION_DURATION)
            .attr("height", y.bandwidth())
            .attr("width", y.bandwidth());
    }
});
