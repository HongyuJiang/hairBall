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

var accent = d3.scaleOrdinal(d3.schemeSet2);

export default {
  name:'direction-indicator',
  data () {
    return { }
  },
  methods:{
    chartInit(positions, semantic_counter){

      console.log(semantic_counter)

        d3.select("#direction-indicator").selectAll('*').remove()

        const svg = d3.select("#direction-indicator").append('svg')
          .attr("viewBox", [-50, 50, this.width, this.height * 2])
          .attr("font-size", 16)
          .attr("font-family", "sans-serif")

        function dataBin(dataList, binNum, attr){

          let min = d3.min(dataList, d => d[attr])
          let max = d3.max(dataList, d => d[attr])

          let range = (max - min) / binNum

          let dataGroup = {}

          dataList.forEach(function(d){

            let index = parseInt((d[attr] - min) / range) % (binNum) 

            if(dataGroup[index] != undefined){

              dataGroup[index]['counter'] += 1
            }
            else{
              dataGroup[index] = {}
              dataGroup[index]['value'] = min + (index * range)
              dataGroup[index]['counter'] = 1
            }
          })

          return dataGroup;
        }

        let groupDData = dataBin(positions, 32, 'angle')

        let _data = []

        for(let key in groupDData){

          _data.push(groupDData[key])
        }

        let valueMax = d3.max(_data, d => d.counter)

        let ring = svg.append('circle')
        .attr('r', 100)
        .attr('cx', 60)
        .attr('cy', this.height / 2)
        .attr('stroke', 'white')
        .attr('opacity', 0.3)
        .attr('stroke-width', 10)
        .attr('fill','none')

        let spins = svg.append('g')
        .attr('transform','translate( ' + 60 + ',' + this.height / 2 + ')')

        let radius = 105
        let barHeight = 50

        spins.selectAll('.spin')
        .data(_data)
        .enter()
        .append('line')
        .attr('x1', d => radius * Math.cos(d.value * Math.PI / 180))
        .attr('y1', d => radius * Math.sin(d.value * Math.PI / 180))
        .attr('x2', d => (radius + d.counter / valueMax * barHeight) * Math.cos(d.value * Math.PI / 180))
        .attr('y2', d => (radius + d.counter / valueMax * barHeight) * Math.sin(d.value * Math.PI / 180))
        .attr('stroke','#8D85F2')
        .attr('fill','none')
        .attr('opacity','0.5')
        .attr('stroke-width', 5)

        spins.selectAll('.spinDot')
        .data(_data)
        .enter()
        .append('circle')
        .attr('cx', d => (radius + d.counter / valueMax * barHeight) * Math.cos(d.value * Math.PI / 180))
        .attr('cy', d => (radius + d.counter / valueMax * barHeight) * Math.sin(d.value * Math.PI / 180))
        .attr('r',3)
        .attr('fill','#8D85F2')
        .attr('opacity','0.3')

        let cross = svg.append('g')

        cross.append('circle')
        .attr('cx', 60)
        .attr('cy', this.height /2)
        .attr('r', 6)
        .attr('fill', 'grey')

        cross.append('line')
        .attr('x1', 60 - 30)
        .attr('x2', 60 + 30)
        .attr('y1', this.height /2)
        .attr('y2', this.height /2)
        .attr('stroke', 'grey')

        cross.append('line')
        .attr('x1', 60)
        .attr('x2', 60)
        .attr('y1', this.height /2 - 30)
        .attr('y2', this.height /2 + 30)
        .attr('stroke', 'grey')

        cross.append('text')
        .attr('class','dir')
        .attr('x', 60 - 40)
        .attr('y', this.height /2)
        .text('西')

        cross.append('text')
        .attr('class','dir')
        .attr('x', 60 + 40)
        .attr('y', this.height /2)
        .text('东')

        cross.append('text')
        .attr('class','dir')
        .attr('x', 60)
        .attr('y', this.height /2 - 40)
        .text('北')

        cross.append('text')
        .attr('class','dir')
        .attr('x', 60)
        .attr('y', this.height /2 + 40)
        .text('南')

        cross.selectAll('.dir')
        .attr('text-anchor', 'middle')
        .attr('alignment-baseline', 'middle')
        .attr('font-family','Microsoft Yahei')
        .attr('fill', 'white')

        let group = svg.append('g')
        .attr('transform','translate(0, 400)')

        group
        .selectAll('sc')
        .data(['No semantic', 'Home','Two high','Weekend','Work time'])
        .enter()
        .append('circle')
        .attr('r', function(d,i){

           return Math.sqrt(semantic_counter['' + i])
        })
        .attr('fill', function(d,i){

          return accent(i-1)
        })
        .attr('opacity',0.7)
        .attr('cx', 30)
        .attr('cy', function(d,i){
          return i * 80
        })

        group
        .selectAll('sc')
        .data(['No semantic', 'Home','Two high','Weekend','Work time'])
        .enter()
        .append('text')
        .attr('x', 70)
        .attr('y', function(d,i){
          return i * 80
        })
        .attr('fill','white')
        .text(d => d)
    }
  },
  mounted(){

    d3.select('#' + 'direction-indicator-container')
      .style('position', 'absolute')
      .style('top', '2%')
      .style('left', '2%')
      .style('width', '17.5%')
      .style('height', '35.5%')

    this.width = 400
    this.height = 450

    let that = this

    this.$root.$on('updateDirIndicator', data => {
      this.chartInit(data.positions, data.counter)
    })

  },
}
</script>

<style scoped>

.name{
  border-left: rgb(185, 199, 230) solid 3px;
  color:white;
  padding-left:10px;
  margin-right: 10px;
  left:10px;
  float: left;
}



</style>