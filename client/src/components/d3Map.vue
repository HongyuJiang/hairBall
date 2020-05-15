<template>

  <div id='map-view-container'>
      <div id='map-view'>
   
      </div>
  </div>
</template>
<script>

import * as d3 from 'd3';
import DataProvider from '../DataProvider';
import * as GL from './gradientLine.js';

export default {
  name:'d3-map',
  data () {
    return { }
  },
  methods:{
    mapInit(mapFeatures){

        const svg = d3.select("#map-view").append('svg')
          .attr("viewBox", [100, -200, this.width, this.height])
          .attr("font-size", 16)
          .attr("font-family", "sans-serif")

        var projection = d3.geoMercator()
          .center([104.717437, 31.460112])
          .scale(13000)
          .rotate([0,0]);

        const zoom = d3.zoom()
          .scaleExtent([1, 12])
          .on('zoom', zoomed);

        this.globalProjection = projection

        var path = d3.geoPath()
          .projection(projection);

        let map = svg.append('g').attr('id','mapContainer')

        map.selectAll("path")
        .data(mapFeatures.features)
        .enter()
        .append("path")
        .attr("d", path)  
        .attr("fill", "none")
        .attr("fill-opacity", 0.01)
        .attr("fill", 'white')
        .attr("stroke", "#3DD3EB")
        .attr('stroke-width', 1)
        .attr('stroke-dasharray', "5,5")

        this.map = map

        function zoomed(d) {
          let factor = d3.event.transform.k
          map.selectAll('path').attr('transform', d3.event.transform);
          map.selectAll('.cell').attr('transform', d3.event.transform).attr('r',function(d){

            let or = d3.select(this).attr('or')
            let nr = or / factor
            return nr
          })
          map.selectAll('.edge').attr('transform', d3.event.transform)
          map.selectAll('.selector').attr('transform', d3.event.transform)

        }

        map.call(zoom);
      
        let drag = d3.drag()
        .on('drag', function(d){

            d3.select(this)
            .attr('cx', d3.event.x)
            .attr('cy', d3.event.y)

        })
        .on('end', function(d){
          
          let p = d3.mouse(this)
          let x = p[0], y = p[1]
          let R = 20
          
          let selected = []

          map.selectAll('.cell')
          .attr('fill', function(q){

            let cell = d3.select(this)
            let px = cell.attr('cx')
            let py = cell.attr('cy')
            let id = cell.attr('id')

            let d1 = (px - x) * (px - x)
            let d2 = (py - y) * (py - y)

            if(d1 + d2 < R * R){

              selected.push(id)

              return 'red'
            }

            else return 'white'
          })

          d3.selectAll('.edge')
          .remove()

          that.relationsDrawing(selected)

        })

        map.on("dblclick.zoom", null);

        let that = this

        map.on('dblclick', function(d){

          let p = d3.mouse(this)

          let x = p[0], y = p[1]

          let R = 20

          map.selectAll('.selector').remove()
          
          map.append('circle')
              .attr('class', 'selector')
              .attr('r', R)
              .attr('or', 20)
              .attr('cx', p[0])
              .attr('cy', p[1])
              .attr('fill','#fff')
              .attr('fill-opacity', 0.2)
              .attr('stroke','#000')
              .attr('stroke-width', 2)
              //.call(drag)

          let selected = []

          map.selectAll('.cell')
          .attr('fill', function(q){

            let cell = d3.select(this)
            let px = cell.attr('cx')
            let py = cell.attr('cy')
            let id = cell.attr('id')

            let d1 = (px - x) * (px - x)
            let d2 = (py - y) * (py - y)

            if(d1 + d2 < R * R){

              selected.push(id)

              return 'red'
            }

            else return 'white'
          })

          that.relationsDrawing(selected)
          
        })

    },

    cellsDrawing(cellInfos){

      let map =this.map

      let projection = this.globalProjection

      let cellList = []

      let cell_info = {}

      for(let cellID in cellInfos){

        let meta = cellInfos[cellID]
        cellList.push(meta)

        let id = cellInfos[cellID]['id']

        if(id != undefined){

          cell_info[id] = cellInfos[cellID]
        }

        this.cell_info = cell_info
      
      }

      map.selectAll('.points')
        .data(cellList.filter(d => d['id'] != undefined)) //& d['name'].indexOf('MY') > -1))
        .enter()
        .append('circle')
        .attr('class','cell')
        .attr('id',d => 'node' + d['id'])
        .attr('r', 1)
        .attr('or', 1)
        .attr('fill', 'white')
        .attr('opacity', '0.1')
        .attr('stroke','none')
        .attr('cx', d => projection([d.lon, d.lat])[0])
        .attr('cy', d => projection([d.lon, d.lat])[1])

    },

    relationsDrawing(cells){

      let map = this.map

      let that = this

      let line = d3.line()
      .x(d => d.x) 
      .y(d => d.y) 
      .curve(d3.curveBasis) 

      let curve = function(d) {
        var dx = d.tx - d.sx,
            dy = d.ty - d.sy,
            dr = Math.sqrt(dx * dx + dy * dy);
        return "M" + d.sx + "," + d.sy + "A" + dr + "," + dr + " 0 0,1 " + d.tx + "," + d.ty;
      };

      let relations = this.relations

      let graph = []

      let source_finder = {}

      cells.forEach(function(cell){

        let real_id = cell.replace('node','')

        source_finder[real_id] = 1

        if (relations[real_id] != undefined){

          let links = relations[real_id]

          links.forEach(function(link){

            graph.push({'source': real_id, 'target':link[0], 'weight': link[1]})
          })

        }
      })

      let edges = []

      let positions = []

      let innerEdges = []

      let targetsInfo = []

      let graphWithoutEgo = []

      graph.forEach(function(link){

        if(!d3.select('#node' + link.source).empty()){

          let source = d3.select('#node' + link.source)
          let sx = source.attr('cx'), sy = source.attr('cy')

          if(!d3.select('#node' + link.target).empty()){

            let target = d3.select('#node' + link.target)

            let target_info = that.cell_info[link.target]

            targetsInfo.push(target_info)

            if(source_finder[link.target] == undefined){

              let tx = target.attr('cx'), ty = target.attr('cy')
              edges.push({'sx': sx, 'sy': sy, 'tx': tx, 'ty':ty, 'weight':link.weight})

              target.attr('fill', '#4AFF8B')

              let angleDeg = Math.atan2(ty - sy, tx - sx) * 180 / Math.PI;

              positions.push({'source': link.source, 'angle': angleDeg})

              graphWithoutEgo.push(link)
            }
            else{

              innerEdges.push(link)

            }
            
          }
        }

      })

      that.$root.$emit('updateDirIndicator', positions)
      that.$root.$emit('updateInnerNet', [innerEdges, that.cell_info])
      that.$root.$emit('updateAssocCells', [graphWithoutEgo, that.cell_info])
      that.$root.$emit('updateTemporal', source_finder)

      let graph_edges = map.selectAll('.link')
      .data(edges)
      .enter()
      .append('g')

      map.selectAll('.edge').remove()

      graph_edges.append('path')
      .attr('class', 'edge')
      .attr('d', curve)
      .attr('opacity','0.5')
      .attr('fill','none')
      .attr('stroke','black')
      .attr('stroke-width', d => d.weight / 5)

      var color = d3.interpolateRgb('#78FFB8', '#FF8D84');

      map.selectAll('.edge')
      .each(function(q){
        
        let path = d3.select(this).remove()

        map.selectAll("hehe")
            .data(GL.quads(GL.samples(path.node(), 8)))
          .enter().append("path")
            .attr('opacity','0.3')
            .attr('class', 'edge')
            .style("fill", function(d) { return color(d.t); })
            .style("stroke", function(d) { return color(d.t); })
            .attr("d", function(d) { return GL.lineJoin(d[0], d[1], d[2], d[3], q.weight / 5); });
      })

      

    }
  },
  mounted(){

    d3.select('#' + 'map-view-container')
      .style('position', 'absolute')
      .style('top', '5%')
      .style('left', '5%')

    this.width = 800
    this.height = 700

    let that = this

    DataProvider.getMapJson().then(response => {

          this.mapInit(response.data)

        }, error => {
            that.loading = false;
    });

    DataProvider.getCellInfo().then(response => {

        this.cellsDrawing(response.data)

        }, error => {
            that.loading = false;
    });
    
    DataProvider.getCellRelations().then(response => {

        this.relations = response.data
        
    });
    

  },
}
</script>

<style scoped>
#map-view-container{
  width:100%;
  height:70%;
}

.name{
  border-left: lightsalmon solid 3px;
  color:black;
  padding-left:10px;
  margin-right: 10px;
  right:0px;
  float: right;
}



</style>