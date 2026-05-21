import "./style.css";
import * as d3 from "d3";

const datasets = {
  videoGame: {
    title: "Video Game Sales",
    desc: "Top 100 Most Sold Video Games Grouped by Platform",
    url: "https://cdn.freecodecamp.org/testable-projects-fcc/data/tree_map/video-game-sales-data.json",
  },
  movies: {
    title: "Movie Sales",
    desc: "Top 100 Highest Grossing Movies Grouped By Genre",
    url: "https://cdn.freecodecamp.org/testable-projects-fcc/data/tree_map/movie-data.json",
  },
  kickStarter: {
    title: "Kickstarter Pledges",
    desc: "Top 100 Most Pledged Kickstarter Campaigns Grouped By Category",
    url: "https://cdn.freecodecamp.org/testable-projects-fcc/data/tree_map/kickstarter-funding-data.json",
  },
};
const defaultDataset = "videoGame";

const initRender = () => {
  d3.select("#app").html(
    `<div class="options">
      <a href="?data=videoGame" class="option-link">Video Game Data Set</a> |
      <a href="?data=movies" class="option-link">Movies Data Set</a> |
      <a href="?data=kickStarter" class="option-link">Kickstarter Data Set</a>
    </div>
    <h1 id="title"></h1>
    <p id="description"></p>
    <svg id="chart"></svg>
    <svg id="legend"></svg>
    <div id="tooltip"></div>`,
  );
};

const renderChart = () => {
  //get dataset query from URL
  const query = new URLSearchParams(window.location.search);
  const dataset = datasets[query.get("data") || defaultDataset];

  //set title and description
  d3.select("#title").text(dataset.title);
  d3.select("#description").text(dataset.desc);

  //initialize tooltip
  const tooltip = d3.select("#tooltip");
  tooltip.style("opacity", 0);

  //define chart and dimensions
  const width = 960;
  const height = 570;
  const chart = d3.select("#chart").attr("width", width).attr("height", height);

  //define treemap
  const treemap = d3.treemap().size([width, height]).paddingInner(1);

  //get data
  d3.json(dataset.url)
    .then((data) => {
      //create treemap root
      const root = d3
        .hierarchy(data)
        .sum((d) => d.value)
        .sort((a, b) => b.value - a.value); //sort descending
      treemap(root);

      //create colorScale
      const colorScale = d3.scaleOrdinal().range(
        //schemeCategory20 (deprecated, hence copying)
        [
          "#1f77b4",
          "#aec7e8",
          "#ff7f0e",
          "#ffbb78",
          "#2ca02c",
          "#98df8a",
          "#d62728",
          "#ff9896",
          "#9467bd",
          "#c5b0d5",
          "#8c564b",
          "#c49c94",
          "#e377c2",
          "#f7b6d2",
          "#7f7f7f",
          "#c7c7c7",
          "#bcbd22",
          "#dbdb8d",
          "#17becf",
          "#9edae5",
        ].map((c) => d3.interpolateRgb(c, "#fff")(0.2)),
      );

      //set the treemap
      const tile = chart
        .append("g")
        .selectAll("g")
        .data(root.leaves())
        .join("g")
        .attr("transform", (d) => `translate(${d.x0}, ${d.y0})`)
        .on("mousemove", function (e) {
          const hoveredItem = d3.select(this);
          const d = hoveredItem.datum();

          tooltip
            .attr("data-value", d.value)
            .style("left", e.pageX + 16 + "px")
            .style("top", e.pageY - 26 + "px")
            .style("opacity", 0.9)
            .html(
              `Name: ${d.data.name}
              <br>
              Category: ${d.data.category}
              <br>
              Value: ${d.value}`,
            );
        })
        .on("mouseout", function (e) {
          tooltip.style("opacity", 0);
        });

      tile
        .append("rect")
        .attr("class", "tile")
        .attr("data-name", (d) => d.data.name)
        .attr("data-category", (d) => d.data.category)
        .attr("data-value", (d) => d.value)
        .attr("width", (d) => d.x1 - d.x0)
        .attr("height", (d) => d.y1 - d.y0)
        .style("fill", (d) => colorScale(d.data.category));

      //labels
      tile
        .append("text")
        .style("font-size", "0.675rem")
        .selectAll("tspan")
        .data((d) => d.data.name.split(/(?=[A-Z][^A-Z])/g))
        .join("tspan")
        .attr("x", 2)
        .attr("y", (d, i) => 10 + i * 10)
        .text((d) => d);

      //create legend
      const legendWidth = 500;
      const legendHeight = 210;
      let row = 0;

      const legend = d3
        .select("#legend")
        .attr("width", legendWidth)
        .attr("height", legendHeight)
        .append("g")
        .attr("transform", `translate(30, -8)`)
        .selectAll("g")
        .data(colorScale.domain())
        .join("g");

      //legend squares
      legend
        .append("rect")
        .attr("class", "legend-item")
        .attr("width", 16)
        .attr("height", 16)
        .attr("x", (d, i) => ((i % 3) * legendWidth) / 3)
        .attr("y", (d, i) => {
          if (i % 3 === 0) row++;
          return row * 26;
        })
        .style("fill", (d) => colorScale(d));

      row = 0; //reset the rows for reuse in labels

      //legend labels
      legend
        .append("text")
        .attr("x", (d, i) => ((i % 3) * legendWidth) / 3 + 20)
        .attr("y", (d, i) => {
          if (i % 3 === 0) row++;
          return row * 26;
        })
        .attr("dy", 14)
        .style("fill", "black")
        .text((d) => d);
    })
    .catch((err) => {
      console.log(err);
    });
};

d3.select(document).on("DOMContentLoaded", function () {
  initRender();
  renderChart();
});
