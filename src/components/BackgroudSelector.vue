<template>
  <Row type="flex">
    <Col v-for="({ subclass }, index) in colorList" :key="index">
      <div :class="subclass" v-on:click="onClick($event, index)">
        <span v-if="index == selectedIndex">&#10004;</span>
      </div>
    </Col>
  </Row>
</template>
<script>
export default {
  name: "BackgroudSelector",
  model: {
    prop: "selectedIndex",
  },
  data() {
    return {};
  },
  props: {
    selectedIndex: { type: Number, default: undefined },
    colorList: {
      type: Array,
      default: function () {
        return [
          {
            subclass: "hlred d1",
          },
          {
            subclass: "hlgreen d1",
          },
          {
            subclass: "hlyellow d1",
          },
        ];
      },
    },
  },
  methods: {
    onClick(e, index) {
      e.stopPropagation();
      if(index==this.selectedIndex){
          index = undefined;
      }
      this.$emit("update:selectedIndex", index);
    },
  },
};
</script>