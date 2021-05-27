

function whenDocumentLoaded(action) {
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", action);
  } else {
    // `DOMContentLoaded` already fired
    action();
  }
}

class StretchableTimeline {
  constructor(svg_element_id, data) {
    const data_ = d3.nest()
      .key(d => d.year)
      .rollup(v => v.filter(d => d.track_popularity == d3.max(v, d_ => d_.track_popularity))[0])
      .entries(data)
      .map(d => d.value);
    this.svg = d3.select('#' + svg_element_id);
    
    var svg = this.svg,
      margin = {top: 104, right: 20, bottom: 110, left: 40},
      margin2 = {top: 524, right: 20, bottom: 30, left: 40},
      width = +1000 - margin.left - margin.right,
      height = +600 - margin.top - margin.bottom,
      height2 = +600 - margin2.top - margin2.bottom;

    const year_range = [d3.min(data_, d => d.year), d3.max(data_, d => d.year)];

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
      .x(d => x(d.year))
      .y0(height)
      .y1(d => y(d.track_popularity));

    var area2 = d3.area()
      .curve(d3.curveMonotoneX)
      .x(d => x2(d.year))
      .y0(height2)
      .y1(d => y2(d.track_popularity));

    svg.append("defs").append("clipPath")
      .attr("id", "clip")
      .append("rect")
      .attr("width", width)
      .attr("height", height);

    var foreign_object = svg.append('foreignObject')
      .attr("width", "100%")
      .attr("height", "80");

    var focus = svg.append("g")
      .attr("class", "focus")
      .attr("transform", "translate(" + margin.left + "," + margin.top + ")");
      
    var context = svg.append("g")
      .attr("class", "context")
      .attr("transform", "translate(" + margin2.left + "," + margin2.top + ")");

    x.domain(d3.extent(data_, d => d.year));
    y.domain([0, d3.max(data_, d => d.track_popularity)]);
    x2.domain(x.domain());
    y2.domain(y.domain());

    // Back in Black by default
    foreign_object.append("xhtml:iframe")
      .attr("src", "https://open.spotify.com/embed/track/08mG3Y1vljYA6bvDt4Wqkj")
      .attr("width", "50%")
      .attr("height", "80")
      .style("margin", "auto")
      .style("display", "block")
      .attr("frameborder", "0")
      .attr("allowtransparency", "true")
      .attr("allow", "encrypted-media");

    focus.append("path")
      .datum(data_)
      .attr("class", "area")
      .attr("d", area);

    focus.append("g")
      .attr("class", "axis axis--x")
      .attr("transform", "translate(0," + height + ")")
      .call(xAxis);

    focus.append("g")
      .attr("class", "axis axis--y")
      .call(yAxis);

    // text label for the y axis
    svg.append("text")
    .attr("transform", "rotate(-90)")
    .attr("y", 15)
    .attr("x", - (height / 2) - 80)
    .text("Popularity");

    context.append("path")
      .datum(data_)
      .attr("class", "area")
      .attr("d", area2);

    context.append("g")
      .attr("class", "axis axis--x")
      .attr("transform", "translate(0," + height2 + ")")
      .call(xAxis2);

    // text label for the x axis
    svg.append("text")             
      .attr("transform",
          "translate(" + (width/2) + " ," + 
                        (margin2.top + margin.top + 60) + ")")
      .style("text-anchor", "middle")
      .text("Year");

    var slider = context.append("g")
      .attr("class", "brush")
      .attr("cursor", "grab")
      .call(brush)
      .call(brush.move, x.range());
    
    slider.selectAll(".overlay").remove();
    slider.selectAll(".handle").remove();

    focus.append("rect")
      .attr("class", "zoom")
      .attr("width", width)
      .attr("height", height)
      .lower();
      
      focus.call(zoom);
    
    // plot the songs data
    function plot() {
      var ticks = xAxis.scale().ticks();
      var filtered_data = data_.filter(d => ticks.includes(d.year));

      const circle = focus.selectAll('circle')
      .data(filtered_data);

      // Update point parameters when zooming or scrolling
      circle
          .attr("cx", d => x(d.year))
          .attr("r", d => 20)
          .attr("cy", d => y(d.track_popularity))
          .attr("id", d => "a"+d.id)
          // When hovering on this song point
          .on("mouseover", d => {
              // increase circle radius
              focus.select("#a" + d.id).attr('r', '35');

              foreign_object.selectAll("iframe").remove();
              foreign_object.append("xhtml:iframe")
                .attr("src", "https://open.spotify.com/embed/track/" + d.id)
                .attr("width", "50%")
                .attr("height", "80")
                .style("margin", "auto")
                .style("display", "block")
                .attr("frameborder", "0")
                .attr("allowtransparency", "true")
                .attr("allow", "encrypted-media");
          })
          // When putting cursor away from this point, decrease circle radius back to its normal size
          .on("mouseout", d => {
              focus.select("#a" + d.id).attr('r', '20');
          });

      // Add circles
      circle
          .enter()
          .append('circle')
          .attr("class", "song_circle");

      // Remove out-of-scope circles
      circle
          .exit()
          .remove();
                
    }

    function brushed() {
      if (d3.event.sourceEvent && d3.event.sourceEvent.type === "zoom") return; // ignore brush-by-zoom
      s = d3.event.selection || x2.range();
      x.domain(s.map(x2.invert, x2));
      focus.select(".area").attr("d", area);
      focus.select(".axis--x").call(xAxis);
      svg.select(".zoom").call(zoom.transform, d3.zoomIdentity
        .scale(width / (s[1] - s[0]))
        .translate(-s[0], 0)
      );
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
  d3.json("viz/data/10pc_most_popular_songs_per_year.json", function(err, json){
    let st = new StretchableTimeline('timeline', json);
  });
});
