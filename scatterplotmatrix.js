var width = 960,
    size = 200,
    padding = 30;

var x = d3.scaleLinear()
    .range([padding / 2, size - padding / 2]);

var y = d3.scaleLinear()
    .range([size - padding / 2, padding / 2]);

var xAxis = d3.axisBottom()
    .scale(x)
    .ticks(4, "s")    ;
    //.tickFormat(d3.format(".0s"));

var yAxis = d3.axisLeft()
    .scale(y)
    .ticks(4, "s")    ;
    //.tickFormat(d3.format(".0s"));

var color = d3.scaleOrdinal(d3.schemeTableau10);

d3.csv("la-4col-sort.csv").then(function(data) {

  var domainByTrait = {},
      traits = d3.keys(data[0]).filter(function(d) { return d !== "type"; }),
      n = traits.length;

  traits.forEach(function(trait) {
    domainByTrait[trait] = d3.extent(data, function(d) { return Number(d[trait]); });
  });

  console.log(domainByTrait);

  xAxis.tickSize(size * n);
  yAxis.tickSize(-size * n);


  var svg = d3.select("#d3").append("svg")
      //.attr("width", size * n + padding * 2 + 40)
      //.attr("height", size * n + padding * 2 + 40)
      .attr("width", 960)
      .attr("height", 740)
    .append("g")
      .attr("transform", "translate(" + padding + "," + 25 + ")");

  svg.selectAll(".x.axis")
      .data(traits)
    .enter().append("g")
      .attr("class", "x axis")
      .attr("transform", function(d, i) { return "translate(" + (n - i - 1) * size + ",0)"; })
      .each(function(d) { x.domain(domainByTrait[d]); d3.select(this).call(xAxis); });

  svg.selectAll(".y.axis")
      .data(traits)
    .enter().append("g")
      .attr("class", "y axis")
      .attr("transform", function(d, i) { return "translate(0," + i * size + ")"; })
      .each(function(d) { y.domain(domainByTrait[d]); d3.select(this).call(yAxis); });

  var cell = svg.selectAll(".cell")
      .data(cross(traits, traits))
    .enter().append("g")
      .attr("class", "cell")
      .attr("transform", function(d) {
        return "translate(" + (n - d.i - 1) * size + "," + d.j * size + ")"; })
      .each(plot);

  // Titles for the diagonal.
  cell.filter(function(d) { return d.i === d.j; }).append("text")
      .attr("x", padding)
      .attr("y", padding)
      .attr("dy", ".71em")
      .text(function(d) { return d.x; });

  function plot(p) {
    var cell = d3.select(this);

    x.domain(domainByTrait[p.x]);
    y.domain(domainByTrait[p.y]);

    cell.append("rect")
        .attr("class", "frame")
        .attr("x", padding / 3)
        .attr("y", padding / 3)
        .attr("width", size - padding)
        .attr("height", size - padding);

    cell.selectAll("circle")
        .data(data)
      .enter().append("circle")
        .attr("cx", function(d) { return x(d[p.x]); })
        .attr("cy", function(d) { return y(d[p.y]); })
        .attr("r", 4)
        .style("fill", function(d) { return color(d.type); });
  }

  // title & citation
  svg.append("text")
      .attr("text-anchor", "middle")
      .attr("x", 275)
      .attr("font-size", 22)
      //.attr("y", height + margin.top + 10)
      .text("Los Angeles Area College Outcomes");

      svg.append("text")
          .attr("text-anchor", "start")
          .attr("x", 10)
          .attr("y", 650)
          .text("Source: Baseline Cross-Sectional Estimates of Child and Parent Income Distributions by College from Opportunity Insights https://opportunityinsights.org/paper/mobilityreportcards/");

  // place legend into its own group
  const group = svg.append('g').attr('id', 'circle-legend')
  .attr("transform", "translate(" + 600 + "," + 100 + ")");

  // https://d3-legend.susielu.com/#size-linear
  const legendColor = d3.legendColor()
    .scale(color)
    .shape('circle')
    .ascending(false)
    .shapePadding(4)
    .labelOffset(10)
    .labelFormat("d")
    .title('School Type')
    .orient('vertical')
    .labels(["public", "private non-profit", "for-profit"]);

  group.call(legendColor);


});

function cross(a, b) {
  var c = [], n = a.length, m = b.length, i, j;
  for (i = -1; ++i < n;) for (j = -1; ++j < m;) c.push({x: a[i], i: i, y: b[j], j: j});
  return c;
}
