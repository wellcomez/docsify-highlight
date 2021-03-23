<template>
  <Tooltip
    :delay="300"
    :max-width="maxWidth"
    theme="light"
    :disabled="disabled"
    transfer
    :placement="placement"
    :always="always"
  >
    <Icon v-if="icon" :type="icon"></Icon>
    <span
      :style="style"
      @click="onClick"
      v-touch:touchhold="touchHoldHandler"
      v-touch:start="startHandler"
      v-touch:end="endHandler"
      >{{ title2 }}</span
    >
    <div slot="content">
      <div v-if="note" class="outline-title">
        <p>{{ note }}</p>
      </div>
      <div v-if="note" class="outline-note">
        <p style="padding: 10px; margin: 10px">{{ title }}</p>
      </div>
      <p v-else class="outline-title">{{ title }}</p>
    </div>
  </Tooltip>
</template>
<script>
import isMobile from "_is-mobile@3.0.0@is-mobile";
import { tBackgroundColor, tUl } from "../colorSelector";
export default {
  name: "TocOutLine",
  created() {
    let { label: title, children, note, style: styleDefine } = this.notedata;
    // this.classOfSpan = this.spanclass(this.notedata);
    this.title2 = title;
    if (note && note.length) {
      this.title2 = `"${note}"-${title}`;
    }
    this.title = title;
    this.note = note && note.length ? `"${note}"` : undefined;
    let style = {};
    for (let color in styleDefine) {
      color = parseInt(color);
      let a = styleDefine[color];
      let { colorhex, enable } = a;
      if (enable == false) continue;
      if (color == tUl) {
        style.borderBottom = "1px solid " + colorhex;
      } else if (color == tBackgroundColor) {
        style.backgroundColor = colorhex;
      } else {
        style.color = colorhex;
      }
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
      always: false,
    };
  },
  props: {
    notedata: { type: Object, default: undefined },
    onSelected: { type: Function, default: undefined },
  },
  computed: {
    placement() {
      return isMobile() ? "top-start" : "bottom-start";
    },
    maxWidth() {
      if (window.screen < 320) {
        return 200;
      }
      return 400;
    },
  },
  methods: {
    touchHoldHandler() {
      if (isMobile()) this.always = true;
    },
    endHandler() {
      if (isMobile()) this.always = false;
    },
    onClick(e) {
      this.onSelected(e);
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
  border-left-color: red !important;
  border-left-width: 2px !important;
  border-left-style: solid !important;
}
</style>
