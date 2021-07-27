<template>
  <div class="export-html">
    <Layout>
      <Layout>
        <Sider
          :collapsed-width="0"
          collapsible
          :style="{ background: '#fff' }"
          v-model="isCollapsed"
        >
          <TocHtml :charpter="charpter" :exporthtml="true" />
        </Sider>
        <Content>
          <CharptHtml
            class="charpterhtml"
            v-for="(charpter, index) in charpter"
            :charpter="charpter"
            :key="index"
            :exporthtml="true"
            :rootpath="rootpath"
          />
        </Content>
      </Layout>
    </Layout>
    <Button class="content-button" size="small" @click="disabled = !disabled"
      >目录</Button
    >
  </div>
</template>
<script>
import CharptHtml from "./CharptHtml";
import TocHtml from "./TocHtml";
// eslint-disable-next-line no-unused-vars
import { Drawer, Layout, Sider, Content } from "iview";
export default {
  name: "ExportHtml",
  components: { TocHtml, CharptHtml, Layout, Sider, Content },
  data() {
    return {
      disabled: false,
      isCollapsed: false,
    };
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
  methods: {},
};
</script>
<style >
.content-button {
  right: 20px;
  top: 20px;
}
</style>