<template>
  <span class="notemarker">
    <!-- <Tooltip
      v-if="hidden == false"
      :content="content"
      :max-width="maxWidth"
      :delay="500"
      class="notemarker"
      theme="light"
      :always="always"
      placement="right"
    >
      <sup>
        <Icon type="md-create" style="color: var(--theme-color, #42b983)" />
      </sup>
    </Tooltip> -->
    <sup>
      <Icon type="md-create" style="color: var(--theme-color, #42b983)" @click="hidden=hidden!=true"/>
    </sup>
    <TipsInline v-if="hidden == false" :tip="content" style="margin:2px"></TipsInline>
  </span>
</template>
<script>
import TipsInline from "./TipsInline";
export default {
  name: "NoteMarker",
  components: { TipsInline },
  data() {
    return {
      on: this.showall,
      always: true,
      hidden: false,
    };
  },
  computed: {
    maxWidth() {
      if (window.screen < 320) {
        return 200;
      }
      return 400;
    },
  },
  mounted() {
    this.$el.setAttribute("id",this.noteid+"notemarker")
    this.updateWithOnStatus();
  },
  props: {
    noteid: { type: String, default: undefined },
    content: { type: String, default: "" },
    showall: { type: Boolean, default: undefined },
    hl: { type: Object, default: undefined },
  },
  methods: {
    dblclick() {
      let { hl } = this;
      if (hl) {
        this.on = false;
        this.updateWithOnStatus();
        let el = hl.getElement(this.noteid);
        hl.createNoteMenu(el);
      }
    },
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
    // eslint-disable-next-line no-unused-vars
    onClick(e) {
      //   e.stopPropagation();
      this.on = this.on ? false : true;
      this.updateWithOnStatus();
    },
  },
};
</script>