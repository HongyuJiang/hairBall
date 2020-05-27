 <template>

  <div id='user-semantics-container'>
      <div class='name'>羊肉串串</div>
      <div id='user-semantics'>
   
      </div>
  </div>
</template>
<script>

import * as d3 from 'd3';
import {sankey as Sankey, sankeyLinkHorizontal } from "d3-sankey";
import DataProvider from '../DataProvider';

export default {
  name:'user-semantics',
  data () {
    return { }
  },
  methods:{
    chartInit(user_semantics){

        var accent = d3.scaleOrdinal(d3.schemeSet2 );

        d3.select("#user-semantics").selectAll('*').remove()

        const svg = d3.select("#user-semantics").append('svg')
          .attr("viewBox", [-10, -10, this.width , this.height + 200])
          .attr("font-size", 14)
          .attr("font-family", "sans-serif")

        let selected = []

        for(let user in user_semantics){

            if(user_semantics[user].length > 100){

                selected.push(user_semantics[user])
            }
        }

        let user_bars = svg.selectAll('userBar')
        .data(selected.slice(0, 20))
        .enter()
        .append('g')
        .attr('transform', function(d,i){

            return 'translate(' + (i * 25) + ',0)'
        })

        user_bars.selectAll('step')
        .data(d => d)
        .enter()
        .append('circle')
        .attr('cy', function(d,i){

            return (d[0] * 24 + d[1]) * 6
        })
        .attr('r', 5)
        .attr('stroke', d => accent(d[2]))
        .attr('stroke-width', '2')
        .attr('fill', 'none')
        .attr('height', 5)
        .attr('opacity', 0.8)
        .attr('width', 10)

        svg.selectAll('legend')
        .data([-1,0,1,2,3])
        .enter()
        .append('rect')
        .attr('y', 1050)
        .attr('x', function(d,i){
            return i * 111
        })
        .attr('fill', d => accent(d))
        .attr('height', 20)
        .attr('opacity', 0.8)
        .attr('width', 20)

        svg.selectAll('legend')
        .data(['No semantic', 'Home','Two high','Weekend','Work time'])
        .enter()
        .append('text')
        .attr('y', 1100)
        .attr('font-size', 20)
        .attr('x', function(d,i){
            return i * 111
        })
        .text(d => d)

    }
  },
  mounted(){

    d3.select('#' + 'user-semantics-container')
      .style('position', 'absolute')
      .style('top', '38%')
      .style('right', '0%')
      .style('width', '30%')
      .style('height', '55%')

    this.width = 600
    this.height = 950

    let that = this

     DataProvider.getUserSemantics().then(response => {

        let trajectory = response.data

        this.chartInit(trajectory)

        console.log(123)

    });

  },
}
</script>

<style scoped>

.name{
  border-left: rgb(40, 52, 78) solid 3px;
  color:black;
  padding-left:10px;
  margin-right: 60px;
  right:20px;
  float: right;
}



</style>