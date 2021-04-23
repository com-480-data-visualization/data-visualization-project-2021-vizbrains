

function whenDocumentLoaded(action) {
	if (document.readyState === "loading") {
		document.addEventListener("DOMContentLoaded", action);
	} else {
		// `DOMContentLoaded` already fired
		action();
	}
}

class PlotByYear {
	constructor(svg_element_id, data) {
		this.data = data;
		this.svg = d3.select('#' + svg_element_id);

		const year_range = [d3.min(data, d => d.year), d3.max(data, d => d.year)];

		const scaleY = d3.scaleLinear()
			.domain(year_range)
			.range([0, 1500]);

		this.svg.append('rect')
			.classed('plot-background', true)
			.attr('width', 70)
			.attr('height', 1500);

		// Create Y labels
		const label_ys = Array.from(Array(101), (elem, index) => 1920 + index);
		this.svg.selectAll('text')
			.data(label_ys)
			.enter()
				.append('text')
				.text( d => d )
				.attr('x', -10)
				.attr('y', d => scaleY(d) + 5)
				.style("font-size", "5px");

		var elem = this.svg.selectAll("g")
        .data(data)
		.enter()
        .append("g");


		// Circle for each song
		elem.append("circle")
			.attr("r", d => d.popularity / 15) // radius
			.attr("cx", 10) // position, rescaled
			.attr("cy", d => scaleY(d.year) + 5)
        	.attr("fill", "blue");
		
		// Title for each song
		elem.append("text")
		.text( d => d.name)
		.attr('x', 40)
		.attr('y', d => scaleY(d.year) + 5)
		.style("font-size", "2px");
	}
}

class StretchableTimeline {
	constructor(svg_element_id, data) {
		this.data = data;
		this.svg = d3.select('#' + svg_element_id);
		
		var svg = this.svg,
			margin = {top: 20, right: 20, bottom: 110, left: 40},
			margin2 = {top: 430, right: 20, bottom: 30, left: 40},
			width = +1000 - margin.left - margin.right,
			height = +500 - margin.top - margin.bottom,
			height2 = +500 - margin2.top - margin2.bottom;


		const year_range = [d3.min(data, d => d.year), d3.max(data, d => d.year)];

		const x = d3.scaleLinear().domain(year_range).range([0, width]),
			x2 = d3.scaleLinear().domain(year_range).range([0, width]),
			y = d3.scaleLinear().range([height, 0]),
			y2 = d3.scaleLinear().range([height2, 0]);

		var xAxis = d3.axisBottom(x).tickFormat(d3.format("d")),
			xAxis2 = d3.axisBottom(x2).tickFormat(d3.format("d")),
			yAxis = d3.axisLeft(y);

		var s = [0, width];
		var t = d3.zoomIdentity;

		var brush = d3.brushX()
			.extent([[0, 0], [width, height2]])
			.on("brush end", brushed);

		var zoom = d3.zoom()
			.scaleExtent([1, 10])
			.translateExtent([[0, 0], [width, height]])
			.extent([[0, 0], [width, height]])
			.on("zoom", zoomed);

		var area = d3.area()
			.curve(d3.curveMonotoneX)
			.x(function(d) { return x(d.year); })
			.y0(height)
			.y1(function(d) { return y(d.popularity); });

		var area2 = d3.area()
			.curve(d3.curveMonotoneX)
			.x(function(d) { return x2(d.year); })
			.y0(height2)
			.y1(function(d) { return y2(d.popularity); });

		svg.append("defs").append("clipPath")
			.attr("id", "clip")
		.append("rect")
			.attr("width", width)
			.attr("height", height);

		var context = svg.append("g")
			.attr("class", "context")
			.attr("transform", "translate(" + margin2.left + "," + margin2.top + ")");

		var focus = svg.append("g")
			.attr("class", "focus")
			.attr("transform", "translate(" + margin.left + "," + margin.top + ")");

		x.domain(d3.extent(data, function(d) { return d.year; }));
		y.domain([0, d3.max(data, function(d) { return d.popularity; })]);
		x2.domain(x.domain());
		y2.domain(y.domain());

		focus.append("path")
			.datum(data)
			.attr("class", "area")
			.attr("d", area);

		focus.append("g")
			.attr("class", "axis axis--x")
			.attr("transform", "translate(0," + height + ")")
			.call(xAxis);

		focus.append("g")
			.attr("class", "axis axis--y")
			.call(yAxis);

		context.append("path")
			.datum(data)
			.attr("class", "area")
			.attr("d", area2);

		context.append("g")
			.attr("class", "axis axis--x")
			.attr("transform", "translate(0," + height2 + ")")
			.call(xAxis2);

		context.append("g")
			.attr("class", "brush")
			.call(brush)
			.call(brush.move, x.range());

		focus.append("rect")
			.attr("class", "zoom")
			.attr("width", width)
			.attr("height", height)
			.lower();
			
			focus.call(zoom);
		
		// plot the songs data
		function plot() {
			var ticks = xAxis.scale().ticks();
			var filtered_data = data.filter(d => ticks.includes(d.year));

			const circle = focus.selectAll('circle')
			.data(filtered_data);

			// Update point parameters when zooming or scrolling
			circle
				.attr("cx", d => x(d.year))
				.attr("r", d => 20)
				.attr("cy", d => y(d.popularity))
				.attr("id", d => "a"+d.id)
				// When hovering on this song point
				.on("mouseover", d => {
					// hide the circle
					focus.select("#a" + d.id).attr('opacity', '0');
					
					// display a transparent rectangle to put song infos into
					focus.append('rect')
					.attr("class", "info")
					.attr("id", "r"+d.id)
					.attr("width", 450)
					.attr("height", 80)
					.attr("x", Math.min(x(d.year) - 20, width - 450))
					.attr("y", y(d.popularity) - 20)
					.attr("fill", "blue")
					.attr('opacity', '.5');

					// song title
					focus.append('text')
					.attr("class", "info")
					.text(d.name)
					.attr("x", Math.min(x(d.year) + 205, width - 205))
					.attr("y", y(d.popularity) +10);

					// song artist
					focus.append('text')
					.attr("class", "info")
					.text(d.artists)
					.attr("x", Math.min(x(d.year) + 205, width - 205))
					.attr("y", y(d.popularity) + 40);
				})
				// When putting cursor away from this point, remove infos and show the circle
				.on("mouseout", d => {
					focus.select("#a" + d.id).attr('opacity', '1');
					focus.selectAll(".info").remove();
				});

			// Add circles
			circle
				.enter()
				.append('circle')
				.attr("fill", "blue");

			// Remove out-of-scope circles
			circle
				.exit()
				.remove();
				
		};

		function brushed() {
		if (d3.event.sourceEvent && d3.event.sourceEvent.type === "zoom") return; // ignore brush-by-zoom
		s = d3.event.selection || x2.range();
		x.domain(s.map(x2.invert, x2));
		focus.select(".area").attr("d", area);
		focus.select(".axis--x").call(xAxis);
		svg.select(".zoom").call(zoom.transform, d3.zoomIdentity
			.scale(width / (s[1] - s[0]))
			.translate(-s[0], 0));
		plot();
		}

		function zoomed() {
		if (d3.event.sourceEvent && d3.event.sourceEvent.type === "brush") return; // ignore zoom-by-brush
		t = d3.event.transform;
		x.domain(t.rescaleX(x2).domain());
		focus.select(".area").attr("d", area);
		focus.select(".axis--x").call(xAxis);
		context.select(".brush").call(brush.move, x.range().map(t.invertX, t));
		plot();
		}
	}
}

whenDocumentLoaded(() => {

	d3.json("viz/out.json", function(err, json){
		let plot = new PlotByYear('plot', json);
	});

	d3.json("viz/out.json", function(err, json){
		let st = new StretchableTimeline('timeline', json);
	});

});
