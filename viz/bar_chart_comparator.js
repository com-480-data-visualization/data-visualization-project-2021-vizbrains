function whenDocumentLoaded(action) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", action);
    } else {
      // `DOMContentLoaded` already fired
      action();
    }
}
  
/*
 ************************
 *** HELPER FUNCTIONS ***
 ************************
 */

// --- Transforms the data the way we want ---
function transform_data(data) {
    var res = []
    for (var genre in data) {
        res.push({
            genre:   genre,
            value: data[genre]
        });
    }
    return res
}

// --- add info about previous data ---
function merge_data(data, prev_data) {
    var res = []
    for(var i = 0; i < data.length; i++) {
        res.push({
            genre: data[i]["genre"],
            value: [prev_data[i]["value"], data[i]["value"]]
        });
    }
    return res
}
  
// --- Refactor translate function as it is used a lot ---
function translate(x, y) {
    return "translate(" + x + ", " + y + ")"
}

// --- One Genre = One Color ---
function colorPicker(d) {
    if (d.genre == "Blues") {
        // Violet 1
        return "#592ca1";
    } else if (d.genre == "Classical") {
        // Violet 2 
        return "#8700aa";
    } else if (d.genre == "Comedy") {
        // Violet clair
        return "#dd55fd";
    } else if (d.genre == "Country") {
        // Pastelle
        return "#ff5699";
    } else if (d.genre == "Electronic") {
        // Rouge
        return "#aa0045";
    } else if (d.genre == "Flamenco") {
        // Orange 1
        return "#ff2a2a";
    } else if (d.genre == "Folk") {
        // Orange 2
        return "#ff6600";
    } else if (d.genre == "Funk") {
        // Jaune 1
        return "#fcfb1c";
    } else if (d.genre == "Hip hop") {
        // Jaune 2
        return "#fdd42a";
    } else if (d.genre == "House") {
        // Jaune - vert
        return "#eee566";
    } else if (d.genre == "Jazz") {
        // Vert clair
        return "#c7fc04";
    } else if (d.genre == "Latin") {
        // Vert 1
        return "#00ac00";
    } else if (d.genre == "Metal") {
        // Vert 2
        return "#24d000";
    } else if (d.genre == "Pop") {
        // Vert - Bleu
        return "#65df00";
    } else if (d.genre == "R&B and soul") {
        // Bleu très clair
        return "#4cd8fb";
    } else if (d.genre == "Reggae") {
        // Bleu
        return "#0074e5";
    } else if (d.genre == "Rock") {
        // Bleu foncé
        return "#0004c8";
    } else {
        // Bleu encore plus foncé
        return "#00006c";
    }
}

/*
 *********************************************
 *** CLASS FOR THE BAR GRAPH VISUALIZATION ***
 *********************************************
 */
class BarChartComparator {
    constructor(data, genres) {
        this.data_full = data;
        this.genres = genres;
        this.year = "2001";
        
        var barChartDiv = d3.select("div#bar_chart_comparator_div")
        // Slider
        var sliderDiv = barChartDiv
            .append("div")
            .classed("slider_container", true);

        this.slider = sliderDiv.append("input")
            .classed("slider", true)
            .attr("id", "slider_year")
            .attr("type", "range")
            .attr("min", "1922")
            .attr("max", "2021")
            .attr("value", this.year);
      
        // Show the year on the side
        sliderDiv.append("text")
            .classed("sliderText", true)
            .attr("id", "text_year")
            .text(this.year);
        
        // SVG canvas
        var w = 1200,
        h = 800
        this.svg = barChartDiv
            .append("svg")
            .attr("id", "bar_chart_comparator")
            .attr("viewBox", "0 0 " + w + " " + h)
            .attr("width", "80%")
            .attr("height", "80%")
            .style("margin-top", "0")
            .style("margin-bottom", "0");
        
        var margin = 200
        this.width = w - margin
        this.height = h - margin

        // transform data as we want and keep i
        var fitting_data = transform_data(this.data_full[this.year])
        // no previous data, so instantiate it as 0s
        // (deep copy first)
        var prev_data = JSON.parse(JSON.stringify(fitting_data))
        prev_data.map(elem => elem.value = 0)
        // merging both
        var merged_data = merge_data(fitting_data,prev_data)
        this.draw(merged_data);
    }

    draw(merged_data) {
        this.svg.append("text")
            .attr("class", "chart_title")
            .attr("transform", translate(this.width/2,0))
            .attr("x", 50)
            .attr("y", 50)
            .attr("font-size", "30px")
            .text("Genres popularity in " + this.year)

        // Define scales for the x-axis and y-axis
        var xScale = d3.scaleBand().range([0, this.width]).padding(0.4),
        yScale = d3.scaleLinear().range([this.height, 0]);

        // Add a group element to our SVG, as we will add our axes and bars to the group element. 
        // We add a transform attribute to position our graph with some margin.
        this.g = this.svg.append("g")
            .attr("transform", translate(100,100));

        xScale.domain(this.genres);
        yScale.domain([0, 100]);
        
        this.g.append("g")
            .attr("transform", translate(0,this.height))
            .call(d3.axisBottom(xScale))
            .append("text")
            .attr("y", this.height/12)
            .attr("x", this.width/2 - 20)
            .attr("font-size", "15px")
            .text("Genre");

        this.g.append("g")
            .call(d3.axisLeft(yScale).tickFormat(function(d){
                return d + "%";
            })
            .ticks(10))
            .append("text")
            .attr("transform", "rotate(-90)")
            .attr("y", -this.height/12)
            .attr("x", -this.width/4 - 50)
            .attr("font-size", "15px")
            .text("Popularity");

        // `this.height` now working inside the function (SVGAnimatedLength)
        var h = this.height
        this.g.selectAll(".bar")
            .data(merged_data)
            .enter().append("rect")
            .attr("class", "bar")
            .attr("x", function(d) { return xScale(d.genre); })
            .attr("y", function(d) { return yScale(d.value[0]); })
            // call the color picker to get the fill.
            .style("fill", function(d) { return colorPicker(d); })
            .attr("width", xScale.bandwidth())
            .attr("height", function(d) { 
                return h - yScale(d.value[0]); })
            .transition()
            .duration(2000)
            .attr("y", function(d) { return yScale(d.value[1]); })
            .attr("height", function(d) { 
                return h - yScale(d.value[1]); })
    };

}


whenDocumentLoaded(() => {
    var genres = [
        'Blues',
        'Classical',
        'Comedy',
        'Country',
        'Electronic',
        'Flamenco',
        'Folk',
        'Funk',
        'Hip hop',
        'House',
        'Jazz',
        'Latin',
        'Metal',
        'Pop',
        'R&B and soul',
        'Reggae',
        'Rock',
        'Other'
    ];

    const data_in = "viz/data/top_genres_per_year.json";

    d3.json(data_in, function(err, data){
        if (err) {
            throw err;
        }

        let bar_chart = new BarChartComparator(data, genres);
  
        // --- What to do when slider is changed ---
        bar_chart.slider.on("input", function() {
            // keeping previous data (for smooth transitioning)
            var prev_data = bar_chart.data_full
            var prev_year = bar_chart.year
            prev_data = transform_data(prev_data[prev_year])
            // new data
            const year = this.value;
            d3.select("#text_year").text(year);
            bar_chart.year = year.toString();
            var fitting_data = transform_data(bar_chart.data_full[bar_chart.year])
            // merged data (can't use the function : "undefined object")
            var merged_data = merge_data(fitting_data, prev_data)

            // remove previous bars
            bar_chart.g.selectAll(".bar")
                .remove()
                .exit()
            // remove chart title
            bar_chart.svg.selectAll(".chart_title")
                .remove()
            bar_chart.draw(merged_data);
        });
    });
  });