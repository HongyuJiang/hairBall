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
    chartInit(user_semantics, persons){

        var accent = d3.scaleOrdinal(d3.schemeSet2);

        d3.select("#user-semantics").selectAll('*').remove()

        const svg = d3.select("#user-semantics").append('svg')
          .attr("viewBox", [-10, -10, this.width , this.height + 200])
          .attr("font-size", 14)
          .attr("font-family", "sans-serif")
          .append('g')
          .attr('transform','translate(0,50)')

        let selected = []

        persons.forEach(function(user){

          selected.push({ 'name': user.person, 'seq': user_semantics[user.person]})
        })

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

        let user_name = svg.selectAll('.username')
        .data(selected.slice(0, 10))
        .enter()
        .append('g')
        .attr('transform',function(d,i){

          return 'translate(' + (i * 50) + ',' + 10 + ')'
        })
        .append('text')
        .attr('transform','rotate(90)')
        .attr('x',0)
        .attr('y',0)
        .text(d => d.name)

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

            return (d * 24 + d) * 10
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

            return (d.start[0] * 24 + d.start[1]) * 10
        })
        .attr('height', function(d,i){

            return (d.end[0] * 24 + d.end[1]) * 10 - (d.start[0] * 24 + d.start[1]) * 10
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
        .attr('y', 1650)
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
        .attr('y', 1700)
        .attr('font-size', 20)
        .attr('x', function(d,i){
            return i * 111
        })
        .text(d => d)

        let yHour = d3.scaleLinear()
        .range([0, this.height + 10])
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
      .style('top', '5%')
      .style('right', '0%')
      .style('width', '30%')
      .style('height', '85%')

    this.width = 600
    this.height = 1650

    let that = this

    DataProvider.getUserSemantics().then(response => {

        this.trajectory = response.data

    });

    this.$root.$on('updateUserSemantics', data => {

        let candidates = []

        let od = data.SID + '-' + data.TID

        let PODs = this.personODs

        for(let person in PODs){

          let ods = PODs[person]

          if(ods[od] != undefined){

            candidates.push({'person': person, 'count': ods[od]})
          }
        }

        candidates = candidates.sort(function(a,b){

          return b.count - a.count
        })

        candidates = candidates.slice(0,10)

        this.chartInit(this.trajectory, candidates)
    })

    DataProvider.getPersonODs().then(response => {

        this.personODs = response.data

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