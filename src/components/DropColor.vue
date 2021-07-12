<template>
  <Badge :count="count" id="badgedrop">
    <Dropdown class="colorroot" @on-click="onClick" trigger="custom" :visible="open">
      <DropdownMenu slot="list" class="colordrop-menu">
        <DropdownItem
          :name="index"
          :style="style"
          v-for="({ style }, index) in colorListStyle"
          :key="index"
        ></DropdownItem>
      </DropdownMenu>
    </Dropdown>
  </Badge>
</template>
<script>
import { Dropdown, DropdownMenu, DropdownItem } from "iview";
import { getColorList } from "../utils";
export default {
  name: "DropColor",
  components: {
    Dropdown,
    DropdownMenu,
    DropdownItem,
  },
  data() {
    return {
      open:false,
      colorListStyle: [],
      currentIndex: this.selectedIndex,
    };
  },
  mounted() {
    this.convert(this.colorList);
    let handleImageClick = () => {
      this.open = this.open!=true;
    };
    this.$el.addEventListener("click", handleImageClick);
  },
  model: {
    prop: "selectedIndex",
  },
  computed: {
    count() {
      return this.colorListStyle.length;
    },
    currentStyle() {
      // if (this.colorListStyle.length) {
      //   let a = this.colorListStyle[this.currentIndex];
      //   return a.style;
      // }
      return "";
    },
  },
  methods: {
    onClick(a) {
      this.currentIndex = parseInt(a);
      this.$emit("update:selectedIndex", this.currentIndex);
    },
    convert(a) {
      this.colorListStyle = getColorList(a).map((a) => {
        return a;
      });
    },
  },
  watch: {
    colorList(a) {
      this.convert(a);
    },
    selectedIndex(a) {
      this.currentIndex = a;
    },
  },
  props: {
    selectedIndex: { type: Number, default: 0 },
    colorList: {
      type: Array,
      default: () => {
        return [];
      },
    },
  },
};
</script>
<style >
.drop-active {
  margin-top: 1px;
  width: 16px;
  height: 32px;
  display: block;
  /* border: 2px solid white; */
  /* border-radius: 4px; */
}
.colordrop-menu li {
  height: 20px;
  margin-left: 4px;
  margin-right: 2px;
  margin-top: 2px;
  margin-bottom: 2px;
}
</style>