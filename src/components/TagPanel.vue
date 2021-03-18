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
    <Row class="input-panel" type="flex" justify="space-between" align="middle">
      <Col :span="12">
        <Input
          class="input"
          clearable
          v-model="inputText"
          placeholder="something..."
        />
      </Col>
      <Col>
        <Button
          class="add-btn"
          :disabled="btndiable"
          type="primary"
          @click="onAdd"
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
</style>
<script>
import { getConfig } from "../ANoteConfig";
/* eslint-disable no-unused-vars */
export default {
  //   components: { Card ,Divider},
  data() {
    return {
      inputText: "",
      existsTag: [],
      tagSet: ["稍后", "难"],
      tagClass: "",
    };
  },
  model: {
    prop: "tags",
  },
  computed: {
    btndiable() {
      return this.inputText == undefined || this.inputText.length == 0;
    },
  },
  created() {
    let { tagSet } = getConfig().load();
    if (tagSet && tagSet.length) this.tagSet = tagSet;
    this.convert(this.tags);
  },
  methods: {
    update() {
      this.$emit("update:tags", this.tags);
    },
    onAdd() {
      let { inputText, tagSet, tags } = this;
      if (tags.indexOf(inputText) >= 0) {
        this.inputText = "";
        return;
      }
      this.tags.push(inputText);
      this.update()
      tagSet.push(inputText);
      this.convert(this.tags);
      this.inputText = "";
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
      this.update()
      this.convert(this.tags);
    },
    handleClose(index, txt) {
      this.removeItem(this.tags, txt);
      this.removeItem(this.tagSet, txt);
      this.update()
      this.convert(this.tags);
    },
    convert(tags) {
      let ret = [];
      let { tagSet } = this;
      tags.forEach((a) => {
        if (tagSet.indexOf(a) < 0) {
          tagSet.push(a);
        }
      });
      getConfig().save({ tagSet });

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