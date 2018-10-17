import Vue from "vue";
import Changelog from "./changelog.vue";

new Vue({
    el: "#app",
    components: {Changelog},
    render (h) {
      return h('Changelog')
    }
});