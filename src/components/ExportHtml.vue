<template>
  <div class="export-html">
    <Row>
      <Col
        :span="4"
        style="
           {
            position: fixed;
            top: 1px;
            bottom: 1px;
            width: 300px;
            overflow: scroll;
            position: fixed;
          }
        "
      >
        <TocHtml :click="clickOnToc" :charpter="charpter" :exporthtml="true" />
      </Col>
      <Col style="margin-left: 300px">
        <CharptHtml
          v-for="(charpter, index) in charpter"
          :id="index"
          :class="classname(index)"
          :charpter="charpter"
          :key="index"
          :exporthtml="true"
          :rootpath="rootpath"
        />
      </Col>
    </Row>
  </div>
</template>
<script>
import CharptHtml from "./CharptHtml";
import TocHtml from "./TocHtml";
// eslint-disable-next-line no-unused-vars
import { Drawer, Layout, Sider, Content } from "iview";
export default {
  name: "ExportHtml",
  components: { TocHtml, CharptHtml },
  data() {
    return {
      disabled: false,
      isCollapsed: false,
    };
  },
  methods: {
    classname(index) {
      return "charpterhtml " + "sub" + index;
    },
    changeCurrentCharacter(charpter) {
      this.disabled = false;
      let a = this.charpter.find((a) => {
        if (charpter.label == a.label) {
          return true;
        }
      });
      if (a) {
        let id = this.charpter.indexOf(a);
        let target = this.$el.querySelector(".sub" + id);
        if (target) {
          target.scrollIntoView();
        }
      }
    },
    clickOnToc(charpter) {
      this.changeCurrentCharacter(charpter);
    },
  },
  props: {
    rootpath: { type: String, default: undefined },
    charpter: {
      type: Array,
      default: () => {
        return [];
      },
    },
  },
};
</script>
<style >
.content-button {
  right: 20px;
  top: 20px;
}
.export-html .ivu-layout-content {
  margin-right: 200px;
}
.export-html.layout {
  border: 1px solid #d7dde4;
  background: #f5f7f9;
  position: relative;
  border-radius: 4px;
  overflow: hidden;
}
.export-html .sidebar {
  /* position: fixed; */
  /* overflow-y: scroll; */
  /* top: 2px; */
  /* bottom: 0px; */
  background-color: #ffff;
  /* left: 0px; */
}
</style>