<template>
  <Tooltip
    theme="light"
    :disabled="disabled"
    width="60px"
    v-click-outside="clickoutside"
  >
    <SvgButton
      name="ios-download"
      tips="Export"
      @click="disabled = disabled == false"
      onOff
      :on="disabled"
    />
    <ButtonGroup slot="content" vertical v-if="useButtonGroup">
      <Button
        v-for="name in list"
        :key="name"
        @click="onOption($event, name)"
        >{{ name }}</Button
      >
    </ButtonGroup>
    <Menu v-if="useMenu" @on-select="onSelectMenu" slot="content">
      <Submenu
        v-for="({ items, name }, index) in menu"
        :name="name + '-' + index"
        :key="name"
      >
        <template slot="title">
          <Icon type="ios-paper" style="color: #42b983" />
          {{ name }}
        </template>
        <MenuItem
          v-for="{ name } in items"
          :name="name + '-' + index"
          :key="name + index"
          >{{ name }}</MenuItem
        >
      </Submenu>
    </Menu>
  </Tooltip>
</template>
<script>
import SvgButton from "./SvgButton";
import ClickOutside from "vue-click-outside";
import { Menu, MenuItem, Submenu } from "iview";
export default {
  name: "Bubbling",
  components: { SvgButton, Menu, MenuItem, Submenu },
  directives: { ClickOutside },
  data() {
    return {
      disabled: true,
      expanded: false,
    };
  },
  computed: {
    useButtonGroup() {
      return this.list && this.list.length > 0;
    },
    useMenu() {
      return this.menu && this.menu.length > 0;
    },
  },
  props: {
    list: {
      type: Array,
      default: () => [],
    },
    menu: {
      type: Array,
      default: () => [],
    },
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
    onSelectMenu(name) {
      let menuName = name.split("-")[0];
      let index = parseInt(name.split("-")[1]);
      let item = this.menu[index].items.find((a) => {
        return a.name == menuName;
      });
      if (item) {
        item.action();
      }
      console.log(name + "");
    },
    clickoutside() {
      this.disabled = true;
    },
    onOption(e, name) {
      e.stopPropagation();
      this.disabled = true;
      if (this.onSelect) {
        this.onSelect(name);
      }
      if (this.closeButtons) this.closeButtons();
    },
  },
};
</script>

<style scoped>
</style>