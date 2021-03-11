
<template>
  <div class="op-panel">
    <Row class="panel-header" type="flex">
      <Col>
        <SvgButton
          v-if="checked"
          v-bind:onClick="onOpenContentList"
          name="toc"
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
          name="Clouddownload"
          title="Download data"
          tips="Download"
        />
      </Col>
      <Col>
        <PopSvgButton
          v-if="canupload"
          :click="onSave2Cloud"
          title="Update data to cloud"
          name="Cloudupload"
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
      <Col>
        <div
          class="d1"
          v-if="checked"
          style="text-align: center; background-color: rgb(202, 233, 202)"
        >
          <span v-html="count2" style=""></span>
        </div>
      </Col>
    </Row>
    <Row class="contenttable" v-if="showdetail">
      <Tabs type="line" size="small">
        <TabPane label="标签一">
          <TocNote
            v-bind:close="closedetail"
            v-bind:key="count2"
            style="margin-left: 10px"
          ></TocNote>
        </TabPane>
        <TabPane label="标签三">标签三的内容</TabPane>
      </Tabs>
    </Row>
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
    count2: function () {
      let a = new book().count() + this.count;
      return a + preHighLightItems().length - this.count;
    },
    canupload: function () {
      return this.checked && localidstore.on;
    },
  },
  data() {
    return {
      closedetail: this.fnclosedetail,
    };
  },
  mounted: function () {
    // let d = document.getElementsByClassName("op-panel")[0];
    // checkClickOut(d, this.hideDetails);
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
        console.log(md);
        funDownload(md, window.$docsify.name + ".md");
      } else if (name == "json") {
        let b = new book();
        let json = b.jsonstr();
        funDownload(json, window.$docsify.name + ".json");
      }
    },
    onChange() {
      let { hl: highlighter } = window;
      this.checked = this.checked == false;
      highlighter.enable(this.checked);
      if (this.checked == false) this.showdetail = false;
    },
  },
};
</script>
<style>
.contenttable .ivu-tabs-nav .ivu-tabs-tab-active {
  color: var(--theme-color, #42b983);
}
.contenttable .ivu-tabs-nav .ivu-tabs-tab-active::before {
  color: var(--theme-color, #42b983);
}
</style>
<style scoped>
.op-panel {
  position: fixed;
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
@import '../styles/iview.css';
@import "../assets/web.css";
</style>