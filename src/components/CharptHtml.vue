<template>
  <div class="">
    <h2>{{ title }}</h2>
    <div
      v-for="({ note, label, style, imgsrc, text, tags }, index) in list"
      :key="index"
    >
      <h3 v-if="label">{{ index + 1 }}</h3>
      <h3 v-else>{{ index + 1 }}</h3>
      <span
        v-for="(a, index) in tags"
        :key="index"
        style="
          border: 1px solid #42b983;
          border-radius: 3px;
          padding-left: 4px;
          padding-right: 4px;
        "
        >{{ a }}</span
      >
      <span v-if="text" :style="style">{{ text }}</span>
      <img v-if="imgsrc" :src="imgsrc" style="width:60%" />
      <div v-if="note" :style="styleNote" class="outline-title">
        <p>{{ note }}</p>
      </div>
    </div>
  </div>
</template>
<script>
import { tBackgroundColor, tUl } from "../colorSelector";
// const rgba = require("color-rgba");
const convert = (a) => {
  let { note, imgsrc, text, style: styleDefine, tags } = a;
  let style = {};
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
  let ret = { ...{ tags: [] }, ...{ imgsrc, label, text, style, note, tags } };
  return ret;
};
export default {
  data() {
    return {
      title: "",
      list: [{ name: "" }],
      styleNote:
        " border-left: 2px solid #42b983;\
  margin-left: 4px;\
  padding-left: 4px;\
  margin-top: 2px;",
    };
  },
  created() {
    let { charpterData, charpter } = this;
    if (charpter) {
      this.title = charpter.label;
      this.list = charpter.children.map(convert);
    } else {
      this.list = charpterData.map(convert);
    }
  },
  watch: {
    charpterData(charpterData) {
      this.list = charpterData.map(convert);
    },
    charpter(charpter) {
      this.list = charpter.children.map(convert);
    },
  },
  props: {
    charpter: { type: Object, default: undefined },
    charpterData: {
      type: Array,
      default: () => {
        return [];
      },
    },
  },
};
</script>
<style scoped>
.outline-title {
  border-left: 2px solid #42b983;
  margin-left: 4px;
  padding-left: 4px;
  margin-top: 2px;
}
</style>
