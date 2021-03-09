<template>
  <div class="mask note-menu" v-on:click="onClickMask">
    <div v-bind:style="style" class="my-remove-tip" id="markpannel">
      <SvgButton onOff v-bind:on="UnderlineEnable" name="ul" v-bind:onClick="onUnderline" tips="Underline"></SvgButton>
      <div class="d1 hlyellow left" v-on:click="onYellow">
        <span v-if="isYellow">&#10004;</span>
      </div>
      <div class="d1 hlred left" v-on:click="onRed">
        <span v-if="isRed">&#10004;</span>
      </div>
      <div class="d1 hlgreen left" v-on:click="onGreen">
        <span v-if="isGreen">&#10004;</span>
      </div>
      <SvgButton v-bind:onClick="onDelete" name="del" tips="Remove"/>
      <SvgButton v-bind:onClick="onCopy" name="copy" tips="Copy"/>
    </div>
  </div>
</template>






<script>
import "../icons";
import { yellow, green, red, ul } from "../hl_mengshou";
export default {
  name: "NoteMenu",
  data() {
    return {
      style: {
        left: this.left - 20 + "px",
        top: this.top - 25 - window.pageYOffset + "px",
        width: 6 * 30,
      },
    };
  },
  computed: {
    UnderlineEnable(){
      return this.color == ul;
    },
    isYellow() {
      return this.color == yellow;
    },
    isRed() {
      return this.color == red;
    },
    isGreen() {
      return this.color == green;
    },
  },
  methods: {
    onUnderline(e) {
      if (this.UnderlineEnable==false) {
        this.onClick(e, ul);
      } else {
        this.onClick(e, red);
      }
    },
    onSearch() {
      console.log("xx");
      this.removeSelectionHighLight();
      this.removeMenu();
    },
    onCopy() {
      console.log("onCopy");
      let { hl } = window;
      hl.onCopy(this.noteid);
      this.removeSelectionHighLight();
      this.removeMenu();
    },
    // eslint-disable-next-line no-unused-vars
    removeSelectionHighLight() {
      if (this.color == undefined) {
        if (this.onClose) {
          this.onClose(undefined, this.noteid);
        }
      }
    },
    onClickMask(e) {
      let mask = document.getElementsByClassName("note-menu")[0];
      if (mask != e.target) return;
      this.removeSelectionHighLight();
      this.removeMenu();
    },
    onClick(e, color) {
      this.color = color;
      if (this.onClose) {
        this.onClose(color, this.noteid);
      } else {
        let { hl } = window;
        hl.setHighlightColor(color, this.noteid);
      }
    },
    onRed(e) {
      this.onClick(e, red);
    },
    onGreen(e) {
      this.onClick(e, green);
    },
    onYellow(e) {
      this.onClick(e, yellow);
    },
    removeMenu() {
      var tips = document.getElementsByClassName("note-menu");
      tips.forEach((tip) => {
        tip.parentNode.removeChild(tip);
      });
    },
    onDelete() {
      const id = this.noteid;
      let { hl } = window;
      console.log("*click remove-tip*", id);
      hl.deleteId(id);
      this.removeMenu();
    },
  },
  props: {
    color: {
      type: Number,
      default: undefined,
    },
    left: {
      type: Number,
      default: undefined,
    },
    onClose: {
      type: Function,
      default: undefined,
    },
    top: {
      type: Number,
      default: undefined,
    },
    noteid: {
      type: String,
      default: undefined,
    },
    nochoose: {
      type: Boolean,
      default: true,
    },
  },
};
</script>
<style>
@import "../assets/web.css";
</style>
<style scoped>
.button {
  height: 22px;
  padding: 1px;
  width: 22px;
  margin: 4px;
  border: 1px;
  border-radius: 3px;
}
.button {
  width: fit-content;
  font-size: small;
}
</style>
<style type="text/css">
.icon-del {
  /* background-image: url(../assets/del.svg); */
  background-size: 16px 16px;
  background-position: 2px 2px;
  background-repeat: no-repeat;
  padding: 2px 2px 2px 2px;
  border: 1px solid #ddd;
  margin: 4px;
  width: 30px;
  border-radius: 3px;
  text-align: center;
  height: 22px;
}
.my-remove-tip {
  box-sizing: border-box;
  position: absolute;
  border: 1px solid #fff;
  border-radius: 3px;
  height: 30px;
  /* width        : 90px; */
  color: #fff;
  background: rgb(226, 223, 223);
  /* text-align   : center; */
  font-size: 12px;
  cursor: pointer;
  line-height: 18px;
  overflow: visible;
}

</style>
