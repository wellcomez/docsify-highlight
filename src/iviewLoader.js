// import 'iview/dist/styles/iview.css';
// import './assets/iview.css';
import Vue from 'vue';
import { Notice, Tree, Poptip, Button,ColorPicker} from 'iview';
const m = { Notice, Tree, Poptip, Button,ColorPicker }
for (let k in m) {
    Vue.component(k, m[k]);
}
// Vue.component('Notice', Notice);
// Vue.component('Tree', Tree);
// Vue.component('Poptip', Poptip);