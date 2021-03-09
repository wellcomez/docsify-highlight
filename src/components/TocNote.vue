
<template>
  <section class="xxxx">
    <Tree :data="data" @on-toggle-expand="selectChange"></Tree>
  </section>
</template>

<script>
import { book } from "../store";
import { parseurl, scollTopID } from "../mountCmp";
import { classNameFromColor } from "../hl_mengshou";
import { preHighLightItems } from "../DocHighlighter";
export default {
  name: "TocNote",
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
      console.log("xxxx");
      this.toc[a.title] = a.expand;
    },
    createOutLine(a) {
      let { label: title, children } = a;
      let expand = false;
      if (children) {
        children = this.mapchildren(children);
        if (this.toc[title]) expand = true;
      }
      let aa = this.spanclass(a);
      // eslint-disable-next-line no-unused-vars
      const render = (h, { root, node, data }) => {
        return h(
          "span",
          {
            class: aa,
            style: { color: "black" },
            on: {
              click: () => {
                this.handleNodeClick(a);
              },
            },
          },
          title
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
    // eslint-disable-next-line no-unused-vars
    spanclass(data) {
      let { id, color, className } = data;
      if (className != undefined) {
        return className;
      }
      if (id == undefined) {
        return "chartper";
      } else {
        let ret = "chartper-note " + classNameFromColor(color);
        return ret;
      }
    },
    updateKeyChildren(key, data) {
      console.log(key, data);
    },
    handleNodeClick(data) {
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
        hash = hash + "?id=" + id;
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
        console.log(data);
      }
    },
  },
};
</script>
<style>
.chartper {
  font-weight: bold;
}
.chartper-note {
  font-weight: normal;
}
</style>
<style scoped>
.xxxx {
  overflow: auto;
  height: 400px;
  background-color: white;
}

.xxxx::-webkit-scrollbar {
  border-width: 1px;
}
.xxxx {
  border: 1px solid var(--theme-color, #42b983);
}
</style>




