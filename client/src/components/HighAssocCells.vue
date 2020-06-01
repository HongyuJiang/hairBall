 <template>

  <div id='high-assoc-cells-container'>
      <div class='name'>连山易水</div>
      <div id='high-assoc-cells'>
   
      </div>
  </div>
</template>
<script>

import * as d3 from 'd3';
import {sankey as Sankey, sankeyLinkHorizontal } from "d3-sankey";
import DataProvider from '../DataProvider';

export default {
  name:'high-assoc-cells',
  data () {
    return { }
  },
  methods:{
    chartInit(links, cell_info){

        d3.select("#high-assoc-cells").selectAll('*').remove()

        let color = function(){
            const color = d3.scaleOrdinal(d3.schemeCategory10);
            return d => color(d.category === undefined ? d.name : d.category);
         }

        const svg = d3.select("#high-assoc-cells").append('svg')
          .attr("viewBox", [-10, -10, this.width + 100, this.height + 100])
          .attr("font-size", 14)
          .attr("font-family", "sans-serif")

        links = links.sort(function(a,b){

            return b.weight - a.weight
        })

        links = links.slice(0,25)

        let IDAssigner = {}

        let newEdges = []

        let nodes = []

        links.forEach(function(edge){

            if (edge.weight > 1){

                if (IDAssigner[edge.source] == undefined) IDAssigner[edge.source] = d3.keys(IDAssigner).length
                if (IDAssigner[edge.target] == undefined) IDAssigner[edge.target] = d3.keys(IDAssigner).length

                let newEdge = {'source': IDAssigner[edge.source], 'target': IDAssigner[edge.target], 'value': edge.weight}
                newEdges.push(newEdge)
            }
           
        })

        for(let node in IDAssigner){

            nodes.push({'name': cell_info[node].name, 'id': IDAssigner[node]})
        }

        let sankey = Sankey()
            .nodeSort(null)
            .linkSort(null)
            .nodeWidth(8)
            .nodePadding(5)
            .extent([[0, 5], [this.width, this.height - 5]])

        const {_nodes, _links} = sankey({
            nodes: nodes,
            links: newEdges
        });

        let that = this

        svg.append("g")
            .selectAll("rect")
            .data(nodes)
            .enter()
            .append("rect")
            .attr("x", d => d.x0)
            .attr("y", d => d.y0)
            .attr("height", d => d.y1 - d.y0)
            .attr("width", d => d.x1 - d.x0)
            .on('mouseover', function(d){

              let sourceId = d.id

              svg.selectAll('.river')
              .transition()
              .attr('stroke', function(q){

                if (sourceId == q.source.id || sourceId == q.target.id)
                  return "red"
                else return 'grey'
              })
            })
            .on('mouseout', d=>{

              svg.selectAll('.river')
              .transition()
              .attr('stroke', 'grey')
            })

        svg.append("g")
            .attr("fill", "none")
            .selectAll("g")
            .data(newEdges)
            .enter()
            .append("path")
            .attr('class','river')
            .attr("d", sankeyLinkHorizontal())
            .attr("stroke", 'grey')
            .attr("stroke-opacity", '0.3')
            .attr("stroke-width", d => d.width)
            .style("mix-blend-mode", "multiply")
            
        svg.append("g")
            .style("font", "16px sans-serif")
            .selectAll("text")
            .data(nodes)
            .enter()
            .append("text")
            .attr('font-family', 'Microsoft Yahei')
            .attr("x", d => d.x0 < that.width / 2 ? d.x1 + 6 : d.x0 - 6)
            .attr("y", d => (d.y1 + d.y0) / 2)
            .attr("dy", "0.35em")
            .attr("text-anchor", d => d.x0 < that.width / 2 ? "start" : "end")
            .text(d => d.name)
            .append("tspan")
            .attr("fill-opacity", 0.7)
            .text(d => ` ${d.value.toLocaleString()}`);


    }
  },
  mounted(){

    d3.select('#' + 'high-assoc-cells-container')
      .style('position', 'absolute')
      .style('top', '5%')
      .style('right', '35%')
      .style('width', '60%')
      .style('height', '65%')

    this.width = 700
    this.height = 700

    let that = this

    this.$root.$on('updateAssocCells', data => {

        let links = data[0]
        let cell_info = data[1]
        this.chartInit(links, cell_info)
    })

  },
}
</script>

<style scoped>

.name{
  border-left: rgb(40, 52, 78) solid 3px;
  color:black;
  padding-left:10px;
  margin-right: 10px;
  right:0px;
  float: left;
}



</style>