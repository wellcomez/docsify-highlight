<template>
  <div style="margin-left: 10px">
    <ul>
      <li v-for="(a, index) in list" @click="clickme(a)" :key="index">
        {{ a }}
      </li>
    </ul>
  </div>
</template>
<script>
export default {
  name: "TocHtml",
  props: {
    charpter: {
      type: Array,
      default: () => {
        return [];
      },
    },
    click: { type: Function, default: undefined },
  },
  watch: {
    charpter() {
      this.newFunction();
    },
  },
  data() {
    return { list: [] };
  },
  created() {
    this.newFunction();
  },
  methods: {
    newFunction() {
      this.list = this.charpter.map((a) => {
        return a.label;
      });
    },
    // eslint-disable-next-line no-unused-vars
    clickme(index) {
      if (this.click) {
        this.click(index);
      }
    },
  },
};
</script>