<template>
  <div style="margin-left: 10px">
    <ul>
      <li
        class="html-toc-li"
        v-for="(a, index) in list"
        @click="clickme(a)"
        :key="index"
        style="list-style-type: decimal; list-style: decimal"
      >
        {{ a }}
      </li>
    </ul>
  </div>
</template>
<script>
export default {
  name: "TocHtml",
  props: {
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
    return { list: [] };
  },
  created() {
    this.newFunction();
  },
  methods: {
    newFunction() {
      this.list = this.charpter.map((a) => {
        return a.label;
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
      let h2 = document.querySelectorAll("h2");
      for (let i = 0; i < h2.length; i++) {
        let t = h2[i];
        if (t.innerText == a) {
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