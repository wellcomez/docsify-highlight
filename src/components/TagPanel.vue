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
      <Button icon="ios-add" type="dashed" size="small" @click="onAdd"
        >添加标签</Button
      >
    </div>
    <!-- <Button size="small" class="add-btn" style="display:in" type="primary" @click="onAdd">Add</Button> -->
  </div>
</template>
<style scoped>
.add-btn {
  margin-right: 4px;
}

.tagpane .input {
  margin-left: 4px;
  width: 100%;
  padding-top: 2px;
  padding-bottom: 2px;
}
.tagpane {
  background: white;
  border: 1px solid var(--theme-color, #42b983);
  border-radius: 3px;
  height: 300px;
  overflow: scroll;
}
.tagpane .input-panel {
  background: grayscale;
}
.tagpane ivu-tag-dot {
  height: 24px;
  line-height: 24px;
}
.tagClass,
.tagClass-empty {
  margin: 4px;
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
      tagSet: new Set(["稍后", "难"]),
    };
  },
  model: {
    prop: "tags",
  },
  computed: {
    tagClass() {
      return this.existsTag.length > 0 ? "tagClass" : "tagClass-empty";
    },
    existsTag() {
      let ret = [];
      let { tagSet, tags } = this;
      tagSet.forEach((txt) => {
        let enable = false;
        if (tags.indexOf(txt) >= 0) {
          enable = true;
        }
        let color = enable ? "success" : "default";
        let a = { color, txt, enable };
        ret.push(a);
      });
      return ret.filter((a)=>a.txt).sort((param1, param2)=> {
        return param1.txt.localeCompare(param2.txt, "zh");
      });
    },
  },
  created() {
    let tagSet = new Book().tags();
    tagSet.forEach((e) => {
      this.tagSet.add(e);
    });
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
    },
    handleClose(index, txt) {
      this.removeItem(this.tags, txt);
      this.tagSet.delete(txt);
      this.update();
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