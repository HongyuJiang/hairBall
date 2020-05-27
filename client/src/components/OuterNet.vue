 <template>

  <div id='outer-net-container'>
      <div class='name'>推背图</div>
      <div id='outer-net'>
   
      </div>
  </div>
</template>
<script>

import * as d3 from 'd3';
import DataProvider from '../DataProvider';


export default {
  name:'outer-net',
  data () {
    return { }
  },
  methods:{
    chartInit(edges, positions){

        const svg = d3.select("#outer-net").append('svg')
          .attr("viewBox", [-50, 50, this.width, this.height])
          .attr("font-size", 16)
          .attr("font-family", "sans-serif")

        let simulation = d3.forceSimulation()
        .force("charge", d3.forceManyBody())
        //.force("link", d3.forceLink().id(function(d) { return d.id; }))
        .force("center", d3.forceCenter(this.width / 2, this.height / 2))
        

        simulation.force("charge")
        .strength(-20).distanceMax(30)

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
        .attr('stroke-opacity','0.3')
        .attr("stroke-width", function(d) { return Math.sqrt(d.weight); });

        var node = svg.append("g")
            .attr("class", "nodes")
            .selectAll("g")
            .data(nodes)
            .enter().append("g")
            
        var circles = node.append("circle")
            .attr("r", 5)
            .attr('id', d => 'node' + d.name)
            .attr("fill", 'grey')

        node.append("title")
            .text(function(d) { return d.name; });

        let linesG = svg.append('g')

        linesG.append('circle')
        .attr('r', 200)
        .attr('cx', this.width/2)
        .attr('cy', this.height/2)
        .attr('stroke', 'grey')
        .attr('stroke-width', 10)
        .attr('fill','none')

        let lines = linesG.selectAll('.line')
        .data(positions)
        .enter()
        .append('line')
        .attr('class', 'connect')
        .attr('x1', d=>svg.select('#node' + d.source).attr('cx'))
        .attr('y1', d=>svg.select('#node' + d.source).attr('cy'))
        .attr('x2', d => this.width/2 + 200 * Math.cos(d.angle * Math.PI / 180))
        .attr('y2', d => this.height/2 + 200 * Math.sin(d.angle * Math.PI / 180))
        .attr('stroke', 'black')

        function ticked() {
    
            circles
                .attr("cx", d => d.x)
                .attr("cy", d => d.y)

            lines
                .attr('x1', d=>node.select('#node' + d.source).attr('cx'))
                .attr('y1', d=>node.select('#node' + d.source).attr('cy'))
        }

        simulation
            .nodes(nodes)
            .on("tick", ticked);
        
    }
  },
  mounted(){

    d3.select('#' + 'outer-net-container')
      .style('position', 'absolute')
      .style('top', '38%')
      .style('right', '40%')
      .style('width', '55%')
      .style('height', '40%')

    this.width = 800
    this.height = 800

    let that = this

    this.$root.$on('updateOuterNet', data => {
        let edges = data[0]
        let positions = data[1]
        this.chartInit(edges,positions)
    })

  },
}
</script>

<style scoped>

.name{
  border-left: lightsalmon solid 3px;
  color:black;
  padding-left:10px;
  margin-right: 10px;
  right:0px;
  float: right;
}



</style>