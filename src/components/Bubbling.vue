<template>
  <Poptip theme="light" v-model="visible" width="60px">
    <SvgButton name="ios-download" tips="Export" />
        <!-- type="primary" -->
    <ButtonGroup slot="content">
      <Button
        v-for="{ name } in list"
        :key="name"
        @click="onOption(name)"
        >{{ name }}</Button
      >
    </ButtonGroup>
  </Poptip>
</template>
<script>
// import { checkClickOut } from "../utils";
import SvgButton from "./SvgButton";
export default {
  name: "Bubbling",
  components: { SvgButton },
  data() {
    return {
      visible: false,
      list: [
        {
          name: "json",
        },
        {
          name: "md",
        },
      ],
      expanded: false,
    };
  },
  mounted() {
  },
  props: {
    content: {
      type: String,
      default: "btn",
    },
    onSelect: {
      type: Function,
      default: undefined,
    },
  },
  methods: {
    onOption(name) {
      if (this.onSelect) {
        this.onSelect(name);
      }
      this.closeButtons();
    },
  },
};
</script>

<style scoped>
</style>