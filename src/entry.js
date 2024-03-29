import Panel from './components/Panel.vue'
import NoteMenu from './components/NoteMenu.vue'
// import TocNote from './components/TocNote.vue'
import Bubbling from './components/Bubbling.vue'
import SvgButton from './components/SvgButton.vue'
import PopSvgButton from './components/PopSvgButton.vue'
import NoteMarker from './components/NoteMarker.vue'
import TocOutLine from './components/TocOutLine.vue'
import BookMarks from './components/BookMarks.vue'
import NoteBookmark from './components/NoteBookMark.vue'
import TocHtml from './components/TocHtml.vue'
import ExportHtml from './components/ExportHtml.vue'
import hlinit from './hl';
import { registComponet } from './utils'
import Vue from 'vue';
import Vue2TouchEvents from 'vue2-touch-events'
import VueLazyload from 'vue-lazyload'
Vue.use(Vue2TouchEvents)
Vue.use(VueLazyload)
import less from'less'
Vue.use(less)
import './iviewLoader'
let component = { ExportHtml,TocHtml, NoteBookmark, NoteMarker, Panel, BookMarks, NoteMenu, Bubbling, SvgButton, PopSvgButton, TocOutLine }
registComponet(component)

// eslint-disable-next-line no-unused-vars
export function install(hook, vm) {
  hook.doneEach(function () {
    hlinit()
    // 初始化并第一次加载完成数据后调用，没有参数。
  });
}
try {
  window.$docsify.plugins = (window.$docsify.plugins || []).concat(install)
} catch (error) {
  console.error(error)
}
window.hlinit = hlinit
export default {
  Panel, Note: NoteMenu 
}