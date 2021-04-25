<template>
  <Drawer
    class="html-drawer zoom-in"
    title="笔记"
    :closable="true"
    v-model="open"
    scrollable
    :mask="false"
  >
    <Row
      slot="header"
      type="flex"
      justify="space-between"
      style="margin-right: 20px"
    >
      <Col>
        <Tooltip
          theme="light"
          :disabled="disabled"
          placement="bottom-start"
          style="overflow-x: hidden"
        >
          <Button size="small" @click="disabled = !disabled">目录</Button>
          <TocHtml
            slot="content"
            :charpter="sortedChapter"
            :click="clickOnToc"
            class="html-drawer-toc"
          />
        </Tooltip>
      </Col>
      <Col>
        <h2>笔记</h2>
      </Col>
      <Col>
        <Icon
          type="ios-expand"
          size="18"
          @click="zoomNoteBook = zoomNoteBook != true"
        />
      </Col>
    </Row>
    <div class="html-drawer-content">
      <!-- <div class="backtop">
        <Button type="success" size="small" @click="onBackTop">
          <Icon type="md-arrow-up" />
        </Button>
      </div> -->

      <CharptHtml
        class="charpterhtml"
        v-for="(charpter, index) in sortedChapter"
        :charpter="charpter"
        :onClickURL="onClickURL"
        :key="index"
        :hl="hl"
      />
    </div>
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
  computed: {},
  model: {
    prop: "openNoteBook",
  },
  data() {
    return {
      open: undefined,
      disabled: true,
      zoomNoteBook: false,
    };
  },
  methods: {
    clickoutside() {},
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
      let width = document.querySelector("body").clientWidth;
      width = width <= 480 ? 0 : width * 0.3;
      document.querySelector(".content").style["margin-right"] =
        a == false ? "0px" : width + "px";
    },
    zoomNoteBook(a) {
      if (a == false) {
        this.$el.classList.replace("zoom-out", "zoom-in");
      } else {
        this.$el.classList.replace("zoom-in", "zoom-out");
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
      this.$el.classList.add("mobile");
    }
    this.zoomNoteBook = false;
  },
};
</script>

<style>
.html-drawer .ivu-drawer.ivu-drawer-right {
  left: 70% !important;
  width: 30% !important;
}
@media screen and (max-width: 480px) {
  .html-drawer .ivu-drawer.ivu-drawer-right {
    left: 10% !important;
    width: 90% !important;
  }
}

.html-drawer-toc {
  overflow-x: hidden;
}
.html-drawer-toc .ivu-tooltip-inner {
  overflow-y: scroll;
  overflow-x: hidden;
}
.mobile .html-drawer-toc {
  margin: 1px;
}
.mobile .html-drawer-toc .ivu-tooltip-inner {
  margin-left: 5px;
  margin-right: 30px;
  height: 200px;
}
.mobile .html-drawer-toc .ivu-tooltip-inner ul {
  padding: 1px;
  margin: 1px;
}
.mobile .charpterhtml .html-img,
.zoom-in .charpterhtml .html-img {
  width: 90%;
}
.zoom-out .charpterhtml .html-img {
  width: 60%;
}
</style>