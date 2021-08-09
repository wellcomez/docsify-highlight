<template>
  <Editor :initialValue="initialValue" :key="key" class="markdown-editor" />
</template>
<script>
import { Editor } from "@toast-ui/vue-editor";
export default {
  name: "PreviewMarkEditor",
  components: {
    Editor,
  },
  watch: {
    hl(a) {
      let md = getmd(a);
      this.initialValue = md;
      this.key = a.store.title;
    },
  },
  data() {
    return {
      key: undefined,
      initialValue: getmd(this.hl),
    };
  },
  mounted() {},
  props: {
    hl: {
      type: Object,
      default: undefined,
    },
  },
};

function getmd(a) {
  if (!a) {
    return "";
  }
  const newLocal = a.store.Chapter();
  let md = newLocal.md();
  return md;
}
</script>
<style>
@import "../../node_modules/@toast-ui/editor/dist/toastui-editor.css";
</style>
<style scoped>
.markdown-editor {
  margin-left: 10px;
  margin-right: 10px;
  height: 100% !important;
}
</style>