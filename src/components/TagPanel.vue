<template>
  <div class="tagpane">
    <div :class="tagClass">
      <Tag
        v-for="({ color, txt, enable }, index) in existsTag"
        :color="color"
        :key="index"
        type="dot"
        closable
        checkable
        :checked="enable"
        @on-close="handleClose(index, txt)"
        @on-change="handleChange(index, txt)"
        >{{ txt }}</Tag
      >
    </div>
    <Row class="input-panel" type="flex" justify="end" align="middle">
      <Col>
        <Button size="small" class="add-btn" type="primary" @click="onAdd"
          >Add</Button
        >
      </Col>
    </Row>
  </div>
</template>
<style scoped>
.add-btn {
  margin-right: 4px;
}

.tagpane .input {
  margin-left: 4px;
  /* float: right; */
  width: 100%;
  padding-top: 2px;
  padding-bottom: 2px;
}
.tagpane {
  background: white;
  border: 1px solid #3fb07c;
  border-radius: 3px;
}
.tagpane .input-panel {
  background: grayscale;
}
.tagpane ivu-tag-dot {
  height: 24px;
  line-height: 24px;
}
.tagClass-empty {
  height: 50px;
}
.tagpane .ivu-tag,
.tagpane .ivu-tag-text {
  padding-left: 2px;
  padding-right: 2px;
  padding-top: 2px;
  padding-bottom: 2px;
  margin: 1px;
}
.tagpane .ivu-tag {
  line-height: 24px;
  height: 24px;
}
</style>
<script>
import { Modal } from "iview";
import { Book } from "../store";
/* eslint-disable no-unused-vars */
export default {
  //   components: { Card ,Divider},
  data() {
    return {
      existsTag: [],
      tagSet: new Set(["稍后", "难"]),
      tagClass: "",
    };
  },
  model: {
    prop: "tags",
  },
  computed: {},
  created() {
    let tagSet = new Book().tags();
    tagSet.forEach((e) => {
      this.tagSet.add(e);
    });
    this.convert(this.tags);
  },
  methods: {
    update() {
      this.$emit("update:tags", this.tags);
    },
    onAdd() {
      let ok = (tmpdata) => {
        let { tagSet, tags } = this;
        let inputText = tmpdata;
        if (tags.indexOf(inputText) >= 0) {
          this.inputText = "";
          return;
        }
        this.tags.push(inputText);
        this.update();
        tagSet.add(inputText);
        this.convert(this.tags);
      };

      var tmpdata;
      Modal.confirm({
        onOk: () => {
          ok(tmpdata);
        },
        render: (h) => {
          return h("Input", {
            props: {
              autofocus: true,
              clearable: true,
            },
            on: {
              input: (val) => {
                tmpdata = val;
              },
            },
          });
        },
      });
    },
    removeItem(a, b) {
      let i = a.indexOf(b);
      if (i >= 0) a.splice(i, 1);
    },
    handleChange(index, txt) {
      let i = this.tags.indexOf(txt);
      if (i >= 0) {
        this.removeItem(this.tags, txt);
      } else {
        this.tags.push(txt);
      }
      this.update();
      this.convert(this.tags);
    },
    handleClose(index, txt) {
      this.removeItem(this.tags, txt);
      this.tagSet.delete(txt);
      this.update();
      this.convert(this.tags);
    },
    convert(tags) {
      let ret = [];
      let { tagSet } = this;
      tagSet.forEach((txt) => {
        let enable = false;
        if (tags.indexOf(txt) >= 0) {
          enable = true;
        }
        let color = enable ? "success" : "default";
        let a = { color, txt, enable };
        ret.push(a);
      });
      this.existsTag = ret;
      this.tagClass = this.existsTag.length > 0 ? "" : "tagClass-empty";
    },
  },
  props: {
    tags: {
      type: Array,
      default: () => {
        return [];
      },
    },
  },
};
</script>