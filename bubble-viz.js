function whenDocumentLoaded(action) {
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", action);
  } else {
    // `DOMContentLoaded` already fired
    action();
  }
}

class PlotByMetric {
  constructor(svg_element_id, data) {
    this.data = data;
    this.svg = d3.select('#' + svg_element_id);

    // const year_range = [d3.min(data, d => d.year), d3.max(data, d => d.year)];

    // const scaleY = d3.scaleLinear()
                     // .domain(year_range)
                     // .range([0, 1500]);

    this.svg.append('rect')
            .classed('plot-background', true)
            .attr('width', 70)
            .attr('height', 1500);

    // Create Y labels
    // const label_ys = Array.from(Array(101), (elem, index) => 1920 + index);
    // this.svg.selectAll('text')
            // .data(label_ys)
            // .enter()
            // .append('text')
            // .text( d => d )
            // .attr('x', -10)
            // .attr('y', d => scaleY(d) + 5)
            // .style("font-size", "5px");

    var elem = this.svg.selectAll("g")
                       .data(data)
                       .enter()
                       .append("g");


    // Circle for each metric
    elem.append("circle")
	.attr("r", d => d.popularity / 15) // radius
	.attr("cx", 10) // position, rescaled
	// .attr("cy", d => scaleY(d.year) + 5)
	// Should come from CSS
	.attr("fill", "blue");
    
    // Title for each song
    // elem.append("text")
        // .text( d => d.name )
        // .attr('x', 40)
        // .attr('y', d => scaleY(d.year) + 5)
        // .style("font-size", "2px");
  }
}

whenDocumentLoaded(() => {

  d3.json(
    // Data contains average metric for each year
    "by_year.json",
  ).then(data => {
    let plot = new PlotByMetric("bubble-viz", data);
  });

});
