<template>
  <div id="map"></div>
</template>

<script>
import DataProvider from "../DataProvider";
import * as mapboxgl from "mapbox-gl";
import * as d3 from "d3";
import "@mapbox/mapbox-gl-draw/dist/mapbox-gl-draw.css";
var MapboxDraw = require("@mapbox/mapbox-gl-draw");

export default {
  name: "mapbox-view",

  mounted() {
    this.map = "";
    this.mapInit(this);
    this.mapLoadGeojson(this);

    DataProvider.getCellRelations().then(response => {
      this.relations = response.data;
    });
  },
  methods: {
    addRegion2Map(features) {
      this.map.addSource("region_json", {
        type: "geojson",
        data: {
          type: "FeatureCollection",
          features: features.features
        }
      });

      this.map.addLayer({
        id: "region",
        type: "fill",
        source: "region_json",
        paint: {
          "fill-color": "#fff",
          "fill-opacity": 0
        },
        minzoom: 5,
        maxzoom: 20
      });

      this.map.addLayer({
        id: "region_boundry",
        type: "line",
        source: "region_json",
        paint: {
          "line-width": 2,
          "line-color": "rgba(200,0,0,0.5)"
        },
        minzoom: 5,
        maxzoom: 20
      });

      this.map.addLayer({
        id: "region-label",
        type: "symbol",
        source: "region_json",
        layout: {
          "text-field": "{name}",
          "text-size": 12
        },
        paint: {
          "text-color": "#fff"
        }
      });
    },

    mapInit(that) {
      let Draw = new MapboxDraw();

      mapboxgl.accessToken =
        "pk.eyJ1IjoiaG9uZ3l1amlhbmciLCJhIjoiY2s3N202NDIxMDhkdzNpcGg3djRtdnN4dCJ9.lysys8PBG25SxeHRF-sPvA";
      this.map = new mapboxgl.Map({
        container: "map", // container id
        style: "mapbox://styles/hongyujiang/cja855cbk09vg2spehn1ap5yo", // stylesheet location
        center: [104.849, 31.558], // starting position [lng, lat]
        zoom: 8.5 // starting zoom
      });

      this.map.addControl(Draw, "bottom-left");

      d3.selectAll(".mapboxgl-control-container").style("z-index", 9999);
    },
    mapLoadGeojson(that) {

      this.map.on("move", this.updateLines);

      this.map.on("load", function() {
        DataProvider.getMapJson().then(response => {
          that.data = response.data;
          that.addRegion2Map(that.data);
        });

        DataProvider.getCellInfo().then(response => {
          let cell_info = response.data;

          let info = {};

          for (let cell in cell_info) {
            if (cell_info[cell].id != undefined) {
              let id = cell_info[cell].id;
              info[id] = cell_info[cell];
            }
          }

          that.cell_info = info;

          that.mapAddCircle(cell_info);
        });

        that.map.on("click", function(e) {
          let points = that.points;

          let point = e.lngLat.wrap();

          let s_point = e.point;

          let ODs = { source: point, target: [] };

          that.mapAddSelection(point);

          let targetCounter = {};

          let targetCollection = []

          let sourceEntities = {}, targetEntities = {}

          let positions = []

          let graphWithoutEgo = []

          points.forEach(function(p) {

            let pos = p["geometry"]["coordinates"];

            let id = p["properties"]["id"];

            let q = that.map.project(new mapboxgl.LngLat(pos[0], pos[1]));

            let dis =
              (s_point.x - q.x) * (s_point.x - q.x) +
              (s_point.y - q.y) * (s_point.y - q.y);

            if (dis < 400) {

              let angleDeg = Math.atan2(q.y - s_point.y, q.x - s_point.x) * 180 / Math.PI;

              positions.push({'source': id, 'angle': angleDeg})

              p["properties"].selected = true;
              
              let targets = that.relations[id];

              if(targets) {

                targets.forEach(function(t){

                  targetEntities[t[0]] = 1
                })

                targetCollection.push(targets)
                
              }
              sourceEntities[id] = 1
            }

          });

          points.forEach(function(p) {

            let id = p["properties"]["id"]
          
            if(targetEntities[id] != undefined && sourceEntities[id] == undefined){

              p["properties"].size = 12;
              p["properties"].color = '#30FA74';

            }
            else if(sourceEntities[id] != undefined){

              let targets = that.relations[id];

              if(targets) {

                targets.forEach(function(t){

                  if(sourceEntities[t[0]] == undefined)
                    graphWithoutEgo.push({'source': id, 'target':t[0], 'weight': t[1]})
                })
                
              }
              
            }
          })

          console.log(graphWithoutEgo)

          that.$root.$emit('updateTemporal', sourceEntities)
          that.$root.$emit('updateDirIndicator', positions)
          that.$root.$emit('updateAssocCells', [graphWithoutEgo, that.cell_info])

          targetCollection.forEach(function(targets){

            targets.forEach(function(t) {
                  if (targetCounter[t[0]] != undefined && sourceEntities[t[0]] == undefined)
                    targetCounter[t[0]] += t[1];
                  else if (sourceEntities[t[0]] == undefined) targetCounter[t[0]] = t[1];
                });
          })

          for (let t in targetCounter) {
            let cell = that.cell_info[t];

            if (cell)
              ODs.target.push({
                lng: cell.lon,
                lat: cell.lat,
                weight: targetCounter[t]
              });
          }

          that.mapAddCurve(ODs);

          that.map.getSource("cells").setData({
            type: "FeatureCollection",
            features: points
          });
        });
      });
    },

    updateLines(d) {

      if (this.lineData != undefined) {

        let that = this

        let lineData = that.lineData;

        let OD_lines = [];

        let sp = lineData.source;

        let sPos = that.map.project(new mapboxgl.LngLat(sp.lng, sp.lat));

        lineData.target.forEach(function(p) {
          let tPos = that.map.project(new mapboxgl.LngLat(p.lng, p.lat));

          let meta = {
            sx: sPos.x,
            sy: sPos.y,
            tx: tPos.x,
            ty: tPos.y,
            weight: tPos.weight
          };

          OD_lines.push(meta);
        });

        //console.log(OD_lines);

        let curve = function(d) {
          var dx = d.tx - d.sx,
            dy = d.ty - d.sy,
            dr = Math.sqrt(dx * dx + dy * dy);
          return (
            "M" +
            d.sx +
            "," +
            d.sy +
            "A" +
            dr +
            "," +
            dr +
            " 0 0,1 " +
            d.tx +
            "," +
            d.ty
          );
        };

        let canvas = that.map.getCanvasContainer();

        let svg = d3.select(canvas).select("svg");

        let graph = svg
          .selectAll(".link")
          .data(OD_lines)
          //.enter()
          
        graph
          .attr("d", curve)
          
      }
    },

    mapAddCurve(lineData) {

      this.lineData = lineData;

      let that = this;

      let OD_lines = [];

      let sp = lineData.source;

      let sPos = that.map.project(new mapboxgl.LngLat(sp.lng, sp.lat));

      lineData.target.forEach(function(p) {
        let tPos = that.map.project(new mapboxgl.LngLat(p.lng, p.lat));

        let meta = {
          sx: sPos.x,
          sy: sPos.y,
          tx: tPos.x,
          ty: tPos.y,
          weight: p.weight
        };

        OD_lines.push(meta);
      });

      console.log(OD_lines);

      let curve = function(d) {
        var dx = d.tx - d.sx,
          dy = d.ty - d.sy,
          dr = Math.sqrt(dx * dx + dy * dy);
        return (
          "M" +
          d.sx +
          "," +
          d.sy +
          "A" +
          dr +
          "," +
          dr +
          " 0 0,1 " +
          d.tx +
          "," +
          d.ty
        );
      };

      let canvas = that.map.getCanvasContainer();

      let svg = d3
        .select(canvas)
        .append("svg")
        .style("position", "absolute")
        .attr("width", "1000px")
        .attr("height", "1080px");

      svg
        .selectAll(".link")
        .data(OD_lines)
        .enter()
        .append("path")
        .attr('class','link')
        .attr("d", curve)
        .attr("opacity", 0.4)
        .attr("fill", "none")
        .attr("stroke", "#ECEC4B")
        .attr("stroke-width", d => Math.sqrt(d.weight));
    },

    mapAddSelection(location) {
      this.map.addSource("selection", {
        type: "geojson",
        data: {
          type: "FeatureCollection",
          features: [
            {
              type: "Feature",
              geometry: {
                type: "Point",
                coordinates: [location.lat, location.lng]
              }
            },
            {
              type: "Feature",
              geometry: {
                type: "Point",
                coordinates: [location.lng, location.lat]
              }
            }
          ]
        }
      });

      this.map.addLayer({
        id: "selector",
        type: "circle",
        source: "selection",
        paint: {
          "circle-radius": 20,
          "circle-color": "#fff",
          "circle-opacity": 0.3
        }
      });
    },

    mapAddCircle(data) {
      let points = [];

      for (let cell_id in data) {
        //console.log(cell_id)

        if (data[cell_id]["id"] != undefined) {
          let cell = data[cell_id];

          let meta = {};
          meta["properties"] = {};
          if (cell.name.split("_").length > 1)
            cell.name = cell.name.split("_")[1];
          meta["properties"]["name"] = cell.name.replace("绵阳", "");
          meta["properties"]["weight"] = 1;
          meta["properties"]["size"] = 0;
          meta["properties"]["color"] = "rgba(255,255,255,0.1)";
          meta["properties"]["id"] = cell.id;
          meta["type"] = "Feature";
          meta["geometry"] = {};
          meta["geometry"]["type"] = "Point";
          meta["geometry"]["coordinates"] = [cell.lon, cell.lat];

          points.push(meta);
        } else {
          //console.log(cell_id)
        }
      }

      this.points = points;

      if (this.map.getSource("cells") != null) {
        this.map.getSource("cells").setData({
          type: "FeatureCollection",
          features: points
        });
      } else {
        this.map.addSource("cells", {
          type: "geojson",
          data: {
            type: "FeatureCollection",
            features: points
          }
        });

        this.map.addLayer({
          id: "cells-circle",
          type: "circle",
          source: "cells",
          paint: {
            "circle-radius": 2,
            "circle-color": { "type": "identity", "property": "color" },
            "circle-stroke-width": 0,
            "circle-stroke-color": "#fff"
          }
          //minzoom: 10,
        });

        this.map.addLayer({
          id: "cells-text",
          type: "symbol",
          source: "cells",
          layout: {
            "text-field": "{name}",
            // "text-font": ["DIN Offc Pro Medium", "Arial Unicode MS Bold"],
            "text-size": { "type": "identity", "property": "size" },
            "text-offset": [0, 1.2],
            "text-anchor": "top"
          },
          paint: {
            "text-color": "#fff"
          },
          minzoom: 12
        });
      }
      this.map.on("click", "wubai-circle", function(e) {
        new mapboxgl.Popup()
          .setLngLat(e.lngLat)
          .setHTML(e.features[0].properties.name)
          .addTo(that.map);
      });
    },

    mapAddMarker(cell) {
      var marker = new mapboxgl.Marker({ id: cell.name });
      marker.setLngLat([cell.lon, cell.lat]);
      //marker.setID(cell.name);
      marker.addTo(this.map);
    }
  },

  data() {
    return {
      data: [],
      loading: true
    };
  }
};
</script>

<style lang="css">
div #map {
  position: absolute;
  width: 100%;
  height: 100%;
}

body {
  margin: 0;
  padding: 0;
}
</style>