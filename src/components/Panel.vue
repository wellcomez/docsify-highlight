
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
          @click="onOpenContentList"
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
        <SvgButton @click="bDrawerOpen = true" name="md-settings" />
      </Col>
    </Row>
    <Row class="contenttable" v-if="showdetail">
      <Tabs type="line" size="small" class="tabs">
        <TabPane label="批注">
          <Row type="flex" justify="space-between">
            <Col> <span style="margin-left: 4px">全部</span> </Col>
            <Col span="5">
              <Button @click="onClickOpenNote" size="small">打开</Button>
            </Col>
          </Row>
          <TocNote v-bind:close="closedetail" v-bind:key="count2" :book="book"></TocNote>
        </TabPane>
        <TabPane label="书签">
          <BookMarks :hl="hl" :key="bookmarkey" />
        </TabPane>
      </Tabs>
    </Row>
    <Drawer
      class="setting-drawer"
      :closable="false"
      v-model="bDrawerOpen"
      :width="drawWidth"
    >
      <Account v-if="cloudOn" slot="header" style="width: 280px" />
      <div style="background: #f8f8f9; width: 280px">
        <Card :padding="0" shadow>
          <CellGroup style="">
            <Cell title="开关" style="">
              <i-switch :value="checked" @on-change="onChange" slot="extra" />
            </Cell>
            <Cell title="执行自定义脚本" style="">
              <i-switch
                :value="enableScript"
                @on-change="onEnableScript"
                slot="extra"
              />
            </Cell>
            <Cell title="重置">
              <Button type="primary" @click="ResetAll"> 重置</Button>
            </Cell>
            <Cell title="版本" :label="vesion"> </Cell>
          </CellGroup>
        </Card>
      </div>
      <!-- <ConfigPanel /> -->
    </Drawer>
    <Drawer
      class="html-drawer"
      title="笔记"
      :closable="true"
      v-model="openNoteBook"
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
  /* background: var(--theme-color, #42b983); */
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
  height: 480px;
  background: white;
  border: 1px solid var(--theme-color, #42b983);
}
.op-panel .outline,
.op-panel {
  width: 268px;
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
    left: 4px;
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
const pkg = require("../../package.json");
import { Book } from "../store";
// import { Notification } from "element-ui";
import { localidstore, downloadFromCloud, updateBookOnLean } from "../leanweb";
import FileSaver from "file-saver";
import { msg } from "./msgbox";
import { Drawer } from "iview";
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
import Account from "./Account";
import CharptHtml from "./CharptHtml";
import TocHtml from "./TocHtml";
import ClickOutside from "vue-click-outside";
import { getConfig } from "../ANoteConfig";
var isMobile = require("is-mobile");

import { gotoNote } from "../utils";
// import { checkClickOut } from "../mountCmp";
export default {
  components: {
    PopSvgButton,
    TocNote,
    Bubbling,
    SvgButton,
    BookMarks,
    Account,
    Drawer,
    CharptHtml,
    TocHtml,
  },
  name: "Panel",
  directives: {
    ClickOutside,
  },
  computed: {
     bookmarkey(){
        return this.seq+'-'+this.bookmark;
     },
    sortedChapter(){
      return this.book.sortedChapter()
    },
    htmldrawerWidthDynamic() {
      if (isMobile()) return this.htmldrawerWidth;
      return this.zoomNoteBook
        ? this.fullhtmldrawerWidth
        : this.htmldrawerWidth;
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
      zoomNoteBook: false,
      htmldrawerWidth: 480,
      fullhtmldrawerWidth: 480,
      openNoteBook: false,
      book: new Book(),
      vesion: "",
      showexport: true,
      drawWidth: 320,
      enableScript: false,
      bDrawerOpen: false,
      uername: undefined,
      collapsed: false,
      closedetail: this.fnclosedetail,
      bookmark: false,
    };
  },
  mounted() {
    let { enableScript } = getConfig().load();
    this.showexport = isMobile() ? false : true;
    this.enableScript = enableScript;
    // this.drawWidth = window.screen.width < 480 ? 440: 320;
    if (window.screen.width < 480) {
      let left = window.screen.width - 300;
      document.querySelector(
        ".setting-drawer .ivu-drawer-right"
      ).style = `left:${left}px`;
      left = 0;
    }
    if (isMobile()) {
      let left = 0;
      this.htmldrawerWidth = window.screen.width;
      this.fullhtmldrawerWidth = window.screen.width;
      document.querySelector(
        ".html-drawer .ivu-drawer-right"
      ).style.left = `${left}px`;
    } else {
      this.fullhtmldrawerWidth = window.screen.width * 0.8;
      document.querySelector(
        ".html-drawer .ivu-drawer-right"
      ).style.height = "70%";
    }
    this.vesion = pkg.version;
  },
  beforeCreate: function () {
    this.fnclosedetail = () => {
      this.showdetail = false;
    };
  },
  beforeDestroy: function () {
    // checkClickOut(undefined, this.hideDetails);
  },
  model: {
    prop: "updated",
  },
  props: {
    seq: { type: Number, default: 0 },
    updated: { type: Boolean, default: false },
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
    changeNumber: { type: Number, default: 0 },
  },
  watch: {
    hl(hl) {
      let { store } = hl;
      if (store) {
        this.bookmark = store.isBookMarked();
      }
    },
    seq() {
      this.book = new Book()
    },
  },
  methods: {
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
    onClickURL(a) {
      gotoNote(a);
    },
    onClickOpenNote() {
      this.openNoteBook = true;
    },
    ResetAll() {
      window.localStorage.clear();
      window.location.reload();
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
      if(a.target.innerText=='删除')return
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
    onOpenContentList() {
      this.showdetail = this.showdetail == false;
    },
    onSelect(name) {
      let b = new Book();
      if (name == "md") {
        let md = b.md();
        // console.log(md);
        funDownload(md, window.$docsify.name + ".md");
      } else if (name == "json") {
        let json = b.jsonstr();
        funDownload(json, window.$docsify.name + ".json");
      } else if (name == "html") {
        let json = b.exportHtml();
        funDownload(json, window.$docsify.name + ".html");
      }
    },
    onEnableScript() {
      this.enableScript = this.enableScript == false;
      let { enableScript } = this;
      getConfig().save({ enableScript });
      // document.location.reload();
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