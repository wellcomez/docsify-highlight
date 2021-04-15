<template>
  <Tooltip theme="light" :disabled="disabled" width="60px" v-click-outside="clickoutside">
    <SvgButton name="ios-download" tips="Export" @click="disabled=disabled==false" onOff :on="disabled"/>
    <ButtonGroup slot="content" vertical>
      <Button v-for="{ name } in list" :key="name" @click="onOption(name)">{{
        name
      }}</Button>
    </ButtonGroup>
  </Tooltip>
</template>
<script>
import SvgButton from "./SvgButton";
import ClickOutside from "vue-click-outside";
export default {
  name: "Bubbling",
  components: { SvgButton },
  directives:{ClickOutside},
  data() {
    return {
      disabled: true,
      list: [
        {
          name: "json",
        },
        {
          name: "md",
        },
        { name: "html" },
      ],
      expanded: false,
    };
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
    clickoutside(){
      this.disabled = true
    },
    onOption(name) {
      this.disabled = true
      if (this.onSelect) {
        this.onSelect(name);
      }
      if(this.closeButtons)
      this.closeButtons();
    },
  },
};
</script>

<style scoped>
</style>