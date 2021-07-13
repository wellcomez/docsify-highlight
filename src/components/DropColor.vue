<template>
  <Tooltip theme="light" :disabled="false" width="60px">
    <!-- <Icon type="md-more" /> -->
    <Badge :count="count">
      <Button>
        <Icon type="md-more" :size="20" />
      </Button>
    </Badge>
    <ul slot="content" class="dropcolor">
      <li
        :key="index"
        v-for="({ style }, index) in colorListStyle"
        :style="style"
        @click="onClick(index)"
      >
        <Row type="flex">
          <Col span="1"></Col>
          <Col span="4">
            <Icon
              type="ios-close"
              size="24"
              class="dropcolor-delete"
              @click="onClickDelete2(index)"
            />
          </Col>
        </Row>
      </li>
    </ul>
  </Tooltip>
  <!-- </Badge> -->
</template>
<script>
// import { Dropdown, DropdownMenu, DropdownItem } from "iview";
import { getColorList } from "../utils";
export default {
  name: "DropColor",
  components: {
    // Dropdown,
    // DropdownMenu,
    // DropdownItem,
  },
  data() {
    return {
      open: false,
      colorListStyle: [],
      currentIndex: this.selectedIndex,
    };
  },
  mounted() {
    this.convert(this.colorList);
    let handleImageClick = () => {
      this.open = this.open != true;
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
    onClickDelete2(index) {
      if (this.onClickDelete) {
        this.onClickDelete(index);
      }
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
    onClickDelete: { type: Function, default: undefined },
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
.dropcolor-delete {
  margin-right: 2px;
}
.dropcolor li {
  margin: 0;
  line-height: normal;
  padding: 7px 16px;
  clear: both;
  color: #515a6e;
  font-size: 12px !important;
  white-space: nowrap;
  list-style: none;
  cursor: pointer;
  transition: background 0.2s ease-in-out;
}
.dropcolor li div {
  width: 40px;
}
.dropcolor-deleteicon {
  margin-right: 2px;
}
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