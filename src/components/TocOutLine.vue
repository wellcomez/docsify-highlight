<template>
  <!-- style="width: 100%; margin-left: 10px; padding-right: 10px" -->
  <Row type="flex">
    <Col v-if="icon" span="3" style="display: inline-block; text-align: center">
      <Icon :type="icon" size="18" :color="iconColor"></Icon>
    </Col>
    <Col span="21">
      <Tooltip
        class="outline"
        :delay="500"
        :max-width="maxWidth"
        theme="light"
        :disabled="disabled"
        transfer
        :placement="placement"
        :always="always"
      >
        <div>
          <p
            :style="style"
            @click="onClick"
            v-touch:touchhold="touchHoldHandler"
            v-touch:end="endHandler"
          >
            {{ title2 }}
            <img
              v-if="imgsrc"
              v-bind:src="imgsrc"
              style="width: 40px; height: 40px"
            />
          </p>
        </div>
        <div slot="content">
          <img
            v-if="imgsrc"
            v-bind:src="imgsrc"
            style="width: 80%; height: 80%"
          />
          <div v-if="note" class="outline-title">
            <p>{{ note }}</p>
          </div>
          <div v-if="note" class="outline-note">
            <p style="padding: 10px; margin: 10px">{{ title }}</p>
          </div>
          <p v-else class="outline-title">{{ title }}</p>
        </div>
      </Tooltip>
    </Col>
    <Col
      v-if="mainicon"
      span="3"
      style="display: inline-block; text-align: center"
    >
      <!-- style="display: flex; justify-content: center" -->
      <Icon
        :type="mainicon"
        size="18"
        class="mainicon"
        @click="onClickExpanded1"
      ></Icon>
      <!-- style="float: right; margin-right: 10px" -->
    </Col>
  </Row>
</template>
<script>
import isMobile from "_is-mobile@3.0.0@is-mobile";
const rgba = require("color-rgba");
import { tBackgroundColor, tUl } from "../colorSelector";
var Colr = require("Colr");
export default {
  name: "TocOutLine",
  created() {
    let {
      label: title,
      children,
      note,
      style: styleDefine,
      imgsrc,
    } = this.notedata;
    this.imgsrc = imgsrc;
    // this.classOfSpan = this.spanclass(this.notedata);
    this.title2 = title;
    if (note && note.length) {
      this.title2 = `"${note}"-${title}`;
    }
    this.title = title;
    this.note = note && note.length ? `"${note}"` : undefined;
    let style = { "padding-left": "4px" };
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
      if (this.iconColor.length == 0) {
        let array = rgba(colorhex);
        a[3] = 1;
        let colr = Colr.fromRgbArray(array);
        let { h, s, v } = colr.toHsvObject();
        v = Math.min(70, v);
        s = Math.max(90, s);
        this.iconColor = Colr.fromHsvObject({ h, s, v }).toHex();
      }
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
    // if(title==undefined||(title.length==0)){
    //   this.disabled = true;
    // }
  },
  data() {
    return {
      style: {},
      imgsrc: undefined,
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

@media screen and (max-width: 480px) {

}
</style>
