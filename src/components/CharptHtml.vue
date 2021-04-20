<template>
  <div class="charpterhtml" style="margin-left: 10%; margin-right: 10%">
    <h2 v-if="exporthtml">
      <a :href="hrefa">{{ title }}</a>
    </h2>
    <h2 v-else>{{ title }}</h2>
    <div
      v-for="(
        { note, html, imgsrc, tags, url, text, style, notshowSeq }, index
      ) in list"
      :key="index"
    >
      <Divider v-if="notshowSeq != true"></Divider>
      <div v-else><br /><br /></div>
      <div class="sub-title">
        <a
          v-if="notshowSeq != true"
          style="text-decoration: none; color: black"
        >
          {{ index + 1 }}.</a
        >
        <sup style="margin-left: 4px">
          <a v-if="onClick" @click="onClick({ index, url })"
            ><Icon type="md-link"
          /></a>
          <a v-else :href="url"><Icon type="md-link" /></a>
        </sup>
        <Icon
          type="ios-close"
          @click="onDelete(index)"
          size="18"
          color="#42b983"
        />

        <div v-if="tags" style="display: inline-block">
          <span v-for="(a, index) in tags" :key="index" class="sub-tag">{{
            a
          }}</span>
        </div>
        <div
          @click="onIcon(index)"
          v-if="html"
          style="display: inline"
          v-html="html"
        ></div>
        <div @click="onIcon(index)" v-else style="display: inline">
          <span :style="style">{{ text }}</span>
        </div>
      </div>
      <img
        class="html-img"
        @click="onIcon(index)"
        v-if="imgsrc"
        :src="imgsrc"
      />
      <div v-if="note" class="outline-title">
        <p>{{ note }}</p>
      </div>
    </div>
  </div>
</template>
<script>
import { convertStyle, createHtml, getImgSrcUrl } from "../utils";
import { Divider } from "iview";
// import { Tooltip } from "iview";
export default {
  components: { Divider },
  data() {
    return {
      list: this.initList(this.charpter),
      showMerge: false,
      showSelected: {},
    };
  },
  computed: {
    title() {
      return this.charpter.label;
    },
    hrefa() {
      return "#" + this.title;
    },
  },
  watch: {
    charpter(charpter) {
      this.list = this.initList(charpter);
    },
  },
  methods: {
    initList(charpter) {
      if (charpter)
        return charpter.mergeChild().map((a) => this.convert(a, charpter));
      return [{ name: "" }];
    },
    onDelete(index) {
      let l = this.list[index];
      let { id } = l;
      let { hl, charpter } = this;
      let { store } = charpter;
      hl.deleteId(id, store);
    },
    updateList() {
      let getrootid = (notshowSeq, index) => {
        if (notshowSeq) {
          let end = index > 0 ? 0 : index + 1;
          for (let i = index; i >= end; i--) {
            let l = this.list[i];
            let { notshowSeq, id } = l;
            if (notshowSeq != true) {
              return id;
            }
          }
          return;
        }
      };
      return this.list.map((a, idx) => {
        let { notshowSeq, id } = a;
        let rootid = getrootid(notshowSeq, idx);
        if (rootid == undefined) {
          notshowSeq = false;
        }
        this.charpter.store.update({ id, notshowSeq, rootid });
        return { ...a, ...{ rootid, notshowSeq } };
      });
    },
    onIcon(index) {
      let { notshowSeq } = this.list[index];
      notshowSeq = notshowSeq != true;
      let pre = this.list[index - 1];
      if (pre != undefined && notshowSeq == true) {
        if (pre.notshowSeq) {
          notshowSeq = true;
        }
      }

      let l = this.list[index];
      this.list[index] = { ...l, ...{ notshowSeq } };
      this.list = this.updateList();
    },
    convert(a, charpter) {
      let { imgsrc, text, id, tree, version } = a;
      imgsrc = getImgSrcUrl(imgsrc, this.rootpath);
      let url = charpter.url(id, this.rootpath);
      let label = text.substring(0, 6);
      let style = convertStyle(a.style);
      let html = version ? createHtml(tree) : undefined;
      let ret = {
        ...a,
        ...{ style, label, url, imgsrc, html, text },
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

  props: {
    hl: { type: Object, default: undefined },
    rootpath: { type: String, default: undefined },
    exporthtml: { type: Boolean, default: false },
    charpter: { type: Object, default: undefined },
    onClickURL: { type: Function, default: undefined },
  },
};
</script>
<style >
.charpterhtml a {
  text-decoration: none;
  color: #42b983;
}
.charpterhtml i {
  font-style: normal;
}
.html-img {
  width: 60%;
  border: 1px solid #42b983;
  margin: 2px;
}
.html-img:hover {
  width: 100%;
}
.sub-title {
  margin-top: 4px;
  margin-bottom: 4px;
  font-size: small;
  font-weight: normal;
  display: inline-block;
}
span.sub-tag {
  margin: 4px;
  font-size: small;
  font-weight: normal;
  padding: 2px;
  background-color: #42b983;
  color: white;
  border-radius: 3px;
}
.outline-title {
  border-left: 2px solid #42b983;
  margin-left: 4px;
  padding-left: 4px;
  margin-top: 2px;
}
</style>


