<template>
  <span v-on:click="onClick">
    <Tooltip
      v-if="on"
      :content="content"
      :max-width="200"
      :delay="500"
      class="notemarker"
      theme="light"
      :always="on"
      placement="right"
    >
      <sup>
        <Icon type="md-create" />
      </sup>
    </Tooltip>

    <sup v-if="on == false">
      <Icon type="md-create" />
    </sup>
  </span>
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
      this.on = this.on ? false : true;
    },
  },
};
</script>