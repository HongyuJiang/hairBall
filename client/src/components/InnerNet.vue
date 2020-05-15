 <template>
  <div id="inner-net-container">
    <div class="name">河图洛书</div>
    <div id="tooltip" class="hidden">
        <p>
          <strong>Cell address</strong>
        </p>
        <p>
          <span id="value">100</span>
        </p>
      </div>
    <div id="inner-net">
      
    </div>
  </div>
</template>
<script>
import * as d3 from "d3";
import DataProvider from "../DataProvider";

export default {
  name: "inner-net",
  data() {
    return {};
  },
  methods: {
    chartInit(edges) {
      d3.select("#inner-net")
        .selectAll("*")
        .remove();

      const svg = d3
        .select("#inner-net")
        .append("svg")
        .attr("viewBox", [-150, 150, this.width, this.height])
        .attr("font-size", 16)
        .attr("font-family", "sans-serif");

      let simulation = d3
        .forceSimulation()
        .force("charge", d3.forceManyBody())
        .force(
          "link",
          d3.forceLink().id(function(d) {
            return d.id;
          })
        )
        .force("center", d3.forceCenter(this.width / 2, this.height / 2));

      simulation
        .force("charge")
        .strength(-50)
        .distanceMax(150);

      let IDAssigner = {};

      let newEdges = [];

      let nodes = [];

      edges.forEach(function(edge) {
        if (IDAssigner[edge.source] == undefined)
          IDAssigner[edge.source] = d3.keys(IDAssigner).length;
        if (IDAssigner[edge.target] == undefined)
          IDAssigner[edge.target] = d3.keys(IDAssigner).length;

        let newEdge = {
          source: IDAssigner[edge.source],
          target: IDAssigner[edge.target],
          weight: edge.weight
        };
        newEdges.push(newEdge);
      });

      for (node in IDAssigner) {
        nodes.push({ name: node, id: IDAssigner[node] });
      }

      var link = svg
        .append("g")
        .attr("class", "links")
        .selectAll("line")
        .data(newEdges)
        .enter()
        .append("line")
        .attr("stroke", "black")
        .attr("stroke-opacity", "0.1")
        .attr("stroke-width", function(d) {
          if (d.weight > 1) return Math.sqrt(d.weight);
          else return 0;
        });

      nodes.forEach(function(d) {
        d.degree = 0;
      });

      newEdges.forEach(function(d) {
        nodes[d.source].degree += 1;
        nodes[d.target].degree += 1;
      });

      var node = svg
        .append("g")
        .attr("class", "nodes")
        .selectAll("g")
        .data(nodes)
        .enter()
        .append("g");

      let that = this

      var circles = node
        .append("circle")
        .attr("r", d => Math.sqrt(d.degree))
        .attr("fill", "white")
        .attr('stroke','grey')
        .attr('stroke-width','2')
        .on("mouseover", function(d) {
          
          let info = that.cell_info[d.name]
          var xPosition = 230;
          var yPosition = 250;

          d3.select("#tooltip")
            .style("left", xPosition + "px")
            .style("top", yPosition + "px")
            .select("#value")
            .text(info.name);

          d3.select("#tooltip").classed("hidden", false);
        })
        .on("mouseout", function() {

					d3.select("#tooltip").classed("hidden", true);

			  })

      simulation.nodes(nodes).on("tick", ticked);

      simulation.force("link").links(newEdges);

      function ticked() {
        link
          .attr("x1", function(d) {
            return d.source.x;
          })
          .attr("y1", function(d) {
            return d.source.y;
          })
          .attr("x2", function(d) {
            return d.target.x;
          })
          .attr("y2", function(d) {
            return d.target.y;
          });

        node.attr("transform", function(d) {
          return "translate(" + d.x + "," + d.y + ")";
        });
      }
    }
  },
  mounted() {
    d3.select("#" + "inner-net-container")
      .style("position", "absolute")
      .style("top", "37%")
      .style("right", "5%")
      .style("width", "55%")
      .style("height", "40%");

    this.width = 800;
    this.height = 800;

    let that = this;

    this.$root.$on("updateInnerNet", data => {

      let edges = data[0]
      that.cell_info = data[1]
      this.chartInit(edges);
    });
  }
};
</script>

<style scoped>
.name {
  border-left: rgb(40, 52, 78) solid 3px;
  color: black;
  padding-left: 10px;
  margin-right: 10px;
  right: 0px;
  float: right;
}

#tooltip {
  position: absolute;
  width: 280px;
  height: auto;
  padding: 10px;
  background-color: white;
  -webkit-border-radius: 10px;
  -moz-border-radius: 10px;
  border-radius: 10px;
  -webkit-box-shadow: 4px 4px 10px rgba(0, 0, 0, 0.4);
  -moz-box-shadow: 4px 4px 10px rgba(0, 0, 0, 0.4);
  box-shadow: 4px 4px 10px rgba(0, 0, 0, 0.4);
  pointer-events: none;
}

#tooltip.hidden {
  display: none;
}

#tooltip p {
  margin: 0;
  font-family: "Microsoft Yahei";
  font-size: 12px;
  line-height: 20px;
}
</style>