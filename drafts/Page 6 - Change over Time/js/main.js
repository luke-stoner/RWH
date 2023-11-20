// set margins, width, height
let margin = {top: 40, right: 40, bottom: 60, left: 60};

let width = 900 - margin.left - margin.right;
let height = 600 - margin.top - margin.bottom;

// initialize svg drawing space
let svg = d3.select("#chart-area").append("svg")
		.attr("width", width + margin.left + margin.right)
		.attr("height", height + margin.top + margin.bottom)
	.append("g")
		.attr("transform", "translate(" + margin.left + "," + margin.top + ")");

// format date
let formatDate = d3.timeFormat("%Y%m%d")

// parse date
let parseDate = d3.timeParse("%Y%m%d")

// Initialize data
let data = []; // Initialize empty array

// call load data function
loadData()

// Load CSV file
function loadData() {
	d3.csv("data/labeled.csv", row => {
		row.date = parseDate(row.date);
		return row
	}).then(csv => {

		// Store csv data in global variable
		data = csv;

		// define scales for data
		let x = d3.scaleTime()
			.range([0, width]);

		let y = d3.scaleLinear()
			.range([height, 0]);

		// Initialize the x and y axes
		let xAxis = svg.append("g")
			.attr("class", "x-axis axis")
			.attr("transform", "translate(0," + height + ")");

		let yAxis = svg.append("g")
			.attr("class", "y-axis axis");

		// Update the visualization based on a change in selection in the drop down menu
		document.getElementById('stat-selection').addEventListener('change', function () {
			// Call the updateVisualization function when the dropdown value changes
			updateVisualization();
		});

		// Create date slider
		const sliderRange = d3
			.sliderBottom()
			.min(d3.min(data, d => d.date))
			.max(d3.max(data, d => d.date))
			.width(250)
			.tickFormat(d3.timeFormat('%Y-%m-%d'))
			.ticks(3)
			.default([d3.min(data, d => d.date), d3.max(data, d => d.date)])
			.fill('#85bb65');

		// Add the slider to the DOM
		const gRange = d3
			.select('#slider-range')
			.append('svg')
			.attr('width', 400)
			.attr('height', 100)
			.append('g')
			.attr('transform', 'translate(90,30)');

		gRange.call(sliderRange);

		// set date data to full range by default
		const filtered_date_data = data

		// get selected years from slider and filter data
		sliderRange.on('onchange', val => {
			// Filter data based on slider values
			const filtered_date_data = data.filter(d => d.date >= val[0] && d.date <= val[1]);
		});


		// create list of selected candidates
		let selectedCandidates = [];
		d3.selectAll('input[type=checkbox]').each(function () {
			if (this.checked) {
				selectedCandidates.push(this.id);
			}
		});

		// filter data to only include selected candidates
		let filteredData = filtered_date_data.filter(candidate => {
			return selectedCandidates.includes(candidate.last_name);
		});


		// Get the selected attribute from the dropdown
		let column = document.getElementById("stat-selection").value;

		// do magic to make data 

		// Set domains for x- and y-axes
		x.domain([d3.min(filteredData, d => d.date), d3.max(filteredData, d => d.date)]);
		y.domain([0, d3.max(filteredData, d => d[column])]);

		// Create a D3 line generator
		let line = d3.line()
			.x(d => x(d.date))
			.y(d => y(d[column]));

		// Select or create a path with the "line" class
		let path = svg.selectAll(".line")
			.data([filteredData]);

		// Enter (append new line)
		path.enter()
			.append("path")
			.attr("class", "line")
			.attr("fill", "none")
			.attr("stroke-width", 2)
			.attr("d", d => line(d))
			.attr("opacity", 0)
			.transition() // Apply a transition for enter selection
			.duration(800)
			.attr("opacity", 1); // Fade in the line

		// Update
		path.merge(path)
			.transition() // Apply a transition for update selection
			.duration(800)
			.attr("d", d => line(d));

		// Exit
		path.exit()
			.transition() // Apply a transition for exit selection
			.duration(800)
			.attr("opacity", 0) // Fade out the line
			.remove();

		// Create SVG circles
		let circles = svg.selectAll(".data-point")
			.data(filteredData);

		// Enter (append new circles)
		circles.enter()
			.append("circle")
			.attr("class", "data-point")
			.attr("cx", d => x(d.date))
			.attr("cy", d => y(d[column]))
			.attr("r", 5) // Adjust the radius as needed
			.attr("fill", "green") // Color of the data points
			.attr("opacity", 0) // Start with zero opacity
			.transition()
			.duration(800)
			.attr("opacity", 1); // Fade in circles

		// Update
		circles
			.transition()
			.duration(800)
			.attr("cx", d => x(d.date))
			.attr("cy", d => y(d[column]));

		// Exit
		circles.exit()
			.transition()
			.duration(800)
			.attr("opacity", 0) // Fade out the circles
			.remove();

		// Update the information for the selected edition
		svg.selectAll(".data-point")
			.on("click", function (d) {
				console.log(d)
				showEdition(d);
			});

		// Update the x and y axes
		svg.select(".x-axis")
			.transition()
			.duration(800)
			.call(d3.axisBottom(x));

		svg.select(".y-axis")
			.transition()
			.duration(800)
			.call(d3.axisLeft(y));
})}
