function whenDocumentLoaded(action) {
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", action);
  } else {
    // `DOMContentLoaded` already fired
    action();
  }
}


// Set the dimensions and margins of the graph
const margin = {
  top: 30,
  right: 30,
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

const feature_descs = {
  "Acousticness": "Whether the track is acoustic.",
  "Artist followers": "Whether the artist has many followers on Spotify",
  "Artist popularity": "How popular the artist is.",
  "Duration": "The duration of the track in milliseconds.",
  "Danceability": "Whether it is easy to dance along to the track.",
  "Energy": "A perceptual measure of intensity in the track.",
  "Explicit": "Whether swear words are used on the track.",
  "Instrumentalness": "Whether a track contains no vocals.",
  "Key": "The key the track is in.",
  "Liveness": "Whether there is a live audience in the recording.",
  "Loudness": "The overall loudness of a track.",
  "Mode": "Indicates the modality (major or minor) of a track.",
  "Speechiness": "Whether there are spoken words in a track.",
  "Tempo": "The overall estimated tempo.",
  "Time signature": "An estimated overall time signature of a track.",
  "Track popularity": "How popular the track is.",
  "Valence": "The musical positiveness conveyed by a track."
};

// --- Actual plot now ----------------------------
class PlotYearComparator {
  constructor(data, features) {

    this.data_full = data;
    this.features = features;
    this.years = ["1950", "2001"];
    
    // Sliders
    var sliderDiv = d3.select("div.slider_container");

    // For year 1
    this.slider1 = sliderDiv.append("input")
      .classed("slider", true)
      .attr("id", "slider_year1")
      .attr("type", "range")
      .attr("min", "1922")
      .attr("max", "2021")
      .attr("value", this.years[0]);

    // Show the year on the side
    sliderDiv.append("text")
      .classed("sliderText", true)
      .attr("id", "text_year1")
      .text(this.years[0]);

    // For year 2
    this.slider2 = sliderDiv.append("input")
      .classed("slider", true)
      .attr("id", "slider_year2")
      .attr("type", "range")
      .attr("min", "1922")
      .attr("max", "2021")
      .attr("value", this.years[1]);

    // Show the year on the side
    sliderDiv.append("text")
      .classed("sliderText", true)
      .attr("id", "text_year2")
      .text(this.years[1]);


    // SVG canvas
    this.svg = d3.select("svg#year_comparator");

    // --- Set scales -------------------------
    const [o_x, o_y, w, h] = this.svg.attr("viewBox")
      .split(' ')
      .map(parseFloat);

    this.xRange = [o_x + margin.left, w - margin.right];
    this.yRange = [o_y + margin.top, h - margin.bottom].reverse();

    // --- Create X labels -------------------------
    this.x = d3.scaleLinear()
      .range(this.xRange)
      .domain([0,1])

    this.g = this.svg.append("g");

    this.draw();
  };

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
      .attr("class", "axis axis--x")
      .attr("transform", translate(0, this.yRange[0]))
      .call(d3.axisBottom(this.x)
	.tickFormat(d => d * 100 + "%")
      );
    
    // Y axis
    this.y = d3.scalePoint()
      .range(this.yRange)
      .domain(this.features)
      .padding([0.5]);
      
    let y_lines = this.g.append("g")
      .classed("y_line", true);

    y_lines.selectAll("text.feature_label")
      .data(this.data)
      .enter()
      .append("text")
      .classed("feature_label", true)
      .style("text-anchor", "end")
      .attr("x", this.x(-0.01))
      .attr("dx", -12)
      .attr("y", d => this.y(d.feature))
      .attr("dy", 3)
      .text(d => d.feature)
      .on("mouseover", d => {
        var x_idx = this.x(-0.01);
        var y_idx = this.y(d.feature) - 50;
        var rect_width = (feature_descs[d.feature]).length * 6

        this.g.append('rect')
          .attr("class", "tooltip_rect")
          .attr("width", rect_width)
          .attr("height", 30)
          .attr("x", x_idx)
          .attr("y", y_idx)
          .attr("fill", "#110e0e")
          .attr("stroke", "white")
          .attr("rx", 5)
          .attr("rx", 5);

        this.g.append('text')
          .attr("class", "tooltip_text")
          .text(feature_descs[d.feature])
          .attr("x", x_idx + (rect_width/2))
          .attr("y", y_idx + 20)
          .style("font-size", "12px");
      })
      .on("mouseleave", d => {
        this.g.selectAll(".tooltip_rect").remove();
        this.g.selectAll(".tooltip_text").remove();
      });

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

  redraw() {
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
    // "Track popularity",
    "Explicit",
    // "Danceability",
    "Energy",
    // "Speechiness",
    "Acousticness", //good
    "Instrumentalness",
    // "Liveness",
    // "Valence",
    "Artist popularity",
    // "Artist followers"
  ];

  const data_in = "viz/data/year_averages_by_feature.json";

  d3.json(data_in, function(err, data){
      let plot = new PlotYearComparator(data, features);

    // --- What to do when sliders are changed -------------
    plot.slider1.on("input", function() {
      const year = this.value;
      d3.select("#text_year1").text(year);
      plot.years[0] = year.toString();
      plot.redraw();
    });

    plot.slider2.on("input", function() {
      const year = this.value;
      d3.select("#text_year2").text(year);
      plot.years[1] = year.toString();
      plot.redraw();
    });
  });
});
