// Copied from timeline script

// Peut-etre a retenir pour mettre le texte dans la tooltip (en particulier le truc foreignobject)
// https://stackoverflow.com/questions/6725288/svg-text-inside-rect

// Il y a deja une class qui fait du hover:
  // <div class="tooltip">Hover over me
    // <span class="tooltiptext">Tooltip text</span>
  // </div>


// These are specifically for use in the timeline viz.
// Any way to make this more general?

// Usage:
// elem
//   .data(data)
//   .on("mouseover", d => mouseover(focus, d))
//   .on("mouseout", d => mouseout(focus, d));

function mouseover(focus, d) {
  // hide the circle
  focus.select("#a" + d.id).attr('opacity', '0');
  
  // display a transparent rectangle to put song infos into
  focus.append('rect')
    .attr("class", "info")
    .attr("id", "r"+d.id)
    .attr("width", 300)
    .attr("height", 80)
    .attr("x", math.max(math.min(x(d.year) - 150, width - 300), 0))
    .attr("y", y(d.popularity) - 20)
    .attr("rx", 10)
    .attr("rx", 10);
  // song title
  focus.append('text')
    .attr("class", "info")
    .text(d.name)
    .attr("x", math.max(math.min(x(d.year), width - 150), 150))
    .attr("y", y(d.popularity) +10);

  // song artist
  focus.append('text')
    .attr("class", "info")
    .text(d.artists)
    .attr("x", math.max(math.min(x(d.year), width - 150), 150))
    .attr("y", y(d.popularity) + 40);
}

function mouseout(focus, d) {
  // when putting cursor away from this point, remove infos and show the circle
  focus.select("#a" + d.id).attr('opacity', '1');
  focus.selectall(".info").remove();
}
