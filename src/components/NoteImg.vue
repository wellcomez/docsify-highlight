<template>
  <i class="docsify-highlighter docsify-highlighter-img">
    <ZoomBtn :ele="imgElement" class="i-zoombtn"></ZoomBtn>
    <NoteMarker v-if="note" :noteid="id" :content="note" :hl="hl"></NoteMarker>
  </i>
</template>
<script>
import ZoomBtn from "./ZoomBtn";
import NoteMarker from "./NoteMarker";
export default {
  name: "NoteImg",
  components: { ZoomBtn, NoteMarker },
  data() {
    return {
    };
  },

  mounted() {
    let { id } = this;
    let wrap = this.$el;
    wrap.dataset['highlightId'] = id;
    wrap.insertBefore(this.imgElement,wrap.querySelector('.i-zoombtn'))
  },
  props: {
    id: { type: String, default: "" },
    note: { type: String, default: undefined },
    imgsrc: { type: String, default: undefined },
    hl: { type: Object, default: undefined },
    imgElement: { type: HTMLImageElement, default: undefined }
  },
};
</script>
<style >
.docsify-highlighter-img {
  position: relative;
}
.i-zoombtn {
  position: absolute;
  bottom: 50px;
  left: 10px;
}
</style>