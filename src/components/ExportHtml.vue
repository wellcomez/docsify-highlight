<template>
  <div class="export-html">
    <TocHtml :charpter="charpter" :exporthtml=true />
    <CharptHtml
      class="charpterhtml"
      v-for="(charpter, index) in charpter"
      :charpter="charpter"
      :key="index"
      :exporthtml=true
    />
  </div>
</template>
<script>
import CharptHtml from "./CharptHtml";
import TocHtml from "./TocHtml";
export default {
  name: "ExportHtml",
  components: { TocHtml, CharptHtml },
  props: {
    charpter: {
      type: Array,
      default: () => {
        return [];
      },
    },
  },
  created(){
      console.log(this.charpter)
  },
  methods: {
  },
};
</script>