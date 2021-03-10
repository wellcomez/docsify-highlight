<template>
  <span v-on:click="onClick">
    <Tooltip
      v-if="hidden == false"
      :content="content"
      :max-width="200"
      :delay="500"
      class="notemarker"
      theme="light"
      :always="always"
      placement="right"
    >
      <sup>
        <Icon type="md-create" />
      </sup>
    </Tooltip>
    <sup v-if="hidden">
      <Icon type="md-create" />
    </sup>
  </span>
</template>
<script>
export default {
  name: "NoteMarker",
  data() {
    return {
      on: true,
      always: true,
      hidden: false,
    };
  },
  mounted() {
    if (this.showall == true) {
        this.on = true;
    }else{
        this.on = false;
    }
    this.updateWithOnStatus()
  },
  props: {
    noteid: { type: String, default: undefined },
    content: { type: String, default: "" },
    showall: { type: Boolean, default: undefined},
  },
  methods: {
    updateWithOnStatus() {
      if (this.on == false) {
        this.hidden = true;
        setTimeout(() => {
          this.always = false;
          this.hidden = false;
        }, 100);
      } else {
        this.always = true;
        this.hidden = false;
      }
    },
    onClick(e) {
      e.stopPropagation();
      this.on = this.on ? false : true;
      this.updateWithOnStatus();
    },
  },
};
</script>