<template >
  <sup class="note-bookmark" :id="noteid">
    <Icon type="ios-bookmark"  size="10" color="#42b983"/>
  </sup>
</template>
<script>
export default {
  props: {
    noteid: { type: String, default: "" },
  },
};
</script>