<template>
  <Tooltip :content="tips" :delay="300" :max-width="400" theme="light" :disabled="disabled" placement="left">
    <Icon v-if="icon" :type="icon"></Icon>
    <span
      :style="style"
      v-html="title"
      :class="classOfSpan"
      @click="onSelected"
    />
  </Tooltip>
</template>
<script>
import { classNameFromColor, ul } from "../colorSelector";
export default {
  name: "TocOutLine",
  created() {
    let { label: title, children, colorhex, note, color } = this.item;
    this.classOfSpan = this.spanclass(this.item);
    if (note && note.length) {
      title = `"${note}"-${title}`;
    }
    let style = {};
    if (color == ul) {
      style.borderBottom = "1px solid " + colorhex;
    } else {
      style.backgroundColor = colorhex;
    }
    let icon = "ios-brush-outline";
    if (note) {
      icon = "md-create";
    }
    if (children && children.length) {
      icon = undefined;
    }
    this.icon = icon;
    this.style = style;
    this.title = title;
    this.tips = title;
    this.disabled = false
    if(children&&children.length){
      this.disabled = true;
    }
  },
  data() {
    return {
      style: {},
      icon: undefined,
      classOfSpan: "",
    };
  },
  props: {
    item: { type: Object, default: undefined },
    onSelected: { type: Function, default: undefined },
  },
  methods: {
    spanclass(data) {
      let { id, color, className } = data;
      if (className != undefined) {
        return className;
      }
      if (id == undefined) {
        return "chartper";
      } else {
        let ret = "chartper-note " + classNameFromColor(color);
        return ret;
      }
    },
  },
};
</script>

<style>
.chartper {
  font-weight: bold;
}
.chartper-note {
  font-weight: normal;
}
</style>
