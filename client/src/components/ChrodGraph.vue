 <template>
  <div id="chord-graph-container">
    <div class="name">连山易水</div>
    <div id="chord-graph"></div>
  </div>
</template>
<script>

import * as d3 from "d3";
import DataProvider from "../DataProvider";

export default {
  name: "chord-graph",
  data() {
    return {};
  },
  methods: {
    chartInit(links, cell_info) {
      d3.select("#chord-graph")
        .selectAll("*")
        .remove();

      const color = d3.scaleOrdinal(d3.schemeCategory10);
      let that = this;

      const svg = d3
        .select("#chord-graph")
        .append("svg")
        .attr("viewBox", [-10, -10, this.width + 100, this.height + 100])
        .attr("font-size", 14)
        .attr("font-family", "sans-serif")

      links = links.sort(function(a, b) {
        return b.weight - a.weight;
      });

      links = links.slice(0, 50);

      let indexByName = {};
      let nameByIndex = {};

      let newEdges = [];

      let nodes = [];

      let matrix = []

      links.forEach(function(edge) {
        if (
          edge.weight > 1 &&
          cell_info[edge.source] != undefined &&
          cell_info[edge.target] != undefined
        ) {
          if (indexByName[edge.source] == undefined)
            indexByName[edge.source] = d3.keys(indexByName).length;
          if (indexByName[edge.target] == undefined)
            indexByName[edge.target] = d3.keys(indexByName).length;
        }
      });

      for(let head in indexByName){
          nameByIndex[indexByName[head]] = head
      }

      for(let i =0;i < d3.keys(indexByName).length;i++){
          matrix.push([])
          for(let j =0;j < d3.keys(indexByName).length;j++){
              matrix[i].push(0)
        }
      }

      links.forEach(function(edge) {
        if (
          edge.weight > 1 &&
          cell_info[edge.source] != undefined &&
          cell_info[edge.target] != undefined
        ) {
          let source_id = indexByName[edge.source]
          let target_id = indexByName[edge.target]
          matrix[source_id][target_id] += 1
        }
      });

      let outerRadius = Math.min(this.width, this.height) * 0.5;

      let innerRadius = outerRadius - 124;

      let ribbon = d3.ribbon().radius(innerRadius);

      let arc = d3
        .arc()
        .innerRadius(innerRadius)
        .outerRadius(innerRadius + 20);

      let chord = d3
        .chord()
        .padAngle(0.04)
        .sortSubgroups(d3.descending)
        .sortChords(d3.descending);

      const chords = chord(matrix);

      const group = svg
        .append("g")
        .attr("transform",'translate(' + outerRadius + ',' + (outerRadius - 30) + ')')
        .selectAll("g")
        .data(chords.groups)
        .enter()
        .append("g")
    
      group
        .append("path")
        .attr("fill", d => color(d.index))
        .attr("stroke", d => color(d.index))
        .attr("d", arc);

      group
        .append("text")
        .each(d => {
          d.angle = (d.startAngle + d.endAngle) / 2;
        })
        .attr("dy", ".35em")
        .attr('font-size', 12)
        .attr(
          "transform",
          d => `
        rotate(${(d.angle * 180) / Math.PI - 90})
        translate(${innerRadius + 26})
        ${d.angle > Math.PI ? "rotate(180)" : ""}
      `
        )
        .attr("text-anchor", d => (d.angle > Math.PI ? "end" : null))
        .attr("fill", 'white')
        .text(d => cell_info[nameByIndex[d.index]].name.slice(0,5));

      svg
        .append("g")
        .attr("transform",'translate(' + outerRadius + ',' + (outerRadius - 30) + ')')
        .attr("fill-opacity", 0.67)
        .selectAll("path")
        .data(chords)
        .enter()
        .append("path")
        .on('click', function(d){

            let meta  = {'SID': nameByIndex[d.source.index], "TID": nameByIndex[d.target.index]}
              that.$root.$emit('updateTemporal2', meta)
              that.$root.$emit('updateUserSemantics', meta)
            
         })
        .attr("fill", d => color(d.source.index))
        .attr("d", ribbon);
    }
  },
  mounted() {
    d3.select("#" + "chord-graph-container")
      .style("position", "absolute")
      .style("top", "3%")
      .style("right", "20%")
      .style("width", "80%")
      .style("height", "65%");

    this.width = 700;
    this.height = 700;

    let that = this;

   this.$root.$on("updateAssocCells", data => {
      let links = data[0];
      let cell_info = data[1];
      this.chartInit(links, cell_info);
    });
  }
};
</script>

<style scoped>
.name {
  border-left: rgb(185, 199, 230) solid 3px;
  color: white;
  padding-left: 10px;
  margin-left: 50px;
  right: 0px;
  float: left;
}
</style>