
<template>
  <section class="xxxx">
    <Tree :data="data" @on-toggle-expand="selectChange"></Tree>
  </section>
</template>

<script>
import { book } from "../store";
import { parseurl, scollTopID } from "../mountCmp";
import { preHighLightItems } from "../DocHighlighter";
import TocOutLine from "./TocOutLine"

export default {
  name: "TocNote",
  // eslint-disable-next-line vue/no-unused-components
  components:{ TocOutLine},
  computed: {
    data() {
      let b = new book();
      let ddd = b.Charpter().map((c) => {
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
  },
  props: {
    close: {
      type: Function,
      default: undefined,
    },
  },
  data() {
    return {
      toc: {},
    };
  },
  methods: {
    selectChange(a) {
      // console.log("xxxx");
      this.toc[a.title] = a.expand;
    },
    createOutLine(item) {
      let { label: title, children } = item;
      let expand = false;
      if (children) {
        children = this.mapchildren(children);
        if (this.toc[title]) expand = true;
      }
      // eslint-disable-next-line no-unused-vars
      let notedata = item
      const render = (h) => {
        return h(
          "TocOutLine",
          {
            props: {notedata,onSelected:()=>{this.handleNodeClick(item)}},
          }
        );
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
      let data = item
      let { id, key, node } = data;
      if (node) {
        try {
          window.scrollTo(0, node.offsetTop);
          // eslint-disable-next-line no-empty
        } catch (error) {}
        if (this.close) {
          this.close();
        }
        return;
      }
      if (key && id) {
        const { path } = JSON.parse(key);
        let hash = path.substring(path.indexOf("#"));
        hash = `${hash}?noteid=${id}`;
        let current = parseurl();
        if (current.path == path) {
          document.location.hash = hash;
          scollTopID(id);
        } else {
          document.location.hash = hash;
        }
        // window.location = url;
        if (this.close) {
          this.close();
        }
        // console.log(data);
      }
    },
  },
};
</script>
<style >
.xxxx .ivu-tree li ul{
  margin-left:6px !important;
}
.xxxx {
  overflow: auto;
  /* height: 400px; */
  /* background-color: white; */
}

.xxxx::-webkit-scrollbar {
  border-width: 1px;
}
</style>




