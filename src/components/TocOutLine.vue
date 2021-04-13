<template>
  <!-- style="width: 100%; margin-left: 10px; padding-right: 10px" -->
  <Row type="flex">
    <Col span="20">
      <div
        @click="onClick"
        v-touch:touchhold="touchHoldHandler"
        v-touch:end="endHandler"
        :style="style"
        :class="outlineTitleClass"
      >

        <span v-if="html" v-html="html" class="title-span"></span>
        <span v-else :style=style>{{title2}}</span>
        <img
          v-if="imgsrc"
          v-bind:src="imgsrc"
          style="width: 40px; height: 40px"
        />
      </div>
    </Col>
    <Col
      v-if="mainicon"
      span="3"
      style="display: inline-block; text-align: center; background-color: white"
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
    <Col v-if="icon" span="4" style="display: inline-block; text-align: center">
      <Tooltip
        v-if="showiconRight"
        class="outline"
        :delay="500"
        :max-width="maxWidth"
        theme="light"
        :disabled="disabled"
        transfer
        :placement="placement"
        :always="always"
      >
        <Icon :type="icon" size="18"></Icon>
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

      <!-- v-model="openMore" -->
      <!-- transfer -->
      <Tooltip
        theme="light"
        width="60px"
        placement="left-start"
        :disabled="disabledPopMore"
        class="morebtn"
      >
        <Icon type="ios-more-outline" @click="onClickMore" size="18"></Icon>
        <ButtonGroup slot="content" vertical>
          <Button
            v-for="({ name, click }, index) in list"
            :key="index"
            size="small"
            @click="click()"
            >{{ name }}</Button
          >
        </ButtonGroup>
      </Tooltip>
    </Col>
  </Row>
</template>
<script>
var isMobile = require("is-mobile");

const rgba = require("color-rgba");
var Colr = require("colr");
import { convertStyle, createHtml, getImgSrcUrl } from "../utils";
export default {
  name: "TocOutLine",
  // directives: { ClickOutside },
  created() {
    let {
      label: title,
      children,
      note,
      imgsrc,
      tree,
    } = this.notedata;
    this.showiconRight = isMobile() != true;
    this.imgsrc = getImgSrcUrl(imgsrc);
    this.html = createHtml(tree);
    // this.classOfSpan = this.spanclass(this.notedata);
    this.title2 = title;
    if (note && note.length) {
      this.title2 = `"${note}"-${title}`;
    }
    this.title = title;
    this.note = note && note.length ? `"${note}"` : undefined;
    let styleDefine = this.notedata.styleDefine
    for (let color in styleDefine) {
      let a = styleDefine[color];
      let { colorhex } = a;
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
      this.outlineTitleClass = "outline-text-parent";
    }
    this.icon = icon;
    this.title = title;
    this.tips = title;
    this.disabled = false;
    // this.t1 = t1;
    // this.t2 = t2;
    // this.neststyle = neststyle;
    if (children && children.length) {
      this.disabled = true;
    }
    // if(title==undefined||(title.length==0)){
    //   this.disabled = true;
    // }
  },
  data() {
    return {
      neststyle: undefined,
      t1: undefined,
      t2: undefined,
      showiconRight: true,
      title2:undefined,
      html:undefined,
      list: [
        {
          name: "删除",
          click: () => {
            let { hl } = window;
            let { id } = this.notedata;
            hl.deleteId(id);
          },
        },
        { name: "查看", click: () => {} },
      ],
      disabledPopMore: true,
      textStyle: {},
      outlineTitleClass: "outline-text",
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
    style() {
      return convertStyle(this.notedata.style)
    },
    placement() {
      // return isMobile() ? "top-start" :
      return "left-start";
    },
    maxWidth() {
      if (window.screen < 320) {
        return 200;
      }
      return 400;
    },
  },
  methods: {
    onClickMore() {
      this.openMore = this.openMore != true;
      this.disabledPopMore = this.disabledPopMore != true;
    },
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
.morebtn .ivu-tooltip-inner {
  padding: 0px;
  /* padding-left:1px;
  padding-right:1px;
  padding-top:1px;
  padding-bottom:1px; */
}
.title-span i{
  font-style: normal;
}
.outline-text {
  line-height: normal;
  white-space: normal;
  /* height: 50px; */
  width: 100%;
  overflow-y: hidden;
  overflow-x: hidden;
  padding-left: 4px;
  padding-right: 4px;
  padding-top: 1px;
  padding-bottom: 1px;
}
.outline-text-parent {
  height: 25px;
  width: 100%;
  overflow-y: hidden;
  overflow-x: hidden;
  /* font-weight:bold; */
}

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
