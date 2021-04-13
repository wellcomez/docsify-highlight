
<template>
  <section class="xxxx doclist">
    <Tree :data="data" @on-toggle-expand="selectChange"></Tree>
  </section>
</template>

<script>
import { Book } from "../store";
import { gotoNote} from "../utils";
import { preHighLightItems } from "../DocHighlighter";
import TocOutLine from "./TocOutLine";
var isMobile = require('is-mobile');

let toc = {};
export default {
  name: "TocNote",
  // eslint-disable-next-line vue/no-unused-components
  components: { TocOutLine },
  computed: {},
  props: {
    close: {
      type: Function,
      default: undefined,
    },
  },
  data() {
    return {
      data: [],
    };
  },
  mounted() {
    this.data = this.getDataOfTable();
  },
  methods: {
    selectChange(a) {
      toc[a.title] = a.expand;
    },
    getDataOfTable() {
      let b = new Book();
      let aaa = b.sortedChapter();
      let ddd = aaa.map((c) => {
        return this.createOutLine(c);
      });
      let children = preHighLightItems();
      children = this.mapchildren(children);
      if (children.length) ddd.push({ title: "page", children });
      let ret = [];
      ddd.forEach((a) => {
        if (a.children.length) {
          ret.push(a);
        }
      });
      return ret;
    },
    createOutLine(item) {
      let { label: title, children } = item;
      let expand = false;
      if (children) {
        try {
            children = item.mergeChild() 
        // eslint-disable-next-line no-empty
        } catch (error) {
        }
        children = this.mapchildren(children);
        if (toc[title]) expand = true;
      }
      // eslint-disable-next-line no-unused-vars
      let notedata = {...item};
      const render = (h) => {
        return h(TocOutLine, {
          props: {
            expand,
            notedata,
            onSelected: () => {
              this.handleNodeClick(item);
            },
            onClickExpanded: () => {
              let e = toc[title];
              toc[title] = e != true;
              this.data = this.getDataOfTable();
            },
          },
        });
      };
      return { title, children, expand, render };
    },
    mapchildren(children) {
      if (children)
        return children.map((a) => {
          return this.createOutLine(a);
        });
    },
    handleNodeClick(item) {
      let data = item;
      let { id, key, node } = data;
      if (node) {
        try {
          window.scrollTo(0, node.offsetTop);
          // eslint-disable-next-line no-empty
        } catch (error) {}

        return;
      }
      if (key && id) {
        gotoNote({key,id});
        if (this.close && isMobile()) {
          this.close();
        }
      }
    },
  },
};
</script>
<style >
.xxxx ul.ivu-tree-children ul.ivu-tree-children {
  -webkit-text-size-adjust: 100%;
  -webkit-tap-highlight-color: transparent;
  font-size: 14px;
  font-family: Helvetica Neue, Helvetica, STHeiTi, Arial, sans-serif;
  user-select: none;
  list-style: none outside none;
  box-sizing: border-box;
  margin: 0;
  padding: 0;
  /* height: 50px; */
  /* line-height: 50px; */
  border-top: 1px solid #eee;
}
.xxxx .ivu-tree > ul.ivu-tree-children > li {
  margin-top: 0px;
  margin-bottom: 0px;
}
.xxxx ul.ivu-tree-children ul.ivu-tree-children li {
  margin-top: 0px;
  margin-bottom: 0px;
}
.xxxx ul.ivu-tree-children ul.ivu-tree-children:last-child {
  border-bottom: 1px solid #eee;
}
</style>




