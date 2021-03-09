
<template>
  <div class="op-panel">
    <section class="panel-header ">
      <SvgButton  v-if="checked" v-bind:onClick="onOpenContentList" name="toc" tips="Table of Content"/>
      <Bubbling
        class="left"
        v-if="checked"
        :onSelect="onSelect"
        content="Export"
      />
      <PopSvgButton   v-if="canupload"  :click="onTest" name="Clouddownload" title="Download data" tips="Download"/>
      <PopSvgButton   v-if="canupload"  :click="onSave2Cloud" title="Update data to cloud"  name="Cloudupload" tips="Upload"/>

      <input
        name="auto"
        type="checkbox"
        class="switch left"
        v-bind:checked="checked"
        v-bind:on-change="onChange"
        v-on:click="onChange"
      >
      <div class="d1 hlgreen left" v-if="checked" style="text-align: center">
        <span v-html="count2" style=""></span>
      </div>
    </section>
    <div class="contenttable" v-if="showdetail">
      <TocNote v-bind:close="closedetail" v-bind:key="count2"></TocNote>
    </div>
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
<style scoped>
.op-panel {
  position: fixed;
  right: 20px;
  left: auto;
  top: 50px;
  /* background: rgba(216, 206, 206, 0.897); */
  background: var(--theme-color, #42b983);
  border-radius: 3px;
  color: black;
}

@media screen and (max-width: 1150px) {
  main {
    padding: 0 15px;
    overflow-x: hidden;
  }

  .op-panel {
    right: 20px;
    left: auto;
    top: 50px;
    background: rgba(216, 206, 206, 0.897);
    color: black;
    border-radius: 3px;
  }
}
.panel-header {
  height: 30px;
}

.headtile {
  font-size: xx-small;
  color: white;
  margin: 2px;
}
.contenttable {
  width: 400px;
  /* height: 600px; */
  /* border: 1px solid black; */
  /* background: blue; */
}
button {
  margin: 4px;
}
</style>

<style>
@import "../assets/web.css";
</style>