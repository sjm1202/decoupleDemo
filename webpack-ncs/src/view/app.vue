<template>
  <div>
    <h1>{{title}}</h1>
    <Manage/>

  </div>
</template>
  
<script>
import Manage from './testManagePage';
import Vue from 'vue';
Vue.prototype.$ncs = 'ncs value';
import myNcsComponentVue from './myNcsComponent.vue';

export default {
  components: {
    Manage,
    myNcsComponentVue,
  },
  data() {
    return {
      title: '这是webpack-ncs的主页面'
    }
  },
  mounted() {
    console.log(this, 'webpack-ncs app的this')
  },
}
</script>