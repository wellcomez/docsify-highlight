<template>
  <Tooltip
    class="outline"
    :delay="300"
    :max-width="maxWidth"
    theme="light"
    :disabled="disabled"
    transfer
    :placement="placement"
    :always="always"
  >
    <!-- style="width: 100%; margin-left: 10px; padding-right: 10px" -->
    <Row type="flex">
      <Col
        v-if="icon"
        span="3"
        style="display: inline-block; text-align: center"
      >
        <Icon :type="icon" size="16" :color="iconColor"></Icon>
      </Col>
      <Col span="21">
        <div>
          <p
            :style="style"
            @click="onClick"
            v-touch:touchhold="touchHoldHandler"
            v-touch:end="endHandler"
          >
            {{ title2 }}
          </p>
        </div>
      </Col>
      <Col
        v-if="mainicon"
        span="3"
        style="display: inline-block; text-align: center"
      >
        <!-- style="display: flex; justify-content: center" -->
        <Icon
          :type="mainicon"
          size="16"
          class="mainicon"
          @click="onClickExpanded1"
        ></Icon>
        <!-- style="float: right; margin-right: 10px" -->
      </Col>
    </Row>

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
import α from "color-alpha";
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
    let style = { "padding-left": "5%" };
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
      if (this.iconColor.length == 0) this.iconColor = α(colorhex, 0.8);
    }
    let icon = "ios-brush-outline";
    if (note) {
      icon = "md-create";
    }
    if (children && children.length) {
      icon = undefined;
      this.mainicon = this.expand
        ? "ios-arrow-dropdown"
        : "ios-arrow-dropright";
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
      mainicon: undefined,
      iconColor: "",
      icon: undefined,
      classOfSpan: "",
      always: false,
    };
  },
  props: {
    expand: {
      type: Boolean,
      default: false,
    },
    notedata: { type: Object, default: undefined },
    onSelected: { type: Function, default: undefined },
    onClickExpanded: { type: Function, default: undefined },
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
    onClickExpanded1(e) {
      let drop = "ios-arrow-dropdown" == this.mainicon;
      this.mainicon =
        drop == false ? "ios-arrow-dropdown" : "ios-arrow-dropright";
      this.onClickExpanded(e);
    },
    onClick(e) {
      this.onSelected(e);
    },
  },
};
</script>

<style>
.xxxx .ivu-tree-arrow {
  display: none;
  width: 1px;
}
.doclist .outline .ivu-tree-arrow {
  width: 0px;
}
.outline {
  width: 390px;
}
@media screen and (max-width: 480px) {
  .outline {
    width: 95%;
  }
}
</style>
