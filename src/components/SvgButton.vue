<template>
  <Tooltip :content="tips">
    <button :class="btnClass" v-if="custom" v-on:click="onClick" :style="customStyle"/>
    <Button v-if="custom==false" v-on:click="onClick" size="small" style="height:22px;margin:4px;">
      <Icon :type="name" size="20" :color="svgcolor" style="margin-top:0px" />
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
      let ret = "icon-button iconfont "+this.name;
      if (this.onOff == undefined) {
        return ret;
      }
      ret = ret + (this.on ? " enalbe_ul_btn" : " disable_ul_btn");
      return ret;
    },
    customStyle(){
      return { 
        color:this.svgcolor
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
.icon-button {
  height: 22px;
  padding: 1px;
  width: 22px;
  margin: 4px;
  border: 1px;
  border-radius: 3px;
}
button span {
  width: fit-content;
  position: absolute;
  margin: 4px;
  padding: 5px;
  /* left: 10px; */
  border-radius: 3px;
  top: 28px;
  border: 1px solid #42b983;
  background-color: white;
  font-size: 12px;
  line-height: 20px;
  color: #42b983;
}
.disable_ul_btn {
  border: 1px solid gray;
}
.enalbe_ul_btn {
  border: 1px solid red;
}
</style>