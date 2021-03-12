<template>
  <Tooltip
    :delay="300"
    :max-width="maxWidth"
    theme="light"
    :disabled="disabled"
    placement="bottom-start"
  >
    <Icon v-if="icon" :type="icon"></Icon>
    <span
      :style="style"
      :class="classOfSpan"
      @click="onSelected"
    >{{title2}}</span>
    <div slot="content">
      <div v-if="note" class="outline-title">
        <p>{{note}}</p>
      </div>
      <div v-if="note" class="outline-note">
        <p style="margin-top:10px;margin-bottom:10px;margin-left:5px;margin-right:5px">{{title}}</p>
      </div>
      <p  v-else class="outline-title">{{title}}</p>
    </div>
  </Tooltip>
</template>
<script>
import { classNameFromColor, ul } from "../colorSelector";
export default {
  name: "TocOutLine",
  created() {
    let { label: title, children, colorhex, note, color } = this.notedata;
    this.classOfSpan = this.spanclass(this.notedata);
    this.title2 = title;
    if (note && note.length) {
      this.title2 = `"${note}"-${title}`;
    }
    this.title = title;
    this.note = note && note.length ? `"${note}"` : undefined;
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
    this.disabled = false;
    if (children && children.length) {
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
    notedata: { type: Object, default: undefined },
    onSelected: { type: Function, default: undefined },
  },
  computed: {
    maxWidth() {
      if (window.screen < 320) {
        return 200;
      }
      return 400;
    },
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
.outline-note {
  background: #80808026 !important;
  border-left-color: red  !important;
  border-left-width: 2px!important;
  border-left-style: solid!important;
}
</style>
