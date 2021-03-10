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
      v-html="title2"
      :class="classOfSpan"
      @click="onSelected"
    />
    <div slot="content">
      <p v-html="title" class="outline-title"></p>
      <div v-if="note" class="outline-note">
        <p v-html="note"></p>
      </div>
    </div>
  </Tooltip>
</template>
<script>
import { classNameFromColor, ul } from "../colorSelector";
export default {
  name: "TocOutLine",
  created() {
    let { label: title, children, colorhex, note, color } = this.item;
    this.classOfSpan = this.spanclass(this.item);
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
    item: { type: Object, default: undefined },
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
  border: "1px solid red";
  border-radius: 3px;
}
</style>
