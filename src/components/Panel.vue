
<template>
  <div
    class="op-panel disable-user-selection"
    v-click-outside="hide"
    :style="styclePanel"
  >
    <Row class="panel-header" type="flex" align="middle">
      <Col>
        <SvgButton
          :on="true"
          onOff
          :name="collapsedIcon"
          custom
          @click="onCollapsed"
        ></SvgButton>
      </Col>
      <Col>
        <SvgButton
          @click="showdetail = showdetail != true"
          name="ios-book"
          tips="Table of Content"
          onOff
          :on="showdetail == false"
        />
      </Col>
      <Col v-if="showexport">
        <Bubbling
          v-if="collapsed == false && checked"
          :onSelect="onSelect"
          content="Export"
          :list="explortList"
        />
      </Col>
      <Col>
        <PopSvgButton
          v-if="canupload"
          :click="downloadFromCloud"
          name="md-cloud-download"
          title="Download data"
          tips="Download"
        />
      </Col>
      <Col>
        <Badge
          v-if="canupload"
          :dot="changeNumber == 0 && updated"
          :count="changeNumber ? changeNumber : updated ? 1 : 0"
        >
          <!-- <Badge v-if="checked" dot :count="updated ? 1 : 0"> -->
          <PopSvgButton
            :click="onSave2Cloud"
            title="Update data to cloud"
            name="md-cloud-upload"
            tips="Upload"
          />
        </Badge>
      </Col>

      <Col>
        <SvgButton @click="onBookmark" :name="bookmarkicon" />
      </Col>

      <!-- <Col>
        <i-switch :value="checked" @on-change="onChange" />
      </Col> -->
      <Col>
        <SvgButton @click="onClickOpenNote" name="md-text" />
      </Col>
      <Col>
        <SvgButton @click="bDrawerOpen = true" name="md-settings" />
      </Col>
    </Row>
    <Row class="contenttable" v-if="showdetail">
      <Tabs type="line" size="small" class="tabs">
        <TabPane label="批注">
          <Row type="flex" justify="space-between">
            <Col> <span style="margin-left: 4px">全部</span> </Col>
          </Row>
          <TocNotePanel
            v-bind:close="closedetail"
            v-bind:countkey="count2"
            :book="book"
            class="tabpanel"
          ></TocNotePanel>
        </TabPane>
        <TabPane label="书签">
          <BookMarks :hl="hl" :key="bookmarkey" />
        </TabPane>
      </Tabs>
    </Row>
    <Drawer class="drawer-exporthtml" :width="80" v-model="showPreview">
      <ExportHtml :charpter="sortedChapter"></ExportHtml>
    </Drawer>
    <SettingSideBar
      :cloudOn="cloudOn"
      :checked="checked"
      :bDrawerOpen.sync="bDrawerOpen"
      :onChange="onChange"
      :hl="hl"
      :book="book"
    ></SettingSideBar>
    <NoteSiderBar
      :hl="hl"
      :openNoteBook.sync="openNoteBook"
      :sortedChapter="sortedChapter"
    ></NoteSiderBar>
  </div>
</template>
<style >
.op-panel div.ivu-tabs-bar {
  margin-bottom: 2px;
}
</style>
<style scoped >
.op-panel {
  position: fixed;
  right: 20px;
  left: auto;
  top: 25px;
  border-radius: 3px;
  color: black;
  padding: 4px;
}
.op-panel .ivu-switch {
  /* margin: top 4px; */
}
.op-panel .ivu-switch-checked {
  border-color: #2df05e;
  background-color: #2df05e;
}
.op-panel .contenttable {
  overflow: hidden;
  background: white;
  border: 1px solid var(--theme-color, #42b983);
}
.op-panel .contenttable .tabpanel {
  height: 480px;
}
.op-panel .tabpanel::-webkit-scrollbar {
  display: none;
}
.op-panel .tabpanel {
  overflow-y: scroll;
  overflow-x: hidden;
}

/* Hide scrollbar for IE, Edge and Firefox */
.op-panel .tabpanel {
  -ms-overflow-style: none; /* IE and Edge */
  scrollbar-width: none; /* Firefox */
}
.op-panel .outline,
.op-panel {
  width: 320px;
}
.op-panel .contenttable .tabs {
  height: inherit;
}
.op-panel .panel-header {
  width: fit-content;
  padding: 4px;
  background: var(--theme-color, #42b983);
}
.op-panel .doclist {
  height: 440px;
}
@media screen and (max-width: 480px) {
  .op-panel {
    position: fixed;
    right: 20px;
    /* left: 20px; */
    top: 10px;
    width: 90%;
    max-width: 100vw;
    border-radius: 3px;
    color: black;
    padding: 4px;
    transition: transform 0.25s ease;
  }
  .op-panel .contenttable {
    width: 100%;
    height: 320px;
  }
  .op-panel .contenttable .tabpanel {
    width: 100%;
    height: 320px;
  }
  .op-panel .doclist {
    height: 280px;
  }
  .op-panel .outline {
    width: 95%;
  }
}
</style>

<script>
// eslint-disable-next-line no-unused-vars
import { Book } from "../store";
import { Drawer } from "iview";
import ExportHtml from "./ExportHtml";
import SettingSideBar from "./SettingSideBar";
// import { Notification } from "element-ui";
import { localidstore, downloadFromCloud, updateBookOnLean } from "../leanweb";
import FileSaver from "file-saver";
import { msg } from "./msgbox";
export function funDownload(content, filename) {
  const blob = new Blob([content]);
  FileSaver.saveAs(blob, filename);
  msg("导出", "保存到 " + filename);
}
import { preHighLightItems } from "../DocHighlighter";
import TocNotePanel from "./TocNotePanel";
import Bubbling from "./Bubbling";
import SvgButton from "./SvgButton";
import PopSvgButton from "./PopSvgButton";
import BookMarks from "./BookMarks";
import ClickOutside from "vue-click-outside";
var isMobile = require("is-mobile");
import NoteSiderBar from "./NoteSiderBar";
import { gotoNote } from "../utils";
import { getConfig } from "../ANoteConfig";
export default {
  components: {
    Drawer,
    ExportHtml,
    NoteSiderBar,
    PopSvgButton,
    TocNotePanel,
    Bubbling,
    SvgButton,
    BookMarks,
    SettingSideBar,
  },
  name: "Panel",
  directives: {
    ClickOutside,
  },
  computed: {
    bookmarkey() {
      return this.seq + "-" + this.bookmark;
    },
    sortedChapter() {
      return this.book.sortedChapter();
    },
    collapsedIcon() {
      return this.collapsed == false
        ? "icon-dotsvertical"
        : "icon-dotshorizontal";
    },
    styclePanel() {
      let backgroundColor = "";
      if (this.showdetail) backgroundColor = "var(--theme-color, #42b983)";
      let style = { "background-color": backgroundColor };
      return style;
    },
    count2() {
      let a = this.book.count() + this.count;
      return a + preHighLightItems().length - this.count;
    },
    canupload() {
      return this.collapsed != true && this.checked && this.cloudOn;
    },
    cloudOn() {
      return localidstore.on;
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
      showPreview: false,
      explortList: ["json", "md", "md(章)", "html", "preview"],
      showdetail: false,
      openNoteBook: false,
      book: new Book(),
      showexport: isMobile() ? false : true,
      bDrawerOpen: false,
      uername: undefined,
      collapsed: false,
      bookmark: false,
    };
  },
  mounted() {},
  model: {
    prop: "updated",
  },
  props: {
    seq: { type: Number, default: 0 },
    updated: { type: Boolean, default: false },

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
    changeNumber: { type: Number, default: 0 },
  },
  watch: {
    hl(hl) {
      let { store } = hl;
      if (store) {
        this.bookmark = store.isBookMarked();
      }
    },
    openNoteBook(a) {
      if (a) {
        this.showdetail = false;
      }
    },
    seq() {
      this.book = new Book();
    },
  },
  methods: {
    onChange() {
      this.checked = this.checked == false;
      this.hl.enable(this.checked);
      if (this.checked == false) this.showdetail = false;
    },
    onClickURL(a) {
      if (a) gotoNote(a);
    },

    onClickOpenNote() {
      this.openNoteBook = true;
    },
    onCollapsed() {
      this.collapsed = this.collapsed == false;
      if (this.collapsed) {
        this.showdetail = false;
      }
    },
    getBookmarkCount() {
      let b = this.book;
      let ddd = b.toc.bookMarkList();
      return ddd.length;
    },
    hide(a) {
      if (a.target.innerText == "删除") return;
      this.closedetail();
    },
    closedetail() {
      this.showdetail = false;
    },
    onBookmark() {
      this.hl.store.setBookMark(this.bookmark != true);
      this.bookmark = this.bookmark != true;
    },
    onSave2Cloud() {
      let b = new Book();
      let { hl } = this;
      updateBookOnLean(b)
        // eslint-disable-next-line no-unused-vars
        .then((a) => {
          Book.updated = false;
          hl.updatePanel();
          msg("saved ", b.toc.bookname + " to cloud");
        })
        // eslint-disable-next-line no-unused-vars
        .catch((e) => {});
    },
    downloadFromCloud() {
      downloadFromCloud().then(() => {
        let changeNumber, localNumber;
        getConfig().save({ changeNumber, localNumber });
        window.location.reload();
      });
    },
    onSelect(name) {
      let b = new Book();
      if (name == "md") {
        let md = b.md();
        funDownload(md, window.$docsify.name + ".md");
      } else if (name == "md(章)") {
        const newLocal = this.hl.store.Chapter();
        let md = newLocal.md();
        funDownload(md, newLocal.label + ".md");
      } else if (name == "json") {
        let json = b.jsonstr();
        funDownload(json, window.$docsify.name + ".json");
      } else if (name == "html") {
        let json = b.exportHtml();
        funDownload(json, window.$docsify.name + ".html");
      } else if (name == "preview") {
        this.showPreview = true;
        return;
      }
    },
  },
};
</script>
<style >
@import "../styles/iview.css";
@import "../assets/web.css";
@import "../assets/iconfont.css";
</style>
