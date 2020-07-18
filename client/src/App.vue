<template>
  <div id="app">
    <div class="float-layer left-float-layer">
       <fixed-attr-indicator class="fixed-attrs" name='城邑地理风水沙盘'/>
       <dynamic-attr-indicator 
          name=基站数量
          value=9987
          top=130
          id = xiaqu
          class="dynamic-attrs"
        />

        <mapbox-view />
        <direction-indicator />
    </div>

    <div class="float-layer right-float-layer">
      
      <user-semantics />
      <chrod-graph />
      <temporal-features />
      
    </div>  

  </div>


</template>

<script>

import FixedAttrIndicator from './components/FixedAttrIndicator';
import DynamicAttrIndicator from './components/DynamicAttrIndicator';
import DataProvider from './DataProvider';
import d3Map from './components/d3Map.vue';
import DirectionIndicator from './components/DirectionIndicator.vue';
import InnerNet from './components/InnerNet.vue';
import HighAssocCells from './components/HighAssocCells.vue';
import TemporalFeatures from './components/TemporalFeatures.vue';
import UserSemantics from './components/UserSemantics.vue';
import MapboxView from './components/MapboxView.vue';
import ChrodGraph from './components/ChrodGraph.vue';

//连接时序特征 上 1,2 柱状图或者流图
//方向特征 中 1 玫瑰图
//高频连接基站名称 中 2 列表
//选中的基站之间的内部网络 下 1 力导向图
//选中的基站和外部连接情况 下 2 在外面画个圆  然后根据方向 节点和外面的圆画线

export default {
  name: 'App',
  components: {
    FixedAttrIndicator,
    DynamicAttrIndicator,
    MapboxView,
    DirectionIndicator,
    UserSemantics,
    TemporalFeatures,
    ChrodGraph

  },
  data () {
    return {
      bubbleData: {}
    }
  },
  mounted: function() {

  }
}
</script>

<style>
#app {
  font-family: 'Microsoft Yahei', 'Avenir', Helvetica, Arial, sans-serif;
}

.float-layer {
  position: absolute;
  z-index:999;
  height:100%;

}

.left-float-layer{

  left:0px;
  height:100%;
  width: 100%;
}

.right-float-layer{

  right:0px;
  width: 50%;
  
}


body {
    margin:0; 
    padding:0;
    width:100%;
    height:100%;
}

.chart-name{
    color:white; 
    margin-bottom:30px;
    border-top: 3px solid #F0B04D;
    background: rgba(255,255,255,0.1);
    padding:10px;
    
}

.chart-name-right{

    float:right; 
    right:0px;
    margin: 0%;
    
}

.chart-name-left{

    float:left; 
    left:10px; 
    margin: 5%;
   

}
</style>
