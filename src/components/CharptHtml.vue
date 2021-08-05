<template>
  <div class="charpterhtml">
    <Divider></Divider>
    <h2 class="charpterhtml-h2" v-bind:tt="title">
      <a :href="hrefa">{{ title }} </a>
      <Icon type="ios-git-compare" v-on:click="onSort" />
    </h2>
    <div
      v-for="(
        {
          note,
          imgsrc,
          tags,
          url,
          text,
          style,
          notshowSeq,
          tabn,
          html,
          key,
          id,
        },
        index
      ) in list"
      :key="key"
      :class="lineClass(index)"
      @click="onSelectRow(index)"
      @mouseleave="onChangeFocuse"
    >
      <ButtonGroup
        v-if="exporthtml == false && focusline == index"
        style="display: flex"
      >
        <Button
          size="small"
          v-if="exporthtml == false"
          icon="ios-trash"
          @click="onDelete(index)"
        />
        <Button
          size="small"
          icon="ios-arrow-dropleft-circle"
          @click="onIcon(index, false)"
        />
        <Button
          size="small"
          icon="ios-arrow-dropright-circle"
          @click="onIcon(index, true)"
        />
        <Button
          size="small"
          icon="ios-copy"
          @click="onCopy({ id, text, note })"
        />
      </ButtonGroup>
      <div
        class="sub-title"
        @click="onClick({ index, url })"
        :style="tabN(tabn)"
      >
        <a
          v-if="notshowSeq != true || tabn == 0"
          style="text-decoration: none; color: black"
        >
          {{ headNumer(index) }}.</a
        >
        <p style="display: inline" v-if="html" v-html="html"></p>
        <p style="display: inline" v-else>
          <span :style="style">{{ text }}</span>
        </p>
        <span v-for="(a, index) in tags" :key="index" class="sub-tag">{{
          a
        }}</span>
        <div v-if="imgsrc">
          <img class="content-img" v-if="imgsrc" v-lazy="imgsrc" :id="index" />
          <i style="position: relative; left: -20px; top: -5px"
            ><Icon
              size="20"
              class="zoom-icon"
              @click="onClickImg($event, index)"
              custom="iconfont icon-zoom-out"
              type="icon-zoom-out"
          /></i>
        </div>
        <div v-if="note" class="outline-title">
          <p>{{ note }}</p>
        </div>
      </div>
    </div>
  </div>
</template>
<script>
// eslint-disable-next-line no-unused-vars
import { convertStyle, getImgSrcUrl, getNoteUrl } from "../utils";
import { Divider } from "iview";
import { msg } from "./msgbox";
import { get_default_tree_version } from "../DocHighlighter";
import { createHtml } from "../converDom2Html";
import mediumZoom from "medium-zoom";
var VueScrollTo = require("vue-scrollto");
const copyPasteBoard = require("clipboard-copy");

// import { Tooltip } from "iview";
export default {
  components: { Divider },
  data() {
    return {
      zoom: undefined,
      focusline: undefined,
      list: this.initList(this.charpter),
      showMerge: false,
      showSelected: {},
      hoverDelayImg: undefined,
    };
  },
  computed: {
    title() {
      return this.charpter.label;
    },
    hrefa() {
      return this.charpter.path;
    },
  },
  watch: {
    charpter(charpter) {
      let update = this.list.length ? this.active : true;
      if (update) {
        // if (charpter.children.length) console.log("updatecharpt", charpter);
        this.list = this.initList(charpter);
      }
    },
    // list(a) {
    //   console.log("list changed", a);
    // },
    active(a) {
      if (a) {
        this.onActive();
      }
      this.focusline = undefined;
    },
    focusline() {
      // this.list = this.updateList();
    },
  },
  mounted() {
    if (this.active) {
      console.log("mounted", this.active, this.charpter);
      this.onActive();
    }
  },
  methods: {
    onClickImg(e, index) {
      e.stopPropagation();
      let target = Array.apply(null, this.$el.querySelectorAll("img"));
      index = "" + index;
      target = target.find((a) => {
        if (a.id == index) return a;
      });
      if (this.zoom) {
        let a = this.zoom.getZoomedImage();
        if (a.id == index) {
          this.zoom.close();
          return;
        }
      }
      target.style.zIndex = 1000;
      let zoom = mediumZoom(target, {});
      zoom.open().then(() => {
        let bg = document.querySelector(".medium-zoom-overlay");
        bg.style.zIndex = 1000;
      });
      this.zoom = zoom;
      zoom.on("closed", () => {
        zoom.detach();
        this.zoom = undefined;
      });
    },
    onActive() {
      this.Sort();
      let container = ["#notesidebar .ivu-layout .ivu-layout"].find((a) => {
        if (document.querySelector(a)) return true;
      });
      if (container) {
        var options = {
          container,
          easing: "ease-in",
          lazy: false,
          // offset: -60,
          force: true,
          cancelable: true,
          // eslint-disable-next-line no-unused-vars
          onStart: (element) => {
            // console.warn(element, "start");
          },
          // eslint-disable-next-line no-unused-vars
          onDone: (element) => {
            // console.warn(element, "onDone");
          },
          onCancel: () => {
            // scrolling has been interrupted
          },
          x: false,
          y: true,
        };
        let duration = 1;
        VueScrollTo.scrollTo(this.$el, duration, options);
      } else {
        this.$el.scrollIntoView();
      }
    },
    onCopy({ id, text }) {
      let copy = getNoteUrl(id, this.charpter) + "\n\n" + text;
      copyPasteBoard(copy);
      msg("拷贝", `${id}  [${text.length}]字`);
    },
    onChangeFocuse(e) {
      e.stopPropagation();
      this.focusline = undefined;
    },
    headNumer(aIndex) {
      let cout = 0;
      for (let i = 0; i <= aIndex; i++) {
        let c = this.list[i];
        let { notshowSeq, tabn } = c;
        if (tabn == undefined || isNaN(tabn)) {
          tabn = notshowSeq ? 1 : 0;
        }
        if (tabn == 0) {
          cout++;
        }
        if (aIndex == i) {
          return cout;
        }
      }
      return "";
    },
    onSelectRow(index) {
      let { focusline } = this;
      this.focusline = focusline != index ? index : undefined;
      // setTimeout(() => {
      //   if (this.focusline == index) {
      //     this.focusline = undefined;
      //   }
      // }, 3000);
    },
    lineClass(index) {
      return index == this.focusline ? "linefocus" : "";
    },
    // "display: inline;";
    tabN(tabn) {
      let style = "";
      if (tabn) style = style + `margin-left:${(tabn - 1) * 2}em`;
      return style;
    },
    Sort() {
      let { hl } = this;
      let { store } = hl;
      if (this.charpter.label == store.title) {
        hl.updateAllPositions();
        let charpter = hl.store.Chapter();
        this.list = this.initList(charpter);
        return charpter;
      }
    },
    onSort() {
      let charpter = this.Sort();
      if (charpter) msg("排序", charpter.label);
    },
    initList(charpter) {
      if (charpter) {
        this.children = charpter.mergeChild();
        return this.children.map((a, idx) => this.convert(a, charpter, idx));
      }
      return [{ name: "" }];
    },
    onImageOut(e) {
      let { target } = e;
      let { hoverDelayImg } = this;
      if (hoverDelayImg) clearTimeout(hoverDelayImg);
      this.hoverDelayImg = undefined;
      if (target) target.style.width = "60%";
    },
    onImageIn(e) {
      let { target } = e;
      let { hoverDelayImg } = this;
      if (hoverDelayImg) return;
      this.hoverDelayImg = setTimeout(() => {
        if (target) target.style.width = "100%";
      }, 100);
    },
    onDelete(index) {
      let l = this.list[index];
      let { id } = l;
      let { hl, charpter } = this;
      let { store } = charpter;
      hl.deleteId(id, store);
    },
    onIcon(index, right) {
      let { notshowSeq, tabn } = this.list[index];
      if (tabn == undefined || isNaN(tabn)) {
        tabn = notshowSeq != true ? 0 : 1;
      }
      if (right) {
        tabn++;
      } else {
        tabn--;
        tabn = Math.max(tabn, 0);
      }
      notshowSeq = tabn ? true : false;
      this.focusline = undefined;
      let l = this.list[index];
      let key = new Date() * 1 + "-" + index;
      let a = (this.list[index] = { ...l, ...{ notshowSeq, tabn, key } });
      let { id } = a;
      this.charpter.store.update({ id, notshowSeq, tabn });
    },
    convert(a, charpter, idx) {
      let { imgsrc, text, id, tree, version } = a;
      imgsrc = getImgSrcUrl(imgsrc, this.rootpath);
      let url = charpter.url(id, this.rootpath);
      let label = text ? text.substring(0, 6) : idx;
      let style = convertStyle(a.style);
      let default_tree_version = get_default_tree_version();
      let html = version == default_tree_version ? createHtml(tree) : undefined;
      //  = version ? createHtml(tree) : undefined;
      let key = new Date() * 1 + "-" + idx;
      let ret = {
        ...a,
        ...{ style, label, url, imgsrc, html, text, key },
      };
      return ret;
    },
    // eslint-disable-next-line no-unused-vars
    href({ title, index }) {
      return `#titleid?${title}${index}`;
    },
    onClick({ index, url }) {
      if (this.onClickURL) {
        let a = this.children[index];
        this.onClickURL(a);
        return;
      } else {
        window.location.href = url;
      }
    },
  },

  props: {
    active: { type: Boolean, default: false },
    hl: { type: Object, default: undefined },
    rootpath: { type: String, default: undefined },
    exporthtml: { type: Boolean, default: false },
    charpter: { type: Object, default: undefined },
    onClickURL: { type: Function, default: undefined },
  },
};
</script>
<style lang="less">
@import "../my-theme.less";
.charpterhtml {
  margin-left: 10%;
  margin-right: 10%;
  .linefocus {
    border: 1px solid @primary-color;
    padding: 4px;
    border-radius: 2px;
    background-color: white;
    box-shadow: 0 5px 20px rgba(0, 0, 0, 0.8);
    transform: translateY(-10px) scale(1.02);
  }
  a {
    text-decoration: none;
    color: @primary-color;
  }
  .ivu-icon {
    color: @primary-color;
  }
  i {
    font-style: normal;
  }
}
.content-img {
  max-width: 80%;
  left: -30px;
  top: -10px;
}
.drawerwrapper-full .content-img {
  max-width: 50%;
}
.drawerwrapper .content-img {
  max-width: 50%;
}
// .html-img,
// html-img-hover {
//   display: block;
//   width: 60%;
//   border: 1px solid @primary-color;
//   margin: 2px;
// }
.sub-title {
  /* display: flex; */
  margin-top: 4px;
  margin-bottom: 4px;
  font-size: small;
  font-weight: normal;
  /* display: inline-block; */
}
span.sub-tag {
  margin: 4px;
  font-size: small;
  font-weight: normal;
  padding-right: 2px;
  padding-left: 2px;
  background-color: @primary-color;
  color: white;
  border-radius: 3px;
}
.zoom-icon {
  margin-top: 0px;
  color: @primary-color;
}
.outline-title {
  border-left: 2px solid @primary-color;
  margin-left: 4px;
  padding-left: 4px;
  margin-top: 2px;
}
</style>