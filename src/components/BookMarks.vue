<template>
  <Row class="doclist">
    <Tree :data="bookdata"></Tree>
  </Row>
</template>
<script>
import { Book } from "../store";
import { gotoNote } from "../utils";
export default {
  name: "BookMarks",
  created() {
    this.bookdata = this.load();
  },
  updated() {
    console.log("updated");
  },
  data() {
    return { bookdata: [] };
  },
  methods: {
    // eslint-disable-next-line no-unused-vars
    handleNodeClick(item) {
      let { path, id, text, key } = item;
      if (id && text) {
        gotoNote({ key, id });
      } else {
        document.location.hash = path;
      }
    },
    load() {
      let b = new Book();
      let ddd = b.toc.bookMarkList();
      return ddd.map((a) => {
        let { title, path, text } = a;
        if (text) {
          title = `${title}-${text}`;
        }
        // eslint-disable-next-line no-unused-vars
        const render = (h, { root, node, data }) => {
          return h(
            "span",
            {
              // class: aa,
              // style: style,
              on: {
                click: () => {
                  this.handleNodeClick(a);
                },
              },
            },
            title
          );
        };
        return { title, path, expand: false, render };
      });
    },
  },
};
</script>