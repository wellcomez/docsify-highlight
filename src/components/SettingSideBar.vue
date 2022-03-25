<template>
  <Drawer
    class="setting-drawer"
    :closable="false"
    v-model="open"
    :width="drawWidth"
  >
    <Account v-if="cloudOn" slot="header" style="width: 280px" />
    <div style="background: #f8f8f9; width: 280px">
      <Card :padding="0" shadow>
        <CellGroup style="">
          <Cell title="开关" style="">
            <i-switch :value="checked" @on-change="onChange" slot="extra" />
          </Cell>
          <Cell title="执行自定义脚本" style="">
            <i-switch
              :value="enableScript"
              @on-change="onEnableScript"
              slot="extra"
            />
          </Cell>
          <Cell title="杂项" selected></Cell>
          <Cell title="杂项">
            <ButtonGroup>
              <!-- <Button type="primary" @click="onClickRepairStore">修复</Button> -->
              <!-- <Button type="primary" @click="onClickRepairToc2">排序</Button> -->
              <Button type="primary" @click="ResetAll"> 重置</Button>
              <Upload :before-upload="onImportData" action="">
                <Button type="primary" icon="ios-cloud-upload-outline"
                  >导入</Button
                >
              </Upload>
            </ButtonGroup>
          </Cell>
          <Cell title="版本" :label="vesion"> </Cell>
        </CellGroup>
      </Card>
    </div>
    <!-- <ConfigPanel /> -->
  </Drawer>
</template>
<script>
const pkg = require("../../package.json");
import hlinit from "../hl";
import { Drawer } from "iview";
import Account from "./Account";
import { getConfig } from "../ANoteConfig";
import isMobile from "is-mobile";
import { Upload } from "iview";
import { Book } from "../store";
import { msg } from "./msgbox";
// var request = require("request");
export default {
  name: "SettingSideBar",
  components: { Drawer, Account, Upload },
  model: {
    props: "bDrawerOpen",
  },
  props: {
    hl: { type: Object, default: undefined },
    book: { type: Object, default: undefined },
    cloudOn: { type: Boolean, default: undefined },
    checked: { type: Boolean, default: undefined },
    bDrawerOpen: { type: Boolean, default: undefined },
    onChange: { type: Function, default: undefined },
  },
  data() {
    return {
      open: false,
      drawWidth: 320,
      vesion: pkg.version,
      enableScript: getConfig().load().enableScript,
    };
  },
  watch: {
    open(a) {
      this.$emit("update:bDrawerOpen", a);
    },
    bDrawerOpen(a) {
      if (a) {
        this.open = true;
      }
    },
  },
  mounted() {
    this.open = this.bDrawerOpen;
    if (isMobile()) {
      this.$el.classList.add("mobile");
    }
  },
  methods: {
    onClickRepairStore() {
      this.book && this.book.toc.fixWrongTitles();
    },
    onClickRepairToc2() {
      if (this.hl) {
        this.hl.updateAllPositions();
        Book.updated = true;
        this.hl.updatePanelCb();
      }
    },
    onImportData(file) {
      const handlePreview = () => {
        //  const self = this;
        const reader = new FileReader();
        reader.readAsText(file);
        // eslint-disable-next-line no-unused-vars
        reader.onloadend = (a) => {
          let json = JSON.parse(reader.result);
          let b = new Book();
          // if (toc.name == b.name) {
          b.syn2Local(json);
          msg("导入", b.toc.bookname);
          hlinit();
          // }
        };
      };
      console.log(file);
      handlePreview(file);
      return false;
    },
    onEnableScript() {
      let enable = this.enableScript == true;
      this.enableScript = !enable;
      let { enableScript } = this;
      getConfig().save({ enableScript });
      document.location.reload();
    },

    ResetAll() {
      window.localStorage.clear();
      window.location.reload();
    },
  },
};
</script>
<style>
.mobile.setting-drawer .ivu-drawer-mask {
  width: 100% im !important;
}
.mobile.setting-drawer .ivu-drawer {
  width: 80% !important;
  left: 20% !important;
}
</style>