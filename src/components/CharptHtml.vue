<template>
  <div class="">
    <h2>{{ title }}</h2>
    <div
      v-for="({ note, label, style, imgsrc, text }, index) in list"
      :key="index"
    >
      <h3 v-if="label">{{ label }}</h3>
      <p v-if="text" :style="style">{{ text }}</p>
      <img v-if="imgsrc" :src="imgsrc" />
      <div v-if="note" class="outline-title">
        <p>{{ note }}</p>
      </div>
    </div>
  </div>
</template>
<script>
import { tBackgroundColor, tUl } from "../colorSelector";
// const rgba = require("color-rgba");
const convert = (a) => {
  let { note, imgsrc, text, style: styleDefine } = a;
  let style = {};
  let label = text.substring(0, 6);
  for (let color in styleDefine) {
    color = parseInt(color);
    let a = styleDefine[color];
    let { colorhex } = a;
    if (color == tUl) {
      style["border"] = "1px solid " + colorhex;
    } else if (color == tBackgroundColor) {
      style.backgroundColor = colorhex;
    } else {
      style.color = colorhex;
    }
  }
  let ret = {
    // ...{ imgsrc: false, label: false, text: false, style: {} },
    ...{ imgsrc, label, text, style, note },
  };
  return ret;
};
export default {
  data() {
    return {
      title: "",
      list: [{ name: "" }],
    };
  },
  mounted() {
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
