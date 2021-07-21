<template>
  <div class="toc-html">
    <ul>
      <li
        class="html-toc-li"
        v-for="({ href, label }, index) in list"
        @click="clickme(label)"
        :key="index"
        style="list-style-type: decimal; list-style: decimal"
      >
        <a v-if="exporthtml" :href="href">{{ label }}</a>
        <a v-else>{{ label }}</a>
      </li>
    </ul>
  </div>
</template>
<script>
export default {
  name: "TocHtml",
  props: {
    exporthtml: { type: Boolean, default: false },
    charpter: {
      type: Array,
      default: () => {
        return [];
      },
    },
    click: { type: Function, default: undefined },
  },
  watch: {
    charpter() {
      this.newFunction();
    },
  },
  data() {
    return {
      list: [],
    };
  },
  created() {
    if (this.exporthtml&&this.$el&&this.$el.classList) {
      this.$el.classList.add("exporthtml");
    }
    this.newFunction();
  },
  methods: {
    newFunction() {
      this.list = this.charpter.map((a) => {
        let { label } = a;
        let href;
        if (this.exporthtml) {
          href = "#" + label;
        }
        return { href, label };
      });
    },
    clickOnToc(a) {
      const getPosition = ($node) => {
        let offset = {
          top: 0,
          left: 0,
          height: $node.offsetHeight,
        };
        while ($node) {
          offset.top += $node.offsetTop;
          offset.left += $node.offsetLeft;
          $node = $node.offsetParent;
        }
        offset.bottom = offset.top + offset.height;
        return offset;
      };
      let h2 = document.querySelectorAll(".charpterhtml-h2");
      for (let i = 0; i < h2.length; i++) {
        let t = h2[i];
        let tt = t.getAttribute("tt");
        if (tt == a) {
          let { top } = getPosition(t);
          window.scrollTo(0, top - 50);
          return;
        }
      }
    },
    // eslint-disable-next-line no-unused-vars
    clickme(index) {
      if (this.click) {
        this.click(index);
      } else {
        this.clickOnToc(index);
      }
    },
  },
};
</script>

<style>
.toc-html {
  margin-left: 10%;
  margin-right: 10%;
}
.toc-html.export-html {
  box-shadow: 0 1px 6px rgba(0, 0, 0, 0.2);
  border-color: #eee;
  border-radius: 5px;
  position: fixed;
  top: 10px;
  right: 20px;
  background: white;
  overflow-y: auto;
  height: 200px;
  width: 300px;
  font-size: small;
}
.toc-html a {
  text-decoration: none;
  color: #42b983;
}
.toc-html li {
  color: #42b983;
}
.toc-html ul {
  margin: 10px;
  padding: 10px;
  padding-left: 20px;
}
</style>