import Vue from "vue";
import Index from "./index.vue";

new Vue({
    el: "#app",
    components: {Index},
    render (h) {
      return h('Index')
    }
});