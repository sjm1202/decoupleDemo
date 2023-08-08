<template>
  <div>
    <h1 class="aaa" @click="handleClick">{{title}}</h1>
    <MyNcsComponent/>
    <MyTestComponent/>
    <button @click="handleClick">test</button>
  </div>
</template>
<script>
export default {
  components: {
    // MyTestComponent
  },
  data() {
    return {
      title: '这是webpack-test的manage页面111'
    }
  },
  mounted() {
    console.log(this, 'webpack-test manage的this')
    console.log(this.$test, 'webpack-test manage的this.$test')
    // const a = require('../subModule/new.js')
    
  },
  methods: {
    handleClick() {
      const aaa = import('../subModule/new.js').then(res => {
        console.log(res)
      });
    }
  },
}
</script>
<style>
.aaa {
  color: red;
}
</style>