<template>
  <div class="charpterhtml">
    <Divider></Divider>
    <h2 v-if="exporthtml" class="charpterhtml-h2" v-bind:tt="title">
      <a :href="hrefa"
        >{{ title }}
        <Icon type="ios-git-compare" v-on:click="onSort" />
      </a>
    </h2>
    <h2 v-else class="charpterhtml-h2" v-bind:tt="title">
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
      @mouseover="onChangeFocuse(index)"
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
          v-if="notshowSeq || tabn > 0"
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
      </div>
      <img
        class="html-img"
        @click="onClick({ index, url })"
        v-if="imgsrc"
        @mouseover="onImageIn"
        @mouseout="onImageOut"
        v-lazy="imgsrc"
      />
      <div v-if="note" class="outline-title">
        <p>{{ note }}</p>
      </div>
    </div>
  </div>
</template>
<script>
// eslint-disable-next-line no-unused-vars
import { convertStyle, getImgSrcUrl, getNoteUrl } from "../utils";
import { Divider } from "iview";
import { msg } from "./msgbox";
import { default_tree_version } from "../DocHighlighter";
import { createHtml } from '../converDom2Html';
const copyPasteBoard = require("clipboard-copy");

// import { Tooltip } from "iview";
export default {
  components: { Divider },
  data() {
    return {
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
      this.list = this.initList(charpter);
    },
    active(a) {
      if (a) {
        this.Sort();
        this.$el.scrollIntoView();
      }
      this.focusline = undefined;
    },
    focusline() {
      // this.list = this.updateList();
    },
  },
  mounted() {
    // console.log("mounted");
    if (this.active) {
      this.$el.scrollIntoView();
    }
  },
  methods: {
    onCopy({ id, text }) {
      let copy = getNoteUrl(id, this.charpter) + "\n\n" + text;
      copyPasteBoard(copy);
      msg("拷贝", `${id}  [${text.length}]字`);
    },
    onChangeFocuse(index) {
      if (index != this.focusline && this.focusline != undefined) {
        this.focusline = undefined;
      }
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
      setTimeout(() => {
        if (this.focusline == index) {
          this.focusline = undefined;
        }
      }, 3000);
    },
    lineClass(index) {
      return index == this.focusline ? "linefocus" : "";
    },
    // "display: inline;";
    tabN(tabn) {
      tabn = tabn > 0 ? tabn : 0;
      let style = "";
      if (tabn) style = style + `margin-left:${tabn * 2}em`;
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
      if (charpter)
        return charpter
          .mergeChild()
          .map((a, idx) => this.convert(a, charpter, idx));
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
      if ((tabn == undefined || isNaN(tabn)) && notshowSeq) {
        tabn = 0;
      }
      if (right) {
        tabn++;
      } else {
        tabn--;
      }
      if (tabn < 1) {
        tabn = 0;
        notshowSeq = false;
      } else {
        notshowSeq = true;
      }
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
      let label = text.substring(0, 6);
      let style = convertStyle(a.style);
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
        let children = this.charpter.mergeChild();
        let a = children[index];
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
<style >
.charpterhtml .linefocus {
  border: 1px solid #42b983;
  padding: 4px;
  border-radius: 2px;
  background-color: white;
  box-shadow: 0 5px 20px rgba(0, 0, 0, 0.8);
  transform: translateY(-10px) scale(1.02);
}
.charpterhtml {
  margin-left: 10%;
  margin-right: 10%;
}
.charpterhtml a {
  text-decoration: none;
  color: #42b983;
}
.charpterhtml .ivu-icon {
  color: #42b983;
}
.charpterhtml i {
  font-style: normal;
}
.html-img,
html-img-hover {
  display: block;
  width: 60%;
  border: 1px solid #42b983;
  margin: 2px;
}
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
  background-color: #42b983;
  color: white;
  border-radius: 3px;
}
.outline-title {
  border-left: 2px solid #42b983;
  margin-left: 4px;
  padding-left: 4px;
  margin-top: 2px;
}
</style>


