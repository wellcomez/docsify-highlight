<template>
  <div class="" style="margin-left: 10%; margin-right: 10%">
    <h2 v-if="exporthtml">
      <a :href="hrefa" style="text-decoration: none; color: #42b983">{{
        title
      }}</a>
    </h2>
    <h2 v-else>{{ title }}</h2>
    <div
      v-for="({ note, style, label, imgsrc, text, tags, url }, index) in list"
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
      >
        <a
          :href="href({ title, label, index })"
          style="text-decoration: none; color: black"
          >{{ index + 1 }}.</a
        >

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
        <span v-if="text" :style="style">{{ text }}</span>
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
import { tBackgroundColor, tUl } from "../colorSelector";
import { getImgSrcUrl } from "../utils";
// const rgba = require("color-rgba");
const convert = (a, charpter) => {
  let { note, imgsrc, text, style: styleDefine, tags, id } = a;
  imgsrc = getImgSrcUrl(imgsrc);
  let url = charpter.url(id);
  let style = { margin: "4px" };
  let label = text.substring(0, 6);
  for (let color in styleDefine) {
    color = parseInt(color);
    let a = styleDefine[color];
    let { colorhex } = a;
    if (color == tUl) {
      style["border-bottom"] = "1px solid " + colorhex;
    } else if (color == tBackgroundColor) {
      style.backgroundColor = colorhex;
    } else {
      style.color = colorhex;
    }
  }
  let ret = {
    ...{ imgsrc, label, text, style, note, tags: tags, url },
  };
  return ret;
};
export default {
  computed() {
    return {};
  },
  data() {
    return {
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
    // eslint-disable-next-line no-unused-vars
    href({ title, label, index }) {
      return `#titleid?${title}${index}`;
    },
    onClick({ index, url }) {
      if (this.onClickURL) {
        let a = this.charpter.children[index];
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
      this.list = charpter.children.map((a) => convert(a, charpter));
    }
  },
  watch: {
    charpter(charpter) {
      this.list = charpter.children.map((a) => convert(a, charpter));
    },
  },
  props: {
    exporthtml: { type: Boolean, default: false },
    charpter: { type: Object, default: undefined },
    onClickURL: { type: Function, default: undefined },
  },
};
</script>
<style >
.outline-title {
  border-left: 2px solid #42b983;
  margin-left: 4px;
  padding-left: 4px;
  margin-top: 2px;
}
</style>
