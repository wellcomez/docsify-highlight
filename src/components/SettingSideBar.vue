<template>
  <Drawer
    class="setting-drawer"
    :closable="false"
    v-model="bDrawerOpen"
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
          <Cell title="重置">
            <Button type="primary" @click="ResetAll"> 重置</Button>
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
import { Drawer } from "iview";
import Account from "./Account";
import { getConfig } from "../ANoteConfig";
export default {
  name: "SettingSideBar",
  components: { Drawer, Account },
  model: {
    props: "bDrawerOpen",
  },
  props: {
    cloudOn: { type: Boolean, default: undefined },
    checked: { type: Boolean, default: undefined },
    bDrawerOpen: { type: Boolean, default: undefined },
    onChange: { type: Function, default: undefined },
  },
  data() {
    return {
      drawWidth: 320,
      vesion: pkg.version,
      enableScript: getConfig().load().enableScript,
    };
  },
  watch: {
  },
  mounted() {
  },
  methods: {
    onEnableScript() {
      this.enableScript = this.enableScript == false;
      let { enableScript } = this;
      getConfig().save({ enableScript });
      // document.location.reload();
    },

    ResetAll() {
      window.localStorage.clear();
      window.location.reload();
    },
  },
};
</script>