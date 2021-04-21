<template>
  <Drawer
    class="html-drawer"
    title="笔记"
    :closable="true"
    v-model="open"
    :width="htmldrawerWidthDynamic"
    scrollable
    :mask="false"
  >
    <div slot="header" style="display: flex">
      <Icon
        type="ios-expand"
        size="18"
        @click="zoomNoteBook = zoomNoteBook != true"
      >
      </Icon>
      <h3 style="margin-left: 20px">笔记</h3>
    </div>
    <TocHtml :charpter="sortedChapter" :click="clickOnToc" />
    <CharptHtml
      class="charpterhtml"
      v-for="(charpter, index) in sortedChapter"
      :charpter="charpter"
      :onClickURL="onClickURL"
      :key="index"
      :hl="hl"
    />
  </Drawer>
</template>

<script>
import { Drawer } from "iview";
import isMobile from "is-mobile";
import CharptHtml from "./CharptHtml";
import TocHtml from "./TocHtml";
import { gotoNote } from "../utils";
export default {
  name: "NoteSiderBar",
  components: { CharptHtml, TocHtml, Drawer },
  computed: {
    htmldrawerWidthDynamic() {
      if (isMobile()) return this.htmldrawerWidth;
      return this.zoomNoteBook
        ? this.fullhtmldrawerWidth
        : this.htmldrawerWidth;
    },
  },
  model: {
    prop: "openNoteBook",
  },
  data() {
    return {
      open: undefined,
      zoomNoteBook: false,
      htmldrawerWidth: isMobile() ? 480 : window.screen.width * 0.3,
      fullhtmldrawerWidth: isMobile()
        ? window.screen.width
        : window.screen.width,
    };
  },
  methods: {
    onBackTop() {
      this.$el.scrollTo(0, 0);
    },
    onClickURL(a) {
      gotoNote(a);
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
      let h2 = document.querySelectorAll(".charpterhtml h2");
      for (let i = 0; i < h2.length; i++) {
        let t = h2[i];
        if (t.innerText == a) {
          let { top } = getPosition(t);
          document
            .querySelector(".html-drawer .ivu-drawer-body")
            .scrollTo(0, top - 50);
          return;
        }
      }
    },
  },
  watch: {
    open(a) {
      if (a == false) {
        this.$emit("update:openNoteBook", false);
      }
    },
    openNoteBook(a) {
      if (a) {
        this.open = true;
      }
      if (isMobile() == false) {
        document.querySelector(".content").style["margin-right"] =
          a == false ? "0px" : "250px";
      }
    },
    zoomNoteBook(a) {
      if (isMobile() == false) {
        document.querySelector(
          ".html-drawer .ivu-drawer-right"
        ).style.height = a ? "40%" : "70%";
      }
    },
  },
  props: {
    hl: { type: Object, default: undefined },
    sortedChapter: {
      type: Array,
      default: () => {
        return [];
      },
    },
    openNoteBook: { type: Boolean, default: false },
  },
  mounted() {
    if (isMobile()) {
      let left = 0;
      document.querySelector(
        ".html-drawer .ivu-drawer-right"
      ).style.left = `${left}px`;
    }
    this.zoomNoteBook = false;
  },
};
</script>

<style scoped>
</style>