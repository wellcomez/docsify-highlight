<template>
  <Tooltip :content="tips">
    <Button v-on:click="onClick" size="small" style="height:22px;margin:4px;">
      <i v-if="custom" :class="btnClass" :style="customStyle"/>
      <Icon  v-if="custom==false"  :type="name" size="20" :color="svgcolor" style="margin-top:0px" />
    </Button>
  </Tooltip>
</template>
<script>
import "../icons";
const svgcolor_on = "#42b983";
const svgcolor_off = ""
export default {
  name: "SvgButton",
  computed: {
    btnClass() {
      let ret = "iconfont "+this.name;
      if (this.onOff == undefined) {
        return ret;
      }
      // ret = ret + (this.on ? " enalbe_ul_btn" : " disable_ul_btn");
      return ret;
    },
    customStyle(){
      return { 
        color:this.svgcolor,
        height:"16px",
        width:"16px"
      }
    },
    svgcolor() {
      if (this.onOff) {
        return this.on ? svgcolor_on : svgcolor_off;
      }
      return svgcolor_on;
    },
  },
  data() {
    return {};
  },

  props: {
    custom:{type:Boolean,default:false},
    onClick: {
      type: Function,
      default: undefined,
    },
    name: { type: String, default: "" },
    tips: { type: String, default: "" },
    onOff: { type: Boolean, default: undefined },
    on: { type: Boolean, default: undefined },
  },
  methods: {},
};
</script>
<style scoped>
</style>