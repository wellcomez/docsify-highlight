import './styles/iview.css';
import Vue from 'vue';
import { Tooltip, Notice, Tree, Poptip, Button, ColorPicker, Input, Badge, Row, Col, Icon, Tabs, TabPane } from 'iview';
import './my-theme.less';
const m = { Tooltip, Notice, Tree, Poptip, Button, ColorPicker, Input, Badge, Col, Row, Icon, Tabs, TabPane }
for (let k in m) {
    Vue.component(k, m[k]);
}