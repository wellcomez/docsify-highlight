<template>
  <Tooltip :content="tips" :disabled="tipsDisabled">
    <Button v-on:click="onClick" size="small" style="height: 30px; margin: 4px">
      <Icon
        v-if="custom"
        :custom="btnClass"
        :type="name"
        size="20"
        :color="svgcolor"
        style="margin-top: 0px"
      />
      <Icon
        v-if="custom == false"
        :type="name"
        size="20"
        :color="svgcolor"
        style="margin-top: 0px"
      />
    </Button>
  </Tooltip>
</template>
<script>
const svgcolor_on = "#42b983";
const svgcolor_off = "";
export default {
  name: "SvgButton",
  computed: {
    tipsDisabled() {
      return this.tips == undefined;
    },
    btnClass() {
      let ret = "iconfont " + this.name;
      return ret;
    },
    customStyle() {
      return {
        color: this.svgcolor,
        height: "16px",
        width: "16px",
      };
    },
    svgcolor() {
      let { color } = this;
      if (color== undefined) {
        color = svgcolor_on;
      }
      if (this.onOff) {
        return this.on ? color : svgcolor_off;
      }
      return color;
    },
  },
  data() {
    return {};
  },

  props: {
    custom: { type: Boolean, default: false },
    onClick: {
      type: Function,
      default: undefined,
    },
    name: { type: String, default: "" },
    tips: { type: String, default: undefined },
    color: { type: String, default: undefined },
    onOff: { type: Boolean, default: undefined },
    on: { type: Boolean, default: undefined },
  },
  methods: {},
};
</script>
<style scoped>
</style>