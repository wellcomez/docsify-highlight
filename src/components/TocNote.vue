
<template>
  <section class="xxxx">
    <Tree :data="data"></Tree>
    <!-- <el-tree
      node-key="id-cotent-index"
      :data="data"
      :props="defaultProps"
      @node-click="handleNodeClick"
    >
      <span slot-scope="{ node, data }">
        <p style="font-size: xx-small">
          <span v-bind:class="spanclass(data)">{{ node.label }}</span>
        </p>
      </span>
    </el-tree> -->
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
      // eslint-disable-next-line no-unused-vars
      const mapchildren = (children) => {
        if (children)
          return children.map((a) => {
            let { label: title, children } = a;
            let expand = false;
            if (children) {
              children = mapchildren(children);
              expand = true;
            }
            if (expand == false) {
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
            } else {
              return { title, children, expand };
            }
          });
      };
      let ddd = b.Charpter().map((c) => {
        let { label: title, children } = c;
        children = mapchildren(children);
        let expand = false;
        if (children) expand = true;
        return { title, children, expand };
      });
      let children = preHighLightItems();
      children = mapchildren(children);
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
      defaultProps: {
        children: "children",
        label: "label",
      },
    };
  },
  methods: {
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

<style scoped>
.chartper {
  font-weight: bold;
}
.chartper-note {
  font-weight: normal;
}
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
.xxxx .el-tree {
  /* background: rgba(216, 206, 206, 0.897); */
}
</style>




