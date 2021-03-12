
<template>
  <div class="op-panel">
    <Badge :count="count2">
      <Row class="panel-header" type="flex">
        <Col>
          <SvgButton
            v-if="checked"
            v-bind:onClick="onOpenContentList"
            name="ios-book"
            tips="Table of Content"
          />
        </Col>
        <Col>
          <Bubbling v-if="checked" :onSelect="onSelect" content="Export" />
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
            name="auto"
            type="checkbox"
            class="switch"
            v-bind:checked="checked"
            v-bind:on-change="onChange"
            v-on:click="onChange"
          />
        </Col>
        <!-- <Col>
          <div
            class="d1"
            v-if="checked"
            style="background-color: rgb(202, 233, 202)"
          >
            <span class="d1" style="">{{ count2 }}</span>
          </div>
        </Col> -->
        <Col>
          <SvgButton
            v-if="checked"
            v-bind:onClick="onBookmark"
            :name="bookmarkicon"
          />
        </Col>
      </Row>
      <Row class="contenttable" v-if="showdetail">
        <Tabs type="line" size="small">
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
    </Badge>
  </div>
</template>

<script>
import { book } from "../store";
import TocNote from "./TocNote.vue";
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
import Bubbling from "./Bubbling.vue";
// import { checkClickOut } from "../mountCmp";
export default {
  components: { TocNote, Bubbling },
  name: "Panel",
  computed: {
    count2() {
      let a = new book().count() + this.count;
      return a + preHighLightItems().length - this.count;
    },
    canupload() {
      return this.checked && localidstore.on;
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
    // hideDetails() {
    //   this.showdetail = false;
    // },
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
<style scoped>
.op-panel {
  position: absolute;
  right: 20px;
  left: auto;
  top: 50px;
  border-radius: 3px;
  color: black;
}
.contenttable {
  width: 400px;
  background: white;
  border: 1px solid var(--theme-color, #42b983);
}

.panel-header {
  height: 30px;
  background: var(--theme-color, #42b983);
}

.headtile {
  font-size: xx-small;
  color: white;
  margin: 2px;
}

button {
  margin: 4px;
}

@media screen and (max-width: 640px) {
  .contenttable {
    width: 240px;
  }
}
@media screen and (max-width: 640px) {
  .contenttable {
    height: 240px;
  }
}
@media screen and (max-width: 1150px) {
}
</style>

<style>
</style>