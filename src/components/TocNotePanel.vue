
<template>
  <Collapse class="TocNotePanel">
    <Panel v-for="{ title, children } in pannel" :name="title" :key="title">
      {{ title }}
      <div slot="content" style=>
        <TocOutLine
          :children="[]"
          v-for="({ notedata }, index) in children"
          :notedata="notedata"
          :expand="false"
          :key="index"
        ></TocOutLine>
      </div>
    </Panel>
  </Collapse>
</template>

<script>
import { gotoNote } from "../utils";
import { preHighLightItems } from "../DocHighlighter";
import TocOutLine from "./TocOutLine";
import { Collapse, Panel } from "iview";
var isMobile = require("is-mobile");

let toc = {};
export default {
  name: "TocNotePanel",
  // eslint-disable-next-line vue/no-unused-components
  components: { Collapse, TocOutLine, Panel },
  watch: {
    book(b) {
      let ret = this.getBookOutLine(b);
      this.pannel = ret;
    },
  },
  props: {
    close: {
      type: Function,
      default: undefined,
    },
    book: { type: Object, default: undefined },
  },
  data() {
    return {
      pannel: this.getBookOutLine(this.book),
    };
  },
  methods: {
    getBookOutLine(b) {
      if (b == undefined) return [];
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

    selectChange(a) {
      toc[a.title] = a.expand;
    },
    createOutLine(item, charpter) {
      let { label: title, children } = item;
      if (item && charpter == undefined) {
        charpter = item;
      }
      let expand = false;
      if (children) {
        try {
          children = item.mergeChild();
          // eslint-disable-next-line no-empty
        } catch (error) {}
        children = this.mapchildren(children, charpter);
        if (toc[title]) expand = true;
      }
      // eslint-disable-next-line no-unused-vars
      let notedata = { ...item, ...{ charpter } };
      return { title, children, expand, notedata };
    },
    mapchildren(children, charpter) {
      if (children)
        return children.map((a) => {
          return this.createOutLine(a, charpter);
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
        gotoNote({ key, id });
        if (this.close && isMobile()) {
          this.close();
        }
      }
    },
  },
};
</script>
<style >
.TocNotePanel .ivu-collapse-content {
  padding: 0px;
}
.TocNotePanel div.ivu-collapse-content-box {
  padding: 0px;
}
</style>





