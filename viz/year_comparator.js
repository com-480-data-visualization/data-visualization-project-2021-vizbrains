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
  constructor(svg_element_id, data) {
    this.data_full = data;
    this.svg = d3.select('#' + svg_element_id);

    // Like this for now
    // Will have to adapt to get a second year
    this.year = 1978;

    this.data = this.data_full[this.year];

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
      .domain(this.data.map(d => d.quantity));
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
      .attr("transform", d => "translate(" + x(d.quantity) + ", " + y(0.5) + ")");
      
    // Add the labels to each subgroup
    label_and_bubbles.append("text")
      .attr("dy", - maxRadius)
      .attr("dx", maxRadius/2)
      // .attr("transform", "translate(-" + maxRadius/2 + ", 0)rotate(-25)")
      .attr("transform", "rotate(-25)")
      .text(d => d.quantity)
      .style("font-size", "12pt")
      .style("text-anchor", "middle");

    // Add the bubbles group to each subgroup
    var bubbles = label_and_bubbles.append("g")
      .attr("class", "bubbles");

    // Add the first bubble for each bubbles group
    bubbles.append("circle")
      .attr("classed", "year1")
      .attr("r", d => scaleCircleArea(d.value))
      .attr("fill", "#69b3a2") // Will be in CSS eventually
      .attr("stroke", "black");
  }
}


whenDocumentLoaded(() => {

  d3.json("viz/data/year_averages.json", function(err, json){
    let plot = new PlotYearComparator('year-comparator', json);
  });

  // TODO
  // Add the second year
  // Need to space bubbles better -- can they be on several lines (some kind of wrapping?)
  // or maybe just limit de amount of bubbles period.
  // Add interactivity:
  //   choose the bubbles
  //   choose the features to show
  //   show info on hover
});
