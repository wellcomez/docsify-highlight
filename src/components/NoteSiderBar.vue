<template>
  <div>
    <Drawer
      :class="root_class"
      title="笔记"
      id="notesidebar"
      :closable="true"
      v-model="open"
      scrollable
      :mask="false"
      :class-name="drawer_class_name"
    >
      <Row
        slot="header"
        type="flex"
        justify="space-between"
        style="margin-right: 20px"
      >
        <Col>
          <Button size="small" @click="disabled = !disabled">目录</Button>
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
      <div class="html-drawer-content" v-if="openNoteBook">
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
          :active="charpter.path == current.path"
          :key="index"
          :hl="hl"
        />
      </div>
    </Drawer>
    <Drawer v-model="disabled">
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
  components: {
    CharptHtml,
    TocHtml,
    Drawer,
  },
  computed: {
    root_class() {
      return (
        (isMobile() ? "mobile" : "") +
        " " +
        "html-drawer " +
        (!this.zoomNoteBook ? "zoom-in" : "zoom-out")
      );
    },
    drawer_class_name() {
      return isMobile() != true
        ? "html-drawer-right"
        : "html-drawer-right-mobile";
    },
  },
  model: {
    prop: "openNoteBook",
  },
  data() {
    return {
      current: this.hl ? this.hl.store.Chapter() : undefined,
      open: undefined,
      disabled: false,
      zoomNoteBook: undefined,
    };
  },
  methods: {
    tocDrawer() {
      return document.querySelector("#notesidebar .ivu-drawer");
      // return document.querySelector(".ivu-drawer.ivu-drawer-right");
      // return document.querySelector(".html-drawer-right.ivu-drawer");
    },
    onBackTop() {
      this.$el.scrollTo(0, 0);
    },
    onClickURL(a) {
      gotoNote(a);
    },
    clickOnToc(a) {
      this.disabled = false;
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
        let tt = t.getAttribute("tt");
        if (tt == a) {
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
    hl(a) {
      this.current = a.store.Chapter();
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
      // let aaa = document.querySelector(".html-drawer");
      // setzoom(a, aaa);
    },
  },
  props: {
    hl: {
      type: Object,
      default: undefined,
    },
    sortedChapter: {
      type: Array,
      default: () => {
        return [];
      },
    },
    openNoteBook: {
      type: Boolean,
      default: false,
    },
  },
  mounted() {
    if (isMobile()) {
      this.zoomNoteBook = true;
      let { width } = document.querySelector("body").getBoundingClientRect();
      let drawer = this.tocDrawer();
      let style = drawer.style;
      style.width = width + "px";
      style.left = 0 + "px";
      return;
    }
    this.zoomNoteBook = false;
  },
};
</script>

<style>
.zoom-out .html-drawer-right .ivu-drawer {
  left: 0 !important;
  width: 100% !important;
}
.zoom-in .html-drawer-right .ivu-drawer {
  width: 400px !important;
  right: 2px !important;
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
  margin-right: 400px;
}
.mobile.open-sidebar.content.zoom-in {
  margin-right: 0;
}
.open-sidebar.content.zoom-out {
  margin-right: 0;
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
