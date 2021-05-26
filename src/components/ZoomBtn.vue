<template>
  <Icon type="md-search" @click="onzoom" />
</template>
<script>
import { Icon } from "iview";
import mediumZoom from "medium-zoom";
export default {
  name: "ZoomBtn",
  components: {
    Icon,
  },
  props: {
    ele: { type: HTMLImageElement, default: undefined },
  },
  mounted() {},
  methods: {
    onzoom() {
      let zoom = mediumZoom(this.ele, {
        //   container: ".markdown-section",
        margin: 24,
        background: "#838383",
        scrollOffset: 0,
      });
      zoom.open();
      zoom.on("closed",()=>{
        zoom.detach()
      })
    },
  },
};
</script>