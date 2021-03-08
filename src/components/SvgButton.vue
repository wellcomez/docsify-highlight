<template>
  <button
    :class="btnClass"
    v-on:click="onClick"
    v-on:mouseenter="visible"
    @mouseleave="invisible"
  >
    <span v-show="show" v-html="tips"></span>
    <svgicon
      :name="name"
      width="16"
      height="16"
      color="#42b983 #35495e"
    ></svgicon>
  </button>
</template>
<script>
import "../icons";
export default {
  name: "SvgButton",
  computed: {
    btnClass() {
      let ret = "icon-button left";
      if (this.onOff == undefined) {
        return ret;
      }
      ret = ret + (this.on ? " enalbe_ul_btn" : " disable_ul_btn");
      return ret
    },
    show() {
      return this.seen && this.tips.length > 0;
    },
  },
  data() {
    return {
      seen: false,
    };
  },

  props: {
    onClick: {
      type: Number,
      default: undefined,
    },
    name: { type: String, default: "" },
    tips: { type: String, default: "" },
    onOff: { type: Boolean, default: undefined },
    on: { type: Boolean, default: undefined },
  },
  methods: {
    visible: function () {
      this.seen = true;
    },
    invisible: function () {
      this.seen = false;
    },
  },
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
  width:fit-content; 
  position: absolute;
  margin: 4px;
  padding:5px;
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