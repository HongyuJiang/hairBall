 <template>

  <div id='inner-net-container'>
      <div class='name'>河图洛书</div>
      <div id='inner-net'>
   
      </div>
  </div>
</template>
<script>

import * as d3 from 'd3';
import DataProvider from '../DataProvider';


export default {
  name:'inner-net',
  data () {
    return { }
  },
  methods:{
    chartInit(edges){

        d3.select("#inner-net").selectAll('*').remove()

        const svg = d3.select("#inner-net").append('svg')
          .attr("viewBox", [-150, 150, this.width, this.height])
          .attr("font-size", 16)
          .attr("font-family", "sans-serif")

        let simulation = d3.forceSimulation()
        .force("charge", d3.forceManyBody())
        .force("link", d3.forceLink().id(function(d) { return d.id; }))
        .force("center", d3.forceCenter(this.width / 2, this.height / 2))
        

        simulation.force("charge")
        .strength(-50).distanceMax(150)

        let IDAssigner = {}

        let newEdges = []

        let nodes = []

        edges.forEach(function(edge){

            if (IDAssigner[edge.source] == undefined) IDAssigner[edge.source] = d3.keys(IDAssigner).length
            if (IDAssigner[edge.target] == undefined) IDAssigner[edge.target] = d3.keys(IDAssigner).length

            let newEdge = {'source': IDAssigner[edge.source], 'target': IDAssigner[edge.target], 'weight': edge.weight}
            newEdges.push(newEdge)
        })

        for(node in IDAssigner){

            nodes.push({'name': node, 'id': IDAssigner[node]})
        }

        var link = svg.append("g")
        .attr("class", "links")
        .selectAll("line")
        .data(newEdges)
        .enter().append("line")
        .attr('stroke','black')
        .attr('stroke-opacity','0.1')
        .attr("stroke-width", function(d) { 
          if (d.weight > 1) return Math.sqrt(d.weight); 
          else return 0; 
        });

        var node = svg.append("g")
            .attr("class", "nodes")
            .selectAll("g")
            .data(nodes)
            .enter().append("g")
            
        var circles = node.append("circle")
            .attr("r", 5)
            .attr("fill", 'grey')

        node.append("title")
            .text(function(d) { return d.name; });

        simulation
            .nodes(nodes)
            .on("tick", ticked);

        simulation.force("link")
            .links(newEdges);

        function ticked() {
            link
                .attr("x1", function(d) { return d.source.x; })
                .attr("y1", function(d) { return d.source.y; })
                .attr("x2", function(d) { return d.target.x; })
                .attr("y2", function(d) { return d.target.y; });

            node
                .attr("transform", function(d) {
                return "translate(" + d.x + "," + d.y + ")";
                })

        }
    }
  },
  mounted(){

    d3.select('#' + 'inner-net-container')
      .style('position', 'absolute')
      .style('top', '37%')
      .style('right', '5%')
      .style('width', '55%')
      .style('height', '40%')

    this.width = 800
    this.height = 800

    let that = this

    this.$root.$on('updateInnerNet', edges => {
      this.chartInit(edges)
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
  float: right;
}



</style>