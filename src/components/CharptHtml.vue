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
        { note, imgsrc, tags, url, text, style, notshowSeq, tabn, html }, index
      ) in list"
      :key="index"
      :class="lineClass(index)"
      @click="onSelectRow(index)"
      @mouseover="onChangeFocuse(index)"
    >
      <div
        v-if="exporthtml == false && focusline == index"
        style="display: flex"
      >
        <Icon
          :size="24"
          v-if="exporthtml == false"
          type="ios-close"
          @click="onDelete(index)"
        />
        <Icon
          :size="24"
          v-if="notshowSeq || tabn > 0"
          type="md-arrow-dropleft"
          @click="onIcon(index, false)"
        />
        <Icon
          :size="24"
          type="md-arrow-dropright"
          @click="onIcon(index, true)"
        />
      </div>
      <div class="sub-title">
        <a
          v-if="notshowSeq != true || tabn == 0"
          style="text-decoration: none; color: black"
        >
          {{ headNumer(index) }}.</a
        >
        <p
          @click="onClick({ index, url })"
          v-if="html"
          :style="tabN(tabn, {})"
          v-html="html"
        >
          <span v-for="(a, index) in tags" :key="index" class="sub-tag">{{
            a
          }}</span>
        </p>
        <p @click="onClick({ index, url })" v-else :style="tabN(tabn, {})">
          <span :style="style">{{ text }}</span>
          <span v-for="(a, index) in tags" :key="index" class="sub-tag">{{
            a
          }}</span>
        </p>
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
import { convertStyle, createHtml, getImgSrcUrl } from "../utils";
import { Divider } from "iview";
import { msg } from "./msgbox";

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
        this.$el.scrollIntoView();
      }
    },
  },
  mounted() {
    // console.log("mounted");
    if (this.active) {
      this.$el.scrollIntoView();
    }
  },
  methods: {
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
    },
    lineClass(index) {
      return index == this.focusline ? "linefocus" : "";
    },
    tabN(tabn, s) {
      tabn = tabn > 0 ? tabn : 0;
      let style = "";
      if (tabn) style = `padding-left:${tabn * 20 + 20}px`;
      for (let a in s) {
        style = style + ";" + a + ":" + s[a];
      }
      return style;
    },
    onSort() {
      let { hl } = this;
      hl.updateAllPositions();
      this.charpter = hl.store.Chapter();
      msg("排序", this.charpter.label);
    },
    initList(charpter) {
      if (charpter)
        return charpter.mergeChild().map((a) => this.convert(a, charpter));
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
    updateList() {
      let getrootid = (notshowSeq, index) => {
        if (notshowSeq) {
          let end = index > 0 ? 0 : index + 1;
          for (let i = index; i >= end; i--) {
            let l = this.list[i];
            let { notshowSeq, id } = l;
            if (notshowSeq != true) {
              return id;
            }
          }
          return;
        }
      };
      return this.list.map((a, idx) => {
        let { notshowSeq, id, tabn } = a;
        let rootid = getrootid(notshowSeq, idx);
        // if (rootid == undefined) {
        //   notshowSeq = false;
        // }
        // if (notshowSeq == false) tabn = 0;
        this.charpter.store.update({ id, notshowSeq, rootid, tabn });
        return { ...a, ...{ rootid, notshowSeq } };
      });
    },
    onIcon(index, right) {
      let { notshowSeq, tabn } = this.list[index];
      if ((tabn == undefined || isNaN(tabn)) && notshowSeq) {
        tabn = 1;
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
      // let pre = this.list[index - 1];
      // if (pre != undefined && notshowSeq == true) {
      //   if (pre.notshowSeq) {
      //     notshowSeq = true;
      //   }
      // }
      this.focusline = undefined;
      let l = this.list[index];
      this.list[index] = { ...l, ...{ notshowSeq, tabn } };
      this.list = this.updateList();
    },
    convert(a, charpter) {
      let { imgsrc, text, id, tree, version } = a;
      imgsrc = getImgSrcUrl(imgsrc, this.rootpath);
      let url = charpter.url(id, this.rootpath);
      let label = text.substring(0, 6);
      let style = convertStyle(a.style);
      let html = version ? createHtml(tree) : undefined;
      let ret = {
        ...a,
        ...{ style, label, url, imgsrc, html, text },
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
  display: flex;
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
  padding: 2px;
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


