<template>
  <div class="toc-html">
    <ul>
      <li
        v-for="({ label }, index) in list"
        :class="liClass(index)"
        @click="clickme($event, index)"
        :key="index"
        style="list-style-type: decimal; list-style: decimal"
      >
        <a :class="liClass(index)">{{ label }}</a>
      </li>
    </ul>
  </div>
</template>
<script>
// eslint-disable-next-line no-unused-vars
var VueScrollTo = require("vue-scrollto");
export default {
  name: "TocHtml",
  props: {
    exporthtml: { type: Boolean, default: false },
    active: { type: Object, default: () => undefined },
    charpter: {
      type: Array,
      default: () => {
        return [];
      },
    },
    click: { type: Function, default: undefined },
  },
  watch: {
    active(a) {
      this.onActive(a);
    },
    charpter() {
      this.convertRef();
    },
    clickIndex(a) {
      let el = this.$el.querySelector(`.toc-li-${a}`);
      el.scrollIntoView();
      // eslint-disable-next-line no-unused-vars
      const jump = () => {
        if (el) {
          let container = [
            ".drawer-toc .ivu-drawer-body",
            "#notesidebar .ivu-drawer-body .ivu-layout .ivu-layout-sider .ivu-layout-sider-children",
          ].find((a) => {
            return document.querySelector(a) != null;
          });

          if (container) {
            var options = {
              container,
              easing: "ease-in",
              lazy: false,
              offset: -200,
              force: true,
              cancelable: true,
              // eslint-disable-next-line no-unused-vars
              onStart: (element) => {
                // console.warn(element, "start");
              },
              // eslint-disable-next-line no-unused-vars
              onDone: (element) => {
                // console.warn(element, "onDone");
              },
              onCancel: () => {
                // scrolling has been interrupted
              },
              x: false,
              y: true,
            };
            VueScrollTo.scrollTo(el, 1, options);
          }
        }
      };
      try {
        // jump();
      } catch (error) {
        console.error(error);
      }
    },
  },
  data() {
    return {
      clickIndex: undefined,
      list: [],
    };
  },
  mounted() {
    this.onActive(this.active);
  },
  created() {
    if (this.exporthtml && this.$el && this.$el.classList) {
      this.$el.classList.add("exporthtml");
    }
    this.convertRef();
  },
  methods: {
    onActive(a) {
      if (a) {
        let chapter = this.find(this.list, a);
        this.clickIndex = this.list.indexOf(chapter);
      }
    },
    liClass(index) {
      let classname = "html-toc-li";
      if (index == this.clickIndex) classname = "html-toc-li-active";
      return `${classname} toc-li-${index}`;
    },
    convertRef() {
      this.list = this.charpter.map((a) => {
        let { label } = a;
        let href;
        if (this.exporthtml) {
          href = "#" + label;
        }
        return { href, label };
      });
    },
    find(list, value) {
      return list.find((a) => {
        if (a.label == value.label) {
          return a;
        }
      });
    },
    clickme($event, index) {
      $event.stopPropagation();
      let value = this.list[index];
      let charpter = this.find(this.charpter, value);
      if (this.click) {
        this.click(charpter);
      }
      this.clickIndex = index;
    },
  },
};
</script>

<style lang="less">
@import "../my-theme.less";
.toc-html {
  margin-left: 10%;
  margin-right: 10%;
}
.html-toc-li-active {
  color: #808080 !important;
  font-size: small !important;
}
.toc-html {
  &.export-html {
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
  a {
    text-decoration: none;
    color: @primary-color;
  }
  li {
    color: @primary-color;
  }
  ul {
    margin: 10px;
    padding: 10px;
    padding-left: 20px;
  }
}
</style>