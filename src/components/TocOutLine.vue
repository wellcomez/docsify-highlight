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
        <p v-if="html" v-html="html" class="title-span"></p>
        <span v-else :style="style">{{ title2 }}</span>
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
      <!-- <Tooltip
        v-if="showiconRight"
        class="outline"
        :delay="500"
        :max-width="maxWidth"
        theme="light"
        :disabled="disabled"
        :placement="placement"
        :transfer="true"
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
      </Tooltip> -->

      <!-- v-model="openMore" -->
      <!-- transfer -->
      <Tooltip
        theme="light"
        width="60px"
        placement="left-start"
        :disabled="disabledPopMore"
        class="morebtn"
        :transfer="true"
      >
        <Icon type="md-more" @click="onClickMore" size="18"></Icon>
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
import { createHtml } from "../converDom2Html";
var isMobile = require("is-mobile");

const rgba = require("color-rgba");
var Colr = require("colr");
import { convertStyle, getImgSrcUrl, getNoteUrl } from "../utils";
const copyPasteBoard = require("clipboard-copy");
export default {
  name: "TocOutLine",
  data() {
    return {
      parentData: {
        type: Object,
        default: undefined,
      },
      neststyle: undefined,
      t1: undefined,
      t2: undefined,
      showiconRight: isMobile() != true,
      list: [
        // {
        //   name: "导出",
        //   click: () => {
        //     let { hl } = window;
        //     const newLocal = hl.store.Chapter();
        //     let md = newLocal.md();
        //     funDownload(md, newLocal.label + ".md");
        //   },
        // },
        {
          name: "删除",
          click: () => {
            let { hl } = window;
            let { id, charpter } = this.notedata;
            let { store } = charpter ? charpter : {};
            hl.deleteId(id, store);
          },
        },
        {
          name: "复制",
          click: () => {
            let { id, charpter } = this.notedata;
            id = getNoteUrl(id, charpter);
            let text = this.content;
            copyPasteBoard([text, id].join("\n"));
          },
        },
        // {
        //   name: "fix",
        //   click: () => {
        //     let { id } = this.notedata;
        //     let { hl } = window;
        //     hl.fixid(id);
        //   },
        // },
      ],
      disabledPopMore: true,
      textStyle: {},
      classOfSpan: "",
      always: false,
    };
  },
  props: {
    expand: {
      type: Boolean,
      default: false,
    },
    children: { type: Array, default: undefined },
    notedata: { type: Object, default: undefined },
    onSelected: { type: Function, default: undefined },
    onClickExpanded: { type: Function, default: undefined },
  },
  computed: {
    parent() {
      let { children } = this.notedata;
      if (children && children.length) {
        return true;
      }
      return false;
    },
    mainicon() {
      if (this.parent) {
        return this.expand ? "ios-arrow-dropdown" : "ios-arrow-dropright";
      }
      return undefined;
    },
    outlineTitleClass() {
      if (this.parent) {
        return "outline-text-parent";
      }
      return "outline-text";
    },
    icon() {
      let icon = "ios-brush-outline";
      if (this.note) {
        icon = "md-create";
      }
      if (this.parent) {
        icon = undefined;
      }
      return icon;
    },
    iconColor() {
      let styleDefine = this.notedata.styleDefine;
      for (let color in styleDefine) {
        let a = styleDefine[color];
        let { colorhex } = a;
        let array = rgba(colorhex);
        a[3] = 1;
        let colr = Colr.fromRgbArray(array);
        let { h, s, v } = colr.toHsvObject();
        v = Math.min(70, v);
        s = Math.max(90, s);
        return Colr.fromHsvObject({ h, s, v }).toHex();
      }
      return undefined;
    },
    disabled() {
      return this.parent;
    },
    tip() {
      return this.title;
    },
    note() {
      let { note } = this.notedata;
      return note && note.length ? `"${note}"` : undefined;
    },
    title() {
      let { label: title } = this.notedata;
      return title;
    },
    title2() {
      let { label: title, note } = this.notedata;
      // this.classOfSpan = this.spanclass(this.notedata);
      let title2 = title;
      if (note && note.length) {
        title2 = `"${note}"-${title}`;
      }
      return title2;
    },
    content() {
      let a = this.imgsrc;
      if (a) return a;
      let html = this.html;
      if (html) {
        let div = document.createElement("p");
        div.innerHTML = html;
        return div.innerText;
      }
      return "";
    },
    imgsrc() {
      let { imgsrc } = this.notedata;
      return getImgSrcUrl(imgsrc);
    },
    html() {
      let { tree } = this.notedata;
      return createHtml(tree);
    },
    style() {
      return convertStyle(this.notedata.style);
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
  created() {
    // console.log("created", this.expand, this.notedata);
  },
  mounted() {
    // console.log("mounted", this.expand, this.notedata);
    // let a = this.$parent;
    // this.parentData = a.data;
    // this.children = a.data.children
    //   ? a.data.children.map((a) => {
    //       return a;
    //     })
    //   : [];
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
    // eslint-disable-next-line no-unused-vars
    onClickExpanded1(e) {
      let a = this.$parent;
      // let { children } = this;
      // let expanded = a.data.expanded != true;
      a.$set(a.data, "expand", !a.data.expand);
      // a.$set(a.data, "children", expanded ? children : []);
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
.title-span i {
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
