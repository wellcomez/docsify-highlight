<template>
  <div class="" style="
      margin-left: 10%;
    margin-right: 10%;
  ">
    <h2>{{ title }}</h2>
    <div
      v-for="({ note, label, style, imgsrc, text, tags }, index) in list"
      :key="index"
    >
      <!-- <h3 v-if="label">{{ index + 1 }}</h3> -->
      <!-- <h3 v-else>{{ index + 1 }}</h3> -->
      <div style="margin-top: 4px;margin-bottom: 4px">
        <a :href="url({title,label,index})" style="
            text-decoration: none;
            color: black;
        " >{{index + 1}}.</a>
        <span v-if="text" :style="style">{{ text }}</span>
      </div>
      <img v-if="imgsrc" :src="imgsrc" style="width: 40%;border:1px solid #42b983;margin:2px;" />
      <div v-if="note" :style="styleNote" class="outline-title">
        <p>{{ note }}</p>
      </div>
            <div v-if="tags">
        <span
          v-for="(a, index) in tags"
          :key="index"
          style="
            backgroundColor: #42b983;
            color:white;
            border-radius: 3px;
            padding-left: 4px;
            padding-right: 4px;
            font-size: xx-small;
            margin-left: 4px;
          "
          >{{ a }}</span
        >
      </div>
    </div>
  </div>
</template>
<script>
import { tBackgroundColor, tUl } from "../colorSelector";
// const rgba = require("color-rgba");
const convert = (a) => {
  let { note, imgsrc, text, style: styleDefine, tags } = a;
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
  if (tags && tags.length == 0) {
    tags = undefined;
  }
  let ret = {
    ...{ tags: undefined },
    ...{ imgsrc, label, text, style, note, tags },
  };
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
  methods: {
    // eslint-disable-next-line no-unused-vars
    url({title,label,index}){
      return `#id?${title}${index}`;
    }
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
