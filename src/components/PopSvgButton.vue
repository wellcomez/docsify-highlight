<template>
  <Poptip confirm  :title="title" @on-ok="click" ok-text="yes" cancel-text="no">
    <SvgButton v-bind:onClick="voidfn" :name="name" :tips="tips" />
  </Poptip>
</template>
<script>
export default {
  name: "PopSvgButton",
  props: {
    click: { type: Function, default: undefined },
    name: { type: String, default: "" },
    tips: { type: String, default: "" },
    title: { type: String, default: "" },
  },
  methods: {
      voidfn(){

      }
  }
};
</script>