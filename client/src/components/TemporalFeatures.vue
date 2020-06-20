 <template>

  <div id='temporal-features-container'>
      <div class='name'>时序特征</div>
      <div id='temporal-features'>
   
      </div>
  </div>
</template>
<script>

import * as d3 from 'd3';
import DataProvider from '../DataProvider';

export default {
  name:'temporal-features',
  data () {
    return { }
  },
  methods:{
    chartInit(cells){

        let counter = 0

        let hourGroup = {}

        let weekDGroup = {}

        let weekHourGroup = {}

        let tfs = this.temporalFeatures
        
        for(let od in tfs){

            let source = od.split('-')[0]

            if(source in cells){

                let hours = tfs[od]['hours']

                for(let hour in hours){

                    if(hour in hourGroup){
                        hourGroup[hour] += hours[hour]
                    }
                    else{
                        hourGroup[hour] = hours[hour]
                    }
                }

                let days = tfs[od]['days']

                for(let day in days){

                    let rDay = day - 2 

                    if(rDay in weekDGroup){
                        weekDGroup[rDay] += days[day]
                    }
                    else{
                        weekDGroup[rDay] = days[day]
                    }
                }

            }

        }

        let dayNames = ['Mon', 'Tue', 'Wed', 'Thu','Fri','Sat','Sun']

        let hourList = []

        let that = this

        for(let hour in hourGroup){

            let meta = {'hour': hour, 'value': hourGroup[hour]}

            hourList.push(meta)
        }

        let dayList = []

        for(let day in weekDGroup){

            let meta = {'day': dayNames[day], 'value': weekDGroup[day]}

            dayList.push(meta)
        }

        d3.select("#temporal-features").selectAll('*').remove()

        const svg = d3.select("#temporal-features").append('svg')
          .attr("viewBox", [-50, -50, this.width + 100, this.height + 100])
          .attr("font-size", 14)
          .attr("font-family", "sans-serif")

        let xHour = d3.scaleBand()
          .range([0, this.width/2.5])
          .padding(0.1);
        let yHour = d3.scaleLinear()
          .range([this.height, 0]);

        // Hour ----------
        xHour.domain(hourList.map(function(d) { return d.hour; }));
        yHour.domain([0, d3.max(hourList, function(d) { return d.value; })]);

        svg.selectAll(".hourBar")
            .data(hourList)
            .enter().append("rect")
            .attr("class", "hourBar")
            .attr("x", function(d) { return xHour(d.hour); })
            .attr("width", xHour.bandwidth())
            .attr('fill','#BFAFAC')
            .attr("y", function(d) { return yHour(d.value); })
            .attr("height", function(d) { return that.height - yHour(d.value); })
            .on('mouseover', function(d){
              d3.select(this).transition().attr('fill','#D57DE8')
            })
            .on('mouseout', function(d){
              d3.select(this).transition().attr('fill','#BFAFAC')
            })

        svg.append("g")
            .attr("transform", "translate(0," + that.height + ")")
            .call(d3.axisBottom(xHour));

        svg.append("g")
            .call(d3.axisLeft(yHour));

        // day ---------------------

        let xDay = d3.scaleBand()
          .range([0, this.width/5])
          .padding(0.2);
        let yDay = d3.scaleLinear()
          .range([this.height, 0]);

        xDay.domain(dayList.map(function(d) { return d.day; }));
        yDay.domain([0, d3.max(dayList, function(d) { return d.value; })]);

        let dayContainer = svg.append('g')
        .attr('transform', 'translate(370,0)')

        dayContainer.selectAll(".dayBar")
            .data(dayList)
            .enter().append("rect")
            .attr("class", "dayBar")
            .attr("x", function(d) { return xDay(d.day); })
            .attr("width", xDay.bandwidth())
            .attr('fill','#BFAFAC')
            .attr("y", function(d) { return yDay(d.value); })
            .attr("height", function(d) { return that.height - yDay(d.value); })
            .on('mouseover', function(d){
              d3.select(this).transition().attr('fill','#D57DE8')
            })
            .on('mouseout', function(d){
              d3.select(this).transition().attr('fill','#BFAFAC')
            })

        dayContainer.append("g")
            .attr("transform", "translate(0," + that.height + ")")
            .call(d3.axisBottom(xDay));

        dayContainer.append("g")
            .call(d3.axisLeft(yDay));


    },
    chartUpdate(SOURCE, TARGET){

        let counter = 0

        let hourGroup = {}

        let weekDGroup = {}

        let weekHourGroup = {}

        let tfs = this.temporalFeatures
        
        for(let od in tfs){

            let source = od.split('-')[0]
            let target = od.split('-')[1]

            if(source == SOURCE && target == TARGET){

                let hours = tfs[od]['hours']

                for(let hour in hours){

                    if(hour in hourGroup){
                        hourGroup[hour] += hours[hour]
                    }
                    else{
                        hourGroup[hour] = hours[hour]
                    }
                }

                let days = tfs[od]['days']

                for(let day in days){

                    let rDay = day - 2 

                    if(rDay in weekDGroup){
                        weekDGroup[rDay] += days[day]
                    }
                    else{
                        weekDGroup[rDay] = days[day]
                    }
                }

            }

        }

        let dayNames = ['Mon', 'Tue', 'Wed', 'Thu','Fri','Sat','Sun']

        let hourList = []

        let that = this

        for(let hour in hourGroup){

            let meta = {'hour': hour, 'value': hourGroup[hour]}

            hourList.push(meta)
        }

        let dayList = []

        for(let day in weekDGroup){

            let meta = {'day': dayNames[day], 'value': weekDGroup[day]}

            dayList.push(meta)
        }

        d3.select("#temporal-features").selectAll('*').remove()

        const svg = d3.select("#temporal-features").append('svg')
          .attr("viewBox", [-50, -50, this.width + 100, this.height + 100])
          .attr("font-size", 14)
          .attr("font-family", "sans-serif")

        let xHour = d3.scaleBand()
          .range([0, this.width/2.5])
          .padding(0.1);
        let yHour = d3.scaleLinear()
          .range([this.height, 0]);

        // Hour ----------
        xHour.domain(hourList.map(function(d) { return d.hour; }));
        yHour.domain([0, d3.max(hourList, function(d) { return d.value; })]);

        svg.selectAll(".hourBar")
            .data(hourList)
            .enter().append("rect")
            .attr("class", "hourBar")
            .attr("x", function(d) { return xHour(d.hour); })
            .attr("width", xHour.bandwidth())
            .attr('fill','#BFAFAC')
            .attr("y", function(d) { return yHour(d.value); })
            .attr("height", function(d) { return that.height - yHour(d.value); })
            .on('mouseover', function(d){
              d3.select(this).transition().attr('fill','#D57DE8')
            })
            .on('mouseout', function(d){
              d3.select(this).transition().attr('fill','#BFAFAC')
            })

        svg.append("g")
            .attr("transform", "translate(0," + that.height + ")")
            .call(d3.axisBottom(xHour));

        svg.append("g")
            .call(d3.axisLeft(yHour));

        // day ---------------------

        let xDay = d3.scaleBand()
          .range([0, this.width/5])
          .padding(0.2);
        let yDay = d3.scaleLinear()
          .range([this.height, 0]);

        xDay.domain(dayList.map(function(d) { return d.day; }));
        yDay.domain([0, d3.max(dayList, function(d) { return d.value; })]);

        let dayContainer = svg.append('g')
        .attr('transform', 'translate(370,0)')

        dayContainer.selectAll(".dayBar")
            .data(dayList)
            .enter().append("rect")
            .attr("class", "dayBar")
            .attr("x", function(d) { return xDay(d.day); })
            .attr("width", xDay.bandwidth())
            .attr('fill','#BFAFAC')
            .attr("y", function(d) { return yDay(d.value); })
            .attr("height", function(d) { return that.height - yDay(d.value); })
            .on('mouseover', function(d){
              d3.select(this).transition().attr('fill','#D57DE8')
            })
            .on('mouseout', function(d){
              d3.select(this).transition().attr('fill','#BFAFAC')
            })

        dayContainer.append("g")
            .attr("transform", "translate(0," + that.height + ")")
            .call(d3.axisBottom(xDay));

        dayContainer.append("g")
            .call(d3.axisLeft(yDay));


    }
  },
  mounted(){

    d3.select('#' + 'temporal-features-container')
      .style('position', 'absolute')
      .style('top', '67%')
      .style('right', '7%')
      .style('width', '90%')
      .style('height', '10%')

    this.width = 800
    this.height = 200

    let that = this

    this.$root.$on('updateTemporal', cells => {

        this.chartInit(cells)
    })

    DataProvider.getTemporalFeatures().then(response => {

        this.temporalFeatures = response.data
        
    });

    this.$root.$on('updateTemporal2', OD => {

        console.log(OD)
        this.chartUpdate(OD.SID, OD.TID)
    })

  },
}
</script>

<style scoped>

.name{
  border-left: rgb(40, 52, 78) solid 3px;
  color:black;
  padding-left:10px;
  margin-left: 20px;
  right:0px;
  float: left;
}



</style>