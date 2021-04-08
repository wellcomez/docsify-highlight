<template>
  <div class="charpterhtml" style="margin-left: 10%; margin-right: 10%">
    <h2 v-if="exporthtml">
      <a :href="hrefa" style="text-decoration: none; color: #42b983">{{
        title
      }}</a>
    </h2>
    <h2 v-else>{{ title }}</h2>
    <div
      v-for="(
        { note, html, label, imgsrc, tags, url},
        index
      ) in list"
      :key="index"
    >
      <!-- <h3 v-if="label">{{ index + 1 }}</h3> -->
      <!-- <h3 v-else>{{ index + 1 }}</h3> -->
      <div
        style="
          margin-top: 4px;
          margin-bottom: 4px;
          font-size: small;
          font-weight: normal;
        "
      >
        <a
          :href="href({ title, label, index })"
          style="text-decoration: none; color: black"
          >{{ index + 1 }}.</a
        >

        <sup>
          <a
            v-if="onClick"
            @click="onClick({ index, url })"
            style="text-decoration: none; color: #42b983"
            >~</a
          >
          <a v-else :href="url" style="text-decoration: none; color: #42b983"
            >~</a
          >
        </sup>
        <div v-if="tags" style="display: inline-block">
          <span
            v-for="(a, index) in tags"
            :key="index"
            style="
              background: #42b983;
              color: white;
              border-radius: 3px;
              padding-left: 4px;
              padding-right: 4px;
              font-size: xx-small;
              margin-left: 4px;
            "
            >{{ a }}</span
          >
        </div>
        <div style="display:inline" v-html=html></div>
      </div>
      <img
        v-if="imgsrc"
        :src="imgsrc"
        style="width: 40%; border: 1px solid #42b983; margin: 2px"
      />
      <div v-if="note" :style="styleNote" class="outline-title">
        <p>{{ note }}</p>
      </div>
    </div>
  </div>
</template>
<script>
import { convertStyle, getImgSrcUrl} from "../utils";

export default {
  computed() {
    return {};
  },
  data() {
    return {
      hrefa: "",
      title: "",
      list: [{ name: "" }],
      styleNote:
        " border-left: 2px solid #42b983;\
  margin-left: 4px;\
  padding-left: 4px;\
  margin-top: 2px;",
    };
  },
  methods: {
    convert(a, charpter) {
      let { imgsrc, text, id} = a;
      imgsrc = getImgSrcUrl(imgsrc, this.rootpath);
      let url = charpter.url(id,this.rootpath);
      let label = text.substring(0, 6);
      let style = convertStyle(a.style);
      let ret = {
        ...a,
        ...{ style, label, url, imgsrc }
      };
      return ret;
    },
    // eslint-disable-next-line no-unused-vars
    href({ title, index }) {
      return `#titleid?${title}${index}`;
    },
    onClick({ index, url }) {
      if (this.onClickURL) {
        let children = this.charpter.mergeChild();
        let a = children[index];
        this.onClickURL(a);
        return;
      } else {
        window.location.href = url;
      }
    },
  },

  created() {
    let { charpter } = this;
    if (charpter) {
      this.title = charpter.label;
      this.hrefa = "#" + this.title;
      let children = charpter.mergeChild();
      this.list = children.map((a) => this.convert(a, charpter));
    }
  },
  watch: {
    charpter(charpter) {
      this.list = charpter.mergeChild().map((a) => this.convert(a, charpter));
    },
  },
  props: {
    rootpath: { type: String, default: undefined },
    exporthtml: { type: Boolean, default: false },
    charpter: { type: Object, default: undefined },
    onClickURL: { type: Function, default: undefined },
  },
};
</script>
<style >
.charpterhtml i{
  font-style: normal;
}
.outline-title {
  border-left: 2px solid #42b983;
  margin-left: 4px;
  padding-left: 4px;
  margin-top: 2px;
}
</style>


