
<template>
  <div class="op-panel" v-click-outside="hide" :style="styclePanel">
    <!-- <Badge :count="count2"> -->
    <Row class="panel-header" type="flex">
      <Col>
        <SvgButton
          :on.sync="collapsed"
          onOff
          name="icon-zhankai"
          custom
          :click="onHideSame"
        ></SvgButton>
      </Col>
      <Col>
        <SvgButton
          v-if="checked"
          v-bind:onClick="onOpenContentList"
          name="ios-book"
          tips="Table of Content"
        />
      </Col>
      <Col>
        <Bubbling
          v-if="!collapsed && checked"
          :onSelect="onSelect"
          content="Export"
        />
      </Col>
      <Col>
        <PopSvgButton
          v-if="canupload"
          :click="onTest"
          name="md-cloud-download"
          title="Download data"
          tips="Download"
        />
      </Col>
      <Col>
        <PopSvgButton
          v-if="canupload"
          :click="onSave2Cloud"
          title="Update data to cloud"
          name="md-cloud-upload"
          tips="Upload"
        />
      </Col>

      <Col>
        <input
          v-if="collapsed == false"
          name="auto"
          type="checkbox"
          class="switch"
          v-bind:checked="checked"
          v-bind:on-change="onChange"
          v-on:click="onChange"
        />
      </Col>
      <Col>
        <SvgButton
          v-if="checked"
          v-bind:onClick="onBookmark"
          :name="bookmarkicon"
        />
      </Col>
    </Row>
    <Row
      class="contenttable"
      v-if="showdetail"
      style="overflow: hidden; height: 100%"
    >
      <Tabs type="line" size="small" class="tabs">
        <TabPane label="批注">
          <TocNote
            v-bind:close="closedetail"
            v-bind:key="count2"
            style="margin-left: 10px"
          ></TocNote>
        </TabPane>
        <TabPane label="书签" style="margin-left: 10px">
          <BookMarks :hl="hl" :key="bookmarkey" />
        </TabPane>
      </Tabs>
    </Row>
    <!-- </Badge> -->
  </div>
</template>
<style scoped>
.op-panel {
  position: fixed;
  right: 150px;
  left: auto;
  top: 25px;
  border-radius: 3px;
  color: black;
  padding: 4px;
  /* background: var(--theme-color, #42b983); */
}
.contenttable {
  width: 400px;
  height: 640px;
  background: white;
  border: 1px solid var(--theme-color, #42b983);
}
.contenttable .tabs {
  height: inherit;
}
.panel-header {
  padding: 4px;
  background: var(--theme-color, #42b983);
}
@media screen and (max-width: 480px) {
  .op-panel {
    position: fixed;
    right: 20px;
    left: 4px;
    top: 10px;
    width: 90%;
    max-width: 100vw;
    border-radius: 3px;
    color: black;
    padding: 4px;
    transition: transform 0.25s ease;
  }
  .panel-header {
    width: fit-content;
  }
  .contenttable {
    /* left:0px; */
    /* right:50px; */
    /* width:320px; */
    width: 100%;
  }
}
</style>

<script>
import { book } from "../store";
// import { Notification } from "element-ui";
import { localidstore, testPost, updateBookOnLean } from "../leanweb";
import FileSaver from "file-saver";
import { msg } from "./msgbox";
function funDownload(content, filename) {
  const blob = new Blob([content]);
  FileSaver.saveAs(blob, filename);
  msg("导出", "保存到 " + filename);
}
import { preHighLightItems } from "../DocHighlighter";
import TocNote from "./TocNote";
import Bubbling from "./Bubbling";
import SvgButton from "./SvgButton";
import PopSvgButton from "./PopSvgButton";
import BookMarks from "./BookMarks";
import ClickOutside from "vue-click-outside";

// import { checkClickOut } from "../mountCmp";
export default {
  components: { PopSvgButton, TocNote, Bubbling, SvgButton, BookMarks },
  name: "Panel",
  directives: {
    ClickOutside,
  },
  computed: {
    styclePanel() {
      let backgroundColor = "";
      if (this.showdetail) backgroundColor = "var(--theme-color, #42b983)";
      let style = { "background-color": backgroundColor };
      return style;
    },
    count2() {
      let a = new book().count() + this.count;
      return a + preHighLightItems().length - this.count;
    },
    canupload() {
      return this.collapsed != true && this.checked && localidstore.on;
    },
    bookmarkiconcolor() {
      if (this.bookmark) {
        return "var(--theme-color, #42b983)";
      }
      return undefined;
    },
    bookmarkicon() {
      return this.bookmark ? "ios-bookmark" : "ios-bookmark-outline";
    },
  },
  data() {
    return {
      collapsed: false,
      closedetail: this.fnclosedetail,
      bookmark: false,
      bookmarkey: new Date() * 1,
    };
  },
  mounted: function () {
    // let d = document.getElementsByClassName("op-panel")[0];
    // checkClickOut(d, this.hideDetails);
    this.bookmark = this.hl.store.isBookMarked();
  },
  beforeCreate: function () {
    this.fnclosedetail = () => {
      this.showdetail = false;
    };
  },
  beforeDestroy: function () {
    // checkClickOut(undefined, this.hideDetails);
  },
  props: {
    showdetail: {
      type: Boolean,
      default: false,
    },
    checked: {
      type: Boolean,
      default: true,
    },
    hl: {
      type: Object,
      default: undefined,
    },
    count: {
      type: Number,
      default: 0,
    },
  },
  methods: {
    hide() {
      this.showdetail = false;
    },
    onBookmark() {
      this.hl.store.setBookMark(this.bookmark != true);
      this.bookmark = this.bookmark != true;
      this.bookmarkey = new Date() * 1;
    },
    onSave2Cloud() {
      let b = new book();
      updateBookOnLean(b)
        // eslint-disable-next-line no-unused-vars
        .then((a) => {
          msg("saved ", b.toc.bookname + " to cloud");
        })
        // eslint-disable-next-line no-unused-vars
        .catch((e) => {});
    },
    onTest() {
      testPost();
    },
    onOpenContentList() {
      this.showdetail = this.showdetail == false;
    },
    onSelect(name) {
      if (name == "md") {
        let b = new book();
        let md = b.md();
        // console.log(md);
        funDownload(md, window.$docsify.name + ".md");
      } else if (name == "json") {
        let b = new book();
        let json = b.jsonstr();
        funDownload(json, window.$docsify.name + ".json");
      }
    },
    onChange() {
      this.checked = this.checked == false;
      this.hl.enable(this.checked);
      if (this.checked == false) this.showdetail = false;
    },
  },
};
</script>
<style >
.alpha {
  height: 100%;
  overflow: hidden;
}
</style>

<style>
@import "../styles/iview.css";
@import "../assets/web.css";
@import "../assets/iconfont.css";
</style>