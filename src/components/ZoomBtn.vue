<template>
  <Icon
    :custom="btnClass"
    :type="name"
    size="20"
    class="imgzoombtn"
    style="margin-top: 0px;color: var(--theme-color, #42b983);"
    @click="onzoom"
  />
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
  computed: {
    btnClass() {
      let ret = "iconfont " + this.name;
      return ret;
    },
  },
  data() {
    return { name: "icon-zoom-out" };
  },
  methods: {
    onzoom() {
      let zoom = mediumZoom(this.ele, {
        //   container: ".markdown-section",
        margin: 24,
        background: "#838383",
        scrollOffset: 0,
      });
      zoom.open();
      zoom.on("closed", () => {
        zoom.detach();
      });
    },
  },
};
</script>