// import 'iview/dist/styles/iview.css';
// import './assets/iview.css';
import Vue from 'vue';
import { Tooltip,Notice, Tree, Poptip, Button,ColorPicker,Input,Badge,Row,Col} from 'iview';
const m = { Tooltip,Notice, Tree, Poptip, Button,ColorPicker ,Input,Badge,Col,Row}
for (let k in m) {
    Vue.component(k, m[k]);
}
// Vue.component('Notice', Notice);
// Vue.component('Tree', Tree);
// Vue.component('Poptip', Poptip);