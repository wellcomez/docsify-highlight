<template>
  <Editor :initialValue="initialValue" height="800px" />
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
      this.editorText = md;
    },
  },
  data() {
    return {
      viewerText: getmd(this.hl),
      initialValue: getmd(this.hl),
      editorText: "This is initialValue.",
    };
  },
  mounted() {
    if (this.hl) {
      this.editorText = getmd(this.hl);
    }
  },
  props: {
    hl: {
      type: Object,
      default: undefined,
    },
  },
};

function getmd(a) {
  const newLocal = a.store.Chapter();
  let md = newLocal.md();
  return md;
}
</script>
<style>
@import "../../node_modules/@toast-ui/editor/dist/toastui-editor.css";
</style>
<style scoped>
.mark-viewer {
  margin-left: 10px;
  margin-right: 10px;
}
</style>