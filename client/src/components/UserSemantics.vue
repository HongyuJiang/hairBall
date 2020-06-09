 <template>

  <div id='user-semantics-container'>
      <div class='name'>用户甘特图</div>
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

                selected.push({ 'name': user, 'seq': user_semantics[user]})
            }
        }

        let segments = {}
        let segments_list = []

        selected.forEach(function(userSeq){

          let name = userSeq.name
          let seq = userSeq.seq

          segments[name] = []

          for(let i =0; i < seq.length - 1;i++){

            let meta = {'start': seq[i], 'end': seq[i+1]}

            //if(seq[i+1][0] < 3)
              segments[name].push(meta)
          }
        })

        for(let user in segments){

          segments_list.push(segments[user])
        }

        let user_bars = svg.selectAll('userBar')
        .data(segments_list.slice(0, 10))
        .enter()
        .append('g')
        .attr('transform', function(d,i){

            return 'translate(' + (i * 50 - 10) + ',0)'
        })

        user_bars.selectAll('back')
        .data([0,1,2,3,4,5])
        .enter()
        .append('rect')
        .attr('x', 0)
        .attr('y', function(d,i){

            return (d * 24 + d) * 6
        })
        .attr('height', function(d,i){

            return 24 * 12
        })
        .attr('width', 30)
        .attr('fill','grey')
        .attr('stroke-width', '0')
        .attr('opacity', 0.1)

        user_bars.selectAll('step')
        .data(d => d.filter(q => q.start[2] != -1))
        .enter()
        .append('rect')
        .attr('x', 0)
        .attr('y', function(d,i){

            return (d.start[0] * 24 + d.start[1]) * 6
        })
        .attr('height', function(d,i){

            return (d.end[0] * 24 + d.end[1]) * 6 - (d.start[0] * 24 + d.start[1]) * 6
        })
        .attr('width', 30)
        .attr('fill', d => accent(d.start[2]))
        .attr('stroke-width', '1')
        .attr('stroke', 'white')
        .attr('opacity', 0.8)

           
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

        let yHour = d3.scaleLinear()
        .range([0, this.height + 100])
        .domain([0, 24 * 7])

        let hourAxisG = svg.append('g')
        .attr('transform', 'translate(500,0)')
        .call(d3.axisRight(yHour));

        hourAxisG.selectAll('text')
        .attr('font-size', 18)

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