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
const margin = {top: 30, right: 0, bottom: 0, left: 100};

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
    years, // A list of exactly 2 years
    features, // A list with the features to plot
    feature_names // A dict that translates feature names to proper English; does it have to be an input?
  ) {

    this.data_full = data;
    this.features = features;
    this.feature_names = feature_names;
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

    // This group contains all text+bubbles groups
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

    // Add labels
    this.y = d3.scaleBand()
      .range(this.yRange)
      .domain([...Array(this.features.length).keys()]);
    
    this.g.selectAll("text.feature_label")
      .data(this.data)
      .enter()
      .append("text")
	.classed("feature_label", true)
        .attr("x", this.x(0))
        .attr("dx", -20)
	.attr("y", (d, i) => this.y(i))
	.text(d => this.feature_names[d.feature]);

    // Year 1 circles
    this.g.selectAll("circle.year1")
      .data(this.data)
      .enter()
      .append("circle")
	.classed("year1", true)
	// .attr("id", d => d.feature + "year1")
	.attr("r", 15)
	.attr("cx", (d, i) => this.x(d.values[year1]))
	.attr("cy", (d, i) => this.y(i));

    // Year 2 circles
    this.g.selectAll("circle.year2")
      .data(this.data)
      .enter()
      .append("circle")
	.classed("year2", true)
	// .attr("id", d => d.feature + "year1")
	.attr("r", 15)
	.attr("cx", (d, i) => this.x(d.values[year2]))
	.attr("cy", (d, i) => this.y(i));
  };

  redrawBubbles() {
    // Pick the 2 years from the data, then filter to get only the desired features
    this.data = selectData(
      this.data_full,
      this.years,
      this.features
    );

    var [year1, year2] = this.years;

    // Recompute y axis in case
    this.y = d3.scaleBand()
      .range(this.yRange)
      .domain([...Array(this.features.length).keys()]);
    
    var feature_labels = this.g.selectAll("text.feature_label")
      .data(this.data);

    feature_labels.exit().remove();
    feature_labels.enter().append("text");

    feature_labels.transition().duration(200)
      .attr("y", (d, i) => this.y(i))
      .text(d => this.feature_names[d.feature]);

    // Year 1 circles
    var circles_year1 = this.g.selectAll("circle.year1")
      .data(this.data);

    circles_year1.exit().remove();
    circles_year1.enter().append("circle")
      .attr("r", 15);

    circles_year1.transition().duration(200)
      .attr("cx", (d, i) => this.x(d.values[year1]))
      .attr("cy", (d, i) => this.y(i));

    // Year 2 circles
    var circles_year2 = this.g.selectAll("circle.year2")
      .data(this.data);

    circles_year2.exit().remove();
    circles_year2.enter().append("circle")
      .attr("r", 15);

    circles_year2.transition().duration(200)
      .attr("cx", (d, i) => this.x(d.values[year2]))
      .attr("cy", (d, i) => this.y(i));
  };
}


whenDocumentLoaded(() => {
  var features = ['energy', 'danceability', 'valence', 'explicit', 'track_popularity']
  const data_in = "viz/data/year_averages_by_feature.json"

  d3.json(data_in, function(err, data){

    // Putting the feature names in scope
    d3.json("viz/data/features.json", function(err_, feature_names) {

      let plot = new PlotYearComparator(
	'year_comparator',
	data,
	features,
	feature_names
      );

      // --- What to do when sliders are changed -------------
      plot.slider1.on("input", function() {
	const year = this.value;
	// Change text
	d3.select("#text_year1").text(year);
	// Change year 1 bubbles
	plot.years[0] = year.toString();
	plot.redrawBubbles();
      })

      plot.slider2.on("input", function() {
	const year = this.value;
	// Change text
	d3.select("#text_year2").text(year);
	// Change year 1 bubbles
	plot.years[1] = year.toString();
	plot.redrawBubbles();
      })

    });
  });
});
