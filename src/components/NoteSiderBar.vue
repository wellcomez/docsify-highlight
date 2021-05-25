<template>
  <div>
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
          <Button size="small" @click="openToc = !openToc">目录</Button>
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
    <Drawer
      class="html-drawer-toc"
      :closable="true"
      v-model="openToc"
      scrollable
    >
      <TocHtml
        :charpter="sortedChapter"
        :click="clickOnToc"
        class="html-drawer-toc"
      />
    </Drawer>
  </div>
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
      openToc: false,
      zoomNoteBook: undefined,
    };
  },
  methods: {
    // eslint-disable-next-line no-unused-vars
    onPopperShow(el) {
      console.log(el);
    },
    clickoutside() {},
    onBackTop() {
      this.$el.scrollTo(0, 0);
    },
    onClickURL(a) {
      gotoNote(a);
    },
    clickOnToc(a) {
      this.openToc = false;
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
      let c = "open-sidebar";
      if (a) {
        document.querySelector(".content").classList.add(c);
      } else {
        document.querySelector(".content").classList.remove(c);
      }
    },
    zoomNoteBook(a) {
      let el = document.querySelector(".content");
      let setzoom = (a, el) => {
        if (a == false) {
          el.classList.add("zoom-in");
          el.classList.remove("zoom-out");
        } else {
          el.classList.add("zoom-out");
          el.classList.remove("zoom-in");
        }
      };
      setzoom(a, el);
      setzoom(a, this.$el);
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
      this.zoomNoteBook = true;
      let { width } = document.querySelector("body").getBoundingClientRect();
      let el = this.$el.querySelector(".ivu-drawer");
      el.classList.add("html-drawer-right-mobile");
      let style = el.style;
      style.width = width + "px";
      style.left = 0 + "px";
      return;
    } else {
      var el = this.$el.querySelector(".html-drawer .ivu-drawer");
      if (el) {
        el.classList.add("html-drawer-right");
      }
    }
    this.zoomNoteBook = false;
  },
};
</script>

<style>
.zoom-out .html-drawer-right {
  left: 0px !important;
  width: 100% !important;
}
.zoom-in .html-drawer-right {
  left: 70% !important;
  width: 30% !important;
  margin-bottom: 10px !important;
}
.zoom-in .ivu-drawer {
  height: 100% !important;
}
.zoom-out .ivu-drawer {
  height: 320px;
}
.open-sidebar.content.zoom-in {
  /* margin-right: calc(40vh); */
  margin-right: 300px;
}
.mobile.open-sidebar.content.zoom-in {
  margin-right: 0px;
}
.open-sidebar.content.zoom-out {
  margin-right: 0px;
  margin-top: 320px;
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