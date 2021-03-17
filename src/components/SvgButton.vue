<template>
  <Tooltip :content="tips" :disabled="tipsDisabled">
    <Button v-on:click="onClickMe" size="small" style="height: 32px">
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
      if (color == undefined) {
        color = svgcolor_on;
      }
      if (this.onOff) {
        return this.on ? color : svgcolor_off;
      }
      return color;
    },
  },
  data() {
    return {
      tipsDisabled:true
    };
  },
  mounted(){
    this.tipsDisabled = !this.tips
  },
  model: {
    prop: "on",
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
  methods: {
    onClickMe(e) {
      this.tipsDisabled = true;
      this.$emit("update:on", this.on!=true);
      this.onClick(e);
    },
  },
};
</script>
<style scoped>
</style>