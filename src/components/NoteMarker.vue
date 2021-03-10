<template>
  <Tooltip :content="content" :max-width=200 :delay=500 class="notemarker" theme="light" :always="on" placement="top">
    <sup v-on:click="onClick">
      <Icon type="md-create" />
    </sup>
  </Tooltip>
</template>
<script>
export default {
  name: "NoteMarker",
  data() {
    return {
      on: this.always,
    };
  },
  props: {
    noteid: { type: String, default: undefined },
    content: { type: String, default: "" },
    always: { type: Boolean, default: true },
  },
  methods: {
    onClick(e) {
      e.stopPropagation();
      this.on = this.on?false:true;
    },
  },
};
</script>