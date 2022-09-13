<template >
  <sup class="note-bookmark" :id="noteid">
    <Icon type="ios-bookmark"  size="10" color="var(--theme-color, #42b983)"/>
  </sup>
</template>
<script>
export default {
  name: "NoteBookMark",
  props: {
    noteid: { type: String, default: "" },
  },
};
</script>