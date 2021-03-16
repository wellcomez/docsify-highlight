<template>
  <Row type="flex">
    <Col v-for="({ subclass }, index) in list" :key="index">
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
  computed: {
    list() {
      return [
        {
          subclass: "hlred d1",
        },
        {
          subclass: "hlgreen d1",
        },
      ];
    },
  },
  props: {
    selectedIndex: { type: Number, default: undefined },
  },
  methods: {
    onClick(e, index) {
      e.stopPropagation();
      this.$emit("update:selectedIndex", index);
    },
  },
};
</script>