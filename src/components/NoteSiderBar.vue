<template>
  <div>
    <Drawer
      :class="root_class"
      title="笔记"
      :width="rootDrawerWidth"
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
        style="margin-right: 5%; margin-left: 10%"
      >
        <Col>
          <h2>笔记</h2>
        </Col>
        <Col>
          <ButtonGroup>
            <Button @click="disabled = !disabled" v-if="!useSideBar"
              >目录</Button
            >
            <Button icon="md-arrow-dropup" @click="zoomNoteBook = 1" />
            <Button icon="md-arrow-dropright" @click="zoomNoteBook = 0" />
            <Button icon="ios-expand" @click="zoomNoteBook = 2" />
          </ButtonGroup>
        </Col>
      </Row>

      <Row>
        <Col
          v-if="useSideBar"
          :span="4"
          style="
             {
              position: fixed;
              top: 1px;
              bottom: 1px;
              width: 300px;
              margin-top: 80px;
              overflow: scroll;
              position: fixed;
            }
          "
        >
          <TocHtml
            :charpter="sortedChapter"
            :click="clickOnToc"
            class="html-drawer-toc"
          />
        </Col>
        <Col :style="charpterStyle">
          <div class="html-drawer-content" v-if="openNoteBook">
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
        </Col>
      </Row>
    </Drawer>
    <Drawer v-model="disabled" v-if="!useSideBar">
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
const right = 0;
const full = 2;
const up = 1;
const down = -1;
export default {
  name: "NoteSiderBar",
  components: {
    CharptHtml,
    TocHtml,
    Drawer,
  },
  computed: {
    charpterStyle() {
      if (!this.useSideBar) return "";
      return "margin-left: 300px";
    },
    rootStyles() {
      let { zoomNoteBook } = this;
      let height = {};
      if (zoomNoteBook == up || zoomNoteBook == down) {
        height = "30%";
        height = { height };
      }
      let bottom = {};
      if (zoomNoteBook == down) {
        bottom = { bottom: 0 };
      }
      return { ...height, ...bottom };
    },
    rootDrawerWidth() {
      let { zoomNoteBook } = this;
      if (zoomNoteBook == up || zoomNoteBook == down || zoomNoteBook == full) {
        return 100;
      }
      return 400;
    },
    useSideBar() {
      return this.zoomNoteBook != right;
    },
    root_class() {
      let a = "zoom-in";
      switch (this.zoomNoteBook) {
        case up: {
          a = "zoom-up";
          break;
        }
        case full: {
          a = "zoom-full";
          break;
        }
        case down: {
          a = "zoom-down";
          break;
        }
        case right:
        default:
          a = "zoom-in";
      }
      return (isMobile() ? "mobile" : "") + " " + "html-drawer " + a;
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
      currentIndex: 0,
      current: this.hl ? this.hl.store.Chapter() : {},
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
      if (a) gotoNote(a);
    },
    changeCurrentCharacter(charpter) {
      this.disabled = false;
      this.sortedChapter.find((a, idx) => {
        if (charpter.label == a.label) {
          this.current = a;
          this.currentIndex = idx;
          let b = a.children[0];
          if (b) gotoNote(b);
          return true;
        }
      });
    },
    clickOnToc(charpter) {
      this.changeCurrentCharacter(charpter);
    },
  },
  watch: {
    open(a) {
      if (a == false) {
        this.$emit("update:openNoteBook", false);
      }
    },
    hl(a) {
      this.changeCurrentCharacter(a.store.Chapter());
    },
    openNoteBook(a) {
      if (a) {
        this.open = true;
      } else {
        this.zoomNoteBook = right;
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
      setzoom(a != right, el);
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
      this.zoomNoteBook = full;
      let { width } = document.querySelector("body").getBoundingClientRect();
      let drawer = this.tocDrawer();
      let style = drawer.style;
      style.width = width + "px";
      style.left = 0 + "px";
      return;
    }
    this.zoomNoteBook = right;
  },
};
</script>

<style>
.zoom-in .ivu-drawer {
  height: 100% !important;
}
.zoom-up .ivu-drawer {
  height: 30%;
  min-height: 400px;
}
.zoom-down .ivu-drawer {
  height: 30%;
  min-height: 400px;
}
.open-sidebar.content.zoom-in {
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
/* .zoom-out .charpterhtml .html-img {
  width: 60%;
} */
</style>
