<template>
  <div class="scollposion" :style="style">
    <Icon size="32" type="ios-link" color="red" />
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
    setTimeout(removeself, 500);
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
}
</style>