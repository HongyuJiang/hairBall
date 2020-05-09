 <template>

  <div id='direction-indicator-container'>
      <div class='name'>风水八卦</div>
      <div id='direction-indicator'>
   
      </div>
  </div>
</template>
<script>

import * as d3 from 'd3';
import DataProvider from '../DataProvider';


export default {
  name:'direction-indicator',
  data () {
    return { }
  },
  methods:{
    chartInit(positions){

        d3.select("#direction-indicator").selectAll('*').remove()

        const svg = d3.select("#direction-indicator").append('svg')
          .attr("viewBox", [-50, 50, this.width, this.height])
          .attr("font-size", 16)
          .attr("font-family", "sans-serif")

        console.log(positions)

        let ring = svg.append('circle')
        .attr('r', 100)
        .attr('cx', this.width / 2)
        .attr('cy', this.height / 2)
        .attr('stroke', 'black')
        .attr('opacity', 0.3)
        .attr('stroke-width', 10)
        .attr('fill','none')

        let spins = svg.append('g')
        .attr('transform','translate( ' + this.width /2 + ',' + this.height / 2 + ')')

        let radius = 100
        let outerRadius = 120

        spins.selectAll('.spin')
        .data(positions)
        .enter()
        .append('line')
        .attr('x1', d => radius * Math.cos(d.angle * Math.PI / 180))
        .attr('y1', d => radius * Math.sin(d.angle * Math.PI / 180))
        .attr('x2', d => outerRadius * Math.cos(d.angle * Math.PI / 180))
        .attr('y2', d => outerRadius * Math.sin(d.angle * Math.PI / 180))
        .attr('stroke','black')
        .attr('fill','none')
        .attr('opacity','0.3')
        .attr('stroke-width', 2)

        spins.selectAll('.spinDot')
        .data(positions)
        .enter()
        .append('circle')
        .attr('cx', d => outerRadius * Math.cos(d.angle * Math.PI / 180))
        .attr('cy', d => outerRadius * Math.sin(d.angle * Math.PI / 180))
        .attr('r',3)
        .attr('fill','#8D85F2')
        .attr('opacity','0.3')

        let cross = svg.append('g')

        cross.append('circle')
        .attr('cx', this.width /2)
        .attr('cy', this.height /2)
        .attr('r', 10)
        .attr('fill', 'grey')

        cross.append('line')
        .attr('x1', this.width /2 - 30)
        .attr('x2', this.width /2 + 30)
        .attr('y1', this.height /2)
        .attr('y2', this.height /2)
        .attr('stroke', 'black')

        cross.append('line')
        .attr('x1', this.width /2)
        .attr('x2', this.width /2)
        .attr('y1', this.height /2 - 30)
        .attr('y2', this.height /2 + 30)
        .attr('stroke', 'black')

        cross.append('text')
        .attr('class','dir')
        .attr('x', this.width /2 - 40)
        .attr('y', this.height /2)
        .text('西')

        cross.append('text')
        .attr('class','dir')
        .attr('x', this.width /2 + 40)
        .attr('y', this.height /2)
        .text('东')

        cross.append('text')
        .attr('class','dir')
        .attr('x', this.width /2)
        .attr('y', this.height /2 - 40)
        .text('北')

        cross.append('text')
        .attr('class','dir')
        .attr('x', this.width /2)
        .attr('y', this.height /2 + 40)
        .text('南')

        cross.selectAll('.dir')
        .attr('text-anchor', 'middle')
        .attr('alignment-baseline', 'middle')
        .attr('font-family','Microsoft Yahei')
    }
  },
  mounted(){

    d3.select('#' + 'direction-indicator-container')
      .style('position', 'absolute')
      .style('top', '5%')
      .style('right', '5%')
      .style('width', '35%')
      .style('height', '35%')

    this.width = 400
    this.height = 450

    let that = this

    this.$root.$on('updateDirIndicator', positions => {
      this.chartInit(positions)
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