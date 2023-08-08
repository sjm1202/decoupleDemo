import Manage from '../view/manage.vue';
import MyTestComponent from '../view/myTestComponent.vue';
import Vue from 'vue';
Vue.prototype.$test = 'test value';
Vue.component('MyTestComponent', MyTestComponent);
export default {
  Manage: Manage,   // 导出配置对象
  // Manage: Vue.extend(Manage)  // 导出VueComponent构造函数
}