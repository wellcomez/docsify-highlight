<template>
  <Tooltip theme="light" :disabled="false" :width="60" class="dropcolor-tip">
    <!-- <Icon type="md-more" /> -->
    <Badge :count="count">
      <Button style="height: 32px; padding-left: 2px; padding-right: 2px">
        <ul>
          <li
            class="prevline"
            :key="index"
            v-for="({ style }, index) in colorListStyle"
            :style="prevStyle(style)"
          ></li>
        </ul>
        <!-- <Icon type="md-more" :size="20" /> -->
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
    prevStyle(style) {
      let x = 24 / this.count;
      return `${style};height:${x}px`;
    },
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
/* .#markpannel > div.ivu-row-flex.ivu-row-flex-top.ivu-row-flex-space-between > div:nth-child(4) > div > div:nth-child(2) > div > div.ivu-tooltip-popper.ivu-tooltip-light > div > div.ivu-tooltip-inner */
.dropcolor-tip div.ivu-tooltip-inner {
  padding-left: 2px;
  padding-right: 2px;
  width: 80px;
}
 .dropcolor-delete {
  margin-right: 2px;
}
.dropcolor li {
  margin: 0;
  height: 24px;
  line-height: normal;
  padding: 1px 2px;
  clear: both;
  color: #515a6e;
  font-size: 8px !important;
  white-space: nowrap;
  list-style: none;
  cursor: pointer;
  transition: background 0.2s ease-in-out;
}
li.prevline {
  width: 20px;
  padding-left: 1px;
  padding-right: 1px;
  margin-left: 0px;
  margin-right: 0px;
  cursor: pointer;
  list-style: none;
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