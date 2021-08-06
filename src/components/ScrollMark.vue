<template>
  <div class="scollposion" :style="style">
    <Icon type="ios-pin" color="red" size="32" />
  </div>
</template>>
<script>
export default {
  name: "ScrollMark",
  data() {
    return { style: {} };
  },
  watch: {
    pos(a) {
      this.setPos(a);
    },
    id() {
      this.autoclear();
    },
  },
  methods: {
    setPos(a) {
      let { top, left } = a;
      this.style = {
        top: top + "px",
        left: left + "px",
      };
    },
    autoclear() {
      let removeself = () => {
        let aaa = document.getElementsByClassName("scollposion");
        for (let i = 0; i < aaa.length; i++) {
          let a = aaa[i];
          a.parentElement.removeChild(a);
        }
        this.$destroy(true);
      };
      if (this.autoremove) {
        this.removeself = removeself;
        setTimeout(removeself, 1000);
      }
    },
  },
  mounted() {
    this.setPos(this.pos);
    this.autoclear()
  },
  props: {
    autoremove: { type: Boolean, default: false },
    id: {
      type: String,
      default: undefined,
    },
    pos: {
      top: {
        type: Number,
        default: undefined,
      },
      left: {
        type: Number,
        default: undefined,
      },
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