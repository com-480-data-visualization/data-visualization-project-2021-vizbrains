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
var margin = {top: 30, right: 30, bottom: 70, left: 60};

const maxRadius = 100;
const maxCircleArea = Math.PI * Math.pow(maxRadius, 2);

const circleAreaScale = d3.scaleLinear()
  // Our data will always be in [0, 1]
  .domain([0, 1])
  .range([0, maxCircleArea]);

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
function randomNum(a, b) {
  return Math.floor((Math.random() * (b - a + 1)) + a)
}

// To get the radius based on the area
function scaleCircleArea(d) {
  return Math.sqrt(circleAreaScale(d) / Math.PI)
}

// --- Actual plot now ----------------------------
class PlotYearComparator {
  constructor(
    svg_element_id,
    data,
    years, // A list of exactly 2 years
    features, // A list with the features to plot
    feature_names // A dict that translates feature names to proper English
  ) {

    // Depending on if the constructor is rerun at each change, this might be useless
    // this.data_full = data;

    // Like this for now
    // When the viz first starts the behaviour should be deterministic
    // but it's probably not necessary to keep it this way once the viz is live
    // Check that there are exactly 2 years?
    this.years = years.map(y => y.toString());
    this.features = features;

    // Pick the 2 years from the data, then filter to get only the desired features
    this.data = selectData(data, this.years, this.features)

    this.svg = d3.select('#' + svg_element_id);

    // --- Set scales -------------------------
    const [o_x, o_y, w, h] = this.svg.attr("viewBox")
      .split(' ')
      .map(parseFloat);

    const xRange = [o_x + margin.left, w - margin.right];
    const yRange = [o_y + margin.top, h - margin.bottom].reverse();

    // --- Set background -------------------------
    this.svg.append('rect')
      .classed('plot-background', true)
      .attr('width', w)
      .attr('height', h);

    // --- Create X labels -------------------------
    // Get range of values
    var x = d3.scaleBand()
      .range(xRange)
      .domain(this.data.map(d => d.feature));
      // .round(true)
      // .padding(100);

    var y = d3.scaleLinear()
      .range(yRange)
      .domain([0,1])

    // This group contains all text+bubbles groups
    var g = this.svg.append("g")
      .attr("transform", "translate(40,0)");

    // These groups will hold the labels and the groups of 2 bubbles
    var label_and_bubbles = g.selectAll("g")
      .data(this.data)
      .enter()
      .append("g")
      .attr("transform", d =>
	"translate(" + x(d.feature) + ", " + y(0.5) + ")");
      
    // Add the labels to each subgroup
    label_and_bubbles.append("text")
      .attr("dy", - maxRadius)
      // .attr("transform", "translate(-" + maxRadius/2 + ", 0)rotate(-25)")
      // .attr("transform", "rotate(-25)")
      .text(d => feature_names[d.feature])
      // .text(d => d.feature)
      // That should come from Css
      .style("font-size", "12pt")

    // Do I need an extra group here?
    // Add the bubbles group to each subgroup
    var bubbles = label_and_bubbles.append("g")
      .classed("bubbles", true);

    // Is there a way to modularise this?

    // Add the first bubble for each bubbles group
    bubbles.append("circle")
      .attr("class", "year1")
      // This is for the reusing later
      .attr("id", d => d.feature + "year1")
      .attr("r", d => scaleCircleArea(d.values[this.years[0]]))
      // .attr("fill", "#69b3a2") // Will be in CSS eventually
      // .attr("stroke", "black")
      .attr("opacity", d => (
	// deal with opacity value in CSS
	d.values[this.years[1]] > d.values[this.years[0]] ? 0.5 : 1
      ));

    bubbles.append("circle")
      .attr("class", "year2")
      // This is for the reusing later
      .attr("id", d => d.feature + "year2")
      .attr("r", d => scaleCircleArea(d.values[this.years[1]]))
      // .attr("fill", "#fe5c5c") // Will be in CSS eventually
      // .attr("stroke", "black")
      .attr("opacity", d => (
	// deal with opacity value in CSS
	d.values[this.years[1]] > d.values[this.years[0]] ? 1 : 0.5
      ));

    // Change the order so that the smallest bubble is always in the front
    bubbles.append("use")
      .attr("href", d =>
	"#" + d.feature + (
	  d.values[this.years[1]] > d.values[this.years[0]] ? "year1" : null
      ));
  }
}


whenDocumentLoaded(() => {
  var years = [2001, 1923]
  var features = ['energy', 'danceability', 'valence', 'explicit', 'track_popularity']
  const data_in = "viz/data/year_averages_by_feature.json"

  d3.json(data_in, function(err, data){

    // Putting the feature names in scope
    d3.json("viz/data/features.json", function(err_, feature_names) {

      let plot = new PlotYearComparator(
	'year-comparator',
	data,
	years,
	features,
	feature_names
      );

    });

  });

  // TODO
  // Add the second year
  // Need to space bubbles better -- can they be on several lines (some kind of wrapping?)
  // or maybe just limit de amount of bubbles period.
  // This will have to be reexamine the behaviour of the viz under stretching/compressing
  // Add interactivity:
  //   choose the bubbles
  //   choose the features to show
  //   show info on hover
});
