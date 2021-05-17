function whenDocumentLoaded(action) {
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", action);
  } else {
    // `DOMContentLoaded` already fired
    action();
  }
}

// Set the dimensions and margins of the graph
// Should these be set elsewhere?
const margin = {
  top: 30,
  right: 0,
  bottom: 30,
  left: 200
};

// --- To select the right data ------------------
function pick(obj, keys) {
  return Object.entries(obj)
    .filter(r => keys.includes(r[0]))
}

function selectData(data, years, features) {
  return pick(data, features).map(r => ({
    "feature": r[0],
    "values" : Object.fromEntries(pick(r[1], years))
  }));
}

function range(start, end) {
  return [...Array(end + 1).keys()].slice(start)
}

function translate(x, y) {
  return "translate(" + x + ", " + y + ")"
}

// --- For when the viz is first started up ----------
// function takeRandom(list, numberItems) { }

// For generating a random year at reload
// function randomNum(a, b) {
  // return Math.floor((Math.random() * (b - a + 1)) + a)
// }

// --- Actual plot now ----------------------------
class PlotYearComparator {
  constructor(
    svg_element_id,
    data,
    features, // A list with the features to plot
  ) {

    this.data_full = data;
    this.features = features;
    this.years = ["1950", "2001"];

    // First the sliders
    const sliderDiv = d3.select(".slider_container");

    // For year 1
    this.slider1 = sliderDiv.append("input")
      .classed("slider", true)
      .attr("id", "slider_year1")
      .attr("type", "range")
      .attr("min", "1922")
      .attr("max", "2021");

    // Show the year on the side
    sliderDiv.append("text")
      .classed("sliderText", true)
      .attr("id", "text_year1")
      .text(this.years[0]);

    // For year 2
    // Repetition here...
    this.slider2 = sliderDiv.append("input")
      .classed("slider", true)
      .attr("id", "slider_year2")
      .attr("type", "range")
      .attr("min", "1922")
      .attr("max", "2021");

    // Show the year on the side
    sliderDiv.append("text")
      .classed("sliderText", true)
      .attr("id", "text_year2")
      .text(this.years[1]);
    
    // The SVG canvas
    this.svg = d3.select('#' + svg_element_id);
    
    // --- Set scales -------------------------
    const [o_x, o_y, w, h] = this.svg.attr("viewBox")
      .split(' ')
      .map(parseFloat);

    this.xRange = [o_x + margin.left, w - margin.right];
    this.yRange = [o_y + margin.top, h - margin.bottom].reverse();

    // --- Set background -------------------------
    // this.svg.append('rect')
      // .classed('plot-background', true)
      // .attr('width', w)
      // .attr('height', h);

    // --- Create X labels -------------------------
    this.x = d3.scaleLinear()
      .range(this.xRange)
      .domain([0,1])

    this.g = this.svg.append("g");
      // .attr("transform", "translate(40,0)");

    this.draw();
  };

  // Could I regroup draw and redraw? It's duplicate code...
  draw() {
    // Pick the 2 years from the data, then filter to get only the desired features
    this.data = selectData(
      this.data_full,
      this.years,
      this.features
    );

    var [year1, year2] = this.years;

    // X axis
    this.g.append("g")
      .attr("transform", translate(0, this.yRange[0]))
      .call(d3.axisBottom(this.x));
    
    // Y axis
    this.y = d3.scalePoint()
      .range(this.yRange)
      .domain(this.features)
      .padding([0.5]);

    // let y_axis = this.g.append("g")
      // .classed("y-axis", true)
      // .attr("transform",
	// "translate("
	// + this.x(0)
	// + ", "
	// + 0
	// + ")")
      // .call(d3.axisLeft(this.y)
	// .tickPadding([10])
	// .tickSizeOuter([0])
      // )
      // .selectAll("text")
	// .classed("feature_label", true)
        // .style("text-anchor", "end");

    // y_axis.append("g")
      // .classed("y-gridlines", true)
      // .append(
      // .attr("transform",
	// "translate("
	// + this.x(0)
	// + ", "
	// + 0
	// + ")")
      
    let y_lines = this.g.append("g")
      .classed("y_line", true);

    y_lines.selectAll("text.feature_label")
      .data(this.data)
      .enter()
      .append("text")
	.classed("feature_label", true)
	.attr("x", this.x(-0.01))
	.attr("dx", -5)
	.attr("y", d => this.y(d.feature))
	.attr("dy", 3)
	.text(d => d.feature);

    y_lines.selectAll("line.y_line")
      .data(this.data)
      .enter()
      .append("line")
	.classed("y_line", true)
        .attr("x1", this.x(-0.01))
	.attr("x2", this.x(1))
        .attr("y1", d => this.y(d.feature))
	.attr("y2", d => this.y(d.feature));

    // Year 1 circles
    this.g.selectAll("circle.year1")
      .data(this.data)
      .enter()
      .append("circle")
	.classed("year1", true)
	.attr("r", 15)
	.attr("cx", d => this.x(d.values[year1]))
	.attr("cy", d => this.y(d.feature));

    // Year 2 circles
    this.g.selectAll("circle.year2")
      .data(this.data)
      .enter()
      .append("circle")
	.classed("year2", true)
	.attr("r", 15)
	.attr("cx", d => this.x(d.values[year2]))
	.attr("cy", d => this.y(d.feature));
  };

  redrawBubbles() {
    // Pick the 2 years from the data, then filter to get only the desired features
    this.data = selectData(
      this.data_full,
      this.years,
      this.features
    );

    var [year1, year2] = this.years;

    this.y = d3.scalePoint()
      .range(this.yRange)
      .domain(this.features)
      .padding([0.5]);

    var y_axis = this.g.selectAll("g.y-axis")

    y_axis.call(d3.axisLeft(this.y))
      .selectAll("text")
	.classed("feature_label", true)
        .style("text-anchor", "end")
	.attr("dx", -20);

    // Year 1 circles
    var circles_year1 = this.g.selectAll("circle.year1")
      .data(this.data);

    circles_year1.exit().remove();
    circles_year1.enter().append("circle")
      .attr("r", 15);

    circles_year1.transition().duration(200)
      .attr("cx", d => this.x(d.values[year1]))
      .attr("cy", d => this.y(d.feature));

    // Year 2 circles
    var circles_year2 = this.g.selectAll("circle.year2")
      .data(this.data);

    circles_year2.exit().remove();
    circles_year2.enter().append("circle")
      .attr("r", 15);

    circles_year2.transition().duration(200)
      .attr("cx", d => this.x(d.values[year2]))
      .attr("cy", d => this.y(d.feature));
  };
}


whenDocumentLoaded(() => {
  var features = [
    'Energy',
    'Danceability',
    'Valence',
    'Explicit',
    'Track popularity'
  ];
  const data_in = "viz/data/year_averages_by_feature.json";

  d3.json(data_in, function(err, data){
    let plot = new PlotYearComparator(
      'year_comparator',
      data,
      features
    );

      // --- What to do when sliders are changed -------------
    plot.slider1.on("input", function() {
      const year = this.value;
      d3.select("#text_year1").text(year);
      plot.years[0] = year.toString();
      plot.redrawBubbles();
    })

    plot.slider2.on("input", function() {
      const year = this.value;
      d3.select("#text_year2").text(year);
      plot.years[1] = year.toString();
      plot.redrawBubbles();
    });
  });
});
