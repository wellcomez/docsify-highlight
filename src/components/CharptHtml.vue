<template>
  <div class="charpterhtml" style="margin-left: 10%; margin-right: 10%">
    <h2 v-if="exporthtml">
      <a :href="hrefa" style="text-decoration: none; color: #42b983">{{
        title
      }}</a>
    </h2>
    <h2 v-else>{{ title }}</h2>
    <div
      v-for="(
        { note, html, label, imgsrc, tags, url, text, style, notshowSeq }, index
      ) in list"
      :key="index"
    >
      <!-- <h3 v-if="label">{{ index + 1 }}</h3> -->
      <!-- <h3 v-else>{{ index + 1 }}</h3> -->

      <div
        style="
          margin-top: 4px;
          margin-bottom: 4px;
          font-size: small;
          font-weight: normal;
        "
        @click="onIcon(index)"
      >
          <!-- :href="href({ title, label, index })" -->
        <a
          v-if="notshowSeq != true"
          style="text-decoration: none; color: black"
        >
          {{ index + 1 }}.</a
        >
          <!-- :href="href({ title, label, index })" -->
        <a
          v-if="notshowSeq"
          style="text-decoration: none; color: black"
        ></a>
        <sup>
          <a
            v-if="onClick"
            @click="onClick({ index, url })"
            style="text-decoration: none; color: #42b983"
            >~</a
          >
          <a v-else :href="url" style="text-decoration: none; color: #42b983"
            >~</a
          >
        </sup>
        <div v-if="tags" style="display: inline-block">
          <span
            v-for="(a, index) in tags"
            :key="index"
            style="
              background: #42b983;
              color: white;
              border-radius: 3px;
              padding-left: 4px;
              padding-right: 4px;
              font-size: xx-small;
              margin-left: 4px;
            "
            >{{ a }}</span
          >
        </div>
        <div v-if="html" style="display: inline" v-html="html"></div>
        <div v-else style="display: inline">
          <span :style="style">{{ text }}</span>
        </div>
      </div>
      <img
        v-if="imgsrc"
        :src="imgsrc"
        style="width: 40%; border: 1px solid #42b983; margin: 2px"
      />
      <div v-if="note" :style="styleNote" class="outline-title">
        <p>{{ note }}</p>
      </div>
    </div>
  </div>
</template>
<script>
import { convertStyle, createHtml, getImgSrcUrl } from "../utils";

export default {
  data() {
    return {
      showMerge: false,
      showSelected: {},
      hrefa: "",
      title: "",
      list: [{ name: "" }],
      styleNote:
        " border-left: 2px solid #42b983;\
  margin-left: 4px;\
  padding-left: 4px;\
  margin-top: 2px;",
    };
  },
  methods: {
    onIcon(index) {
      let { notshowSeq } = this.list[index];
      notshowSeq = notshowSeq != true;
      let pre = this.list[index - 1];
      if (pre != undefined && notshowSeq == true) {
        if (pre.notshowSeq) {
          notshowSeq = true;
        }
      }
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
      let l = this.list[index];
      this.list[index] = { ...l, ...{ notshowSeq } };
      this.list = this.list.map((a, idx) => {
        let { notshowSeq, id } = a;
        let rootid = getrootid(notshowSeq, idx);
        if (rootid == undefined) {
          notshowSeq = false;
        }
        this.charpter.store.update({ id, notshowSeq, rootid });
        return { ...a, ...{ rootid, notshowSeq } };
      });
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

  created() {
    let { charpter } = this;
    if (charpter) {
      this.title = charpter.label;
      this.hrefa = "#" + this.title;
      let children = charpter.mergeChild();
      this.list = children.map((a) => this.convert(a, charpter));
    }
  },
  watch: {
    charpter(charpter) {
      this.list = charpter.mergeChild().map((a) => this.convert(a, charpter));
    },
  },
  props: {
    rootpath: { type: String, default: undefined },
    exporthtml: { type: Boolean, default: false },
    charpter: { type: Object, default: undefined },
    onClickURL: { type: Function, default: undefined },
  },
};
</script>
<style >
.charpterhtml i {
  font-style: normal;
}
.outline-title {
  border-left: 2px solid #42b983;
  margin-left: 4px;
  padding-left: 4px;
  margin-top: 2px;
}
</style>


