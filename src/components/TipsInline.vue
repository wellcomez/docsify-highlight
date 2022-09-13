<template>
  <div class="note-inline-tooltip">
    <div class="note-inline-tooltiptext">
      <!-- <p>{{ tip }}</p> -->
      {{ tip }}
    </div>
  </div>
</template>
<script>
export default {
  name: "TipInline",
  computed: {},
  props: {
    tip: { type: String, default: undefined },
  },
};
</script>
<style>
.note-inline-tooltip {
  position: relative;
  display: inline-block;
  margin: 2px;
  word-break: break-all;
}

.note-inline-tooltip .note-inline-tooltiptext {
  background-color: var(--theme-color, #42b983);
  color: #fff;
  border-radius: 6px;
  padding: 5px 0;
  z-index: 1;
  top: -5px;
  left: 110%;
  padding-left: 4px;
  padding: 4px;
  line-height: initial;
}

.note-inline-tooltip .note-inline-tooltiptext::after {
  content: "";
  position: absolute;
  top: 50%;
  right: 100%;
  margin-top: -5px;
  border-width: 5px;
  border-style: solid;
  border-color: transparent var(--theme-color, #42b983) transparent transparent;
}
</style>