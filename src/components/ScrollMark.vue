<template>
  <div class="scollposion" :style="style">
    <Icon type="ios-pin"  color="red" size="32"/>
  </div>
</template>>
<script>
export default {
  name: "ScrollMark",
  data() {
    return { style: {} };
  },
  mounted() {
    // const scrollfn = () => {   let { top, left } =
    // this.hl.getElementPosition(this.id);   this.style = {     top: top -
    // window.pageYOffset + "px",     left: left + "px",   }; };
    // document.body.addEventListener("scroll", scrollfn);
    let { top, left } = this;
    this.style = {
      top: top + "px",
      left: left + "px",
    };
    let removeself = () => {
      let aaa = document.getElementsByClassName("scollposion");
      for (let i = 0; i < aaa.length; i++) {
        let a = aaa[i];
        a.parentElement.removeChild(a);
      }
      this.$destroy(true);
    };
    this.removeself = removeself;
    setTimeout(removeself, 1000);
  },
  props: {
    id: {
      type: String,
      default: undefined,
    },
    hl: {
      type: Object,
      default: undefined,
    },
    top: {
      type: Number,
      default: undefined,
    },
    left: {
      type: Number,
      default: undefined,
    },
  },
};
</script>
<style scoped>
.scollposion {
  position: absolute;
  margin-right: 20px;
}
</style>