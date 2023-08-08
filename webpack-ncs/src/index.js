import _ from 'lodash';
import './style.css';
import * as services from './services.js';
import Vue from 'vue';
import App from './view/app.vue';
import MyNcsComponent from './view/myNcsComponent.vue';
Vue.$ncs = Vue.prototype.$ncs = 'ncs value';
Vue.component('MyNcsComponent', MyNcsComponent);

new Vue({
  el: '#root',
  render: (h) => h(App),
  // template: '<App/>',
  // components: {
  //   App,
  // }
})





// function component() {
//   const element = document.createElement('div');
//   const btn1 = document.createElement('button');
//   const btn2 = document.createElement('button');

//   btn1.innerHTML = 'handleRequest';
//   btn1.onclick = services.handleRequest;
//   btn2.innerHTML = 'jump to cicd';
//   btn2.onclick = () => {
//     window.open('/cicd')
//   };

//   element.appendChild(btn1);
//   element.appendChild(btn2);
//   return element;
// }

// document.body.appendChild(component());