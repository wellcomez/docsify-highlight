import './styles/iview.css';
import Vue from 'vue';
import { Form,FormItem ,CellGroup, Cell, Card, Tag, Tooltip, Notice, Tree, Poptip, Button, ColorPicker, Input, Badge, Row, Col, Icon, Tabs, TabPane } from 'iview';
// import './my-theme.less';
const m = { Form,FormItem, Card, CellGroup, Cell, Tag, Tooltip, Notice, Tree, Poptip, Button, ColorPicker, Input, Badge, Col, Row, Icon, Tabs, TabPane }
for (let k in m) {
    Vue.component(k, m[k]);
}
import { Switch } from 'iview';
Vue.component('i-switch', Switch);