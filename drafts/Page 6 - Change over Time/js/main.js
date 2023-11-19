
// margin conventions & svg drawing area - since we only have one chart, it's ok to have these stored as global variables
// ultimately, we will create dashboards with multiple graphs where having the margin conventions live in the global
// variable space is no longer a feasible strategy.

let margin = {top: 40, right: 40, bottom: 60, left: 60};

let width = 600 - margin.left - margin.right;
let height = 500 - margin.top - margin.bottom;

let svg = d3.select("#chart-area").append("svg")
		.attr("width", width + margin.left + margin.right)
		.attr("height", height + margin.top + margin.bottom)
	.append("g")
		.attr("transform", "translate(" + margin.left + "," + margin.top + ")");


// Date parser
let formatDate = d3.timeFormat("%Y");
let parseDate = d3.timeParse("%Y");

// Initialize data
loadData();

// FIFA world cup
let data;

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

// define slider html location
let slider = document.getElementById('slider');

// Initialize slider
noUiSlider.create(slider, {
	start: [1930, 2014], // Default start and end values
	connect: true,
	step: 4,
	range: {
		min: 1930,
		max: 2014,
	},
	format: {
		to: value => parseInt(value, 10),
		from: value => parseInt(value, 10),
	},
});

// Attach event listeners for slider changes
slider.noUiSlider.on('update', updateSliderLabels);
slider.noUiSlider.on('change', updateVisualization);

// Update the visualization based on a change in selection in the drop down menu
document.getElementById('stat-selection').addEventListener('change', function () {
	// Call the updateVisualization function when the dropdown value changes
	updateVisualization();
});

// Load CSV file
function loadData() {
	d3.csv("data/fifa-world-cup.csv", row => {
		row.YEAR = parseDate(row.YEAR);
		row.TEAMS = +row.TEAMS;
		row.MATCHES = +row.MATCHES;
		row.GOALS = +row.GOALS;
		row.AVERAGE_GOALS = +row.AVERAGE_GOALS;
		row.AVERAGE_ATTENDANCE = +row.AVERAGE_ATTENDANCE;
		return row
	}).then(csv => {

		// Store csv data in global variable
		data = csv;

		// Draw the visualization for the first time
		updateVisualization();
	});
}

// Render visualization
function updateVisualization() {
	// Get the selected attribute from the dropdown
	let column = document.getElementById("stat-selection").value;

	// get selected years from slider and filter data
	let selectedYears = slider.noUiSlider.get();
	let filteredData = data.filter(
		d => d.YEAR >= parseDate(selectedYears[0]) && d.YEAR <= parseDate(selectedYears[1])
	);

	console.log(filteredData)

	// Set domains for x- and y-axes
	x.domain([d3.min(filteredData, d => d.YEAR), d3.max(filteredData, d => d.YEAR)]);
	y.domain([0, d3.max(filteredData, d => d[column])]);

	// Create a D3 line generator
	let line = d3.line()
		.x(d => x(d.YEAR))
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
		.attr("cx", d => x(d.YEAR))
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
		.attr("cx", d => x(d.YEAR))
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
}

// Show details for a specific FIFA World Cup
function showEdition(d){
	// define the data to be used for updating values
	let cup = d.target.__data__

	// Access the event data and update the table content
	document.getElementById("edition-goals").textContent = cup.GOALS;
	document.getElementById("edition-teams").textContent = cup.TEAMS;
}

function updateSliderLabels(values, handle, unencoded) {
	const startLabel = document.getElementById('start-label');
	const endLabel = document.getElementById('end-label');
	startLabel.innerHTML = `${unencoded[0]}&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;`;
	endLabel.innerHTML = `&nbsp;&nbsp;&nbsp;&nbsp;${unencoded[1]}`
}