function whenDocumentLoaded(action) {
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", action);
  } else {
    // `DOMContentLoaded` already fired
    action();
  }
}

// Set the dimensions and margins of the graph
var margin = {top: 30, right: 30, bottom: 70, left: 60};

const maxRadius = 100;
const maxCircleArea = Math.PI * Math.pow(maxRadius, 2);

const circleAreaScale = d3.scaleLinear()
  // Our data will always be in [0, 1]
  .domain([0, 1])
  .range([0, maxCircleArea]);

// --- To select the right data ------------------

// THESE ARE WHEN THE OG DATA IS IN THE FORM:
// {
//   2001: [{quantity: 'energy', value: 0.5},
//         {quantity: 'valence', value: 0.3}],
//   2002: [{quantity: 'energy', value: 0.8},
//         {quantity: 'valence', value: 0.9}],
//   ...
// }
// This can be done with lodash but i don't know how to import yet
// const zip = (a, b) => a.map((k, i) => [k, b[i]]);
// A subset of a dictionary, but only the values
// This SORTS BY INCREASING YEAR BY DEFAULT
// This can be done with lodash but i don't know how to import yet
// function pickYearsData(obj, years) {
  // return Object.entries(obj)
      // .filter(r => years.includes(parseInt(r[0])))
      // .map(r => r[1]);
// }

// quantites is a list of dicts of the form
// {quantity: 'energy', value: 0.5}
// Return the list with only the quantities specified
// This doesn't change the order of the list
// function pickQuantity(obj, quantities) {
  // return obj.filter(r => quantities.includes(r.quantity))
// }

// Return the list with only the quantities specified
// With the form
// [
//   {quantity: "energy", values: [0.3, 0.7]},
//   {quantity: "track_popularity", values: [0.01, 0.5]}
// ]
// function selectData(data, years, features) {
  // var [fst, snd] = pickYearsData(data, years)
    // .map(yearData => pickQuantity(yearData, features));

  // zip(fst.map(r => r.value), snd.map(r => r.value))
// }

// THESE ARE WHEN THE OG DATA IS IN THE FORM:
// {
//   "valence": {"2001": 0.5, "2002": 0.8, ...},
//   "energy" : {"2001": 0.2, "2002": 0.2, ...},
//   ...
// }
// This is more elegant than the other form
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
    features // A list with the features to plot
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
    // this.data = selectData(this.data_full, this.years, this.features);
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
      .attr("dx", maxRadius/2)
      // .attr("transform", "translate(-" + maxRadius/2 + ", 0)rotate(-25)")
      .attr("transform", "rotate(-25)")
      .text(d => d.feature)
      // That should come from Css
      .style("font-size", "12pt")
      .style("text-anchor", "middle");

    // Do I need an extra group here?
    // Add the bubbles group to each subgroup
    var bubbles = label_and_bubbles.append("g")
      .attr("class", "bubbles");

    // Add the first bubble for each bubbles group
    bubbles.append("circle")
      .attr("classed", "year1")
      .attr("id", d => d.feature + "year1")
      .attr("r", d => scaleCircleArea(d.values[this.years[0]]))
      .attr("fill", "#69b3a2") // Will be in CSS eventually
      .attr("stroke", "black");

    bubbles.append("circle")
      .attr("classed", "year2")
      .attr("id", d => d.feature + "year2")
      .attr("r", d => scaleCircleArea(d.values[this.years[1]]))
      // .lower()
      .attr("fill", "#fe5c5c") // Will be in CSS eventually
      .attr("stroke", "black");

    // Change the order so that the smallest bubble is always in the front
    bubbles.append("use")
      .attr("href", d =>
	"#" + d.feature + (
	  d.values[this.years[1]] > d.values[this.years[0]] ? "year1" : "year2"
      ));
  }
}


whenDocumentLoaded(() => {
  var years = [2001, 1923]
  var features = ['energy', 'danceability', 'valence', 'explicit', 'track_popularity']
  const data_in = "viz/data/year_averages_by_feature.json"

  d3.json(data_in, function(err, json){
    let plot = new PlotYearComparator(
      'year-comparator',
      json,
      years,
      features
    );
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
